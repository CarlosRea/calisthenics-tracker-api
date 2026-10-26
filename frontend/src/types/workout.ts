export type ExerciseCategory = 'Pull' | 'Push' | 'Legs' | 'Core';

export interface Workout {
  id: number;
  exercise_name: string;
  category: ExerciseCategory;
  sets: number;
  reps: number;
  added_weight: number;
  date: string;
}

export interface WorkoutCreate {
  exercise_name: string;
  category: ExerciseCategory;
  sets: number;
  reps: number;
  added_weight?: number;
  date?: string;
}

export interface CategoryPR {
  Pull: number;
  Push: number;
  Legs: number;
  Core: number;
}

export interface StatsSummary {
  total_workouts: number;
  total_volume: number;
  personal_records: CategoryPR;
}
