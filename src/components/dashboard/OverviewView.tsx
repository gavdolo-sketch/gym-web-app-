import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import {
  Scale,
  Flame,
  Dumbbell,
  Trophy,
  ArrowRight,
  Check,
  Play,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Plus,
} from 'lucide-react';
import { WorkoutRoutine } from '../../types/fitness';

interface OverviewViewProps {
  onNavigateTab: (tab: 'overview' | 'weight' | 'habits' | 'routines' | 'analytics') => void;
  onOpenLogWeight: () => void;
  onStartWorkout: (routine: WorkoutRoutine) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateTab,
  onOpenLogWeight,
  onStartWorkout,
}) => {
  const {
    profile,
    weightLogs,
    habits,
    routines,
    sessions,
    prs,
    toggleHabit,
    getHabitStatusForDate,
    selectedDate,
    sevenDayWeightAverage,
    weightProgressPercent,
    formatWeight,
  } = useFitness();

  // Find today's recommended routine (or default to first routine)
  const scheduledRoutine = routines[0];

  // Latest 7 weights for mini sparkline
  const sortedWeights = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  const recentWeights = sortedWeights.slice(-7);
  const minW = Math.min(...recentWeights.map((w) => w.weight), 170);
  const maxW = Math.max(...recentWeights.map((w) => w.weight), 185);
  const rangeW = maxW - minW || 1;

  // Generate mini SVG sparkline path
  const sparkPoints = recentWeights.map((w, idx) => {
    const x = (idx / (recentWeights.length - 1 || 1)) * 140;
    const y = 35 - ((w.weight - minW) / rangeW) * 30;
    return `${x},${y}`;
  });
  const sparklineD = sparkPoints.length > 0 ? `M ${sparkPoints.join(' L ')}` : '';

  // Today's completed habit count
  const todayCompletedCount = habits.filter((h) =>
    getHabitStatusForDate(h.id, selectedDate)
  ).length;

  return (
    <div className="space-y-6">
      {/* Cinematic Motivation Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white min-h-[220px] sm:min-h-[240px] flex items-end p-6 sm:p-8 shadow-sm">
        <img
          src="/src/assets/images/gym_motivation_banner_1793433328036.jpg"
          alt="Gym Training Atmosphere"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-60"
        />
        {/* Scrim gradient overlay for WCAG AA readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>Saturday Focus</span>
            <span>·</span>
            <span>Active Phase 2</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
            Welcome back, Gavin. Week 9 on track.
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300">
            Current weight is <span className="font-mono text-amber-400 font-bold">{formatWeight(profile.currentWeight)}</span>. You are {formatWeight(profile.startWeight - profile.currentWeight)} down from start, only {formatWeight(profile.currentWeight - profile.goalWeight)} away from your target goal.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {scheduledRoutine && (
              <button
                onClick={() => onStartWorkout(scheduledRoutine)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-neutral-950" />
                <span>Start {scheduledRoutine.name.split('·')[0].trim()}</span>
              </button>
            )}

            <button
              onClick={onOpenLogWeight}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 text-white text-xs font-semibold backdrop-blur-xs border border-white/10 transition-colors"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Weigh-In</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight Card */}
        <div
          onClick={() => onNavigateTab('weight')}
          className="group p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 cursor-pointer hover:border-amber-500/40 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Current Weight</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {formatWeight(profile.currentWeight)}
            </span>
            {/* Sparkline */}
            <div className="w-24 h-8">
              <svg viewBox="0 0 140 40" className="w-full h-full overflow-visible">
                <path
                  d={sparklineD}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/80 pt-2">
            <span>Goal: {formatWeight(profile.goalWeight)}</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {weightProgressPercent}% reached
            </span>
          </div>
        </div>

        {/* Habit Streaks Card */}
        <div
          onClick={() => onNavigateTab('habits')}
          className="group p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 cursor-pointer hover:border-amber-500/40 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Habit Streaks</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-500">
              {todayCompletedCount} / {habits.length}
            </span>
            <span className="text-xs text-neutral-500">today</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/80 pt-2">
            <span>Top Streak</span>
            <span className="font-mono text-amber-500 font-semibold">26 Days</span>
          </div>
        </div>

        {/* Weekly Sessions Card */}
        <div
          onClick={() => onNavigateTab('routines')}
          className="group p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 cursor-pointer hover:border-amber-500/40 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Weekly Consistency</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              4 / 5
            </span>
            <span className="text-xs text-neutral-500">sessions completed</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/80 pt-2">
            <span>Target Pace</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              80% on track
            </span>
          </div>
        </div>

        {/* PR & Volume Card */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="group p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 cursor-pointer hover:border-amber-500/40 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Peak Performance</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {prs.length}
            </span>
            <span className="text-xs text-neutral-500">active PR records</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/80 pt-2">
            <span>Recent: Squat</span>
            <span className="font-mono text-neutral-900 dark:text-neutral-100 font-semibold">
              315 lbs × 5
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Scheduled Workout + Fast Habit Check-In */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scheduled Routine Spotlight & Recent PRs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scheduled Routine Card */}
          {scheduledRoutine && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Today's Scheduled Split
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {scheduledRoutine.durationMinutes} min · {scheduledRoutine.category}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onStartWorkout(scheduledRoutine)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-neutral-950" />
                  <span>Start Live</span>
                </button>
              </div>

              <div className="mt-3">
                <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {scheduledRoutine.name}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {scheduledRoutine.description}
                </p>

                {/* Exercises list */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scheduledRoutine.exercises.slice(0, 4).map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs flex justify-between items-center"
                    >
                      <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {ex.name}
                      </span>
                      <span className="font-mono text-neutral-500 text-[11px] shrink-0 ml-2">
                        {ex.sets} × {ex.reps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent PR Milestones Strip */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Personal Record Milestones
              </h3>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1"
              >
                <span>View PR Wall</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {prs.slice(0, 3).map((pr) => (
                <div
                  key={pr.id}
                  className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40"
                >
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block truncate">
                    {pr.exerciseName}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                      {pr.weight} {profile.unit}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      × {pr.reps}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 block mt-1">
                    {pr.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Habit Checklist */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Today's Habits
                </h3>
                <p className="text-xs text-neutral-500">
                  {todayCompletedCount} of {habits.length} checked
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('habits')}
                className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1"
              >
                <span>Full Tracker</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Habit Quick Toggles */}
            <div className="mt-3 space-y-2">
              {habits.map((habit) => {
                const isDone = getHabitStatusForDate(habit.id, selectedDate);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id, selectedDate)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      isDone
                        ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${
                          isDone
                            ? 'bg-amber-500 text-neutral-950 font-bold'
                            : 'border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs font-medium truncate ${
                          isDone
                            ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {habit.title.split('(')[0]}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-amber-500 shrink-0 ml-2">
                      {habit.currentStreak}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[11px] text-neutral-400">
              Tap any habit to toggle status for today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
