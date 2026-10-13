import React, { useState } from 'react';
import { DayRecord, UserProfile } from '../types';
import { calculateDayNutrition, calculateWorkoutStats } from '../utils/nutritionCalculations';
import { getDateOffset, getTodayDateString } from '../utils/storage';
import { VEGAN_MICRONUTRIENT_STANDARDS } from '../data/veganFoods';
import {
  BarChart3,
  Flame,
  Award,
  Zap,
  Dumbbell,
  Calendar,
  Save,
  CheckCircle,
} from 'lucide-react';

interface AnalyticsViewProps {
  records: Record<string, DayRecord>;
  user: UserProfile;
  selectedDate: string;
  onSaveReflection: (wins: string, focus: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  records,
  user,
  selectedDate,
  onSaveReflection,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('7d');
  const daysCount = timeRange === '7d' ? 7 : 14;

  const currentRecord = records[selectedDate] || { reflection: { wins: '', focus: '' } };
  const [winsText, setWinsText] = useState(currentRecord.reflection?.wins || '');
  const [focusText, setFocusText] = useState(currentRecord.reflection?.focus || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute daily trend array
  const trendDays = Array.from({ length: daysCount }, (_, i) => {
    const dStr = getDateOffset(selectedDate, -(daysCount - 1 - i));
    const rec = records[dStr];
    const nut = rec ? calculateDayNutrition(rec.meals) : null;
    const wOut = rec ? calculateWorkoutStats(rec) : null;

    const [y, m, d] = dStr.split('-').map(Number);
    const dayLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'narrow' });
    const shortDate = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

    return {
      dateStr: dStr,
      dayLabel,
      shortDate,
      protein: nut ? nut.protein : 0,
      calories: nut ? nut.calories : 0,
      carbs: nut ? nut.carbs : 0,
      fat: nut ? nut.fat : 0,
      leucine: nut ? nut.leucineG : 0,
      microScore: nut ? nut.overallMicronutrientScore : 0,
      sets: wOut ? wOut.totalSets : 0,
      reps: wOut ? wOut.totalReps : 0,
    };
  });

  const proteinGoal = user.goals.protein || 120;
  const calorieGoal = user.goals.calories || 2400;

  // Averages
  const activeProteinDays = trendDays.filter((d) => d.protein > 0);
  const avgProtein = activeProteinDays.length
    ? Math.round(activeProteinDays.reduce((a, b) => a + b.protein, 0) / activeProteinDays.length)
    : 0;

  const avgCalories = activeProteinDays.length
    ? Math.round(activeProteinDays.reduce((a, b) => a + b.calories, 0) / activeProteinDays.length)
    : 0;

  const totalWorkoutSets = trendDays.reduce((a, b) => a + b.sets, 0);
  const totalReps = trendDays.reduce((a, b) => a + b.reps, 0);

  // Today's nutrition
  const todayNut = calculateDayNutrition(records[selectedDate]?.meals || []);

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveReflection(winsText, focusText);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  // Max protein for SVG chart scaling
  const maxProteinVal = Math.max(proteinGoal * 1.25, ...trendDays.map((d) => d.protein), 60);

