import React from 'react';
import { Workout } from '../types/workout';
import { Trash2, Calendar, Weight, Repeat } from 'lucide-react';

interface WorkoutListProps {
  workouts: Workout[];
  onDeleteWorkout: (id: number) => Promise<void>;
  isLoading: boolean;
}

const CATEGORY_BADGES: Record<string, string> = {
  Pull: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Push: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Legs: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Core: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export const WorkoutList: React.FC<WorkoutListProps> = ({
  workouts,
  onDeleteWorkout,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <div className="inline-block animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mb-2"></div>
        <p className="text-sm">Loading workout history...</p>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <p className="text-sm font-medium text-slate-300">No workout records found.</p>
        <p className="text-xs text-slate-500 mt-1">
          Log a session using the form above or adjust your filter.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Workout History ({workouts.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Exercise</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Sets × Reps</th>
              <th className="py-3 px-4">Extra Weight</th>
              <th className="py-3 px-4">Volume (Reps)</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {workouts.map((w) => {
              const totalReps = w.sets * w.reps;
              return (
                <tr key={w.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-medium text-white">{w.exercise_name}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                        CATEGORY_BADGES[w.category] || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {w.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1 font-mono text-xs text-slate-300">
                      <Repeat className="h-3 w-3 text-slate-500" />
                      {w.sets} × {w.reps}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {w.added_weight > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-amber-400">
                        <Weight className="h-3 w-3" />
                        +{w.added_weight} kg
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">Bodyweight</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-emerald-400 font-mono">
                      {totalReps} <span className="text-xs font-normal text-slate-500">reps</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      {w.date}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onDeleteWorkout(w.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
