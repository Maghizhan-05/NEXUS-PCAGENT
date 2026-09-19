"""WebSocket that streams compact telemetry snapshots ~1x/sec."""
from __future__ import annotations

import asyncio
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.config import get_settings
from app.models.telemetry import TelemetrySnapshot
from app.services import alert_service, telemetry_service

router = APIRouter()


@router.websocket("/ws/telemetry")
async def telemetry_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    interval = get_settings().telemetry_interval
    try:
        while True:
            status = telemetry_service.status()
            alert_service.evaluate(status)
            snapshot = TelemetrySnapshot(
                timestamp=time.time(),
                cpu=status.cpu.usage_percent,
                memory=status.memory.percent,
                upload=status.network.upload_rate,
                download=status.network.download_rate,
                disk=status.disk.percent,
            )
            await websocket.send_json(snapshot.model_dump())
            await asyncio.sleep(interval)
    except WebSocketDisconnect:
        return
    except Exception:
        # Never let a telemetry hiccup take down the socket loudly.
        try:
            await websocket.close()
        except Exception:
            pass
