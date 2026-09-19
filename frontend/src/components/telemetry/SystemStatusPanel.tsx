import { useMemo } from "react";
import { PanelFrame } from "@/components/common/PanelFrame";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { overallStatus, levelColor } from "@/lib/status";
import { formatBytes, formatUptime } from "@/lib/formatters";

function senseMessage(cpu: number, mem: number, disk: number): string {
  if (disk >= 90) return "Disk space is running low.";
  if (mem >= 90) return "Memory pressure is high.";
  if (cpu >= 90) return "CPU is under sustained load.";
  if (mem >= 80) return "Memory pressure is climbing.";
  if (cpu >= 70) return "CPU load is elevated.";
  return "Spider-sense is quiet.";
}

export function SystemStatusPanel() {
  const status = useTelemetryStore((s) => s.status);
  const latest = useTelemetryStore((s) => s.latest);

  const cpu = latest?.cpu ?? status?.cpu.usage_percent ?? 0;
  const mem = latest?.memory ?? status?.memory.percent ?? 0;
  const disk = status?.disk.percent ?? 0;

  const overall = useMemo(() => overallStatus(cpu, mem, disk), [cpu, mem, disk]);
  const message = useMemo(() => senseMessage(cpu, mem, disk), [cpu, mem, disk]);
  const color = levelColor(overall.level);
  const critical = overall.level === "WARNING" || overall.level === "CRITICAL";

  const row = (k: string, v: string) => (
    <div className="flex items-center justify-between py-0.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-web-faint">{k}</span>
      <span className="font-mono text-[11px] tabular text-web-mute">{v}</span>
    </div>
  );

  return (
    <PanelFrame
      title="System"
      storageKey="system"
      alert={critical}
      right={
        <span className="font-mono text-[9px] tracking-widest2" style={{ color }}>
          {overall.level}
        </span>
      }
      bodyClassName="flex flex-col gap-2"
    >
      <div>
        <div className="font-display text-lg font-medium uppercase tracking-wide text-web-text">
          {status?.system.platform ?? "—"}
        </div>
        <div className="font-mono text-[11px]" style={{ color: critical ? color : "#7a88ab" }}>
          {message}
        </div>
      </div>

      <div className="border-t border-web-hair pt-1">
        {row("Node", status?.system.hostname ?? "—")}
        {row("Cores", status ? `${status.cpu.logical_core_count} logical` : "—")}
        {row("Memory", status ? formatBytes(status.memory.total) : "—")}
        {row("Uptime", status ? formatUptime(status.system.uptime) : "—")}
        {row("GPU", status?.gpu.available ? status.gpu.name ?? "present" : "Unavailable")}
      </div>
    </PanelFrame>
  );
}
