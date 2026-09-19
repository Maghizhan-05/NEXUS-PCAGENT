"""Network rate calculation from psutil's cumulative counters."""
from __future__ import annotations

import time

import psutil

from app.models.telemetry import NetworkTelemetry


class NetworkService:
    """Tracks previous counters to derive upload/download rates (bytes/sec)."""

    def __init__(self) -> None:
        counters = psutil.net_io_counters()
        self._prev_sent = counters.bytes_sent
        self._prev_recv = counters.bytes_recv
        self._prev_time = time.monotonic()

    def sample(self) -> NetworkTelemetry:
        counters = psutil.net_io_counters()
        now = time.monotonic()
        elapsed = now - self._prev_time

        if elapsed <= 0:
            up_rate = down_rate = 0.0
        else:
            up_rate = max(0.0, (counters.bytes_sent - self._prev_sent) / elapsed)
            down_rate = max(0.0, (counters.bytes_recv - self._prev_recv) / elapsed)

        self._prev_sent = counters.bytes_sent
        self._prev_recv = counters.bytes_recv
        self._prev_time = now

        return NetworkTelemetry(
            bytes_sent=counters.bytes_sent,
            bytes_received=counters.bytes_recv,
            upload_rate=round(up_rate, 2),
            download_rate=round(down_rate, 2),
        )
