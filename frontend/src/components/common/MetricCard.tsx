import type { ReactNode } from "react";
import { metricLevel, levelColor } from "@/lib/status";
import { PanelFrame } from "./PanelFrame";

interface Props {
  label: string;
  storageKey: string;
  value: string;
  unit?: string;
  meta?: string;
  percent?: number;
  kind?: "cpu" | "memory" | "disk";
  children?: ReactNode;
}

export function MetricCard({ label, storageKey, value, unit, meta, percent, kind, children }: Props) {
  const level = percent != null && kind ? metricLevel(kind, percent) : null;
  const elevated = level != null && level !== "NORMAL";
  const critical = level === "WARNING" || level === "CRITICAL";
  const color = level ? levelColor(level) : "#2f6bff";

  return (
    <PanelFrame
      title={label}
      storageKey={storageKey}
      alert={critical}
      right={
        level && (
          <span
            className="font-mono text-[9px] tracking-widest2"
            style={{ color: elevated ? color : "#47526f" }}
          >
            {level}
          </span>
        )
      }
      bodyClassName="flex flex-col gap-2"
    >
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="metric-num text-4xl" style={elevated ? { color } : undefined}>
            {value}
          </span>
          {unit && <span className="font-mono text-xs text-web-mute">{unit}</span>}
        </div>
        {meta && <span className="font-mono text-[10px] text-web-faint">{meta}</span>}
      </div>

      {percent != null && (
        <div className="h-[2px] w-full bg-web-hair">
          <div
            className="h-[2px] transition-all duration-500"
            style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
          />
        </div>
      )}

      {children}
    </PanelFrame>
  );
}
