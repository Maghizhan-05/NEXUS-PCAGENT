import { MetricCard } from "@/components/common/MetricCard";
import { TelemetryChart } from "./TelemetryChart";
import { useTelemetryStore } from "@/stores/telemetryStore";

export function CpuPanel() {
  const status = useTelemetryStore((s) => s.status);
  const latest = useTelemetryStore((s) => s.latest);
  const history = useTelemetryStore((s) => s.history);

  const usage = latest?.cpu ?? status?.cpu.usage_percent ?? 0;
  const cores = status?.cpu.core_count;
  const threads = status?.cpu.logical_core_count;

  return (
    <MetricCard
      label="CPU Load"
      storageKey="cpu"
      value={usage.toFixed(0)}
      unit="%"
      meta={cores && threads ? `${cores} cores · ${threads} threads` : undefined}
      percent={usage}
      kind="cpu"
    >
      <TelemetryChart id="cpu" data={history} dataKey="cpu" color="#2f6bff" height={34} />
    </MetricCard>
  );
}
