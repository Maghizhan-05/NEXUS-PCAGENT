"""Deterministic alert engine with cooldowns to prevent alert spam."""
from __future__ import annotations

import time
import uuid

from app.models.alerts import Alert, AlertSeverity
from app.models.telemetry import SystemStatus

# Sustained-load thresholds.
CPU_WARN = 90.0
MEM_WARN = 90.0
DISK_WARN = 90.0
DISK_CRIT = 95.0
SUSTAIN_SECONDS = 10.0
COOLDOWN_SECONDS = 30.0


class AlertService:
    def __init__(self) -> None:
        self._history: list[Alert] = []
        self._active: dict[str, Alert] = {}
        self._cpu_high_since: float | None = None
        self._mem_high_since: float | None = None
        self._last_emit: dict[str, float] = {}

    def _emit(self, key: str, severity: AlertSeverity, title: str, desc: str) -> None:
        now = time.time()
        if now - self._last_emit.get(key, 0.0) < COOLDOWN_SECONDS:
            return
        alert = Alert(
            id=str(uuid.uuid4()),
            severity=severity,
            title=title,
            description=desc,
            timestamp=now,
        )
        self._last_emit[key] = now
        self._active[key] = alert
        self._history.append(alert)
        self._history = self._history[-50:]

    def _clear(self, key: str) -> None:
        self._active.pop(key, None)

    def evaluate(self, status: SystemStatus) -> None:
        now = time.time()

        # CPU sustained load.
        if status.cpu.usage_percent >= CPU_WARN:
            self._cpu_high_since = self._cpu_high_since or now
            if now - self._cpu_high_since >= SUSTAIN_SECONDS:
                self._emit(
                    "cpu_high",
                    AlertSeverity.WARNING,
                    "HIGH CPU LOAD",
                    f"CPU utilization has remained above {CPU_WARN:.0f}%.",
                )
        else:
            self._cpu_high_since = None
            self._clear("cpu_high")

        # Memory sustained load.
        if status.memory.percent >= MEM_WARN:
            self._mem_high_since = self._mem_high_since or now
            if now - self._mem_high_since >= SUSTAIN_SECONDS:
                self._emit(
                    "mem_high",
                    AlertSeverity.WARNING,
                    "HIGH MEMORY LOAD",
                    f"Memory utilization has remained above {MEM_WARN:.0f}%.",
                )
        else:
            self._mem_high_since = None
            self._clear("mem_high")

        # Disk capacity (instantaneous — no sustain needed).
        if status.disk.percent >= DISK_CRIT:
            self._emit(
                "disk_full",
                AlertSeverity.CRITICAL,
                "DISK NEARLY FULL",
                f"Disk usage has reached {status.disk.percent:.0f}%.",
            )
        elif status.disk.percent >= DISK_WARN:
            self._emit(
                "disk_full",
                AlertSeverity.WARNING,
                "DISK SPACE LOW",
                f"Disk usage has reached {status.disk.percent:.0f}%.",
            )
        else:
            self._clear("disk_full")

    def active_alerts(self) -> list[Alert]:
        return sorted(self._active.values(), key=lambda a: a.timestamp, reverse=True)

    def history(self) -> list[Alert]:
        return list(reversed(self._history))
