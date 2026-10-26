from fastapi import APIRouter

from app.models import StatsSummary
from app.store import store

router = APIRouter(prefix="/api/stats", tags=["Stats"])


@router.get("/summary", response_model=StatsSummary)
def get_stats_summary():
    return store.get_stats_summary()
