import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { Dumbbell, Plus, Flame, Scale, RotateCcw, Download, Upload, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  currentTab: 'overview' | 'weight' | 'habits' | 'routines' | 'analytics';
  setCurrentTab: (tab: 'overview' | 'weight' | 'habits' | 'routines' | 'analytics') => void;
  onOpenLogWeight: () => void;
  onOpenQuickWorkout: () => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenLogWeight,
  onOpenQuickWorkout,
  isDark,
  setIsDark,
}) => {
  const { profile, routines, setActiveWorkoutRoutine, exportDataJson, resetToDefaults, setUnit } = useFitness();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems: { id: 'overview' | 'weight' | 'habits' | 'routines' | 'analytics'; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'weight', label: 'Weight Log' },
    { id: 'habits', label: 'Habit Streaks' },
    { id: 'routines', label: 'Routines' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('overview')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base transition-colors group-hover:bg-amber-500/20">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                Gavin Fitness
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action button + Quick user trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick unit switch */}
            <div className="hidden lg:flex items-center p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-xs">
              <button
                onClick={() => setUnit('lbs')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  profile.unit === 'lbs'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                LBS
              </button>
              <button
                onClick={() => setUnit('kg')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  profile.unit === 'kg'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                KG
              </button>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenQuickWorkout}
              className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-95"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Start Workout</span>
            </button>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 focus:outline-none rounded-full ring-2 ring-transparent hover:ring-amber-500/50 transition-all"
                title="Gavin's Profile"
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-xl z-50 text-neutral-900 dark:text-neutral-100">
                    <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{profile.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{profile.email}</p>
                      </div>
                    </div>

                    <div className="py-2 text-xs space-y-1">
                      <div className="flex justify-between py-1 px-2 text-neutral-500">
                        <span>Current Weight</span>
                        <span className="font-medium font-mono text-neutral-900 dark:text-neutral-100">
                          {profile.currentWeight} lbs
                        </span>
                      </div>
                      <div className="flex justify-between py-1 px-2 text-neutral-500">
                        <span>Target Goal</span>
                        <span className="font-medium font-mono text-amber-500">
                          {profile.goalWeight} lbs
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-1 text-xs">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenLogWeight();
                        }}
                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Scale className="w-3.5 h-3.5 text-amber-500" />
                        <span>Log Today's Weight</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          exportDataJson();
                        }}
                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Export Data (JSON)</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Reset dashboard to default demonstration state?')) {
                            resetToDefaults();
                            setShowProfileMenu(false);
                          }
                        }}
                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Demo Data</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-neutral-100 dark:border-neutral-900 gap-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
