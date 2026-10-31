import { Habit, HabitCompletion, PersonalRecord, UserProfile, WeightEntry, WorkoutRoutine, WorkoutSessionLog } from '../types/fitness';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Gavin',
  email: 'gavdolo@gmail.com',
  avatarUrl: '/src/assets/images/gavin_avatar_1793433197981.jpg',
  startWeight: 188.0,
  currentWeight: 178.4,
  goalWeight: 172.0,
  startDate: '2026-09-01',
  targetDate: '2026-12-15',
  unit: 'lbs',
  heightInches: 71,
};

// Generate 45 days of realistic weight log data leading to 2026-10-31
export function generateInitialWeightLogs(): WeightEntry[] {
  const entries: WeightEntry[] = [];
  const baseDate = new Date('2026-10-31T08:00:00');
  
  // Starting 45 days ago at ~188 lbs, trending downward to 178.4 lbs
  const totalDays = 45;
  const startWeight = 188.2;
  const targetEndWeight = 178.4;
  const totalLoss = startWeight - targetEndWeight;

  for (let i = totalDays; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Progressive loss with realistic daily water fluctuations (+- 0.8 lbs)
    const progressFactor = (totalDays - i) / totalDays;
    const baseProgress = startWeight - (progressFactor * totalLoss);
    // Sine fluctuation for water retention/weekend carb variance
    const variance = Math.sin(i * 1.8) * 0.65 + (Math.cos(i * 0.9) * 0.35);
    const weight = Math.round((baseProgress + (i === 0 ? 0 : variance)) * 10) / 10;
    
    // Body fat estimation dropping from ~19.6% to 16.3%
    const bodyFat = Math.round((19.6 - (progressFactor * 3.3) + (variance * 0.15)) * 10) / 10;
    const waist = Math.round((35.5 - (progressFactor * 1.9)) * 10) / 10;

    let notes: string | undefined = undefined;
    if (i === 0) notes = 'Fasted morning weigh-in. Feeling energetic and lean!';
    else if (i === 7) notes = 'Post refeed day. Water retention as expected.';
    else if (i === 14) notes = 'Hit sub-181 milestone! Strength holds strong.';
    else if (i === 28) notes = 'Mid-month check-in, waist down half an inch.';
    else if (i === 40) notes = 'Initial baseline post-vacation reset.';

    entries.push({
      id: `w-${dateStr}`,
      date: dateStr,
      weight: i === 0 ? 178.4 : weight,
      bodyFat,
      waistInches: waist,
      timeOfDay: 'morning',
      notes,
    });
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h-1',
    title: '1 Gallon Water Intake (3.8L)',
    category: 'hydration',
    targetFrequency: 'daily',
    currentStreak: 18,
    longestStreak: 26,
    icon: 'Droplet',
    description: 'Keep hydration high for optimal metabolic rate and training recovery.',
  },
  {
    id: 'h-2',
    title: 'Hit 180g Protein Target',
    category: 'nutrition',
    targetFrequency: 'daily',
    currentStreak: 12,
    longestStreak: 21,
    icon: 'Beef',
    description: 'Essential for muscle protein synthesis and preserving lean tissue.',
  },
  {
    id: 'h-3',
    title: 'Workout / 45m Active Recovery',
    category: 'training',
    targetFrequency: 'daily',
    currentStreak: 24,
    longestStreak: 24,
    icon: 'Dumbbell',
    description: 'Complete scheduled lifting split or dedicated mobility & zone 2 walk.',
  },
  {
    id: 'h-4',
    title: '7.5+ Hours Quality Sleep',
    category: 'recovery',
    targetFrequency: 'daily',
    currentStreak: 9,
    longestStreak: 15,
    icon: 'Moon',
    description: 'Unwind at 10:30 PM, no screens 30m prior, dark cool room.',
  },
  {
    id: 'h-5',
    title: '10,000 Daily Steps (NEAT)',
    category: 'training',
    targetFrequency: 'daily',
    currentStreak: 16,
    longestStreak: 30,
    icon: 'Footprints',
    description: 'Non-exercise physical activity for consistent daily expenditure.',
  },
  {
    id: 'h-6',
    title: '10 Min Mobility & Foam Rolling',
    category: 'recovery',
    targetFrequency: 'daily',
    currentStreak: 7,
    longestStreak: 14,
    icon: 'Activity',
    description: 'Hip flexors, thoracic spine, and ankles for squat depth.',
  },
];

