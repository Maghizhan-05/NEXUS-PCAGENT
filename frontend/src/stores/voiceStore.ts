import { create } from "zustand";
import type { VoiceState } from "@/types/telemetry";

export interface TranscriptEntry {
  id: string;
  role: "user" | "nexus";
  text: string;
}

interface VoiceStoreState {
  available: boolean;
  connected: boolean;
  state: VoiceState;
  transcript: TranscriptEntry[];
  error: string | null;
  setAvailable: (v: boolean) => void;
  setConnected: (v: boolean) => void;
  setState: (s: VoiceState) => void;
  addTranscript: (entry: TranscriptEntry) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceStoreState>((set) => ({
  available: false,
  connected: false,
  state: "idle",
  transcript: [],
  error: null,
  setAvailable: (v) => set({ available: v }),
  setConnected: (v) => set({ connected: v }),
  setState: (s) => set({ state: s }),
  addTranscript: (entry) =>
    set((prev) => ({ transcript: [...prev.transcript, entry].slice(-20) })),
  setError: (msg) => set({ error: msg }),
  reset: () => set({ connected: false, state: "idle", transcript: [], error: null }),
}));
