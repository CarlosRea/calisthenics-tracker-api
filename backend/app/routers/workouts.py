from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.models import ExerciseCategory, Workout, WorkoutCreate
from app.store import store

router = APIRouter(prefix="/api/workouts", tags=["Workouts"])


@router.post("", response_model=Workout, status_code=status.HTTP_201_CREATED)
def create_workout(workout: WorkoutCreate):
    return store.create_workout(workout)


@router.get("", response_model=List[Workout])
def list_workouts(
    category: Optional[ExerciseCategory] = Query(None, description="Filter by category"),
    exercise: Optional[str] = Query(None, description="Filter by exercise name"),
):
    return store.list_workouts(category=category, exercise=exercise)


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(workout_id: int):
    deleted = store.delete_workout(workout_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout with ID {workout_id} not found"
        )
    return None
