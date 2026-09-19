"""Alert models."""
from __future__ import annotations

from enum import Enum

from pydantic import BaseModel


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class Alert(BaseModel):
    id: str
    severity: AlertSeverity
    title: str
    description: str
    timestamp: float