  return (
    <div className="space-y-6 pb-20">
      {/* Analytics Header & Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-3xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-violet-400" /> Longitudinal Trend Visualizations
          </span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            Progress Insights & Habit Consistency
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === '7d' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('14d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === '14d' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 14 Days
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/80 border border-rose-900/40 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
            Avg Protein Intake
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-white tabular-nums">{avgProtein}g</span>
            <span className="text-xs text-slate-400">/ {proteinGoal}g goal</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {Math.round((avgProtein / proteinGoal) * 100)}% of muscle target
          </span>
        </div>

        <div className="bg-slate-900/80 border border-amber-900/40 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Avg Daily Calories
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-white tabular-nums">{avgCalories}</span>
            <span className="text-xs text-slate-400">kcal</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Clean plant energy surplus</span>
        </div>

        <div className="bg-slate-900/80 border border-cyan-900/40 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
            Calisthenics Volume
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-white tabular-nums">{totalWorkoutSets}</span>
            <span className="text-xs text-slate-400">sets</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {totalReps} total strict reps logged
          </span>
        </div>

        <div className="bg-slate-900/80 border border-emerald-900/40 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Plant Micro Coverage
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-white tabular-nums">{todayNut.overallMicronutrientScore}%</span>
            <span className="text-xs text-slate-400">today</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">B12, Iron, Zinc, Calcium</span>
        </div>
      </div>

      {/* SVG Bar Chart: Daily Protein Progression vs Goal */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" /> Daily Protein Intake vs Target
            </h3>
            <p className="text-xs text-slate-400">
              Maintaining high protein is essential for calisthenics recovery and lean muscle tissue retention.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Protein (g)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 border-b-2 border-dashed border-amber-400 inline-block" /> Goal ({proteinGoal}g)
            </span>
          </div>
        </div>

        {/* SVG Container */}
        <div className="relative pt-6">
          <div className="h-56 sm:h-64 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-slate-800">
            {trendDays.map((d) => {
              const heightPct = Math.min(100, Math.round((d.protein / maxProteinVal) * 100));
              const hitsGoal = d.protein >= proteinGoal;
              const isSelected = d.dateStr === selectedDate;

              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-[10px] pointer-events-none shadow-lg z-10 whitespace-nowrap">
                    <strong>{d.shortDate}:</strong> {d.protein}g protein ({d.calories} kcal)
                  </div>

                  {/* Bar Value text */}
                  <span className="text-[10px] font-bold tabular-nums mb-1 text-slate-400 group-hover:text-white">
                    {d.protein > 0 ? `${Math.round(d.protein)}g` : '—'}
                  </span>

                  {/* The Bar */}
                  <div className="w-full max-w-[42px] bg-slate-800/60 rounded-t-xl overflow-hidden flex items-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        hitsGoal
                          ? 'bg-gradient-to-t from-rose-600 via-rose-500 to-amber-400'
                          : d.protein > 0
                          ? 'bg-gradient-to-t from-slate-700 to-rose-500/80'
                          : 'bg-transparent'
                      } ${isSelected ? 'ring-2 ring-emerald-400' : ''}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-2 ${
                      isSelected ? 'text-emerald-400 font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    {d.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Goal reference line */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-amber-400/70 pointer-events-none"
            style={{
              bottom: `${Math.min(95, Math.round((proteinGoal / maxProteinVal) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* 2-Column Split: Macro Balance & Calisthenics Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Today's Macro Energy Balance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🥗</span> Macro Energy Ratio (Selected Day)
          </h3>

          <div className="space-y-3">
            {/* Visual Macro Strip */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-800">
              <div
                style={{ width: `${Math.max(5, todayNut.proteinRatioPct)}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`Protein: ${todayNut.proteinRatioPct}%`}
              />
              <div
                style={{
                  width: `${Math.max(
                    5,
                    todayNut.calories > 0
                      ? Math.round(((todayNut.carbs * 4) / todayNut.calories) * 100)
                      : 50
                  )}%`,
                }}
                className="bg-amber-500 h-full transition-all"
                title="Carbohydrates"
              />
              <div
                style={{
                  width: `${Math.max(
                    5,
                    todayNut.calories > 0
                      ? Math.round(((todayNut.fat * 9) / todayNut.calories) * 100)
                      : 25
                  )}%`,
                }}
                className="bg-cyan-500 h-full transition-all"
                title="Healthy Fats"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-rose-950">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  Protein
                </span>
                <span className="text-lg font-extrabold text-white tabular-nums">{todayNut.protein}g</span>
                <span className="text-[10px] text-slate-400 block">{todayNut.proteinRatioPct}% kcal</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-2xl border border-amber-950">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Complex Carbs
                </span>
                <span className="text-lg font-extrabold text-white tabular-nums">{todayNut.carbs}g</span>
                <span className="text-[10px] text-slate-400 block">
                  {todayNut.calories > 0
                    ? Math.round(((todayNut.carbs * 4) / todayNut.calories) * 100)
                    : 0}
                  % kcal
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-2xl border border-cyan-950">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Healthy Fats
                </span>
                <span className="text-lg font-extrabold text-white tabular-nums">{todayNut.fat}g</span>
                <span className="text-[10px] text-slate-400 block">
                  {todayNut.calories > 0
                    ? Math.round(((todayNut.fat * 9) / todayNut.calories) * 100)
                    : 0}
                  % kcal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calisthenics Overload Progression */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-cyan-400" /> Calisthenics Volume Over Time
          </h3>

          <div className="space-y-2">
            {trendDays.slice(-7).map((d) => (
              <div key={d.dateStr} className="flex items-center gap-3 text-xs">
                <span className="w-14 text-slate-400 font-semibold">{d.shortDate}</span>
                <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                    style={{ width: `${Math.min(100, (d.sets / 8) * 100)}%` }}
                  />
                </div>
                <span className="w-16 text-right font-bold text-cyan-300 tabular-nums">
                  {d.sets > 0 ? `${d.sets} sets` : 'Rest day'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Wins & Reflection Journal */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>✍️</span> Weekly Self-Reflection & Achievements
            </h3>
            <p className="text-xs text-slate-400">
              Reflect on small wins and set your calisthenics & plant nutrition focus for next week.
            </p>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 rounded-full px-3 py-1 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle className="w-3.5 h-3.5" /> Reflection Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveJournal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                What went well this week? (Small wins count)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Consistently hit 130g protein with TVP and seitan; completed 3 sets of 15 standard pushups without form breakdown..."
                value={winsText}
                onChange={(e) => setWinsText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                One realistic focus for next week
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Practice negative pull-ups twice this week; ensure daily B12 and ground flaxseed intake..."
                value={focusText}
                onChange={(e) => setFocusText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-950/40 transition-all"
            >
              <Save className="w-3.5 h-3.5" /> Save Reflection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
