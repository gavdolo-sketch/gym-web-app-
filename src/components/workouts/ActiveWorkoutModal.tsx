import React, { useState, useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { WorkoutRoutine, ExerciseLog, ExerciseSetLog } from '../../types/fitness';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Clock,
  Flame,
  Award,
  Timer,
  Volume2,
} from 'lucide-react';

interface ActiveWorkoutModalProps {
  routine: WorkoutRoutine;
  onClose: () => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({ routine, onClose }) => {
  const { completeWorkoutSession, profile, formatWeight } = useFitness();

  // Stopwatch timer for entire session
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Dedicated Rest Timer
  const [restDuration, setRestDuration] = useState(90);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);

  // Exercise log states
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => {
    return routine.exercises.map((ex) => {
      const defaultSets: ExerciseSetLog[] = [];
      const numSets = ex.sets || 3;
      const parsedReps = parseInt(ex.reps.split('-')[0]) || 8;
      for (let s = 1; s <= numSets; s++) {
        defaultSets.push({
          setNumber: s,
          reps: parsedReps,
          weight: ex.targetWeight || 135,
          completed: false,
        });
      }
      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetMuscle: ex.targetMuscle,
        sets: defaultSets,
      };
    });
  });

  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [notes, setNotes] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  // Elapsed time effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimeLeft !== null && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimeLeft]);

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle set completed
  const handleToggleSet = (exIdx: number, setIdx: number) => {
    setExerciseLogs((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const sets = [...ex.sets];
      const current = sets[setIdx];
      const nextStatus = !current.completed;
      sets[setIdx] = { ...current, completed: nextStatus };
      ex.sets = sets;
      copy[exIdx] = ex;
      return copy;
    });

    // If marked completed, start rest timer!
    const targetRest = routine.exercises[exIdx]?.restSeconds || restDuration;
    setRestTimeLeft(targetRest);
  };

  const handleUpdateSet = (
    exIdx: number,
    setIdx: number,
    patch: Partial<ExerciseSetLog>
  ) => {
    setExerciseLogs((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], ...patch };
      ex.sets = sets;
      copy[exIdx] = ex;
      return copy;
    });
  };

  const handleAddSet = (exIdx: number) => {
    setExerciseLogs((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets = [
        ...ex.sets,
        {
          setNumber: ex.sets.length + 1,
          reps: lastSet ? lastSet.reps : 8,
          weight: lastSet ? lastSet.weight : 135,
          completed: false,
        },
      ];
      copy[exIdx] = ex;
      return copy;
    });
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    setExerciseLogs((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      ex.sets = ex.sets.filter((_, i) => i !== setIdx);
      copy[exIdx] = ex;
      return copy;
    });
  };

  // Calculate total volume lifted
  const totalVolume = exerciseLogs.reduce((acc, ex) => {
    const exVol = ex.sets.reduce((sAcc, set) => {
      return sAcc + (set.completed ? set.weight * set.reps : 0);
    }, 0);
    return acc + exVol;
  }, 0);

  const completedSetsCount = exerciseLogs.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.completed).length;
  }, 0);

  const totalSetsCount = exerciseLogs.reduce((acc, ex) => acc + ex.sets.length, 0);

  const handleSaveWorkout = () => {
    completeWorkoutSession({
      routineId: routine.id,
      routineName: routine.name,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      exercises: exerciseLogs,
      totalVolumeLbs: totalVolume,
      rating,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[94vh] flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl text-neutral-900 dark:text-neutral-100 overflow-hidden">
        {/* Active Workout Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {routine.name}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live Session Tracking · {completedSetsCount}/{totalSetsCount} sets logged
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Stopwatch Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-sm font-semibold">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{formatTime(elapsedSeconds)}</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="ml-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rest Timer Banner */}
        {restTimeLeft !== null && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
              <Timer className="w-4 h-4 animate-spin" />
              <span>Resting:</span>
              <span className="font-mono text-base font-bold text-amber-500">
                {formatTime(restTimeLeft)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[60, 90, 120, 180].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setRestTimeLeft(sec)}
                  className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-mono hover:bg-neutral-100"
                >
                  {sec}s
                </button>
              ))}
              <button
                onClick={() => setRestTimeLeft(null)}
                className="px-2 py-0.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 text-[11px]"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Exercise Logs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {exerciseLogs.map((ex, exIdx) => (
            <div
              key={ex.exerciseId || exIdx}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {ex.exerciseName}
                  </h4>
                  <span className="text-xs text-neutral-500">
                    Target: {ex.targetMuscle}
                  </span>
                </div>
                <button
                  onClick={() => handleAddSet(exIdx)}
                  className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>
              </div>

              {/* Set Rows Table */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold uppercase text-neutral-400 px-2">
                  <div className="col-span-2">Set</div>
                  <div className="col-span-4">Weight ({profile.unit.toUpperCase()})</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-3 text-right">Log</div>
                </div>

                {ex.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-colors ${
                      set.completed
                        ? 'bg-amber-500/10 border border-amber-500/30'
                        : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60'
                    }`}
                  >
                    <div className="col-span-2 font-mono font-bold text-xs text-neutral-500">
                      #{set.setNumber}
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        step="2.5"
                        value={set.weight}
                        onChange={(e) =>
                          handleUpdateSet(exIdx, setIdx, {
                            weight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) =>
                          handleUpdateSet(exIdx, setIdx, {
                            reps: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleSet(exIdx, setIdx)}
                        className={`p-1.5 rounded-lg transition-all ${
                          set.completed
                            ? 'bg-amber-500 text-neutral-950 shadow-xs'
                            : 'border border-neutral-300 dark:border-neutral-600 hover:border-amber-500 text-neutral-400'
                        }`}
                        title={set.completed ? 'Set completed' : 'Mark set complete'}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {ex.sets.length > 1 && (
                        <button
                          onClick={() => handleRemoveSet(exIdx, setIdx)}
                          className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                          title="Remove set"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Completion Form Details */}
          {isFinishing && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/80 p-4 space-y-3">
              <h4 className="text-sm font-semibold">Session Summary & Reflection</h4>
              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-500">Rate Session:</span>
                <div className="flex items-center gap-1">
                  {([1, 2, 3, 4, 5] as const).map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-lg transition-transform hover:scale-125 ${
                        rating >= star ? 'text-amber-400' : 'text-neutral-400 dark:text-neutral-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Session Notes (Pump, energy, modifications)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Great shoulder pump, felt easy at 225 on bench."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
          <div className="text-xs">
            <span className="text-neutral-500">Total Volume: </span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {totalVolume.toLocaleString()} {profile.unit}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Abandon
            </button>

            {!isFinishing ? (
              <button
                onClick={() => setIsFinishing(true)}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-sm transition-all"
              >
                Finish Workout
              </button>
            ) : (
              <button
                onClick={handleSaveWorkout}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-sm transition-all"
              >
                Save & Celebrate!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
