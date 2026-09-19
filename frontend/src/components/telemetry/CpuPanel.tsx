import { MetricCard } from "@/components/common/MetricCard";
import { TelemetryChart } from "./TelemetryChart";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { useSensorStore } from "@/stores/sensorStore";

export function CpuPanel() {
  const status = useTelemetryStore((s) => s.status);
  const latest = useTelemetryStore((s) => s.latest);
  const history = useTelemetryStore((s) => s.history);
  const cpuTemp = useSensorStore((s) => s.latest?.cpu.tempC ?? null);

  const usage = latest?.cpu ?? status?.cpu.usage_percent ?? 0;
  const threads = status?.cpu.logical_core_count;

  // e.g. "8 threads · 54°C" — temp appears only when a sensor exposes it.
  const meta = [threads ? `${threads} threads` : null, cpuTemp != null ? `${cpuTemp.toFixed(0)}°C` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <MetricCard
      label="CPU Load"
      storageKey="cpu"
      value={usage.toFixed(0)}
      unit="%"
      meta={meta || undefined}
      percent={usage}
      kind="cpu"
    >
      <TelemetryChart id="cpu" data={history} dataKey="cpu" color="#2f6bff" height={34} />
    </MetricCard>
  );
}
