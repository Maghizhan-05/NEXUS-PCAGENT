"""Standalone entrypoint for the packaged backend (built with PyInstaller).

Runs the FastAPI app under uvicorn without an import string, so it works inside
a frozen single-file executable. In the packaged app, NEXUS_STATIC_DIR points
at the built frontend so the backend also serves the UI.
"""
from __future__ import annotations

import os

import uvicorn

from app.main import app

if __name__ == "__main__":
    host = os.getenv("NEXUS_HOST", "127.0.0.1")
    port = int(os.getenv("NEXUS_PORT", "8000"))
    uvicorn.run(app, host=host, port=port, log_level="info")
