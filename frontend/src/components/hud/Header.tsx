import { useEffect, useState } from "react";
import { ConnectionBadge } from "@/components/common/ConnectionBadge";
import { DisplayControls } from "@/components/common/DisplayControls";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatClock } from "@/lib/formatters";
import { isElectron } from "@/lib/env";

export function Header() {
  const hostname = useTelemetryStore((s) => s.status?.system.hostname);
  const [clock, setClock] = useState(formatClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-web-line px-4 py-2">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl font-bold uppercase tracking-[0.22em] text-web-text">
          NE<span className="text-web-red">X</span>US
        </span>
        <span className="hidden font-mono text-[10px] uppercase tracking-widest2 text-web-faint sm:inline">
          web-shooter hud · {hostname ?? "local node"}
        </span>
        {isElectron && (
          <span className="hidden border border-web-line px-1.5 py-0.5 panel-tag text-web-blue md:inline">
            DESKTOP
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ConnectionBadge />
        <span className="hidden font-display text-sm font-medium tabular tracking-wider text-web-mute md:inline">
          {clock}
        </span>
        <DisplayControls />
      </div>
    </header>
  );
}
