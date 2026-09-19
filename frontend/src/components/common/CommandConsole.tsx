import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { api } from "@/lib/api";
import { formatRate, formatUptime, formatBytes } from "@/lib/formatters";

interface Line {
  id: number;
  text: string;
  kind: "in" | "out";
}

const HELP = [
  "AVAILABLE COMMANDS:",
  "  system status   full telemetry summary",
  "  cpu             processor load",
  "  memory          memory utilization",
  "  network         throughput",
  "  disk            storage usage",
  "  processes       top processes by CPU",
  "  clear           clear console",
  "  help            this list",
  "NOTE: read-only. No OS shell commands are executed.",
];

let uid = 0;

export function CommandConsole() {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { id: uid++, text: "NEXUS command interface ready. Type 'help'.", kind: "out" },
  ]);

  const emit = (texts: string[], kind: "in" | "out" = "out") =>
    setLines((prev) => [...prev, ...texts.map((t) => ({ id: uid++, text: t, kind }))]);

  const run = async (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    emit([`> ${raw}`], "in");
    const s = useTelemetryStore.getState().status;
    const latest = useTelemetryStore.getState().latest;

    switch (cmd) {
      case "help":
        emit(HELP);
        break;
      case "clear":
        setLines([]);
        break;
      case "system status":
        if (!s) return emit(["telemetry unavailable"]);
        emit([
          "SYSTEM",
          "────────────────────",
          `CPU        ${(latest?.cpu ?? s.cpu.usage_percent).toFixed(0)}%`,
          `MEMORY     ${s.memory.percent.toFixed(0)}%`,
          `DISK       ${s.disk.percent.toFixed(0)}%`,
          `NETWORK    ↓${formatRate(s.network.download_rate)} ↑${formatRate(s.network.upload_rate)}`,
          `UPTIME     ${formatUptime(s.system.uptime)}`,
        ]);
        break;
      case "cpu":
        emit([`CPU ${(latest?.cpu ?? s?.cpu.usage_percent ?? 0).toFixed(0)}% · ${s?.cpu.logical_core_count ?? "?"} threads`]);
        break;
      case "memory":
        if (!s) return emit(["telemetry unavailable"]);
        emit([`MEMORY ${s.memory.percent.toFixed(0)}% · ${formatBytes(s.memory.used)} / ${formatBytes(s.memory.total)}`]);
        break;
      case "network":
        if (!s) return emit(["telemetry unavailable"]);
        emit([`DOWN ${formatRate(s.network.download_rate)} · UP ${formatRate(s.network.upload_rate)}`]);
        break;
      case "disk":
        if (!s) return emit(["telemetry unavailable"]);
        emit([`DISK ${s.disk.percent.toFixed(0)}% · ${formatBytes(s.disk.free)} free`]);
        break;
      case "processes":
        try {
          const pl = await api.processes("cpu", 5);
          emit(["TOP PROCESSES", ...pl.processes.map((p) => `  ${p.name.padEnd(22).slice(0, 22)} ${p.cpu_percent.toFixed(0)}%  ${formatBytes(p.memory_bytes, 0)}`)]);
        } catch {
          emit(["process table unavailable"]);
        }
        break;
      default:
        emit([`unknown command: ${cmd}  (try 'help')`]);
    }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Console</span>
        <span className="font-mono text-[9px] tracking-widest2 text-nexus-faint">help</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed">
        {lines.map((l) => (
          <div key={l.id} className={l.kind === "in" ? "text-nexus-cyan" : "text-nexus-mute"}>
            <pre className="whitespace-pre-wrap font-mono">{l.text}</pre>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
          setInput("");
        }}
        className="flex items-center gap-1 border-t border-nexus-hair px-3 py-2"
      >
        <ChevronRight size={12} className="text-nexus-cyan" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          aria-label="NEXUS command input"
          placeholder="type a command…"
          className="flex-1 bg-transparent font-mono text-[11px] text-nexus-text placeholder:text-nexus-faint focus:outline-none"
        />
      </form>
    </div>
  );
}
