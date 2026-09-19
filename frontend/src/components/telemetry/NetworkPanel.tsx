import { ArrowDown, ArrowUp } from "lucide-react";
import { PanelFrame } from "@/components/common/PanelFrame";
import { TelemetryChart } from "./TelemetryChart";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatRate } from "@/lib/formatters";

export function NetworkPanel() {
  const latest = useTelemetryStore((s) => s.latest);
  const history = useTelemetryStore((s) => s.history);
  const connection = useTelemetryStore((s) => s.connection);

  const up = latest?.upload ?? 0;
  const down = latest?.download ?? 0;
  const offline = connection !== "connected";

  return (
    <PanelFrame
      title="Network"
      storageKey="network"
      right={<span className="panel-tag text-web-faint">60s</span>}
      bodyClassName="flex flex-col gap-2"
    >
      <div className="grid grid-cols-2 gap-2 font-mono">
        <div className="flex items-center gap-1.5">
          <ArrowDown size={13} className="text-web-blue" strokeWidth={2.2} />
          <span className="tabular text-sm text-web-text">{offline ? "—" : formatRate(down)}</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <ArrowUp size={13} className="text-web-silver" strokeWidth={2.2} />
          <span className="tabular text-sm text-web-mute">{offline ? "—" : formatRate(up)}</span>
        </div>
      </div>
      <TelemetryChart
        id="net-down"
        data={history}
        dataKey="download"
        color="#2f6bff"
        percent={false}
        height={34}
      />
    </PanelFrame>
  );
}
