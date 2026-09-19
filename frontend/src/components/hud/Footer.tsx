import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { formatUptime } from "@/lib/formatters";

export function Footer() {
  const { label, ageSeconds, status } = useConnectionStatus();
  const uptime = useTelemetryStore((s) => s.status?.system.uptime);
  const hostname = useTelemetryStore((s) => s.status?.system.hostname);

  const live = status === "live";
  const updated =
    live && ageSeconds != null
      ? `updated ${ageSeconds < 1 ? "now" : `${ageSeconds.toFixed(0)}s ago`}`
      : label.toLowerCase();

  return (
    <footer className="flex shrink-0 items-center justify-between border-t border-web-line px-4 py-1.5 font-mono text-[10px] text-web-faint">
      <div className="flex items-center gap-4">
        <span>
          local node · <span className="text-web-mute">{hostname ?? "—"}</span>
        </span>
        <span className="hidden sm:inline">telemetry · {updated}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden md:inline">
          session <span className="tabular text-web-mute">{uptime ? formatUptime(uptime) : "—"}</span>
        </span>
        <span className="font-display uppercase tracking-widest2 text-web-faint">
          Spider<span className="text-web-red">·</span>Web HUD v0.1
        </span>
      </div>
    </footer>
  );
}
