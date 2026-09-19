import { useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { useVoiceStore } from "@/stores/voiceStore";

/**
 * ElevenLabs Conversational AI integration.
 *
 * The API key stays on the backend. We fetch a short-lived conversation token,
 * then start a browser session with client-side tools that pull REAL telemetry
 * from the NEXUS backend — the agent never invents values. If the SDK, mic, or
 * network fails, we surface an error and leave the dashboard untouched.
 */

// Client tools exposed to the agent. Each returns a JSON string of real data.
async function json(path: string): Promise<string> {
  const res = await fetch(path);
  if (!res.ok) return JSON.stringify({ error: `telemetry unavailable (${res.status})` });
  return JSON.stringify(await res.json());
}

const clientTools = {
  get_system_status: () => json("/api/voice/tools/system_status"),
  get_cpu_status: () => json("/api/voice/tools/cpu"),
  get_memory_status: () => json("/api/voice/tools/memory"),
  get_disk_status: () => json("/api/voice/tools/disk"),
  get_network_status: () => json("/api/voice/tools/network"),
  get_top_processes: (params: { sort?: string; limit?: number }) => {
    const sort = params?.sort === "memory" ? "memory" : "cpu";
    const limit = Math.min(Math.max(Number(params?.limit) || 5, 1), 20);
    return json(`/api/voice/tools/top_processes?sort=${sort}&limit=${limit}`);
  },
};

export function useVoice() {
  const store = useVoiceStore();
  const convoRef = useRef<{ endSession: () => Promise<void> } | null>(null);

  const start = useCallback(async () => {
    const {
      setConnected,
      setState,
      setError,
      addTranscript,
    } = useVoiceStore.getState();
    setError(null);
    setState("thinking");
    try {
      const { signed_url } = await api.voiceToken();
      if (!signed_url) throw new Error("No signed URL returned by backend");
      // Ask for mic access up front so failures are clear.
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Dynamic import so a missing/updated SDK never breaks the build.
      const mod = await import("@elevenlabs/client");
      const Conversation = (mod as any).Conversation;
      const convo = await Conversation.startSession({
        signedUrl: signed_url,
        clientTools,
        onConnect: () => {
          setConnected(true);
          setState("listening");
        },
        onDisconnect: () => {
          setConnected(false);
          setState("idle");
        },
        onModeChange: ({ mode }: { mode: string }) => {
          setState(mode === "speaking" ? "speaking" : "listening");
        },
        onMessage: ({ message, source }: { message: string; source: string }) => {
          if (!message) return;
          addTranscript({
            id: crypto.randomUUID(),
            role: source === "user" ? "user" : "nexus",
            text: message,
          });
        },
        onError: (err: unknown) => {
          setError(String(err));
          setState("error");
        },
      });
      convoRef.current = convo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice unavailable");
      setState("error");
      setConnected(false);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await convoRef.current?.endSession();
    } catch {
      /* ignore */
    }
    convoRef.current = null;
    useVoiceStore.getState().reset();
  }, []);

  return { start, stop, ...store };
}
