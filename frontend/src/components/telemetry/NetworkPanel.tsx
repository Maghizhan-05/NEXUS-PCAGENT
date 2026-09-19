import { ArrowDown, ArrowUp, Wifi } from "lucide-react";
import { TelemetryChart } from "./TelemetryChart";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatRate } from "@/lib/formatters";

export function NetworkPanel() {
  const latest = useTelemetryStore((s) => s.latest);
  const history = useTelemetryStore((s) => s.history);

  const up = latest?.upload ?? 0;
  const down = latest?.download ?? 0;

  return (
    <div className="panel corner-bracket p-3">
      <div className="flex items-center gap-2">
        <Wifi size={13} className="text-nexus-cyan" strokeWidth={1.5} />
        <span className="panel-label">Network</span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center gap-1 text-[10px] text-nexus-mute">
            <ArrowDown size={11} className="text-nexus-cyan" /> DOWN
          </div>
          <div className="text-sm tabular-nums text-nexus-white">{formatRate(down)}</div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-[10px] text-nexus-mute">
            <ArrowUp size={11} className="text-nexus-cyan" /> UP
          </div>
          <div className="text-sm tabular-nums text-nexus-white">{formatRate(up)}</div>
        </div>
      </div>

      <div className="mt-2">
        <TelemetryChart id="net-down" data={history} dataKey="download" color="#22d3ee" percent={false} />
      </div>
    </div>
  );
}
