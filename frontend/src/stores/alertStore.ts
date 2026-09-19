import { create } from "zustand";
import type { Alert } from "@/types/telemetry";

interface AlertState {
  active: Alert[];
  setActive: (alerts: Alert[]) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  active: [],
  setActive: (alerts) => set({ active: alerts }),
}));
