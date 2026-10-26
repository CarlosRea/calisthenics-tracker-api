import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = (
    os.environ.get("DATABASE_URL")
    or os.environ.get("CALISTHENICS_DATABASE_URL")
    or os.environ.get("SDIP_DATABASE_URL")
    or "sqlite:///./workouts.db"
)

# Ensure directory exists if SQLite path is used
if DATABASE_URL.startswith("sqlite:////"):
    db_file_path = DATABASE_URL.replace("sqlite:////", "/")
    os.makedirs(os.path.dirname(db_file_path), exist_ok=True)

# Conditional connect_args to remain database-agnostic
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(target_engine=engine):
    """Create all tables and auto-seed demo data if the database is empty."""
    Base.metadata.create_all(bind=target_engine)

    from app.db_models import UserDB, WorkoutDB
    from app.auth import hash_password

    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=target_engine)
    with session_factory() as db:
        if db.query(WorkoutDB).count() == 0:
            demo_workouts = [
                WorkoutDB(
                    exercise_name="Weighted Pull-ups",
                    category="Pull",
                    sets=4,
                    reps=8,
                    added_weight=15.0,
                    date="2026-10-24",
                ),
                WorkoutDB(
                    exercise_name="Parallel Bar Dips",
                    category="Push",
                    sets=4,
                    reps=15,
                    added_weight=10.0,
                    date="2026-10-25",
                ),
                WorkoutDB(
                    exercise_name="Pistol Squats",
                    category="Legs",
                    sets=3,
                    reps=10,
                    added_weight=0.0,
                    date="2026-10-25",
                ),
                WorkoutDB(
                    exercise_name="Hanging Leg Raises",
                    category="Core",
                    sets=3,
                    reps=12,
                    added_weight=0.0,
                    date="2026-10-26",
                ),
            ]
            db.add_all(demo_workouts)
            db.commit()

        if db.query(UserDB).count() == 0:
            pwd_hash, salt = hash_password("calisthenics123")
            demo_user = UserDB(
                username="admin",
                hashed_password=pwd_hash,
                salt=salt,
                is_active=True,
            )
            db.add(demo_user)
            db.commit()
