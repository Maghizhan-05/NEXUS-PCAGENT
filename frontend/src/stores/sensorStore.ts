import { create } from "zustand";
import type { SensorSnapshot } from "@/types/sensors";

interface SensorState {
  /** null until the first snapshot arrives; stays null in a plain browser. */
  latest: SensorSnapshot | null;
  supported: boolean; // running under the Electron shell with sensor access
  setLatest: (s: SensorSnapshot) => void;
  setSupported: (v: boolean) => void;
}

export const useSensorStore = create<SensorState>((set) => ({
  latest: null,
  supported: false,
  setLatest: (s) => set({ latest: s }),
  setSupported: (v) => set({ supported: v }),
}));
