import type { StatusLevel } from "@/types/telemetry";

interface Threshold {
  elevated: number;
  warning: number;
  critical: number;
}

const CPU: Threshold = { elevated: 70, warning: 85, critical: 95 };
const MEM: Threshold = { elevated: 75, warning: 85, critical: 95 };
const DISK: Threshold = { elevated: 80, warning: 90, critical: 95 };

function level(value: number, t: Threshold): StatusLevel {
  if (value >= t.critical) return "CRITICAL";
  if (value >= t.warning) return "WARNING";
  if (value >= t.elevated) return "ELEVATED";
  return "NORMAL";
}

const ORDER: StatusLevel[] = ["OPTIMAL", "NORMAL", "ELEVATED", "WARNING", "CRITICAL"];

export function metricLevel(kind: "cpu" | "memory" | "disk", value: number): StatusLevel {
  const t = kind === "cpu" ? CPU : kind === "memory" ? MEM : DISK;
  return level(value, t);
}

export interface OverallStatus {
  level: StatusLevel;
  reason: string;
}

/** Deterministic overall status — the worst of the tracked metrics. */
export function overallStatus(cpu: number, mem: number, disk: number): OverallStatus {
  const parts: { level: StatusLevel; reason: string }[] = [
    { level: metricLevel("cpu", cpu), reason: `CPU utilization has reached ${cpu.toFixed(0)}%.` },
    { level: metricLevel("memory", mem), reason: `Memory utilization has reached ${mem.toFixed(0)}%.` },
    { level: metricLevel("disk", disk), reason: `Disk utilization has reached ${disk.toFixed(0)}%.` },
  ];
  let worst = parts[0];
  for (const p of parts) {
    if (ORDER.indexOf(p.level) > ORDER.indexOf(worst.level)) worst = p;
  }
  if (worst.level === "NORMAL") {
    const allLow = cpu < 40 && mem < 60 && disk < 70;
    if (allLow) return { level: "OPTIMAL", reason: "All subsystems nominal." };
    return { level: "NORMAL", reason: "All subsystems within normal range." };
  }
  return worst;
}

export function levelColor(level: StatusLevel): string {
  switch (level) {
    case "OPTIMAL":
    case "NORMAL":
      return "#22d3ee";
    case "ELEVATED":
      return "#7dd3fc";
    case "WARNING":
      return "#f5b642";
    case "CRITICAL":
      return "#f04a4a";
  }
}
