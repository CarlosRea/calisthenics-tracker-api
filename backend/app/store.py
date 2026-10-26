from typing import Dict, List, Optional
from datetime import date
from app.models import CategoryPR, ExerciseCategory, StatsSummary, UserInDB, Workout, WorkoutCreate


class InMemoryStore:
    def __init__(self):
        self.workouts: List[Workout] = []
        self.users: Dict[str, UserInDB] = {}
        self.next_id: int = 1
        self.seed()

    def seed(self):
        from app.auth import hash_password

        # Seed initial demo street workout logs
        self.workouts = [
            Workout(
                id=1,
                exercise_name="Weighted Pull-ups",
                category=ExerciseCategory.Pull,
                sets=4,
                reps=8,
                added_weight=15.0,
                date="2026-10-24",
            ),
            Workout(
                id=2,
                exercise_name="Parallel Bar Dips",
                category=ExerciseCategory.Push,
                sets=4,
                reps=15,
                added_weight=10.0,
                date="2026-10-25",
            ),
            Workout(
                id=3,
                exercise_name="Pistol Squats",
                category=ExerciseCategory.Legs,
                sets=3,
                reps=10,
                added_weight=0.0,
                date="2026-10-25",
            ),
            Workout(
                id=4,
                exercise_name="Hanging Leg Raises",
                category=ExerciseCategory.Core,
                sets=3,
                reps=12,
                added_weight=0.0,
                date="2026-10-26",
            ),
        ]
        self.next_id = 5

        # Seed initial demo user (username: "admin", password: "calisthenics123")
        pwd_hash, salt = hash_password("calisthenics123")
        self.users = {
            "admin": UserInDB(
                username="admin",
                hashed_password=pwd_hash,
                salt=salt,
                is_active=True,
            )
        }

    def reset(self):
        self.seed()

    # Workouts methods
    def list_workouts(
        self,
        category: Optional[ExerciseCategory] = None,
        exercise: Optional[str] = None
    ) -> List[Workout]:
        results = self.workouts.copy()

        if category is not None:
            results = [w for w in results if w.category == category]

        if exercise and exercise.strip():
            query = exercise.strip().lower()
            results = [w for w in results if query in w.exercise_name.lower()]

        # Sort by date descending, then ID descending
        results.sort(key=lambda w: (w.date, w.id), reverse=True)
        return results

    def create_workout(self, item: WorkoutCreate) -> Workout:
        workout = Workout(
            id=self.next_id,
            exercise_name=item.exercise_name.strip(),
            category=item.category,
            sets=item.sets,
            reps=item.reps,
            added_weight=item.added_weight,
            date=item.date or date.today().isoformat(),
        )
        self.next_id += 1
        self.workouts.append(workout)
        return workout

    def get_workout(self, workout_id: int) -> Optional[Workout]:
        for w in self.workouts:
            if w.id == workout_id:
                return w
        return None

    def delete_workout(self, workout_id: int) -> bool:
        initial_len = len(self.workouts)
        self.workouts = [w for w in self.workouts if w.id != workout_id]
        return len(self.workouts) < initial_len

    def get_stats_summary(self) -> StatsSummary:
        total_workouts = len(self.workouts)
        total_volume = sum(w.sets * w.reps for w in self.workouts)

        prs = {"Pull": 0, "Push": 0, "Legs": 0, "Core": 0}
        for w in self.workouts:
            cat_name = w.category.value
            if w.reps > prs[cat_name]:
                prs[cat_name] = w.reps

        return StatsSummary(
            total_workouts=total_workouts,
            total_volume=total_volume,
            personal_records=CategoryPR(**prs),
        )

    # User auth methods
    def get_user(self, username: str) -> Optional[UserInDB]:
        return self.users.get(username)

    def create_user(self, user: UserInDB) -> UserInDB:
        self.users[user.username] = user
        return user


store = InMemoryStore()
