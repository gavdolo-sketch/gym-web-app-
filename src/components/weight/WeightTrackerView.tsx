import React, { useState, useMemo } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { WeightEntry } from '../../types/fitness';
import { Scale, TrendingDown, Target, Calendar, Plus, Trash2, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface WeightTrackerViewProps {
  onOpenLogModal: () => void;
}

export const WeightTrackerView: React.FC<WeightTrackerViewProps> = ({ onOpenLogModal }) => {
  const { weightLogs, deleteWeightLog, profile, formatWeight, sevenDayWeightAverage, weightChangeTotal, weightChangeThisWeek } = useFitness();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; entry: WeightEntry; avgWeight: number } | null>(null);

  // Filter sorted weight entries chronologically
  const sortedEntries = useMemo(() => {
    return [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  }, [weightLogs]);

  const filteredEntries = useMemo(() => {
    if (sortedEntries.length === 0) return [];
    if (timeRange === 'all') return sortedEntries;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return sortedEntries.slice(-days);
  }, [sortedEntries, timeRange]);

  // Calculate 7-day moving averages for each point
  const pointsWithAvg = useMemo(() => {
    return filteredEntries.map((entry, idx, arr) => {
      // Find entries within 7 days prior in full sorted list
      const fullIdx = sortedEntries.findIndex((e) => e.id === entry.id);
      const startIdx = Math.max(0, fullIdx - 6);
      const slice = sortedEntries.slice(startIdx, fullIdx + 1);
      const avg = slice.reduce((sum, item) => sum + item.weight, 0) / slice.length;
      return {
        entry,
        avgWeight: Math.round(avg * 10) / 10,
      };
    });
  }, [filteredEntries, sortedEntries]);

  // Chart coordinate calculations
  const chartHeight = 260;
  const chartWidth = 800;
  const padding = { top: 24, right: 30, bottom: 36, left: 50 };

  const { minWeight, maxWeight, svgPath, avgPath, areaPath, points } = useMemo(() => {
    if (pointsWithAvg.length === 0) {
      return { minWeight: 170, maxWeight: 190, svgPath: '', avgPath: '', areaPath: '', points: [] };
    }

    const weights = pointsWithAvg.map((p) => p.entry.weight);
    const avgs = pointsWithAvg.map((p) => p.avgWeight);
    const target = profile.goalWeight;

    const allValues = [...weights, ...avgs, target];
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const minWeight = Math.floor(rawMin - 1.5);
    const maxWeight = Math.ceil(rawMax + 1.5);
    const weightRange = maxWeight - minWeight || 1;

    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    const computedPoints = pointsWithAvg.map((p, i) => {
      const x = padding.left + (pointsWithAvg.length > 1 ? (i / (pointsWithAvg.length - 1)) * innerWidth : innerWidth / 2);
      const y = padding.top + innerHeight - ((p.entry.weight - minWeight) / weightRange) * innerHeight;
      const yAvg = padding.top + innerHeight - ((p.avgWeight - minWeight) / weightRange) * innerHeight;
      return { x, y, yAvg, entry: p.entry, avgWeight: p.avgWeight };
    });

    // Build SVG path strings
    let rawPath = '';
    let avgPathStr = '';
    computedPoints.forEach((pt, i) => {
      if (i === 0) {
        rawPath += `M ${pt.x} ${pt.y}`;
        avgPathStr += `M ${pt.x} ${pt.yAvg}`;
      } else {
        // Smooth line
        const prev = computedPoints[i - 1];
        const cpX1 = prev.x + (pt.x - prev.x) / 2;
        rawPath += ` C ${cpX1} ${prev.y}, ${cpX1} ${pt.y}, ${pt.x} ${pt.y}`;
        avgPathStr += ` C ${cpX1} ${prev.yAvg}, ${cpX1} ${pt.yAvg}, ${pt.x} ${pt.yAvg}`;
      }
    });

    const bottomY = padding.top + innerHeight;
    const area = computedPoints.length > 0
      ? `${rawPath} L ${computedPoints[computedPoints.length - 1].x} ${bottomY} L ${computedPoints[0].x} ${bottomY} Z`
      : '';

    return {
      minWeight,
      maxWeight,
      svgPath: rawPath,
      avgPath: avgPathStr,
      areaPath: area,
      points: computedPoints,
    };
  }, [pointsWithAvg, profile.goalWeight, chartWidth, chartHeight]);

  const innerHeight = chartHeight - padding.top - padding.bottom;
  const goalY = padding.top + innerHeight - ((profile.goalWeight - minWeight) / (maxWeight - minWeight || 1)) * innerHeight;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Current Weight</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {formatWeight(profile.currentWeight)}
            </span>
            <span className="text-xs text-neutral-500">
              {weightLogs[0]?.date === '2026-10-31' ? 'Today' : 'Latest'}
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-9.8 lbs from start</span>
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">7-Day Moving Avg</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-500">
              {formatWeight(sevenDayWeightAverage)}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Filters daily water fluctuation
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Weekly Rate</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {weightChangeThisWeek <= 0 ? `${weightChangeThisWeek} lbs` : `+${weightChangeThisWeek} lbs`}
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Optimal target (-0.75 lb/wk)
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 font-medium">Target Goal</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {formatWeight(profile.goalWeight)}
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-mono">
            {Math.max(0, Math.round((profile.currentWeight - profile.goalWeight) * 10) / 10)} lbs to go
          </p>
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Weight & Moving Average Progression
            </h2>
            <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Daily Log</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-neutral-400 dark:bg-neutral-500 inline-block border-t border-dashed" />
                <span>7-Day Trend Average</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
                <span>Goal ({profile.goalWeight} lbs)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter buttons */}
            <div className="flex items-center p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/80 text-xs">
              {(['7d', '30d', '90d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 font-medium rounded-md uppercase transition-colors ${
                    timeRange === r
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenLogModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Weigh-In</span>
            </button>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="relative mt-4 w-full overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + (1 - ratio) * (chartHeight - padding.top - padding.bottom);
              const val = Math.round((minWeight + ratio * (maxWeight - minWeight)) * 10) / 10;
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="currentColor"
                    className="text-neutral-200 dark:text-neutral-800"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-neutral-400 dark:fill-neutral-500"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Goal Line */}
            {goalY >= padding.top && goalY <= chartHeight - padding.bottom && (
              <g>
                <line
                  x1={padding.left}
                  y1={goalY}
                  x2={chartWidth - padding.right}
                  y2={goalY}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <text
                  x={chartWidth - padding.right}
                  y={goalY - 6}
                  textAnchor="end"
                  className="text-[10px] font-mono font-medium fill-emerald-500"
                >
                  GOAL {profile.goalWeight}
                </text>
              </g>
            )}

            {/* Gradient Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#weightAreaGrad)" />}

            {/* 7-Day Moving Average Line (Dashed) */}
            {avgPath && (
              <path
                d={avgPath}
                fill="none"
                stroke="#a1a1aa"
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.85"
              />
            )}

            {/* Daily Weight Line */}
            {svgPath && (
              <path
                d={svgPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Dots */}
            {points.map((pt, idx) => {
              const isHovered = hoveredPoint?.entry.id === pt.entry.id;
              return (
                <g
                  key={pt.entry.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : 3}
                    fill={isHovered ? '#fbbf24' : '#f59e0b'}
                    stroke={isHovered ? '#fff' : '#0a0a0b'}
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                  />
                  {/* Invisible hit box for easier hovering */}
                  <rect
                    x={pt.x - 12}
                    y={padding.top}
                    width={24}
                    height={chartHeight - padding.top - padding.bottom}
                    fill="transparent"
                  />
                </g>
              );
            })}

            {/* Hover Crosshair & Tooltip */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={chartHeight - padding.bottom}
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="6"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* HTML Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 p-2.5 shadow-xl text-xs backdrop-blur-xs min-w-[150px]"
              style={{
                left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                top: `${(hoveredPoint.y / chartHeight) * 100}%`,
              }}
            >
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700/60 pb-1 mb-1">
                <span>{hoveredPoint.entry.date}</span>
                <span className="text-[10px] uppercase text-neutral-400">
                  {hoveredPoint.entry.timeOfDay}
                </span>
              </div>
              <div className="space-y-0.5 text-neutral-600 dark:text-neutral-300">
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className="font-mono font-bold text-amber-500">
                    {formatWeight(hoveredPoint.entry.weight)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>7d Trend:</span>
                  <span className="font-mono">{formatWeight(hoveredPoint.avgWeight)}</span>
                </div>
                {hoveredPoint.entry.bodyFat && (
                  <div className="flex justify-between text-[11px]">
                    <span>Body Fat:</span>
                    <span className="font-mono">{hoveredPoint.entry.bodyFat}%</span>
                  </div>
                )}
                {hoveredPoint.entry.notes && (
                  <p className="pt-1 text-[10px] text-neutral-500 dark:text-neutral-400 italic">
                    "{hoveredPoint.entry.notes}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Weigh-In History
            </h3>
            <p className="text-xs text-neutral-500">
              Showing {sortedEntries.length} recorded entries
            </p>
          </div>
          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Weight</th>
                <th className="px-4 py-3">Change</th>
                <th className="px-4 py-3">Body Fat</th>
                <th className="px-4 py-3">Waist</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {sortedEntries.slice(0, 15).map((entry, idx) => {
                const prev = sortedEntries[idx + 1];
                const delta = prev ? Math.round((entry.weight - prev.weight) * 10) / 10 : null;

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {formatWeight(entry.weight)}
                    </td>
                    <td className="px-4 py-3 font-mono whitespace-nowrap">
                      {delta !== null ? (
                        <span
                          className={`flex items-center gap-0.5 ${
                            delta < 0
                              ? 'text-emerald-500'
                              : delta > 0
                              ? 'text-neutral-400'
                              : 'text-neutral-500'
                          }`}
                        >
                          {delta < 0 ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : delta > 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : null}
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {entry.bodyFat ? `${entry.bodyFat}%` : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {entry.waistInches ? `${entry.waistInches}"` : '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 max-w-xs truncate">
                      {entry.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteWeightLog(entry.id)}
                        className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
