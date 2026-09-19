import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import { useProcesses } from "@/hooks/useProcesses";
import { formatBytes } from "@/lib/formatters";

export function ProcessPanel() {
  const [sort, setSort] = useState<"cpu" | "memory">("cpu");
  const processes = useProcesses(sort);

  const tab = (key: "cpu" | "memory", label: string) => (
    <button
      onClick={() => setSort(key)}
      className={`px-2 py-0.5 text-[10px] tracking-[0.2em] transition-colors ${
        sort === key ? "text-nexus-cyan" : "text-nexus-mute hover:text-nexus-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="panel corner-bracket flex h-full flex-col p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-nexus-cyan" strokeWidth={1.5} />
          <span className="panel-label">Top Processes</span>
        </div>
        <div className="flex items-center gap-1">
          {tab("cpu", "CPU")}
          <span className="text-nexus-line">|</span>
          {tab("memory", "MEM")}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-x-3 text-[9px] tracking-[0.2em] text-nexus-mute">
        <span>PROCESS</span>
        <span className="text-right">CPU</span>
        <span className="text-right">MEM</span>
      </div>

      <div className="mt-1 flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {processes.map((p) => (
            <motion.div
              key={p.pid}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-[1fr_auto_auto] gap-x-3 border-b border-nexus-line/40 py-1 text-xs"
            >
              <span className="truncate text-nexus-white/90" title={`${p.name} (${p.pid})`}>
                {p.name}
              </span>
              <span className="text-right tabular-nums text-nexus-cyan">
                {p.cpu_percent.toFixed(0)}%
              </span>
              <span className="text-right tabular-nums text-nexus-mute">
                {formatBytes(p.memory_bytes, 0)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {processes.length === 0 && (
          <div className="py-4 text-center text-[10px] text-nexus-mute">acquiring process table…</div>
        )}
      </div>
    </div>
  );
}
