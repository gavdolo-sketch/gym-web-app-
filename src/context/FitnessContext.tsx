import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Habit,
  HabitCompletion,
  PersonalRecord,
  UserProfile,
  WeightEntry,
  WorkoutRoutine,
  WorkoutSessionLog,
  Exercise,
  WeightUnit,
} from '../types/fitness';
import {
  INITIAL_HABITS,
  INITIAL_PRS,
  INITIAL_ROUTINES,
  INITIAL_USER_PROFILE,
  INITIAL_PAST_SESSIONS,
  generateInitialHabitCompletions,
  generateInitialWeightLogs,
} from '../data/initialData';
import { fireAchievementConfetti, fireStreakConfetti } from '../components/ui/Confetti';

interface FitnessContextType {
  profile: UserProfile;
  weightLogs: WeightEntry[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  routines: WorkoutRoutine[];
  sessions: WorkoutSessionLog[];
  prs: PersonalRecord[];
  activeWorkoutRoutine: WorkoutRoutine | null;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  setActiveWorkoutRoutine: (routine: WorkoutRoutine | null) => void;

  // Actions
  addWeightLog: (entry: Omit<WeightEntry, 'id'>) => void;
  deleteWeightLog: (id: string) => void;
  toggleHabit: (habitId: string, date?: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak'>) => void;
  deleteHabit: (habitId: string) => void;
  addRoutine: (routine: Omit<WorkoutRoutine, 'id'>) => void;
  updateRoutine: (routine: WorkoutRoutine) => void;
  deleteRoutine: (routineId: string) => void;
  completeWorkoutSession: (session: Omit<WorkoutSessionLog, 'id'>) => void;
  deleteWorkoutSession: (sessionId: string) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setUnit: (unit: WeightUnit) => void;
  exportDataJson: () => void;
  importDataJson: (jsonData: string) => boolean;
  resetToDefaults: () => void;

  // Analytics Helpers
  formatWeight: (weightLbs: number) => string;
  getHabitStatusForDate: (habitId: string, date: string) => boolean;
  getHabitCompletionRateForDate: (date: string) => { completed: number; total: number; percentage: number };
  sevenDayWeightAverage: number;
  weightChangeTotal: number;
  weightChangeThisWeek: number;
  weightProgressPercent: number;
}

const STORAGE_KEY = 'gavin_fitness_dashboard_v1';

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_weights`);
    return saved ? JSON.parse(saved) : generateInitialWeightLogs();
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_habits`);
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_habit_completions`);
    return saved ? JSON.parse(saved) : generateInitialHabitCompletions();
  });

  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_routines`);
    return saved ? JSON.parse(saved) : INITIAL_ROUTINES;
  });

  const [sessions, setSessions] = useState<WorkoutSessionLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
    return saved ? JSON.parse(saved) : INITIAL_PAST_SESSIONS;
  });

  const [prs, setPrs] = useState<PersonalRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prs`);
    return saved ? JSON.parse(saved) : INITIAL_PRS;
  });

  const [selectedDate, setSelectedDate] = useState<string>('2026-10-31');
  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState<WorkoutRoutine | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_weights`, JSON.stringify(weightLogs));
  }, [weightLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_habits`, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_habit_completions`, JSON.stringify(habitCompletions));
  }, [habitCompletions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_routines`, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_prs`, JSON.stringify(prs));
  }, [prs]);

  // Format weight according to profile.unit (lbs or kg)
  const formatWeight = (weightLbs: number): string => {
    if (profile.unit === 'kg') {
      const kg = Math.round((weightLbs * 0.45359237) * 10) / 10;
      return `${kg} kg`;
    }
    return `${Math.round(weightLbs * 10) / 10} lbs`;
  };

  // Add weight log
  const addWeightLog = (entry: Omit<WeightEntry, 'id'>) => {
    const id = `w-${Date.now()}`;
    const newEntry: WeightEntry = { ...entry, id };
    
    // Check if entry for this date already exists; replace or add
    setWeightLogs((prev) => {
      const filtered = prev.filter((w) => w.date !== entry.date);
      const updated = [newEntry, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
      return updated;
    });

    // Update profile current weight if date is recent
    if (entry.date >= selectedDate) {
      setProfile((p) => ({ ...p, currentWeight: entry.weight }));
    }
  };

  const deleteWeightLog = (id: string) => {
    setWeightLogs((prev) => prev.filter((w) => w.id !== id));
  };

  // Habit status
  const getHabitStatusForDate = (habitId: string, date: string): boolean => {
    const record = habitCompletions.find((hc) => hc.habitId === habitId && hc.date === date);
    return !!record?.completed;
  };

  const getHabitCompletionRateForDate = (date: string) => {
    const total = habits.length;
    if (total === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = habits.filter((h) => getHabitStatusForDate(h.id, date)).length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  };

  // Toggle habit completion
  const toggleHabit = (habitId: string, date = selectedDate) => {
    const existing = habitCompletions.find((hc) => hc.habitId === habitId && hc.date === date);
    const newStatus = existing ? !existing.completed : true;

    setHabitCompletions((prev) => {
      const filtered = prev.filter((hc) => !(hc.habitId === habitId && hc.date === date));
      return [
        ...filtered,
        {
          id: `hc-${habitId}-${date}`,
          habitId,
          date,
          completed: newStatus,
        },
      ];
    });

    // Update habit streak calculations
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const currentStreak = newStatus ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1);
        const longestStreak = Math.max(h.longestStreak, currentStreak);
        return { ...h, currentStreak, longestStreak };
      })
    );

    if (newStatus) {
      fireStreakConfetti();
    }
  };

  const addHabit = (newH: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak'>) => {
    const habit: Habit = {
      ...newH,
      id: `h-${Date.now()}`,
      currentStreak: 0,
      longestStreak: 0,
    };
    setHabits((prev) => [...prev, habit]);
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setHabitCompletions((prev) => prev.filter((hc) => hc.habitId !== habitId));
  };

  // Routines
  const addRoutine = (routine: Omit<WorkoutRoutine, 'id'>) => {
    const newRoutine: WorkoutRoutine = {
      ...routine,
      id: `r-${Date.now()}`,
    };
    setRoutines((prev) => [...prev, newRoutine]);
  };

  const updateRoutine = (routine: WorkoutRoutine) => {
    setRoutines((prev) => prev.map((r) => (r.id === routine.id ? routine : r)));
  };

  const deleteRoutine = (routineId: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
  };

  // Complete workout session
  const completeWorkoutSession = (session: Omit<WorkoutSessionLog, 'id'>) => {
    const newSession: WorkoutSessionLog = {
      ...session,
      id: `ws-${Date.now()}`,
    };

    setSessions((prev) => [newSession, ...prev]);

    // Check for PRs
    let newPrFound = false;
    session.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed && set.weight > 0) {
          const existingPr = prs.find(
            (p) => p.exerciseName.toLowerCase() === ex.exerciseName.toLowerCase()
          );

          if (!existingPr) {
            // New PR record
            newPrFound = true;
            setPrs((prevPrs) => [
              ...prevPrs,
              {
                id: `pr-${Date.now()}-${Math.random()}`,
                exerciseName: ex.exerciseName,
                weight: set.weight,
                reps: set.reps,
                date: session.date,
              },
            ]);
          } else if (set.weight > existingPr.weight) {
            // Broken existing PR!
            newPrFound = true;
            setPrs((prevPrs) =>
              prevPrs.map((p) =>
                p.id === existingPr.id
                  ? {
                      ...p,
                      previousWeight: existingPr.weight,
                      weight: set.weight,
                      reps: set.reps,
                      date: session.date,
                    }
                  : p
              )
            );
          }
        }
      });
    });

    // Fire celebration
    fireAchievementConfetti();

    // Mark today's workout habit as completed
    const workoutHabit = habits.find((h) => h.category === 'training');
    if (workoutHabit) {
      const alreadyDone = getHabitStatusForDate(workoutHabit.id, session.date);
      if (!alreadyDone) {
        toggleHabit(workoutHabit.id, session.date);
      }
    }
  };

  const deleteWorkoutSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  };

  const setUnit = (unit: WeightUnit) => {
    setProfile((prev) => ({ ...prev, unit }));
  };

  // Export / Import
  const exportDataJson = () => {
    const data = {
      profile,
      weightLogs,
      habits,
      habitCompletions,
      routines,
      sessions,
      prs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gavin_fitness_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.weightLogs) setWeightLogs(parsed.weightLogs);
      if (parsed.habits) setHabits(parsed.habits);
      if (parsed.habitCompletions) setHabitCompletions(parsed.habitCompletions);
      if (parsed.routines) setRoutines(parsed.routines);
      if (parsed.sessions) setSessions(parsed.sessions);
      if (parsed.prs) setPrs(parsed.prs);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  };

  const resetToDefaults = () => {
    setProfile(INITIAL_USER_PROFILE);
    setWeightLogs(generateInitialWeightLogs());
    setHabits(INITIAL_HABITS);
    setHabitCompletions(generateInitialHabitCompletions());
    setRoutines(INITIAL_ROUTINES);
    setSessions(INITIAL_PAST_SESSIONS);
    setPrs(INITIAL_PRS);
    localStorage.clear();
  };

  // Derived metrics
  const sortedWeights = useMemo(
    () => [...weightLogs].sort((a, b) => a.date.localeCompare(b.date)),
    [weightLogs]
  );

  const sevenDayWeightAverage = useMemo(() => {
    if (sortedWeights.length === 0) return profile.currentWeight;
    const last7 = sortedWeights.slice(-7);
    const sum = last7.reduce((acc, curr) => acc + curr.weight, 0);
    return Math.round((sum / last7.length) * 10) / 10;
  }, [sortedWeights, profile.currentWeight]);

  const weightChangeTotal = useMemo(() => {
    if (sortedWeights.length === 0) return 0;
    const latest = sortedWeights[sortedWeights.length - 1].weight;
    const start = profile.startWeight;
    return Math.round((latest - start) * 10) / 10;
  }, [sortedWeights, profile.startWeight]);

  const weightChangeThisWeek = useMemo(() => {
    if (sortedWeights.length < 8) return -0.8;
    const latest = sortedWeights[sortedWeights.length - 1].weight;
    const weekAgo = sortedWeights[sortedWeights.length - 8].weight;
    return Math.round((latest - weekAgo) * 10) / 10;
  }, [sortedWeights]);

  const weightProgressPercent = useMemo(() => {
    const totalToLose = profile.startWeight - profile.goalWeight;
    if (totalToLose <= 0) return 100;
    const lostSoFar = profile.startWeight - profile.currentWeight;
    const pct = Math.min(100, Math.max(0, Math.round((lostSoFar / totalToLose) * 100)));
    return pct;
  }, [profile]);

  return (
    <FitnessContext.Provider
      value={{
        profile,
        weightLogs,
        habits,
        habitCompletions,
        routines,
        sessions,
        prs,
        activeWorkoutRoutine,
        selectedDate,
        setSelectedDate,
        setActiveWorkoutRoutine,
        addWeightLog,
        deleteWeightLog,
        toggleHabit,
        addHabit,
        deleteHabit,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        completeWorkoutSession,
        deleteWorkoutSession,
        updateProfile,
        setUnit,
        exportDataJson,
        importDataJson,
        resetToDefaults,
        formatWeight,
        getHabitStatusForDate,
        getHabitCompletionRateForDate,
        sevenDayWeightAverage,
        weightChangeTotal,
        weightChangeThisWeek,
        weightProgressPercent,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
