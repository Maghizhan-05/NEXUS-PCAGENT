import { MetricCard } from "@/components/common/MetricCard";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatBytes } from "@/lib/formatters";

export function DiskPanel() {
  const disk = useTelemetryStore((s) => s.status?.disk);
  const percent = disk?.percent ?? 0;

  return (
    <MetricCard
      label="Storage"
      storageKey="disk"
      value={percent.toFixed(0)}
      unit="%"
      meta={disk ? `${formatBytes(disk.free)} free` : undefined}
      percent={percent}
      kind="disk"
    />
  );
}
