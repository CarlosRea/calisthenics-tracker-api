import React, { useState } from 'react';
import { ExerciseCategory, WorkoutCreate } from '../types/workout';
import { PlusCircle, Dumbbell } from 'lucide-react';

interface WorkoutFormProps {
  onAddWorkout: (workout: WorkoutCreate) => Promise<void>;
}

const PREDEFINED_EXERCISES: { name: string; category: ExerciseCategory }[] = [
  { name: 'Pull-ups', category: 'Pull' },
  { name: 'Chin-ups', category: 'Pull' },
  { name: 'Muscle-ups', category: 'Pull' },
  { name: 'Inverted Rows', category: 'Pull' },
  { name: 'Push-ups', category: 'Push' },
  { name: 'Parallel Bar Dips', category: 'Push' },
  { name: 'Handstand Push-ups', category: 'Push' },
  { name: 'Pike Push-ups', category: 'Push' },
  { name: 'Pistol Squats', category: 'Legs' },
  { name: 'Bodyweight Squats', category: 'Legs' },
  { name: 'Bulgarian Split Squats', category: 'Legs' },
  { name: 'Hanging Leg Raises', category: 'Core' },
  { name: 'L-sit Holds', category: 'Core' },
  { name: 'Dragon Flags', category: 'Core' },
];

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ onAddWorkout }) => {
  const today = new Date().toISOString().split('T')[0];

  const [selectedPreset, setSelectedPreset] = useState<string>('Pull-ups');
  const [customExercise, setCustomExercise] = useState<string>('');
  const [category, setCategory] = useState<ExerciseCategory>('Pull');
  const [sets, setSets] = useState<number>(4);
  const [reps, setReps] = useState<number>(10);
  const [addedWeight, setAddedWeight] = useState<number>(0);
  const [date, setDate] = useState<string>(today);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCustom = selectedPreset === 'CUSTOM';

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPreset(value);
    if (value !== 'CUSTOM') {
      const found = PREDEFINED_EXERCISES.find((ex) => ex.name === value);
      if (found) {
        setCategory(found.category);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalExerciseName = isCustom ? customExercise.trim() : selectedPreset;

    if (!finalExerciseName) {
      alert('Please enter an exercise name.');
      return;
    }

    if (sets <= 0 || reps <= 0) {
      alert('Sets and Reps must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddWorkout({
        exercise_name: finalExerciseName,
        category,
        sets: Number(sets),
        reps: Number(reps),
        added_weight: Number(addedWeight) || 0,
        date: date || today,
      });

      // Reset fields partially for fast re-entry
      if (isCustom) {
        setCustomExercise('');
        setSelectedPreset('Pull-ups');
        setCategory('Pull');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="h-4 w-4 text-emerald-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
          Quick-Log Session
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Exercise selector */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Exercise {isCustom ? '(Custom)' : ''}
          </label>
          <select
            value={selectedPreset}
            onChange={handlePresetChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            <optgroup label="Popular Calisthenics">
              {PREDEFINED_EXERCISES.map((ex) => (
                <option key={ex.name} value={ex.name}>
                  {ex.name} ({ex.category})
                </option>
              ))}
            </optgroup>
            <option value="CUSTOM">+ Custom Exercise...</option>
          </select>

          {isCustom && (
            <input
              type="text"
              placeholder="e.g. Ring Archer Push-ups"
              value={customExercise}
              onChange={(e) => setCustomExercise(e.target.value)}
              required
              className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
            disabled={!isCustom}
            className={`w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 ${
              !isCustom ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <option value="Pull">Pull</option>
            <option value="Push">Push</option>
            <option value="Legs">Legs</option>
            <option value="Core">Core</option>
          </select>
        </div>

        {/* Sets & Reps */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Sets</label>
            <input
              type="number"
              min="1"
              value={sets}
              onChange={(e) => setSets(Math.max(1, parseInt(e.target.value) || 1))}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Reps/set</label>
            <input
              type="number"
              min="1"
              value={reps}
              onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 1))}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Added Weight & Date */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">+kg (extra)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={addedWeight}
              onChange={(e) => setAddedWeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[38px] bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold text-sm rounded-lg flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            {isSubmitting ? 'Logging...' : 'Log Workout'}
          </button>
        </div>
      </form>
    </div>
  );
};
