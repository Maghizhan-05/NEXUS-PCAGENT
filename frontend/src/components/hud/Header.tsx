import { useEffect, useState } from "react";
import { StatusIndicator } from "@/components/common/StatusIndicator";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatClock } from "@/lib/formatters";

export function Header() {
  const connected = useTelemetryStore((s) => s.connected);
  const [clock, setClock] = useState(formatClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-nexus-line px-5 py-3">
      <div>
        <div className="text-xl tracking-[0.5em] text-glow text-nexus-cyan">NEXUS</div>
        <div className="text-[9px] tracking-[0.35em] text-nexus-mute">
          LOCAL SYSTEM INTELLIGENCE
        </div>
      </div>
      <div className="flex items-center gap-6">
        <StatusIndicator
          color={connected ? "#22d3ee" : "#f5b642"}
          label={connected ? "SYSTEM ONLINE" : "TELEMETRY OFFLINE · RECONNECTING"}
        />
        <div className="text-sm tabular-nums tracking-widest text-nexus-white/80">{clock}</div>
      </div>
    </header>
  );
}
