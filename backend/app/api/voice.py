"""Backend-mediated ElevenLabs auth + telemetry tool endpoints.

The ElevenLabs API key never reaches the browser. The frontend requests a
short-lived conversation token here, then opens the WebRTC/WebSocket session
directly with ElevenLabs using that token. Tool calls from the agent hit the
`/voice/tools/*` endpoints, which return REAL telemetry only.
"""
from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.core.config import get_settings
from app.services import process_service, telemetry_service

router = APIRouter(prefix="/voice", tags=["voice"])


@router.get("/token")
async def voice_token() -> dict:
    """Fetch a short-lived signed WebSocket URL for the browser SDK.

    The installed @elevenlabs/client connects via `signedUrl`, so we use the
    get-signed-url endpoint rather than the WebRTC token endpoint.
    """
    settings = get_settings()
    if not settings.voice_configured:
        raise HTTPException(
            status_code=503,
            detail="Voice not configured. Set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID.",
        )
    url = "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"
    params = {"agent_id": settings.elevenlabs_agent_id}
    headers = {"xi-api-key": settings.elevenlabs_api_key}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params, headers=headers)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Could not reach ElevenLabs: {exc}") from exc

    if resp.status_code == 401 and "convai_write" in resp.text:
        raise HTTPException(
            status_code=403,
            detail=(
                "Your ElevenLabs API key is missing the 'ElevenAgents = Write' "
                "permission required to start a voice session. Edit the key in the "
                "ElevenLabs dashboard (or create a new one) with ElevenAgents set to "
                "Write, update backend/.env, and restart."
            ),
        )
    if resp.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"ElevenLabs error {resp.status_code}: {resp.text}")

    data = resp.json()
    return {
        "agent_id": settings.elevenlabs_agent_id,
        "signed_url": data.get("signed_url"),
    }


# --- Tool endpoints: the agent calls these to fetch real telemetry ---


@router.get("/tools/system_status")
def tool_system_status() -> dict:
    s = telemetry_service.status()
    return {
        "cpu_percent": s.cpu.usage_percent,
        "memory_percent": s.memory.percent,
        "disk_percent": s.disk.percent,
        "upload_bytes_per_sec": s.network.upload_rate,
        "download_bytes_per_sec": s.network.download_rate,
        "uptime_seconds": round(s.system.uptime),
        "hostname": s.system.hostname,
    }


@router.get("/tools/cpu")
def tool_cpu() -> dict:
    c = telemetry_service.cpu()
    return {"usage_percent": c.usage_percent, "cores": c.logical_core_count}


@router.get("/tools/memory")
def tool_memory() -> dict:
    m = telemetry_service.memory()
    return {
        "percent": m.percent,
        "used_bytes": m.used,
        "total_bytes": m.total,
    }


@router.get("/tools/disk")
def tool_disk() -> dict:
    d = telemetry_service.disk()
    return {"percent": d.percent, "free_bytes": d.free, "total_bytes": d.total}


@router.get("/tools/network")
def tool_network() -> dict:
    n = telemetry_service.network()
    return {
        "upload_bytes_per_sec": n.upload_rate,
        "download_bytes_per_sec": n.download_rate,
    }


@router.get("/tools/top_processes")
def tool_top_processes(
    sort: str = Query("cpu", pattern="^(cpu|memory)$"),
    limit: int = Query(5, ge=1, le=20),
) -> dict:
    pl = process_service.list_processes(sort=sort, limit=limit)
    return {
        "sort": pl.sort,
        "processes": [
            {
                "name": p.name,
                "pid": p.pid,
                "cpu_percent": p.cpu_percent,
                "memory_bytes": p.memory_bytes,
                "memory_percent": p.memory_percent,
            }
            for p in pl.processes
        ],
    }
