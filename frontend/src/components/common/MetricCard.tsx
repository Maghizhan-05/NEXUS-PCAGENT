import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { metricLevel } from "@/lib/status";
import { levelColor } from "@/lib/status";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  /** When provided, drives a thin utilization bar + color. */
  percent?: number;
  kind?: "cpu" | "memory" | "disk";
  children?: ReactNode;
}

export function MetricCard({ icon: Icon, label, value, sub, percent, kind, children }: Props) {
  const level = percent != null && kind ? metricLevel(kind, percent) : null;
  const color = level ? levelColor(level) : "#22d3ee";

  return (
    <div className="panel corner-bracket p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-nexus-cyan" strokeWidth={1.5} />
          <span className="panel-label">{label}</span>
        </div>
        {level && (
          <span className="text-[9px] tracking-[0.2em]" style={{ color }}>
            {level}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-light tabular-nums text-nexus-white" style={{ color }}>
          {value}
        </span>
        {sub && <span className="text-[10px] text-nexus-mute">{sub}</span>}
      </div>

      {percent != null && (
        <div className="mt-2 h-[3px] w-full overflow-hidden bg-nexus-line">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          />
        </div>
      )}

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
