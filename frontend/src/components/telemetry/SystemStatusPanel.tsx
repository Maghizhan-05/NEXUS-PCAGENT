import { useMemo } from "react";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { overallStatus, levelColor } from "@/lib/status";
import { formatUptime } from "@/lib/formatters";

export function SystemStatusPanel() {
  const status = useTelemetryStore((s) => s.status);
  const latest = useTelemetryStore((s) => s.latest);

  const cpu = latest?.cpu ?? status?.cpu.usage_percent ?? 0;
  const mem = latest?.memory ?? status?.memory.percent ?? 0;
  const disk = status?.disk.percent ?? 0;

  const overall = useMemo(() => overallStatus(cpu, mem, disk), [cpu, mem, disk]);
  const color = levelColor(overall.level);

  return (
    <div className="panel corner-bracket p-3">
      <span className="panel-label">System Status</span>
      <div className="mt-2 text-xl tracking-[0.35em] text-glow" style={{ color }}>
        {overall.level}
      </div>
      <div className="mt-1 text-[10px] text-nexus-mute">{overall.reason}</div>

      <div className="mt-3 grid grid-cols-2 gap-y-1 text-[10px]">
        <span className="text-nexus-mute">HOST</span>
        <span className="text-right text-nexus-white/80 truncate">
          {status?.system.hostname ?? "—"}
        </span>
        <span className="text-nexus-mute">OS</span>
        <span className="text-right text-nexus-white/80 truncate">
          {status?.system.platform ?? "—"}
        </span>
        <span className="text-nexus-mute">UPTIME</span>
        <span className="text-right tabular-nums text-nexus-white/80">
          {status ? formatUptime(status.system.uptime) : "—"}
        </span>
        <span className="text-nexus-mute">GPU</span>
        <span className="text-right text-nexus-white/80 truncate">
          {status?.gpu.available ? status.gpu.name : "Unavailable"}
        </span>
      </div>
    </div>
  );
}
