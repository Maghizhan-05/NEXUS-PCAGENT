"""NEXUS FastAPI application entrypoint."""
from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import health, processes, system, voice
from app.core.config import get_settings
from app.websocket import telemetry_socket

settings = get_settings()

app = FastAPI(
    title="NEXUS Core",
    description="Local AI system monitor — real telemetry, read-only.",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(system.router, prefix="/api")
app.include_router(processes.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(telemetry_socket.router)


# Serve the built frontend in a packaged build (mounted last so /api and /ws
# win). In dev this dir is empty and Vite serves the UI instead.
if settings.static_dir and os.path.isdir(settings.static_dir):
    app.mount("/", StaticFiles(directory=settings.static_dir, html=True), name="ui")
else:

    @app.get("/")
    def root() -> dict:
        return {"name": "NEXUS Core", "status": "online", "docs": "/api/docs"}
