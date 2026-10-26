import { ExerciseCategory, StatsSummary, Workout, WorkoutCreate } from '../types/workout';

export interface IWorkoutService {
  listWorkouts(category?: ExerciseCategory, exercise?: string): Promise<Workout[]>;
  createWorkout(workout: WorkoutCreate): Promise<Workout>;
  deleteWorkout(id: number): Promise<void>;
  getStatsSummary(): Promise<StatsSummary>;
}
