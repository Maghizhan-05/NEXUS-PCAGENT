"""Process models."""
from __future__ import annotations

from pydantic import BaseModel


class ProcessInfo(BaseModel):
    pid: int
    name: str
    cpu_percent: float
    memory_percent: float
    memory_bytes: int
    status: str


class ProcessList(BaseModel):
    sort: str
    count: int
    processes: list[ProcessInfo]