// Pre-fill last 30 days habit completions
export function generateInitialHabitCompletions(): HabitCompletion[] {
  const completions: HabitCompletion[] = [];
  const baseDate = new Date('2026-10-31T08:00:00');

  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    INITIAL_HABITS.forEach((habit, hIdx) => {
      // Create high realistic completion rate (~85-95%)
      let isCompleted = true;
      if (i === 0) {
        // For today: 4 completed, 2 pending
        isCompleted = hIdx < 4;
      } else if (i === 10 && hIdx === 3) {
        isCompleted = false; // missed sleep on a late night
      } else if (i === 13 && hIdx === 1) {
        isCompleted = false; // fell short of protein on travel
      } else if (i === 22 && hIdx === 5) {
        isCompleted = false;
      } else if (i === 8 && hIdx === 5) {
        isCompleted = false;
      }

      completions.push({
        id: `hc-${habit.id}-${dateStr}`,
        habitId: habit.id,
        date: dateStr,
        completed: isCompleted,
      });
    });
  }

  return completions;
}

export const INITIAL_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'r-push-a',
    name: 'Push A · Heavy Bench & Chest Focus',
    category: 'Strength',
    durationMinutes: 65,
    scheduledDays: ['Mon', 'Thu'],
    description: 'Primary horizontal pressing strength and deltoid hypertrophy progression.',
    exercises: [
      {
        id: 'e-1',
        name: 'Barbell Flat Bench Press',
        targetMuscle: 'Chest',
        sets: 4,
        reps: '5-8',
        targetWeight: 225,
        restSeconds: 150,
        notes: 'Arch back, plant feet firmly, pause slightly on the sternum.',
      },
      {
        id: 'e-2',
        name: 'Incline Dumbbell Press (30°)',
        targetMuscle: 'Upper Chest',
        sets: 3,
        reps: '8-10',
        targetWeight: 80,
        restSeconds: 120,
        notes: 'Deep stretch at the bottom, drive dumbbells up and inward.',
      },
      {
        id: 'e-3',
        name: 'Standing Overhead Barbell Press',
        targetMuscle: 'Shoulders',
        sets: 3,
        reps: '6-8',
        targetWeight: 145,
        restSeconds: 120,
        notes: 'Lock glutes, brace core, press straight path.',
      },
      {
        id: 'e-4',
        name: 'Dual Cable Lateral Raises',
        targetMuscle: 'Side Delts',
        sets: 4,
        reps: '12-15',
        targetWeight: 22.5,
        restSeconds: 75,
        notes: 'Cuffs at wrist height, lead with elbows, slow eccentric.',
      },
      {
        id: 'e-5',
        name: 'Tricep Rope Overhead Extension',
        targetMuscle: 'Triceps',
        sets: 3,
        reps: '10-12',
        targetWeight: 65,
        restSeconds: 75,
        notes: 'Flare ropes at peak contraction, maximize long head stretch.',
      },
    ],
  },
  {
    id: 'r-pull-a',
    name: 'Pull A · Deadlift & Lat Thickness',
    category: 'Strength',
    durationMinutes: 70,
    scheduledDays: ['Tue', 'Fri'],
    description: 'Heavy posterior pulling chain, vertical pulling, and biceps volume.',
    exercises: [
      {
        id: 'e-6',
        name: 'Conventional Barbell Deadlift',
        targetMuscle: 'Back & Hamstrings',
        sets: 4,
        reps: '4-6',
        targetWeight: 385,
        restSeconds: 180,
        notes: 'Engage lats, wedge hips, push floor away through mid-foot.',
      },
      {
        id: 'e-7',
        name: 'Weighted Pull-Ups',
        targetMuscle: 'Lats & Upper Back',
        sets: 3,
        reps: '6-8',
        targetWeight: 35,
        restSeconds: 120,
        notes: 'Full dead hang to chin over the bar with dip belt.',
      },
      {
        id: 'e-8',
        name: 'Chest-Supported T-Bar Row',
        targetMuscle: 'Mid-Back / Rhomboids',
        sets: 3,
        reps: '8-10',
        targetWeight: 135,
        restSeconds: 90,
        notes: 'Drive elbows back, squeeze scapulae for 1 full second.',
      },
      {
        id: 'e-9',
        name: 'Cable Facepulls with Rope',
        targetMuscle: 'Rear Delts & Rotators',
        sets: 3,
        reps: '15-20',
        targetWeight: 45,
        restSeconds: 60,
        notes: 'Pull to eye level, externally rotate wrists at finish.',
      },
      {
        id: 'e-10',
        name: 'Incline Dumbbell Hammer Curls',
        targetMuscle: 'Biceps & Brachialis',
        sets: 3,
        reps: '10-12',
        targetWeight: 40,
        restSeconds: 75,
        notes: 'Strict form, no swinging, full elbow extension at bottom.',
      },
    ],
  },
  {
    id: 'r-legs-a',
    name: 'Legs A · Squat & Quad Dominant',
    category: 'Hypertrophy',
    durationMinutes: 75,
    scheduledDays: ['Wed', 'Sat'],
    description: 'Barbell squat foundation, hamstring curls, and calf development.',
    exercises: [
      {
        id: 'e-11',
        name: 'Barbell Back Squat (High Bar)',
        targetMuscle: 'Quads & Glutes',
        sets: 4,
        reps: '5-8',
        targetWeight: 295,
        restSeconds: 180,
        notes: 'Brace into lifting belt, hit parallel, explode out of hole.',
      },
      {
        id: 'e-12',
        name: 'Romanian Deadlift (Dumbbell or Barbell)',
        targetMuscle: 'Hamstrings & Glutes',
        sets: 3,
        reps: '8-10',
        targetWeight: 205,
        restSeconds: 120,
        notes: 'Hinge hips back, feel intense hamstring stretch below knees.',
      },
      {
        id: 'e-13',
        name: 'Bulgarian Split Squats',
        targetMuscle: 'Quads & Unilateral Balance',
        sets: 3,
        reps: '10-12',
        targetWeight: 55,
        restSeconds: 90,
        notes: 'Front shin vertical, lower back knee gently to turf pad.',
      },
      {
        id: 'e-14',
        name: 'Seated Hamstring Leg Curl',
        targetMuscle: 'Hamstrings',
        sets: 3,
        reps: '12-15',
        targetWeight: 140,
        restSeconds: 75,
        notes: 'Toes pointed up, control 3-second eccentric return.',
      },
      {
        id: 'e-15',
        name: 'Standing Calf Raise Machine',
        targetMuscle: 'Calves',
        sets: 4,
        reps: '12-15',
        targetWeight: 210,
        restSeconds: 60,
        notes: 'Full stretch at bottom for 2 sec, drive high on big toe.',
      },
    ],
  },
  {
    id: 'r-engine-hiit',
    name: 'Athletic Engine · Conditioning & Core',
    category: 'Conditioning',
    durationMinutes: 45,
    scheduledDays: ['Sun'],
    description: 'High-intensity intervals, kettlebell ballistic flow, and core stability.',
    exercises: [
      {
        id: 'e-16',
        name: 'Echo Bike Intervals (Sprint / Rest)',
        targetMuscle: 'Cardiovascular & Quads',
        sets: 8,
        reps: '20s on / 40s off',
        restSeconds: 40,
        notes: 'Aim for 70+ RPM during max work sprint windows.',
      },
      {
        id: 'e-17',
        name: 'Kettlebell Russian Swings',
        targetMuscle: 'Posterior Chain',
        sets: 4,
        reps: '20',
        targetWeight: 53,
        restSeconds: 60,
        notes: 'Explosive hip snap, maintain neutral spine throughout.',
      },
      {
        id: 'e-18',
        name: 'Hanging Leg Raises',
        targetMuscle: 'Abs & Hip Flexors',
        sets: 3,
        reps: '12-15',
        restSeconds: 60,
        notes: 'Curl pelvis up towards ribs, avoid using body momentum.',
      },
    ],
  },
];

