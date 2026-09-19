import type { Alert, ProcessList, SystemStatus } from "@/types/telemetry";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export const api = {
  systemStatus: () => getJson<SystemStatus>("/api/system/status"),
  processes: (sort: "cpu" | "memory", limit = 10) =>
    getJson<ProcessList>(`/api/processes?sort=${sort}&limit=${limit}`),
  alerts: () => getJson<Alert[]>("/api/system/alerts"),
  capabilities: () => getJson<{ voice: boolean }>("/api/capabilities"),
  voiceToken: () =>
    getJson<{ agent_id: string; signed_url: string }>("/api/voice/token"),
};

export function wsUrl(): string {
  if (BASE) {
    return BASE.replace(/^http/, "ws") + "/ws/telemetry";
  }
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws/telemetry`;
}
