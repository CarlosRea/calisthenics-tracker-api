import React from 'react';
import { ExerciseCategory } from '../types/workout';
import { Search } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: ExerciseCategory | 'All';
  onSelectCategory: (category: ExerciseCategory | 'All') => void;
  searchExercise: string;
  onSearchChange: (value: string) => void;
}

const CATEGORIES: (ExerciseCategory | 'All')[] = ['All', 'Pull', 'Push', 'Legs', 'Core'];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  searchExercise,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
      {/* Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Exercise Search input */}
      <div className="relative min-w-[200px]">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by exercise..."
          value={searchExercise}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
};
