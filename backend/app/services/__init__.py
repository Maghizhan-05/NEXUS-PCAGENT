"""Shared singleton service instances.

Instantiated once so per-process CPU counters and network deltas persist
across requests and the WebSocket loop.
"""
from __future__ import annotations

from app.services.alert_service import AlertService
from app.services.process_service import ProcessService
from app.services.telemetry_service import TelemetryService

telemetry_service = TelemetryService()
process_service = ProcessService()
alert_service = AlertService()
