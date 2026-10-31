import React, { useState, useMemo } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { Habit } from '../../types/fitness';
import {
  Flame,
  Check,
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Beef,
  Dumbbell,
  Moon,
  Footprints,
  Activity,
  Award,
} from 'lucide-react';

interface HabitStreakViewProps {
  onOpenAddModal: () => void;
}

export const HabitStreakView: React.FC<HabitStreakViewProps> = ({ onOpenAddModal }) => {
  const {
    habits,
    deleteHabit,
    toggleHabit,
    getHabitStatusForDate,
    getHabitCompletionRateForDate,
    selectedDate,
    setSelectedDate,
  } = useFitness();

  // Helper icon renderer
  const renderHabitIcon = (icon: string) => {
    switch (icon) {
      case 'Droplet':
        return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'Beef':
        return <Beef className="w-4 h-4 text-rose-500" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4 text-amber-500" />;
      case 'Moon':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'Footprints':
        return <Footprints className="w-4 h-4 text-emerald-500" />;
      default:
        return <Activity className="w-4 h-4 text-purple-400" />;
    }
  };

  // Generate last 30 dates array (oldest to newest)
  const last30Dates = useMemo(() => {
    const dates: string[] = [];
    const base = new Date('2026-10-31T12:00:00');
    for (let i = 29; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const todayStats = getHabitCompletionRateForDate(selectedDate);

  // Navigate date
  const changeDateBy = (offset: number) => {
    const current = new Date(`${selectedDate}T12:00:00`);
    current.setDate(current.getDate() + offset);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Compute best habit streak
  const bestStreakHabit = useMemo(() => {
    if (habits.length === 0) return null;
    return [...habits].sort((a, b) => b.currentStreak - a.currentStreak)[0];
  }, [habits]);

  // Overall 30-day compliance percentage across all habits
  const overallCompliance = useMemo(() => {
    let totalChecks = 0;
    let completedChecks = 0;
    last30Dates.forEach((d) => {
      habits.forEach((h) => {
        totalChecks++;
        if (getHabitStatusForDate(h.id, d)) {
          completedChecks++;
        }
      });
    });
    return totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;
  }, [last30Dates, habits, getHabitStatusForDate]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Streak KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Daily Completion</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {todayStats.completed} / {todayStats.total}
            </span>
            <span className="text-xs font-mono font-medium text-amber-500">
              {todayStats.percentage}%
            </span>
          </div>
          <div className="mt-2 w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${todayStats.percentage}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Top Active Streak</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-500 flex items-center gap-1">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>{bestStreakHabit?.currentStreak || 0}</span>
              <span className="text-xs font-sans text-neutral-500 font-normal">days</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 truncate">
            {bestStreakHabit ? bestStreakHabit.title : 'None active'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">30-Day Adherence</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {overallCompliance}%
            </span>
            <span className="text-xs text-neutral-500">consistency</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Across all {habits.length} daily habits
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Longest All-Time</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {Math.max(...habits.map((h) => h.longestStreak), 0)} days
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            10,000 Steps Record
          </p>
        </div>
      </div>

      {/* Date Switcher & Daily Habits Checklist */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Daily Accountability Check-In
            </h2>
            <p className="text-xs text-neutral-500">
              Lock in your non-negotiable fundamentals every day
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Navigator */}
            <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/80 p-0.5 text-xs">
              <button
                onClick={() => changeDateBy(-1)}
                className="p-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md transition-colors"
                title="Previous day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 font-medium font-mono text-neutral-900 dark:text-neutral-100">
                {selectedDate === '2026-10-31' ? 'Today (Oct 31)' : selectedDate}
              </span>
              <button
                onClick={() => changeDateBy(1)}
                className="p-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md transition-colors"
                title="Next day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Habit</span>
            </button>
          </div>
        </div>

        {/* Habits Checklist Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.map((habit) => {
            const isCompleted = getHabitStatusForDate(habit.id, selectedDate);
            return (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id, selectedDate)}
                className={`group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isCompleted
                    ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 group-hover:border-neutral-400'
                    }`}
                  >
                    {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{renderHabitIcon(habit.icon)}</span>
                      <p
                        className={`text-sm font-medium truncate ${
                          isCompleted
                            ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {habit.title}
                      </p>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {habit.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="flex items-center gap-1 font-mono text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    <Flame className="w-3 h-3 fill-amber-500" />
                    <span>{habit.currentStreak}d</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete habit "${habit.title}"?`)) {
                        deleteHabit(habit.id);
                      }
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {todayStats.completed === todayStats.total && todayStats.total > 0 && (
          <div className="mt-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="font-semibold">All habits locked in for this day! Outstanding discipline, Gavin.</span>
            </div>
            <span className="font-mono font-bold">100%</span>
          </div>
        )}
      </div>

      {/* 30-Day Heatmap Streak Matrix */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              30-Day Consistency Heatmap
            </h3>
            <p className="text-xs text-neutral-500">
              Visualizing daily accountability history over the past 30 days
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
              <span>Completed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 inline-block" />
              <span>Missed</span>
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[650px] space-y-3">
            {/* Header Dates */}
            <div className="flex items-center text-[10px] text-neutral-400 font-mono pl-48 gap-1.5">
              {last30Dates.map((dateStr, idx) => {
                const dayNum = dateStr.slice(-2);
                return (
                  <div key={dateStr} className="w-4 text-center">
                    {idx % 5 === 0 || idx === 29 ? dayNum : ''}
                  </div>
                );
              })}
            </div>

            {/* Habit Rows */}
            {habits.map((habit) => {
              // Calculate 30d adherence for this specific habit
              let doneCount = 0;
              last30Dates.forEach((d) => {
                if (getHabitStatusForDate(habit.id, d)) doneCount++;
              });
              const pct = Math.round((doneCount / last30Dates.length) * 100);

              return (
                <div key={habit.id} className="flex items-center gap-2">
                  <div className="w-48 shrink-0 flex items-center justify-between pr-3">
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {habit.title.split('(')[0]}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {pct}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {last30Dates.map((dateStr) => {
                      const isDone = getHabitStatusForDate(habit.id, dateStr);
                      const isSelected = dateStr === selectedDate;

                      return (
                        <div
                          key={dateStr}
                          onClick={() => toggleHabit(habit.id, dateStr)}
                          title={`${habit.title} on ${dateStr}: ${isDone ? 'Completed' : 'Missed'}`}
                          className={`w-4 h-4 rounded-xs cursor-pointer transition-transform hover:scale-125 ${
                            isSelected ? 'ring-1 ring-white' : ''
                          } ${
                            isDone
                              ? 'bg-amber-500'
                              : 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
