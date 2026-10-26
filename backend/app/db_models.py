from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base


class WorkoutDB(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    exercise_name = Column(String(255), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    added_weight = Column(Float, default=0.0, nullable=False)
    date = Column(String(10), nullable=False, index=True)


class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    salt = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
