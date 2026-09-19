import { Mic, MicOff, Loader2 } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { Transcript } from "./Transcript";
import type { VoiceState } from "@/types/telemetry";

const STATE_LABEL: Record<VoiceState, string> = {
  idle: "VOICE READY",
  listening: "LISTENING…",
  thinking: "ANALYZING…",
  speaking: "RESPONDING…",
  error: "VOICE ERROR",
};

export function VoiceInterface() {
  const { start, stop, available, connected, state, error } = useVoice();

  return (
    <div className="panel corner-bracket flex h-full flex-col p-3">
      <div className="flex items-center justify-between">
        <span className="panel-label">Voice Interface</span>
        <span
          className={`text-[9px] tracking-[0.2em] ${
            state === "error" ? "text-nexus-red" : "text-nexus-cyan"
          }`}
        >
          {STATE_LABEL[state]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={connected ? stop : start}
          disabled={!available}
          title={available ? "Talk to NEXUS" : "Voice not configured (set ElevenLabs keys)"}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all ${
            connected
              ? "border-nexus-cyan bg-nexus-cyan/15 shadow-glow"
              : "border-nexus-line hover:border-nexus-cyan/60"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {state === "thinking" ? (
            <Loader2 size={17} className="animate-spin text-nexus-cyan" />
          ) : connected ? (
            <Mic size={17} className="text-nexus-cyan" />
          ) : (
            <MicOff size={17} className="text-nexus-mute" />
          )}
        </button>
        <div className="flex-1">
          <VoiceVisualizer state={state} />
        </div>
      </div>

      <div className="mt-3 flex-1">
        <Transcript />
      </div>

      {!available && (
        <div className="mt-2 text-[9px] leading-relaxed text-nexus-mute">
          Voice offline — add ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID to the backend .env to
          enable conversational control.
        </div>
      )}
      {error && <div className="mt-2 text-[9px] text-nexus-red">{error}</div>}
    </div>
  );
}
