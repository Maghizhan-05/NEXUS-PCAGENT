import { useState } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { formatBytes } from "@/lib/formatters";

export function ProcessPanel() {
  const [sort, setSort] = useState<"cpu" | "memory">("cpu");
  const processes = useProcesses(sort);

  const tab = (key: "cpu" | "memory", label: string) => (
    <button
      onClick={() => setSort(key)}
      aria-pressed={sort === key}
      className={`font-mono text-[10px] tracking-wider transition-colors ${
        sort === key ? "text-nexus-cyan" : "text-nexus-faint hover:text-nexus-mute"
      }`}
    >
      {label}
      {sort === key && " ↓"}
    </button>
  );

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Process Activity</span>
        <div className="flex items-center gap-3">
          {tab("cpu", "CPU")}
          {tab("memory", "MEM")}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-3 pt-1.5">
        <div className="grid grid-cols-[1fr_3rem_4.5rem] gap-x-2 border-b border-nexus-hair pb-1 font-mono text-[9px] uppercase tracking-wider text-nexus-faint">
          <span>Name</span>
          <span className="text-right">CPU</span>
          <span className="text-right">Memory</span>
        </div>

        <div className="h-[calc(100%-1.5rem)] overflow-y-auto">
          {processes.map((p) => (
            <div
              key={p.pid}
              className="grid grid-cols-[1fr_3rem_4.5rem] gap-x-2 border-b border-nexus-hair/50 py-1 font-mono text-[11px]"
            >
              <span className="truncate text-nexus-text/90" title={`${p.name} · pid ${p.pid}`}>
                {p.name}
              </span>
              <span className="text-right tabular text-nexus-cyan">{p.cpu_percent.toFixed(0)}%</span>
              <span className="text-right tabular text-nexus-mute">{formatBytes(p.memory_bytes, 0)}</span>
            </div>
          ))}
          {processes.length === 0 && (
            <div className="py-4 text-center font-mono text-[10px] text-nexus-faint">
              reading process table…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
