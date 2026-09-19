import { PanelFrame } from "@/components/common/PanelFrame";
import { useSensorStore } from "@/stores/sensorStore";
import { tempLevel, levelColor } from "@/lib/status";

export function GpuPanel() {
  const supported = useSensorStore((s) => s.supported);
  const gpu = useSensorStore((s) => s.latest?.gpus?.[0] ?? null);

  const level = gpu?.tempC != null ? tempLevel(gpu.tempC) : null;
  const critical = level === "WARNING" || level === "CRITICAL";
  const tempColor = level ? levelColor(level) : "#e8eeff";
  const vramPct =
    gpu?.memUsedMb != null && gpu?.memTotalMb ? (gpu.memUsedMb / gpu.memTotalMb) * 100 : null;

  return (
    <PanelFrame
      title="GPU"
      storageKey="gpu"
      alert={critical}
      right={
        level ? (
          <span className="panel-tag" style={{ color: critical ? tempColor : "#47526f" }}>
            {level}
          </span>
        ) : (
          <span className="panel-tag text-web-faint">
            {supported ? "N/A" : "DESKTOP"}
          </span>
        )
      }
      bodyClassName="flex flex-col gap-2"
    >
      {!supported ? (
        <p className="font-mono text-[11px] text-web-mute">
          GPU sensors available in the desktop app.
        </p>
      ) : !gpu ? (
        <p className="font-mono text-[11px] text-web-mute">No discrete GPU detected.</p>
      ) : (
        <>
          <div className="truncate font-mono text-[10px] text-web-faint" title={gpu.name}>
            {gpu.name}
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="metric-num text-3xl" style={{ color: critical ? tempColor : undefined }}>
                {gpu.tempC != null ? gpu.tempC.toFixed(0) : "—"}
              </span>
              <span className="font-mono text-xs text-web-mute">°C</span>
            </div>
            {gpu.utilPercent != null && (
              <span className="font-mono text-[11px] text-web-mute">{gpu.utilPercent.toFixed(0)}% load</span>
            )}
          </div>

          {vramPct != null && (
            <div>
              <div className="mb-0.5 flex justify-between font-mono text-[9px] text-web-faint">
                <span>VRAM</span>
                <span>
                  {(gpu.memUsedMb! / 1024).toFixed(1)} / {(gpu.memTotalMb! / 1024).toFixed(1)} GB
                </span>
              </div>
              <div className="h-[2px] w-full bg-web-hair">
                <div
                  className="h-[2px] bg-web-blue transition-all duration-500"
                  style={{ width: `${Math.min(vramPct, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between font-mono text-[10px] text-web-mute">
            <span>{gpu.powerW != null ? `${gpu.powerW.toFixed(1)} W` : "— W"}</span>
            <span>{gpu.clockMhz != null ? `${gpu.clockMhz.toFixed(0)} MHz` : "— MHz"}</span>
          </div>
        </>
      )}
    </PanelFrame>
  );
}
