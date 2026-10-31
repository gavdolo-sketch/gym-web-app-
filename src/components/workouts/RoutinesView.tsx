import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { WorkoutRoutine } from '../../types/fitness';
import {
  Dumbbell,
  Play,
  Plus,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  Flame,
  Award,
} from 'lucide-react';

interface RoutinesViewProps {
  onOpenCreateRoutine: () => void;
  onEditRoutine: (routine: WorkoutRoutine) => void;
  onStartWorkout: (routine: WorkoutRoutine) => void;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  onOpenCreateRoutine,
  onEditRoutine,
  onStartWorkout,
}) => {
  const { routines, deleteRoutine, sessions, profile, formatWeight } = useFitness();
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Strength', 'Hypertrophy', 'Conditioning'];

  const filteredRoutines = routines.filter((r) => {
    if (filterCategory === 'All') return true;
    return r.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="space-y-8">
      {/* Top Banner & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Custom Workout Routines
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Structured training splits designed for progressive overload and tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/80 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterCategory === cat
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCreateRoutine}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Routine</span>
          </button>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRoutines.map((routine) => (
          <div
            key={routine.id}
            className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                      {routine.category}
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{routine.durationMinutes} min</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                    {routine.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditRoutine(routine)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Edit routine"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete routine "${routine.name}"?`)) {
                        deleteRoutine(routine.id);
                      }
                    }}
                    className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Delete routine"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                {routine.description}
              </p>

              {/* Scheduled Days */}
              <div className="flex items-center gap-1 mt-3">
                {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
                  const isScheduled = routine.scheduledDays.includes(day);
                  return (
                    <span
                      key={day}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        isScheduled
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>

              {/* Exercise Preview List */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                <span className="text-[11px] font-semibold uppercase text-neutral-400">
                  Exercises ({routine.exercises.length})
                </span>
                <div className="space-y-1.5">
                  {routine.exercises.slice(0, 4).map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-neutral-50 dark:bg-neutral-800/50"
                    >
                      <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {ex.name}
                      </span>
                      <span className="font-mono text-neutral-500 text-[11px] shrink-0 ml-2">
                        {ex.sets} × {ex.reps} {ex.targetWeight ? `@ ${ex.targetWeight} ${profile.unit}` : ''}
                      </span>
                    </div>
                  ))}
                  {routine.exercises.length > 4 && (
                    <p className="text-[11px] text-neutral-400 text-center pt-0.5">
                      + {routine.exercises.length - 4} more exercises
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => onStartWorkout(routine)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-xs transition-all active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-neutral-950" />
                <span>Start Live Session</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Workout History Section */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Completed Workout Sessions Log
            </h3>
            <p className="text-xs text-neutral-500">
              Total volume tonnage and session ratings over time
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {sessions.slice(0, 6).map((session) => (
            <div
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {session.routineName}
                  </span>
                  <span className="text-xs text-neutral-400">·</span>
                  <span className="text-xs font-mono text-neutral-500">
                    {session.date}
                  </span>
                </div>
                {session.notes && (
                  <p className="text-xs text-neutral-500 italic mt-0.5">
                    "{session.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-[11px] text-neutral-400 block">Duration</span>
                  <span className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {session.durationMinutes} min
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-neutral-400 block">Total Volume</span>
                  <span className="font-mono text-xs font-bold text-amber-500">
                    {session.totalVolumeLbs.toLocaleString()} {profile.unit}
                  </span>
                </div>

                <div className="text-amber-400 text-xs">
                  {'★'.repeat(session.rating)}
                  {'☆'.repeat(5 - session.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
