import { useConnectionStatus, type DisplayStatus } from "@/hooks/useConnectionStatus";

const TONE: Record<DisplayStatus, string> = {
  live: "#2f6bff",
  connecting: "#7a88ab",
  reconnecting: "#f0a92e",
  stale: "#f0a92e",
  offline: "#e5142a",
};

export function ConnectionBadge() {
  const { status, label, ageSeconds } = useConnectionStatus();
  const color = TONE[status];
  const pulse = status === "live" || status === "connecting" || status === "reconnecting";

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-50 motion-safe:animate-ping"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className="relative inline-flex h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      </span>
      <span className="font-display text-[12px] font-medium uppercase tracking-widest2" style={{ color }}>
        {label}
      </span>
      {status === "live" && ageSeconds != null && (
        <span className="font-mono text-[10px] text-nexus-faint">
          · {ageSeconds < 1 ? "now" : `${ageSeconds.toFixed(0)}s ago`}
        </span>
      )}
    </div>
  );
}
