"""Collects real system telemetry via psutil. Each metric is guarded so a
single failure never crashes a collection cycle."""
from __future__ import annotations

import platform
import sys
import time

import psutil

from app.models.telemetry import (
    CpuTelemetry,
    DiskTelemetry,
    GpuTelemetry,
    MemoryTelemetry,
    SystemStatus,
    SystemTelemetry,
)
from app.services.network_service import NetworkService

try:  # GPU is optional and must never be a hard dependency.
    import GPUtil  # type: ignore
except Exception:  # pragma: no cover - import guard
    GPUtil = None


class TelemetryService:
    def __init__(self) -> None:
        self._network = NetworkService()
        self._cpu_model = self._resolve_cpu_model()
        # Prime cpu_percent so the first real reading is non-zero.
        psutil.cpu_percent(interval=None)

    @staticmethod
    def _resolve_cpu_model() -> str:
        proc = platform.processor()
        if proc:
            return proc
        return f"{platform.machine()} CPU"

    @staticmethod
    def _resolve_os_label() -> str:
        """Human-readable OS name.

        On Windows, ``platform.release()`` reports "10" even on Windows 11 —
        the only reliable signal is the build number (>= 22000 => Windows 11).
        We never hardcode an edition; we derive it from the actual build.
        """
        system = platform.system()
        if system != "Windows":
            release = platform.release()
            return f"{system} {release}".strip()

        build = 0
        try:
            build = sys.getwindowsversion().build  # type: ignore[attr-defined]
        except Exception:
            try:
                build = int(platform.version().split(".")[2])
            except Exception:
                build = 0

        if build >= 22000:
            return "Windows 11"
        if build > 0:
            return "Windows 10"
        return "Windows"

    def cpu(self) -> CpuTelemetry:
        freq = None
        try:
            f = psutil.cpu_freq()
            freq = round(f.current, 1) if f else None
        except Exception:
            freq = None
        return CpuTelemetry(
            usage_percent=round(psutil.cpu_percent(interval=None), 1),
            core_count=psutil.cpu_count(logical=False) or 0,
            logical_core_count=psutil.cpu_count(logical=True) or 0,
            frequency_mhz=freq,
        )

    def memory(self) -> MemoryTelemetry:
        vm = psutil.virtual_memory()
        return MemoryTelemetry(
            total=vm.total,
            used=vm.used,
            available=vm.available,
            percent=round(vm.percent, 1),
        )

    def disk(self) -> DiskTelemetry:
        usage = psutil.disk_usage("/")
        read_bytes = write_bytes = None
        try:
            io = psutil.disk_io_counters()
            if io:
                read_bytes, write_bytes = io.read_bytes, io.write_bytes
        except Exception:
            pass
        return DiskTelemetry(
            total=usage.total,
            used=usage.used,
            free=usage.free,
            percent=round(usage.percent, 1),
            read_bytes=read_bytes,
            write_bytes=write_bytes,
        )

    def network(self):
        return self._network.sample()

    def system(self) -> SystemTelemetry:
        boot = psutil.boot_time()
        return SystemTelemetry(
            hostname=platform.node(),
            platform=self._resolve_os_label(),
            cpu_model=self._cpu_model,
            boot_time=boot,
            uptime=max(0.0, time.time() - boot),
        )

    def gpu(self) -> GpuTelemetry:
        if GPUtil is None:
            return GpuTelemetry(available=False)
        try:
            gpus = GPUtil.getGPUs()
            if not gpus:
                return GpuTelemetry(available=False)
            g = gpus[0]
            return GpuTelemetry(
                available=True,
                name=g.name,
                load_percent=round(g.load * 100, 1),
                memory_percent=round(g.memoryUtil * 100, 1),
            )
        except Exception:
            return GpuTelemetry(available=False)

    def status(self) -> SystemStatus:
        return SystemStatus(
            cpu=self.cpu(),
            memory=self.memory(),
            disk=self.disk(),
            network=self.network(),
            system=self.system(),
            gpu=self.gpu(),
        )
