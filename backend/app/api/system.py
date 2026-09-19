"""System telemetry endpoints."""
from __future__ import annotations

from fastapi import APIRouter

from app.models.alerts import Alert
from app.models.telemetry import SystemStatus
from app.services import alert_service, telemetry_service

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/status", response_model=SystemStatus)
def system_status() -> SystemStatus:
    status = telemetry_service.status()
    alert_service.evaluate(status)
    return status


@router.get("/alerts", response_model=list[Alert])
def alerts() -> list[Alert]:
    return alert_service.active_alerts()


@router.get("/alerts/history", response_model=list[Alert])
def alerts_history() -> list[Alert]:
    return alert_service.history()
