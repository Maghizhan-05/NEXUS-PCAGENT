import { MetricCard } from "@/components/common/MetricCard";
import { TelemetryChart } from "./TelemetryChart";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatBytes } from "@/lib/formatters";

export function MemoryPanel() {
  const status = useTelemetryStore((s) => s.status);
  const latest = useTelemetryStore((s) => s.latest);
  const history = useTelemetryStore((s) => s.history);

  const percent = latest?.memory ?? status?.memory.percent ?? 0;
  const used = status?.memory.used;
  const total = status?.memory.total;

  return (
    <MetricCard
      label="Memory"
      storageKey="memory"
      value={percent.toFixed(0)}
      unit="%"
      meta={used && total ? `${formatBytes(used)} / ${formatBytes(total)}` : undefined}
      percent={percent}
      kind="memory"
    >
      <TelemetryChart id="mem" data={history} dataKey="memory" color="#5b8cff" height={34} />
    </MetricCard>
  );
}