export const INITIAL_PAST_SESSIONS: WorkoutSessionLog[] = [
  {
    id: 'ws-2026-10-30',
    routineId: 'r-pull-a',
    routineName: 'Pull A · Deadlift & Lat Thickness',
    date: '2026-10-30',
    durationMinutes: 68,
    totalVolumeLbs: 28450,
    rating: 5,
    notes: 'Incredible grip strength today. Deadlifts felt weightless at 385.',
    exercises: [
      {
        exerciseId: 'e-6',
        exerciseName: 'Conventional Barbell Deadlift',
        targetMuscle: 'Back & Hamstrings',
        sets: [
          { setNumber: 1, reps: 6, weight: 345, completed: true },
          { setNumber: 2, reps: 5, weight: 365, completed: true },
          { setNumber: 3, reps: 5, weight: 385, completed: true },
          { setNumber: 4, reps: 4, weight: 405, completed: true },
        ],
      },
      {
        exerciseId: 'e-7',
        exerciseName: 'Weighted Pull-Ups',
        targetMuscle: 'Lats & Upper Back',
        sets: [
          { setNumber: 1, reps: 8, weight: 35, completed: true },
          { setNumber: 2, reps: 7, weight: 35, completed: true },
          { setNumber: 3, reps: 6, weight: 45, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ws-2026-10-28',
    routineId: 'r-push-a',
    routineName: 'Push A · Heavy Bench & Chest Focus',
    date: '2026-10-28',
    durationMinutes: 62,
    totalVolumeLbs: 24320,
    rating: 4,
    notes: 'Solid chest pump. Bench felt locked in at 225 lbs.',
    exercises: [
      {
        exerciseId: 'e-1',
        exerciseName: 'Barbell Flat Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, reps: 8, weight: 205, completed: true },
          { setNumber: 2, reps: 7, weight: 225, completed: true },
          { setNumber: 3, reps: 6, weight: 225, completed: true },
          { setNumber: 4, reps: 5, weight: 235, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ws-2026-10-26',
    routineId: 'r-legs-a',
    routineName: 'Legs A · Squat & Quad Dominant',
    date: '2026-10-26',
    durationMinutes: 74,
    totalVolumeLbs: 31200,
    rating: 5,
    notes: 'Hit new PR on Barbell Back Squat: 315 lbs for 5 clean reps!',
    exercises: [
      {
        exerciseId: 'e-11',
        exerciseName: 'Barbell Back Squat',
        targetMuscle: 'Quads & Glutes',
        sets: [
          { setNumber: 1, reps: 8, weight: 265, completed: true },
          { setNumber: 2, reps: 6, weight: 285, completed: true },
          { setNumber: 3, reps: 5, weight: 305, completed: true },
          { setNumber: 4, reps: 5, weight: 315, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ws-2026-10-24',
    routineId: 'r-push-a',
    routineName: 'Push A · Heavy Bench & Chest Focus',
    date: '2026-10-24',
    durationMinutes: 60,
    totalVolumeLbs: 23150,
    rating: 4,
    notes: 'Shoulders felt good on OHP. Nice consistent tempo.',
    exercises: [],
  },
  {
    id: 'ws-2026-10-21',
    routineId: 'r-pull-a',
    routineName: 'Pull A · Deadlift & Lat Thickness',
    date: '2026-10-21',
    durationMinutes: 65,
    totalVolumeLbs: 27900,
    rating: 4,
    notes: 'Strong t-bar rows and heavy deadlifts.',
    exercises: [],
  },
  {
    id: 'ws-2026-10-18',
    routineId: 'r-legs-a',
    routineName: 'Legs A · Squat & Quad Dominant',
    date: '2026-10-18',
    durationMinutes: 70,
    totalVolumeLbs: 29800,
    rating: 4,
    notes: 'RDLs felt deep in hamstrings.',
    exercises: [],
  },
];

export const INITIAL_PRS: PersonalRecord[] = [
  {
    id: 'pr-1',
    exerciseName: 'Barbell Back Squat',
    weight: 315,
    reps: 5,
    date: '2026-10-26',
    previousWeight: 305,
  },
  {
    id: 'pr-2',
    exerciseName: 'Conventional Deadlift',
    weight: 405,
    reps: 4,
    date: '2026-10-30',
    previousWeight: 395,
  },
  {
    id: 'pr-3',
    exerciseName: 'Barbell Flat Bench Press',
    weight: 235,
    reps: 5,
    date: '2026-10-28',
    previousWeight: 225,
  },
  {
    id: 'pr-4',
    exerciseName: 'Incline Dumbbell Press',
    weight: 85,
    reps: 8,
    date: '2026-10-15',
    previousWeight: 80,
  },
  {
    id: 'pr-5',
    exerciseName: 'Standing Overhead Press',
    weight: 155,
    reps: 5,
    date: '2026-10-20',
    previousWeight: 145,
  },
  {
    id: 'pr-6',
    exerciseName: 'Weighted Pull-Ups',
    weight: 45,
    reps: 6,
    date: '2026-10-30',
    previousWeight: 35,
  },
];
