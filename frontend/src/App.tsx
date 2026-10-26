import { useState, useEffect, useCallback } from 'react';
import { ExerciseCategory, StatsSummary, Workout, WorkoutCreate } from './types/workout';
import { workoutService } from './services';
import { MockWorkoutService } from './services/mockWorkoutService';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { WorkoutForm } from './components/WorkoutForm';
import { CategoryFilter } from './components/CategoryFilter';
import { WorkoutList } from './components/WorkoutList';

export function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'All'>('All');
  const [searchExercise, setSearchExercise] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      const catParam = selectedCategory === 'All' ? undefined : selectedCategory;
      const [workoutsData, statsData] = await Promise.all([
        workoutService.listWorkouts(catParam, searchExercise),
        workoutService.getStatsSummary(),
      ]);
      setWorkouts(workoutsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load workout data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchExercise]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddWorkout = async (newWorkout: WorkoutCreate) => {
    await workoutService.createWorkout(newWorkout);
    await loadData();
  };

  const handleDeleteWorkout = async (id: number) => {
    if (window.confirm('Delete this workout entry?')) {
      await workoutService.deleteWorkout(id);
      await loadData();
    }
  };

  const handleResetData = async () => {
    if (workoutService instanceof MockWorkoutService) {
      workoutService.resetSeed();
      await loadData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header onResetData={handleResetData} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* KPI Summary Cards */}
        <KpiCards stats={stats} />

        {/* Quick-Log Form */}
        <WorkoutForm onAddWorkout={handleAddWorkout} />

        {/* Filter Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchExercise={searchExercise}
          onSearchChange={setSearchExercise}
        />

        {/* Workout History Table */}
        <WorkoutList
          workouts={workouts}
          onDeleteWorkout={handleDeleteWorkout}
          isLoading={isLoading}
        />
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        Calisthenics & Street Workout Tracker • MVP Demo
      </footer>
    </div>
  );
}

export default App;
