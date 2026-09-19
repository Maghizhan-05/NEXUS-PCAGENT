import { create } from "zustand";
import type { SystemStatus, TelemetrySnapshot } from "@/types/telemetry";

const HISTORY_CAP = 60;

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export interface HistoryPoint {
  t: number;
  cpu: number;
  memory: number;
  upload: number;
  download: number;
}

interface TelemetryState {
  connection: ConnectionStatus;
  /** epoch ms of the last telemetry frame actually received. */
  lastMessageAt: number | null;
  latest: TelemetrySnapshot | null;
  status: SystemStatus | null;
  history: HistoryPoint[];
  setConnection: (c: ConnectionStatus) => void;
  pushSnapshot: (s: TelemetrySnapshot) => void;
  setStatus: (s: SystemStatus) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  connection: "connecting",
  lastMessageAt: null,
  latest: null,
  status: null,
  history: [],
  setConnection: (c) => set({ connection: c }),
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
      return { latest: s, history, lastMessageAt: Date.now() };
    }),
  setStatus: (s) => set({ status: s }),
}));
