import { ExerciseCategory, StatsSummary, Workout, WorkoutCreate } from '../types/workout';
import { IWorkoutService } from './workoutService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8093';

export class ApiWorkoutService implements IWorkoutService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async listWorkouts(category?: ExerciseCategory, exercise?: string): Promise<Workout[]> {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }
    if (exercise && exercise.trim() !== '') {
      params.append('exercise', exercise.trim());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/api/workouts${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch workouts: ${res.statusText}`);
    }
    return res.json();
  }

  async createWorkout(workout: WorkoutCreate): Promise<Workout> {
    const url = `${this.baseUrl}/api/workouts`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exercise_name: workout.exercise_name,
        category: workout.category,
        sets: Number(workout.sets),
        reps: Number(workout.reps),
        added_weight: Number(workout.added_weight) || 0,
        date: workout.date,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail ? JSON.stringify(errorData.detail) : `Failed to create workout: ${res.statusText}`);
    }
    return res.json();
  }

  async deleteWorkout(id: number): Promise<void> {
    const url = `${this.baseUrl}/api/workouts/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Failed to delete workout: ${res.statusText}`);
    }
  }

  async getStatsSummary(): Promise<StatsSummary> {
    const url = `${this.baseUrl}/api/stats/summary`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch stats summary: ${res.statusText}`);
    }
    return res.json();
  }
}
