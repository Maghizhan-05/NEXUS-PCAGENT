import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ProcessInfo } from "@/types/telemetry";

export function useProcesses(sort: "cpu" | "memory") {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      // Skip while the window is hidden — enumerating processes is not cheap.
      if (document.hidden) return;
      try {
        const list = await api.processes(sort, 8);
        if (alive) setProcesses(list.processes);
      } catch {
        /* ignore transient failure */
      }
    };
    poll();
    const id = setInterval(poll, 4000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [sort]);

  return processes;
}
