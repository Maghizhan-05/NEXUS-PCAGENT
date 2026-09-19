"""Network rate calculation from psutil's cumulative counters.

This service is a shared singleton sampled by several callers (the ~1s
WebSocket loop, the HTTP status endpoint, and the voice tool endpoints). If
every call recomputed the delta, the window between two nearby calls would be a
few milliseconds and the rate would swing wildly. To keep rates stable and
correct, we only recompute over a real window (>= MIN_WINDOW) and otherwise
return the last computed value.
"""
from __future__ import annotations

import threading
import time

import psutil

from app.models.telemetry import NetworkTelemetry

MIN_WINDOW = 0.75  # seconds — minimum span between recomputes


class NetworkService:
    def __init__(self) -> None:
        counters = psutil.net_io_counters()
        self._prev_sent = counters.bytes_sent
        self._prev_recv = counters.bytes_recv
        self._prev_time = time.monotonic()
        self._lock = threading.Lock()
        self._last = NetworkTelemetry(
            bytes_sent=counters.bytes_sent,
            bytes_received=counters.bytes_recv,
            upload_rate=0.0,
            download_rate=0.0,
        )

    def sample(self) -> NetworkTelemetry:
        with self._lock:
            now = time.monotonic()
            elapsed = now - self._prev_time

            # Too soon since the last recompute — reuse the stable value but
            # refresh the absolute counters so totals stay current.
            if elapsed < MIN_WINDOW:
                counters = psutil.net_io_counters()
                self._last = self._last.model_copy(
                    update={
                        "bytes_sent": counters.bytes_sent,
                        "bytes_received": counters.bytes_recv,
                    }
                )
                return self._last

            counters = psutil.net_io_counters()
            up_rate = max(0.0, (counters.bytes_sent - self._prev_sent) / elapsed)
            down_rate = max(0.0, (counters.bytes_recv - self._prev_recv) / elapsed)

            self._prev_sent = counters.bytes_sent
            self._prev_recv = counters.bytes_recv
            self._prev_time = now

            self._last = NetworkTelemetry(
                bytes_sent=counters.bytes_sent,
                bytes_received=counters.bytes_recv,
                upload_rate=round(up_rate, 2),
                download_rate=round(down_rate, 2),
            )
            return self._last
