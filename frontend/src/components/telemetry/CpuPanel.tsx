import { Cpu } from "lucide-react";
import { MetricCard } from "@/components/common/MetricCard";
import { TelemetryChart } from "./TelemetryChart";
import { useTelemetryStore } from "@/stores/telemetryStore";

export function CpuPanel() {
  const status = useTelemetryStore((s) => s.status);
  const latest = useTelemetryStore((s) => s.latest);
  const history = useTelemetryStore((s) => s.history);

  const usage = latest?.cpu ?? status?.cpu.usage_percent ?? 0;
  const cores = status?.cpu.logical_core_count;
  const freq = status?.cpu.frequency_mhz;

  return (
    <MetricCard
      icon={Cpu}
      label="Processor"
      value={`${usage.toFixed(0)}%`}
      sub={cores ? `${cores} threads${freq ? ` · ${(freq / 1000).toFixed(1)} GHz` : ""}` : undefined}
      percent={usage}
      kind="cpu"
    >
      <TelemetryChart id="cpu" data={history} dataKey="cpu" color="#22d3ee" />
    </MetricCard>
  );
}
