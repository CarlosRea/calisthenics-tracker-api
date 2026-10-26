from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import WorkoutDB
from app.models import CategoryPR, StatsSummary

router = APIRouter(prefix="/api/stats", tags=["Stats"])


@router.get("/summary", response_model=StatsSummary)
def get_stats_summary(db: Session = Depends(get_db)):
    workouts = db.query(WorkoutDB).all()

    total_workouts = len(workouts)
    total_volume = sum(w.sets * w.reps for w in workouts)

    prs = {"Pull": 0, "Push": 0, "Legs": 0, "Core": 0}
    for w in workouts:
        cat = w.category
        if cat in prs and w.reps > prs[cat]:
            prs[cat] = w.reps

    return StatsSummary(
        total_workouts=total_workouts,
        total_volume=total_volume,
        personal_records=CategoryPR(**prs),
    )
