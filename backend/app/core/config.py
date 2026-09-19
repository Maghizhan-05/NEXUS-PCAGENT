"""NEXUS runtime configuration loaded from environment."""
from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings sourced from environment variables."""

    def __init__(self) -> None:
        origins = os.getenv(
            "NEXUS_CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )
        self.cors_origins: list[str] = [o.strip() for o in origins.split(",") if o.strip()]
        self.telemetry_interval: float = float(os.getenv("NEXUS_TELEMETRY_INTERVAL", "1.0"))

        # ElevenLabs (server-side only — never exposed to the browser).
        self.elevenlabs_api_key: str = os.getenv("ELEVENLABS_API_KEY", "")
        self.elevenlabs_agent_id: str = os.getenv("ELEVENLABS_AGENT_ID", "")

    @property
    def voice_configured(self) -> bool:
        return bool(self.elevenlabs_api_key and self.elevenlabs_agent_id)


@lru_cache
def get_settings() -> Settings:
    return Settings()
