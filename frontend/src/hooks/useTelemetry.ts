import { useEffect } from "react";
import { api, wsUrl } from "@/lib/api";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { useAlertStore } from "@/stores/alertStore";
import type { TelemetrySnapshot } from "@/types/telemetry";

/**
 * Owns the single telemetry WebSocket plus a slower HTTP poll for the full
 * status + alerts. The socket lifecycle is StrictMode-safe:
 *
 * - The connect is scheduled on a 0ms timer, so React's dev double-mount
 *   cancels the throwaway connection before a socket is ever created.
 * - Every handler is guarded by a per-effect `disposed` flag, so a stale
 *   socket can never overwrite the live connection state or spawn an orphan
 *   reconnect timer (the bug that caused perpetual "RECONNECTING").
 */
export function useTelemetry() {
  useEffect(() => {
    const { setConnection, pushSnapshot } = useTelemetryStore.getState();
    let disposed = false;
    let ws: WebSocket | null = null;
    let everOpened = false;
    let connectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let openWatchdog: ReturnType<typeof setTimeout> | null = null;

    const OPEN_TIMEOUT = 6000; // force-close a socket that never finishes opening

    const connect = () => {
      if (disposed) return;
      setConnection(everOpened ? "reconnecting" : "connecting");
      const socket = new WebSocket(wsUrl());
      ws = socket;

      // Watchdog: a half-open connect (e.g. backend restarting behind the
      // proxy) can hang in CONNECTING forever without firing onclose. If we
      // don't reach OPEN in time, force a close so the retry path runs.
      openWatchdog = setTimeout(() => {
        if (disposed || socket.readyState === WebSocket.OPEN) return;
        try {
          socket.close();
        } catch {
          /* onclose drives the retry */
        }
      }, OPEN_TIMEOUT);

      socket.onopen = () => {
        if (openWatchdog) clearTimeout(openWatchdog);
        if (disposed) return;
        everOpened = true;
        setConnection("connected");
      };
      socket.onmessage = (evt) => {
        if (disposed) return;
        try {
          pushSnapshot(JSON.parse(evt.data) as TelemetrySnapshot);
        } catch {
          /* ignore malformed frame */
        }
      };
      socket.onclose = () => {
        if (openWatchdog) clearTimeout(openWatchdog);
        if (disposed) return;
        setConnection("reconnecting");
        reconnectTimer = setTimeout(connect, 2000);
      };
      socket.onerror = () => {
        try {
          socket.close();
        } catch {
          /* onclose handles the retry */
        }
      };
    };

    connectTimer = setTimeout(connect, 0);

    return () => {
      disposed = true;
      if (connectTimer) clearTimeout(connectTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (openWatchdog) clearTimeout(openWatchdog);
      if (ws) {
        ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
        try {
          ws.close();
        } catch {
          /* already closing */
        }
      }
    };
  }, []);

  // Slower poll for full status + alerts (heavier payloads than the socket).
  useEffect(() => {
    const { setStatus } = useTelemetryStore.getState();
    const { setActive } = useAlertStore.getState();
    let alive = true;
    const poll = async () => {
      if (document.hidden) return; // pause polling when minimized to tray
      try {
        const [status, alerts] = await Promise.all([api.systemStatus(), api.alerts()]);
        if (!alive) return;
        setStatus(status);
        setActive(alerts);
      } catch {
        /* backend momentarily unreachable — WS status reflects connectivity */
      }
    };
    poll();
    const id = setInterval(poll, 4000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
}
