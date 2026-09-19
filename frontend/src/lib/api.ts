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

// Backend port for local dev. Override the whole origin with VITE_API_BASE_URL
// if the backend runs elsewhere.
const DEV_BACKEND_PORT = "8000";
const VITE_DEV_PORT = "5173";

export function wsUrl(): string {
  if (BASE) {
    return BASE.replace(/^http/, "ws") + "/ws/telemetry";
  }
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  const { hostname, host, port } = window.location;
  // When served by the Vite dev server, connect straight to the backend
  // instead of through Vite's `/ws` proxy (its WS upgrade is negotiated
  // inconsistently across browsers). The backend listens on IPv4 only, so we
  // force 127.0.0.1 for loopback hosts — otherwise Windows browsers like Edge
  // resolve "localhost" to IPv6 [::1], where nothing listens, and the socket
  // fails. A real LAN hostname/IP is used as-is.
  if (port === VITE_DEV_PORT) {
    const loopback = hostname === "localhost" || hostname === "::1" || hostname === "[::1]";
    const backendHost = loopback ? "127.0.0.1" : hostname;
    return `${proto}://${backendHost}:${DEV_BACKEND_PORT}/ws/telemetry`;
  }
  return `${proto}://${host}/ws/telemetry`;
}
