from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import WorkoutDB
from app.models import ExerciseCategory, Workout, WorkoutCreate
from app.telemetry import (
    record_workout_created,
    record_workout_deleted,
    record_workout_error,
)

router = APIRouter(prefix="/api/workouts", tags=["Workouts"])


@router.post("", response_model=Workout, status_code=status.HTTP_201_CREATED)
def create_workout(workout: WorkoutCreate, db: Session = Depends(get_db)):
    try:
        db_workout = WorkoutDB(
            exercise_name=workout.exercise_name.strip(),
            category=workout.category.value,
            sets=workout.sets,
            reps=workout.reps,
            added_weight=workout.added_weight,
            date=workout.date or date.today().isoformat(),
        )
        db.add(db_workout)
        db.commit()
        db.refresh(db_workout)

        # Record domain application metrics
        record_workout_created(
            category=db_workout.category,
            exercise=db_workout.exercise_name,
            sets=db_workout.sets,
            reps=db_workout.reps,
        )
        return db_workout
    except Exception as e:
        record_workout_error(operation="create_workout", reason=str(e))
        raise


@router.get("", response_model=List[Workout])
def list_workouts(
    category: Optional[ExerciseCategory] = Query(None, description="Filter by category"),
    exercise: Optional[str] = Query(None, description="Filter by exercise name"),
    db: Session = Depends(get_db),
):
    query = db.query(WorkoutDB)

    if category is not None:
        query = query.filter(WorkoutDB.category == category.value)

    if exercise and exercise.strip():
        search_pattern = f"%{exercise.strip()}%"
        # Database-agnostic case-insensitive search
        query = query.filter(WorkoutDB.exercise_name.ilike(search_pattern))

    return query.order_by(WorkoutDB.date.desc(), WorkoutDB.id.desc()).all()


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    db_workout = db.query(WorkoutDB).filter(WorkoutDB.id == workout_id).first()
    if not db_workout:
        record_workout_error(operation="delete_workout", reason="not_found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout with ID {workout_id} not found"
        )
    category = db_workout.category
    db.delete(db_workout)
    db.commit()

    # Record deletion metric
    record_workout_deleted(category=category)
    return None
