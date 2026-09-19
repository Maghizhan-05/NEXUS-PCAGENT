"""Process enumeration and sorting."""
from __future__ import annotations

import psutil

from app.models.process import ProcessInfo, ProcessList

VALID_SORTS = {"cpu", "memory"}

# Kernel idle accounting — not real consumers, and their per-core CPU sums
# dwarf everything else on the list.
_EXCLUDED = {"System Idle Process", "Idle"}
_CORES = psutil.cpu_count(logical=True) or 1


class ProcessService:
    def __init__(self) -> None:
        # Prime per-process cpu_percent counters.
        for proc in psutil.process_iter():
            try:
                proc.cpu_percent(interval=None)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

    def list_processes(self, sort: str = "cpu", limit: int = 10) -> ProcessList:
        sort = sort if sort in VALID_SORTS else "cpu"
        limit = max(1, min(limit, 100))
        results: list[ProcessInfo] = []

        for proc in psutil.process_iter(
            ["pid", "name", "cpu_percent", "memory_percent", "memory_info", "status"]
        ):
            try:
                info = proc.info
                name = info.get("name") or "unknown"
                if info["pid"] == 0 or name in _EXCLUDED:
                    continue
                mem_info = info.get("memory_info")
                # psutil sums per-core; normalize to a share of total CPU.
                cpu_share = (info.get("cpu_percent") or 0.0) / _CORES
                results.append(
                    ProcessInfo(
                        pid=info["pid"],
                        name=name,
                        cpu_percent=round(min(cpu_share, 100.0), 1),
                        memory_percent=round(info.get("memory_percent") or 0.0, 1),
                        memory_bytes=mem_info.rss if mem_info else 0,
                        status=info.get("status") or "unknown",
                    )
                )
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue  # process vanished mid-scan — ignore gracefully.

        key = (lambda p: p.cpu_percent) if sort == "cpu" else (lambda p: p.memory_bytes)
        results.sort(key=key, reverse=True)
        top = results[:limit]

        return ProcessList(sort=sort, count=len(top), processes=top)
