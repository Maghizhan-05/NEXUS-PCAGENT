import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ProcessInfo } from "@/types/telemetry";

export function useProcesses(sort: "cpu" | "memory") {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const list = await api.processes(sort, 8);
        if (alive) setProcesses(list.processes);
      } catch {
        /* ignore transient failure */
      }
    };
    poll();
    const id = setInterval(poll, 2500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [sort]);

  return processes;
}
