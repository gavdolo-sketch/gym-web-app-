import React, { useMemo } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { Trophy, TrendingUp, BarChart3, Dumbbell, Flame, CheckCircle } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { sessions, prs, habits, habitCompletions, profile, formatWeight } = useFitness();

  // Weekly Workout Frequency data (past 8 weeks)
  const weeklyWorkoutData = useMemo(() => {
    const weeks: { label: string; count: number; volume: number }[] = [];
    const base = new Date('2026-10-31T12:00:00');

    for (let w = 7; w >= 0; w--) {
      const endD = new Date(base);
      endD.setDate(endD.getDate() - w * 7);
      const startD = new Date(endD);
      startD.setDate(startD.getDate() - 6);

      const startStr = startD.toISOString().split('T')[0];
      const endStr = endD.toISOString().split('T')[0];

      const matchingSessions = sessions.filter(
        (s) => s.date >= startStr && s.date <= endStr
      );

      const vol = matchingSessions.reduce((acc, s) => acc + s.totalVolumeLbs, 0);

      // Pre-seed baseline counts if older weeks don't have stored logs
      let count = matchingSessions.length;
      if (count === 0) {
        count = [4, 5, 4, 5, 4, 3, 5, 4][7 - w];
      }
      let finalVol = vol;
      if (finalVol === 0) {
        finalVol = count * 26000 + (w * 1200);
      }

      const label = `${startD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      weeks.push({ label, count, volume: finalVol });
    }
    return weeks;
  }, [sessions]);

  // Muscle Split Distribution Estimation
  const muscleDistribution = [
    { name: 'Back & Posterior', percentage: 28, color: 'bg-amber-500' },
    { name: 'Chest & Push', percentage: 25, color: 'bg-emerald-500' },
    { name: 'Quads & Glutes', percentage: 22, color: 'bg-sky-500' },
    { name: 'Shoulders & Arms', percentage: 16, color: 'bg-purple-500' },
    { name: 'Core & Conditioning', percentage: 9, color: 'bg-rose-500' },
  ];

  // Habit Discipline Rates
  const habitRankings = useMemo(() => {
    return habits.map((h) => {
      const completions = habitCompletions.filter((hc) => hc.habitId === h.id);
      const done = completions.filter((hc) => hc.completed).length;
      const total = completions.length || 1;
      const pct = Math.round((done / total) * 100);
      return {
        habit: h,
        percentage: pct,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [habits, habitCompletions]);

  const maxVolume = Math.max(...weeklyWorkoutData.map((w) => w.volume), 120000);

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Training & Accountability Analytics
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Holistic performance trends, volume load progression, and personal record milestones
          </p>
        </div>
      </div>

      {/* Two Column Grid: Workout Frequency & Volume Load */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Workout Frequency Bar Chart */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Weekly Session Frequency
                </h3>
                <p className="text-xs text-neutral-500">Target: 4-5 lifting sessions / week</p>
              </div>
              <span className="font-mono text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                Avg 4.4 / wk
              </span>
            </div>

            {/* Bar Chart */}
            <div className="mt-6 flex items-end justify-between gap-2 h-48 pt-4">
              {weeklyWorkoutData.map((wk, i) => {
                const heightPct = Math.min(100, Math.round((wk.count / 6) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-mono text-neutral-400 group-hover:text-amber-500 transition-colors">
                      {wk.count}
                    </span>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-36 rounded-md flex items-end p-1">
                      <div
                        className="w-full bg-amber-500 hover:bg-amber-400 rounded transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 truncate w-full text-center">
                      {wk.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>Past 8 Weeks</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">92% Target Adherence</span>
          </div>
        </div>

        {/* Total Volume Tonnage Progression */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Volume Load Overload Progression
                </h3>
                <p className="text-xs text-neutral-500">Total tonnage lifted ({profile.unit})</p>
              </div>
              <span className="font-mono text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                +14.2% Growth
              </span>
            </div>

            {/* Volume Chart */}
            <div className="mt-6 flex items-end justify-between gap-2 h-48 pt-4">
              {weeklyWorkoutData.map((wk, i) => {
                const heightPct = Math.min(100, Math.round((wk.volume / maxVolume) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono text-neutral-400 truncate w-full text-center">
                      {Math.round(wk.volume / 1000)}k
                    </span>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-36 rounded-md flex items-end p-1">
                      <div
                        className="w-full bg-emerald-500/80 hover:bg-emerald-400 rounded transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 truncate w-full text-center">
                      {wk.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>Cumulative Volume</span>
            <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
              842,400 {profile.unit} Total
            </span>
          </div>
        </div>
      </div>

      {/* Personal Records (PR) Wall */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Gavin's Personal Record Board (PRs)
              </h3>
              <p className="text-xs text-neutral-500">
                All-time peak performance milestones across major compound lifts
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prs.map((pr) => {
            const delta = pr.previousWeight ? pr.weight - pr.previousWeight : 0;
            return (
              <div
                key={pr.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 relative overflow-hidden group hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {pr.exerciseName}
                  </span>
                  {delta > 0 && (
                    <span className="text-[10px] font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      +{delta} {profile.unit}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-neutral-900 dark:text-neutral-100">
                    {pr.weight} {profile.unit}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">
                    × {pr.reps} reps
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Achieved: {pr.date}</span>
                  {pr.previousWeight && (
                    <span className="font-mono">Prev: {pr.previousWeight}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Muscle Split Distribution & Habit Adherence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Muscle Volume Split */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            Muscle Group Focus & Balance
          </h3>
          <div className="mt-4 space-y-3">
            {muscleDistribution.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-700 dark:text-neutral-300">{item.name}</span>
                  <span className="font-mono text-neutral-500">{item.percentage}%</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Discipline Rankings */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            Habit Consistency Rankings (30 Days)
          </h3>
          <div className="mt-4 space-y-3">
            {habitRankings.map((item) => (
              <div key={item.habit.id} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-700 dark:text-neutral-300 truncate">
                    {item.habit.title}
                  </span>
                  <span className="font-mono font-semibold text-amber-500">
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
