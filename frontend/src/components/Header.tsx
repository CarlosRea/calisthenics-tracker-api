import React from 'react';
import { Dumbbell, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onResetData }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Dumbbell className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Calisthenics Tracker
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                FastAPI Connected
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Street Workout & Weighted Calisthenics Volume Logger
            </p>
          </div>
        </div>

        <button
          onClick={onResetData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition"
          title="Reset to 4 demo street workout records"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Demo Data
        </button>
      </div>
    </header>
  );
};
