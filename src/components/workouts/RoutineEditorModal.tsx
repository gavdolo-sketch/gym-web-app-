import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { Exercise, WorkoutRoutine } from '../../types/fitness';
import { X, Plus, Trash2, Dumbbell, Clock } from 'lucide-react';

interface RoutineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineToEdit?: WorkoutRoutine | null;
}

export const RoutineEditorModal: React.FC<RoutineEditorModalProps> = ({
  isOpen,
  onClose,
  routineToEdit,
}) => {
  const { addRoutine, updateRoutine, profile } = useFitness();

  const [name, setName] = useState(routineToEdit?.name || '');
  const [category, setCategory] = useState<WorkoutRoutine['category']>(
    routineToEdit?.category || 'Strength'
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    routineToEdit?.durationMinutes || 60
  );
  const [description, setDescription] = useState(routineToEdit?.description || '');
  const [scheduledDays, setScheduledDays] = useState<
    ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[]
  >(routineToEdit?.scheduledDays || ['Mon', 'Thu']);

  const [exercises, setExercises] = useState<Exercise[]>(
    routineToEdit?.exercises || [
      {
        id: `e-${Date.now()}-1`,
        name: 'Barbell Flat Bench Press',
        targetMuscle: 'Chest',
        sets: 4,
        reps: '6-8',
        targetWeight: 225,
        restSeconds: 120,
      },
    ]
  );

  if (!isOpen) return null;

  const daysOfWeek: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];

  const toggleDay = (day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun') => {
    if (scheduledDays.includes(day)) {
      setScheduledDays(scheduledDays.filter((d) => d !== day));
    } else {
      setScheduledDays([...scheduledDays, day]);
    }
  };

  const handleAddExercise = () => {
    const newEx: Exercise = {
      id: `e-${Date.now()}-${Math.random()}`,
      name: '',
      targetMuscle: 'Full Body',
      sets: 3,
      reps: '8-12',
      targetWeight: 100,
      restSeconds: 90,
    };
    setExercises([...exercises, newEx]);
  };

  const handleUpdateExercise = (idx: number, patch: Partial<Exercise>) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, ...patch } : ex))
    );
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanedExercises = exercises.filter((ex) => ex.name.trim().length > 0);
    if (cleanedExercises.length === 0) {
      alert('Please include at least one exercise name.');
      return;
    }

    if (routineToEdit) {
      updateRoutine({
        ...routineToEdit,
        name: name.trim(),
        category,
        durationMinutes,
        description: description.trim(),
        scheduledDays,
        exercises: cleanedExercises,
      });
    } else {
      addRoutine({
        name: name.trim(),
        category,
        durationMinutes,
        description: description.trim(),
        scheduledDays,
        exercises: cleanedExercises,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl text-neutral-900 dark:text-neutral-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">
                {routineToEdit ? 'Edit Routine' : 'Create Custom Workout Routine'}
              </h3>
              <p className="text-xs text-neutral-500">
                Configure your split, target muscles, and progression parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Routine Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Push A · Heavy Bench & Shoulders"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkoutRoutine['category'])}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="Strength">Strength</option>
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Conditioning">Conditioning</option>
                <option value="Mobility">Mobility</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Estimated Duration (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Scheduled Days
              </label>
              <div className="flex items-center gap-1">
                {daysOfWeek.map((d) => {
                  const isChecked = scheduledDays.includes(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        isChecked
                          ? 'border-amber-500 bg-amber-500 text-neutral-950 font-semibold'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Primary horizontal pressing strength and deltoid hypertrophy progression."
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Exercise Builder */}
          <div className="pt-2">
            <div className="flex items-center justify-between pb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Exercises ({exercises.length})
              </label>
              <button
                type="button"
                onClick={handleAddExercise}
                className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Exercise</span>
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((ex, idx) => (
                <div
                  key={ex.id || idx}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Exercise Name (e.g. Barbell Squat)"
                      value={ex.name}
                      onChange={(e) => handleUpdateExercise(idx, { name: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                      title="Remove exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500 text-[11px] block">Target Muscle</span>
                      <input
                        type="text"
                        value={ex.targetMuscle}
                        onChange={(e) => handleUpdateExercise(idx, { targetMuscle: e.target.value })}
                        placeholder="e.g. Chest"
                        className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[11px] block">Sets</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={ex.sets}
                        onChange={(e) => handleUpdateExercise(idx, { sets: parseInt(e.target.value) || 1 })}
                        className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[11px] block">Reps</span>
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={(e) => handleUpdateExercise(idx, { reps: e.target.value })}
                        placeholder="8-10"
                        className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[11px] block">Target {profile.unit.toUpperCase()}</span>
                      <input
                        type="number"
                        step="2.5"
                        value={ex.targetWeight || 0}
                        onChange={(e) => handleUpdateExercise(idx, { targetWeight: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-colors"
            >
              {routineToEdit ? 'Save Changes' : 'Create Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
