import { HardDrive } from "lucide-react";
import { MetricCard } from "@/components/common/MetricCard";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatBytes } from "@/lib/formatters";

export function DiskPanel() {
  const status = useTelemetryStore((s) => s.status);
  const disk = status?.disk;
  const percent = disk?.percent ?? 0;

  return (
    <MetricCard
      icon={HardDrive}
      label="Storage"
      value={`${percent.toFixed(0)}%`}
      sub={disk ? `${formatBytes(disk.free)} free` : undefined}
      percent={percent}
      kind="disk"
    />
  );
}
