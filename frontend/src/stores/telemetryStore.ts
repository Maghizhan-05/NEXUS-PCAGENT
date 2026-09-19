import { create } from "zustand";
import type { SystemStatus, TelemetrySnapshot } from "@/types/telemetry";

const HISTORY_CAP = 60;

export interface HistoryPoint {
  t: number;
  cpu: number;
  memory: number;
  upload: number;
  download: number;
}

interface TelemetryState {
  connected: boolean;
  latest: TelemetrySnapshot | null;
  status: SystemStatus | null;
  history: HistoryPoint[];
  setConnected: (v: boolean) => void;
  pushSnapshot: (s: TelemetrySnapshot) => void;
  setStatus: (s: SystemStatus) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  connected: false,
  latest: null,
  status: null,
  history: [],
  setConnected: (v) => set({ connected: v }),
  pushSnapshot: (s) =>
    set((state) => {
      const point: HistoryPoint = {
        t: s.timestamp,
        cpu: s.cpu,
        memory: s.memory,
        upload: s.upload,
        download: s.download,
      };
      const history = [...state.history, point];
      if (history.length > HISTORY_CAP) history.shift();
      return { latest: s, history };
    }),
  setStatus: (s) => set({ status: s }),
}));
