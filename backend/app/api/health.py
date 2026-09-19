"""Health + capability endpoints."""
from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/capabilities")
def capabilities() -> dict:
    """Reports which optional features are available (e.g. voice)."""
    settings = get_settings()
    return {"voice": settings.voice_configured}
