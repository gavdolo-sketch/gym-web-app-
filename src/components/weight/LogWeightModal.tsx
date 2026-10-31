import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { X, Scale, Calendar, Clock, Percent, FileText } from 'lucide-react';

interface LogWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const LogWeightModal: React.FC<LogWeightModalProps> = ({ isOpen, onClose, initialDate }) => {
  const { addWeightLog, profile, formatWeight } = useFitness();
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<string>(profile.currentWeight.toString());
  const [bodyFat, setBodyFat] = useState<string>('16.2');
  const [waist, setWaist] = useState<string>('33.5');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('morning');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight <= 0) return;

    // Convert to lbs if user profile is kg
    const weightInLbs = profile.unit === 'kg' ? Math.round((numWeight / 0.45359237) * 10) / 10 : numWeight;

    addWeightLog({
      date,
      weight: weightInLbs,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      waistInches: waist ? parseFloat(waist) : undefined,
      timeOfDay,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-6 text-neutral-900 dark:text-neutral-100">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Log Weigh-In</h3>
              <p className="text-xs text-neutral-500">Record daily weight to track long-term trend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Time of Day
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as 'morning' | 'evening')}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="morning">Morning (Fasted)</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Weight ({profile.unit.toUpperCase()})
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 178.4"
                className="w-full pl-3 pr-12 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-base font-mono font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <span className="absolute right-3 top-2.5 text-xs text-neutral-400 font-mono uppercase">
                {profile.unit}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Body Fat % (Optional)
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="e.g. 16.2"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Waist (Inches)
              </label>
              <input
                type="number"
                step="0.1"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="e.g. 33.5"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fasted after 8hr sleep, feeling energized"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
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
              Save Weigh-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
