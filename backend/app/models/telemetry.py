"""Typed telemetry models returned by the NEXUS API."""
from __future__ import annotations

from pydantic import BaseModel


class CpuTelemetry(BaseModel):
    usage_percent: float
    core_count: int
    logical_core_count: int
    frequency_mhz: float | None = None


class MemoryTelemetry(BaseModel):
    total: int
    used: int
    available: int
    percent: float


class DiskTelemetry(BaseModel):
    total: int
    used: int
    free: int
    percent: float
    read_bytes: int | None = None
    write_bytes: int | None = None


class NetworkTelemetry(BaseModel):
    bytes_sent: int
    bytes_received: int
    upload_rate: float  # bytes/sec
    download_rate: float  # bytes/sec


class SystemTelemetry(BaseModel):
    hostname: str
    platform: str
    cpu_model: str
    boot_time: float
    uptime: float  # seconds


class GpuTelemetry(BaseModel):
    available: bool = False
    name: str | None = None
    load_percent: float | None = None
    memory_percent: float | None = None


class SystemStatus(BaseModel):
    cpu: CpuTelemetry
    memory: MemoryTelemetry
    disk: DiskTelemetry
    network: NetworkTelemetry
    system: SystemTelemetry
    gpu: GpuTelemetry


class TelemetrySnapshot(BaseModel):
    """Compact snapshot pushed over the WebSocket ~1x/sec."""

    timestamp: float
    cpu: float
    memory: float
    upload: float
    download: float
    disk: float
