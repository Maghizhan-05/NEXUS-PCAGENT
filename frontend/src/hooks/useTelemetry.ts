import { useEffect, useRef } from "react";
import { api, wsUrl } from "@/lib/api";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { useAlertStore } from "@/stores/alertStore";
import type { TelemetrySnapshot } from "@/types/telemetry";

/**
 * Opens the telemetry WebSocket with auto-reconnect, polls the full system
 * status + alerts on a slower cadence, and keeps the stores in sync.
 */
export function useTelemetry() {
  const setConnected = useTelemetryStore((s) => s.setConnected);
  const pushSnapshot = useTelemetryStore((s) => s.pushSnapshot);
  const setStatus = useTelemetryStore((s) => s.setStatus);
  const setActive = useAlertStore((s) => s.setActive);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedRef = useRef(false);

  useEffect(() => {
    closedRef.current = false;

    const connect = () => {
      if (closedRef.current) return;
      const ws = new WebSocket(wsUrl());
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onmessage = (evt) => {
        try {
          pushSnapshot(JSON.parse(evt.data) as TelemetrySnapshot);
        } catch {
          /* ignore malformed frame */
        }
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closedRef.current) {
          reconnectRef.current = setTimeout(connect, 2000);
        }
      };
      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      closedRef.current = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [setConnected, pushSnapshot]);

  // Slower poll for full status + alerts (heavier payloads).
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const [status, alerts] = await Promise.all([api.systemStatus(), api.alerts()]);
        if (!alive) return;
        setStatus(status);
        setActive(alerts);
      } catch {
        /* backend momentarily unreachable */
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [setStatus, setActive]);
}
