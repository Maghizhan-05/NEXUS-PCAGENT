"""Backend unit tests. psutil is mocked where determinism matters."""
from __future__ import annotations

import sys
import time
import types
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.models.telemetry import (  # noqa: E402
    CpuTelemetry,
    DiskTelemetry,
    MemoryTelemetry,
    NetworkTelemetry,
    SystemStatus,
    SystemTelemetry,
    GpuTelemetry,
)
from app.services.alert_service import AlertService  # noqa: E402
from app.services.network_service import NetworkService  # noqa: E402
from app.services.process_service import ProcessService  # noqa: E402


def _counters(sent: int, recv: int):
    return types.SimpleNamespace(bytes_sent=sent, bytes_recv=recv)


def test_telemetry_model_roundtrip():
    m = MemoryTelemetry(total=100, used=60, available=40, percent=60.0)
    assert m.model_dump()["percent"] == 60.0


def test_network_rate_calculation():
    with patch("app.services.network_service.psutil.net_io_counters") as mock:
        mock.return_value = _counters(1000, 2000)
        svc = NetworkService()
        # Simulate 1s elapsed and +1000/+4000 bytes.
        svc._prev_time = time.monotonic() - 1.0
        mock.return_value = _counters(2000, 6000)
        sample = svc.sample()
    assert sample.upload_rate >= 900
    assert sample.download_rate >= 3900


def test_network_rate_never_negative():
    with patch("app.services.network_service.psutil.net_io_counters") as mock:
        mock.return_value = _counters(5000, 5000)
        svc = NetworkService()
        svc._prev_time = time.monotonic() - 1.0
        mock.return_value = _counters(1000, 1000)  # counter reset
        sample = svc.sample()
    assert sample.upload_rate == 0.0
    assert sample.download_rate == 0.0


def test_process_sorting_by_memory():
    fake = [
        types.SimpleNamespace(info={"pid": 1, "name": "a", "cpu_percent": 5.0,
                                    "memory_percent": 1.0,
                                    "memory_info": types.SimpleNamespace(rss=100),
                                    "status": "running"}),
        types.SimpleNamespace(info={"pid": 2, "name": "b", "cpu_percent": 1.0,
                                    "memory_percent": 9.0,
                                    "memory_info": types.SimpleNamespace(rss=900),
                                    "status": "running"}),
    ]
    with patch("app.services.process_service.psutil.process_iter", side_effect=[iter([]), iter(fake)]):
        svc = ProcessService()  # first process_iter -> priming
        result = svc.list_processes(sort="memory", limit=5)
    assert result.processes[0].pid == 2  # highest memory first


def _status(cpu: float, mem: float, disk: float) -> SystemStatus:
    return SystemStatus(
        cpu=CpuTelemetry(usage_percent=cpu, core_count=4, logical_core_count=8),
        memory=MemoryTelemetry(total=100, used=int(mem), available=100 - int(mem), percent=mem),
        disk=DiskTelemetry(total=100, used=int(disk), free=100 - int(disk), percent=disk),
        network=NetworkTelemetry(bytes_sent=0, bytes_received=0, upload_rate=0, download_rate=0),
        system=SystemTelemetry(hostname="t", platform="test", cpu_model="x", boot_time=0, uptime=1),
        gpu=GpuTelemetry(available=False),
    )


def test_alert_disk_critical_fires_immediately():
    svc = AlertService()
    svc.evaluate(_status(cpu=10, mem=10, disk=97))
    active = svc.active_alerts()
    assert any(a.title == "DISK NEARLY FULL" for a in active)


def test_alert_cpu_requires_sustain():
    svc = AlertService()
    svc.evaluate(_status(cpu=95, mem=10, disk=10))
    # Not yet sustained -> no CPU alert.
    assert not any(a.title == "HIGH CPU LOAD" for a in svc.active_alerts())
