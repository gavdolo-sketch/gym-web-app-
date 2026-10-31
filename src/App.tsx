import React, { useState, useEffect } from 'react';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/dashboard/OverviewView';
import { WeightTrackerView } from './components/weight/WeightTrackerView';
import { HabitStreakView } from './components/habits/HabitStreakView';
import { RoutinesView } from './components/workouts/RoutinesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { LogWeightModal } from './components/weight/LogWeightModal';
import { AddHabitModal } from './components/habits/AddHabitModal';
import { RoutineEditorModal } from './components/workouts/RoutineEditorModal';
import { ActiveWorkoutModal } from './components/workouts/ActiveWorkoutModal';
import { WorkoutRoutine } from './types/fitness';

function DashboardContent() {
  const { routines, activeWorkoutRoutine, setActiveWorkoutRoutine } = useFitness();

  const [currentTab, setCurrentTab] = useState<
    'overview' | 'weight' | 'habits' | 'routines' | 'analytics'
  >('overview');

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('gavin_fitness_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  // Modals
  const [isLogWeightOpen, setIsLogWeightOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isRoutineEditorOpen, setIsRoutineEditorOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);

  // Sync theme class on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gavin_fitness_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gavin_fitness_theme', 'light');
    }
  }, [isDark]);

  const handleStartWorkout = (routine: WorkoutRoutine) => {
    setActiveWorkoutRoutine(routine);
  };

  const handleEditRoutine = (routine: WorkoutRoutine) => {
    setEditingRoutine(routine);
    setIsRoutineEditorOpen(true);
  };

  const handleOpenCreateRoutine = () => {
    setEditingRoutine(null);
    setIsRoutineEditorOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Top Header Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenLogWeight={() => setIsLogWeightOpen(true)}
        onOpenQuickWorkout={() => {
          if (routines.length > 0) {
            handleStartWorkout(routines[0]);
          } else {
            handleOpenCreateRoutine();
          }
        }}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'overview' && (
          <OverviewView
            onNavigateTab={setCurrentTab}
            onOpenLogWeight={() => setIsLogWeightOpen(true)}
            onStartWorkout={handleStartWorkout}
          />
        )}

        {currentTab === 'weight' && (
          <WeightTrackerView onOpenLogModal={() => setIsLogWeightOpen(true)} />
        )}

        {currentTab === 'habits' && (
          <HabitStreakView onOpenAddModal={() => setIsAddHabitOpen(true)} />
        )}

        {currentTab === 'routines' && (
          <RoutinesView
            onOpenCreateRoutine={handleOpenCreateRoutine}
            onEditRoutine={handleEditRoutine}
            onStartWorkout={handleStartWorkout}
          />
        )}

        {currentTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              Gavin Fitness Dashboard
            </span>
            <span>·</span>
            <span>Progressive Overload & Habit Accountability</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentTab('overview')}
              className="hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentTab('weight')}
              className="hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
            >
              Weight Chart
            </button>
            <button
              onClick={() => setCurrentTab('habits')}
              className="hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
            >
              Habit Streaks
            </button>
            <button
              onClick={() => setCurrentTab('routines')}
              className="hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
            >
              Routines
            </button>
            <button
              onClick={() => setCurrentTab('analytics')}
              className="hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
            >
              Analytics
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <LogWeightModal
        isOpen={isLogWeightOpen}
        onClose={() => setIsLogWeightOpen(false)}
      />

      <AddHabitModal
        isOpen={isAddHabitOpen}
        onClose={() => setIsAddHabitOpen(false)}
      />

      <RoutineEditorModal
        isOpen={isRoutineEditorOpen}
        onClose={() => setIsRoutineEditorOpen(false)}
        routineToEdit={editingRoutine}
      />

      {activeWorkoutRoutine && (
        <ActiveWorkoutModal
          routine={activeWorkoutRoutine}
          onClose={() => setActiveWorkoutRoutine(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <FitnessProvider>
      <DashboardContent />
    </FitnessProvider>
  );
}
