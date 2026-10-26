import { ExerciseCategory, StatsSummary, Workout, WorkoutCreate } from '../types/workout';
import { IWorkoutService } from './workoutService';

const STORAGE_KEY = 'calisthenics_workouts_db';

const INITIAL_SEED_DATA: Workout[] = [
  {
    id: 1,
    exercise_name: 'Weighted Pull-ups',
    category: 'Pull',
    sets: 4,
    reps: 8,
    added_weight: 15,
    date: '2026-10-24',
  },
  {
    id: 2,
    exercise_name: 'Parallel Bar Dips',
    category: 'Push',
    sets: 4,
    reps: 15,
    added_weight: 10,
    date: '2026-10-25',
  },
  {
    id: 3,
    exercise_name: 'Pistol Squats',
    category: 'Legs',
    sets: 3,
    reps: 10,
    added_weight: 0,
    date: '2026-10-25',
  },
  {
    id: 4,
    exercise_name: 'Hanging Leg Raises',
    category: 'Core',
    sets: 3,
    reps: 12,
    added_weight: 0,
    date: '2026-10-26',
  },
];

export class MockWorkoutService implements IWorkoutService {
  private inMemoryWorkouts: Workout[] | null = null;

  private getWorkouts(): Workout[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
        return [...INITIAL_SEED_DATA];
      }
      try {
        return JSON.parse(data);
      } catch {
        return [...INITIAL_SEED_DATA];
      }
    }

    if (!this.inMemoryWorkouts) {
      this.inMemoryWorkouts = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    }
    return this.inMemoryWorkouts!;
  }

  private saveWorkouts(workouts: Workout[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    }
    this.inMemoryWorkouts = [...workouts];
  }

  async listWorkouts(category?: ExerciseCategory, exercise?: string): Promise<Workout[]> {
    let list = this.getWorkouts();

    if (category) {
      list = list.filter((w) => w.category === category);
    }

    if (exercise && exercise.trim() !== '') {
      const query = exercise.toLowerCase().trim();
      list = list.filter((w) => w.exercise_name.toLowerCase().includes(query));
    }

    // Sort by date descending, then ID descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id);
  }

  async createWorkout(workout: WorkoutCreate): Promise<Workout> {
    const list = this.getWorkouts();
    const newId = list.length > 0 ? Math.max(...list.map((w) => w.id)) + 1 : 1;

    const newWorkout: Workout = {
      id: newId,
      exercise_name: workout.exercise_name.trim(),
      category: workout.category,
      sets: Number(workout.sets),
      reps: Number(workout.reps),
      added_weight: workout.added_weight !== undefined ? Number(workout.added_weight) : 0,
      date: workout.date || new Date().toISOString().split('T')[0],
    };

    list.push(newWorkout);
    this.saveWorkouts(list);
    return newWorkout;
  }

  async deleteWorkout(id: number): Promise<void> {
    const list = this.getWorkouts();
    const filtered = list.filter((w) => w.id !== id);
    this.saveWorkouts(filtered);
  }

  async getStatsSummary(): Promise<StatsSummary> {
    const list = this.getWorkouts();

    const total_workouts = list.length;
    const total_volume = list.reduce((acc, curr) => acc + curr.sets * curr.reps, 0);

    const personal_records = {
      Pull: 0,
      Push: 0,
      Legs: 0,
      Core: 0,
    };

    for (const w of list) {
      if (w.reps > personal_records[w.category]) {
        personal_records[w.category] = w.reps;
      }
    }

    return {
      total_workouts,
      total_volume,
      personal_records,
    };
  }

  resetSeed(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.inMemoryWorkouts = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  }
}
