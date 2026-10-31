export type WeightUnit = 'lbs' | 'kg';

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // in lbs
  bodyFat?: number; // percentage
  waistInches?: number;
  timeOfDay: 'morning' | 'evening';
  notes?: string;
}

export interface Habit {
  id: string;
  title: string;
  category: 'nutrition' | 'hydration' | 'recovery' | 'training' | 'mindset';
  targetFrequency: 'daily' | 'weekdays' | 'weekends';
  currentStreak: number;
  longestStreak: number;
  icon: string;
  description: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string; // e.g. "8-10"
  targetWeight?: number; // in lbs
  restSeconds: number;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  category: 'Strength' | 'Hypertrophy' | 'Conditioning' | 'Mobility';
  durationMinutes: number;
  exercises: Exercise[];
  scheduledDays: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  description: string;
}

export interface ExerciseSetLog {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: string;
  sets: ExerciseSetLog[];
}

export interface WorkoutSessionLog {
  id: string;
  routineId?: string;
  routineName: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  exercises: ExerciseLog[];
  totalVolumeLbs: number;
  rating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  previousWeight?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  startWeight: number;
  currentWeight: number;
  goalWeight: number;
  startDate: string;
  targetDate: string;
  unit: WeightUnit;
  heightInches: number;
}
