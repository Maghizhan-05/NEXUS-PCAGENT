import { useEffect, useState } from "react";
import { useTelemetryStore } from "@/stores/telemetryStore";

const STALE_AFTER_MS = 5000;

export type DisplayStatus = "live" | "connecting" | "reconnecting" | "stale" | "offline";

export interface ConnectionView {
  status: DisplayStatus;
  label: string;
  /** seconds since last telemetry frame, or null if none yet. */
  ageSeconds: number | null;
}

const LABEL: Record<DisplayStatus, string> = {
  live: "LIVE",
  connecting: "CONNECTING",
  reconnecting: "RECONNECTING",
  stale: "STALE",
  offline: "OFFLINE",
};

/**
 * Derives the user-facing telemetry status from the real connection state plus
 * how long ago the last frame arrived. Ticks once a second so "stale" and the
 * age readout stay current without spamming re-renders elsewhere.
 */
export function useConnectionStatus(): ConnectionView {
  const connection = useTelemetryStore((s) => s.connection);
  const lastMessageAt = useTelemetryStore((s) => s.lastMessageAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ageSeconds = lastMessageAt == null ? null : (now - lastMessageAt) / 1000;

  let status: DisplayStatus;
  if (connection === "connecting") status = "connecting";
  else if (connection === "reconnecting") status = "reconnecting";
  else if (connection === "disconnected" || connection === "error") status = "offline";
  else if (lastMessageAt != null && now - lastMessageAt > STALE_AFTER_MS) status = "stale";
  else status = "live";

  return { status, label: LABEL[status], ageSeconds };
}
