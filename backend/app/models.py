from datetime import date
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class ExerciseCategory(str, Enum):
    Pull = "Pull"
    Push = "Push"
    Legs = "Legs"
    Core = "Core"


class WorkoutCreate(BaseModel):
    exercise_name: str = Field(..., min_length=1, description="Exercise name", json_schema_extra={"example": "Pull-ups"})
    category: ExerciseCategory = Field(..., description="Movement category")
    sets: int = Field(..., ge=1, description="Completed sets", json_schema_extra={"example": 4})
    reps: int = Field(..., ge=1, description="Reps completed per set", json_schema_extra={"example": 10})
    added_weight: float = Field(0.0, ge=0.0, description="Extra weight in kg", json_schema_extra={"example": 10.0})
    date: Optional[str] = Field(
        default_factory=lambda: date.today().isoformat(),
        description="ISO date string (YYYY-MM-DD)",
        json_schema_extra={"example": "2026-10-26"}
    )


class Workout(BaseModel):
    id: int
    exercise_name: str
    category: ExerciseCategory
    sets: int
    reps: int
    added_weight: float
    date: str


class CategoryPR(BaseModel):
    Pull: int = 0
    Push: int = 0
    Legs: int = 0
    Core: int = 0


class StatsSummary(BaseModel):
    total_workouts: int
    total_volume: int
    personal_records: CategoryPR


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class User(BaseModel):
    username: str
    is_active: bool = True


class UserInDB(User):
    hashed_password: str
    salt: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
