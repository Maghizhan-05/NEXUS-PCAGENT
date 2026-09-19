import { BatteryCharging, Battery } from "lucide-react";
import { PanelFrame } from "@/components/common/PanelFrame";
import { useSensorStore } from "@/stores/sensorStore";

export function BatteryPanel() {
  const supported = useSensorStore((s) => s.supported);
  const battery = useSensorStore((s) => s.latest?.battery ?? null);

  // Health below 80% is worth flagging on a battery.
  const lowHealth = battery?.healthPercent != null && battery.healthPercent < 80;
  const timeLabel =
    battery?.timeRemainingMin != null
      ? `${Math.floor(battery.timeRemainingMin / 60)}h ${battery.timeRemainingMin % 60}m left`
      : battery?.charging
        ? "charging"
        : null;

  return (
    <PanelFrame
      title="Battery"
      storageKey="battery"
      right={
        <span className="panel-tag flex items-center gap-1 text-web-faint">
          {battery?.charging ? (
            <BatteryCharging size={12} className="text-web-blue" />
          ) : (
            <Battery size={12} />
          )}
          {battery?.charging ? "AC" : "BATT"}
        </span>
      }
      bodyClassName="flex flex-col gap-2"
    >
      {!supported ? (
        <p className="font-mono text-[11px] text-web-mute">Battery info available in the desktop app.</p>
      ) : !battery ? (
        <p className="font-mono text-[11px] text-web-mute">No battery — running on AC.</p>
      ) : (
        <>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="metric-num text-3xl">
                {battery.percent != null ? battery.percent.toFixed(0) : "—"}
              </span>
              <span className="font-mono text-xs text-web-mute">%</span>
            </div>
            {timeLabel && <span className="font-mono text-[10px] text-web-faint">{timeLabel}</span>}
          </div>
          <div className="h-[2px] w-full bg-web-hair">
            <div
              className="h-[2px] bg-web-blue transition-all duration-500"
              style={{ width: `${Math.min(battery.percent ?? 0, 100)}%` }}
            />
          </div>
          {battery.healthPercent != null && (
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-web-faint">HEALTH</span>
              <span style={{ color: lowHealth ? "#f0a92e" : "#7a88ab" }}>
                {battery.healthPercent}% of design
              </span>
            </div>
          )}
        </>
      )}
    </PanelFrame>
  );
}
