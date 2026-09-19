"""Process listing endpoint."""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.models.process import ProcessList
from app.services import process_service

router = APIRouter(tags=["processes"])


@router.get("/processes", response_model=ProcessList)
def processes(
    sort: str = Query("cpu", pattern="^(cpu|memory)$"),
    limit: int = Query(10, ge=1, le=100),
) -> ProcessList:
    return process_service.list_processes(sort=sort, limit=limit)
