import React from 'react';
import { StatsSummary } from '../types/workout';
import { Activity, Flame, Trophy, Award, Zap, Shield } from 'lucide-react';

interface KpiCardsProps {
  stats: StatsSummary | null;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ stats }) => {
  const summary = stats || {
    total_workouts: 0,
    total_volume: 0,
    personal_records: { Pull: 0, Push: 0, Legs: 0, Core: 0 },
  };

  return (
    <section className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* Total Workouts */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Sessions</span>
          <Activity className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-white">{summary.total_workouts}</div>
        <p className="text-[11px] text-slate-500 mt-1">Logged workouts</p>
      </div>

      {/* Total Volume */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Total Volume</span>
          <Flame className="h-4 w-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold text-amber-300">{summary.total_volume}</div>
        <p className="text-[11px] text-slate-500 mt-1">Total reps (sets × reps)</p>
      </div>

      {/* Pull PR */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Pull PR</span>
          <Trophy className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-bold text-cyan-300">
          {summary.personal_records.Pull} <span className="text-xs font-normal text-slate-400">reps</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Max reps in 1 set</p>
      </div>

      {/* Push PR */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Push PR</span>
          <Award className="h-4 w-4 text-rose-400" />
        </div>
        <div className="text-2xl font-bold text-rose-300">
          {summary.personal_records.Push} <span className="text-xs font-normal text-slate-400">reps</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Max reps in 1 set</p>
      </div>

      {/* Legs PR */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Legs PR</span>
          <Zap className="h-4 w-4 text-violet-400" />
        </div>
        <div className="text-2xl font-bold text-violet-300">
          {summary.personal_records.Legs} <span className="text-xs font-normal text-slate-400">reps</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Max reps in 1 set</p>
      </div>

      {/* Core PR */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Core PR</span>
          <Shield className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-emerald-300">
          {summary.personal_records.Core} <span className="text-xs font-normal text-slate-400">reps</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Max reps in 1 set</p>
      </div>
    </section>
  );
};
