import React from 'react';
import { DayRecord, UserProfile } from '../types';
import { calculateDayNutrition, calculateWorkoutStats } from '../utils/nutritionCalculations';
import { getDateOffset, getTodayDateString } from '../utils/storage';
import { ASSET_IMAGES } from '../assets/images';
import {
  Flame,
  Zap,
  Dumbbell,
  Shield,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Award,
  ArrowRight,
} from 'lucide-react';

interface TodayDashboardProps {
  record: DayRecord;
  user: UserProfile;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'nutrition' | 'calisthenics' | 'analytics' | 'care', mealType?: string) => void;
  onToggleEssential: (key: keyof DayRecord['essentials']) => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  record,
  user,
  selectedDate,
  onSelectDate,
  onNavigateTab,
  onToggleEssential,
}) => {
  const nutrition = calculateDayNutrition(record.meals);
  const workoutStats = calculateWorkoutStats(record);

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  // Goals
  const proteinGoal = user.goals.protein || 120;
  const calorieGoal = user.goals.calories || 2400;
  const proteinPct = Math.min(100, Math.round((nutrition.protein / proteinGoal) * 100));
  const caloriePct = Math.min(100, Math.round((nutrition.calories / calorieGoal) * 100));
  const workoutTargetSets = 10;
  const workoutPct = Math.min(100, Math.round((workoutStats.totalSets / workoutTargetSets) * 100));

  // Date carousel items
  const dateOptions = [-4, -3, -2, -1, 0].map((offset) => {
    const dStr = getDateOffset(todayStr, offset);
    const [y, m, d] = dStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = dateObj.getDate();
    return { dateStr: dStr, dayName, dayNum, isToday: offset === 0 };
  });

  const mealsByType = {
    breakfast: record.meals.filter((m) => m.mealType === 'breakfast'),
    lunch: record.meals.filter((m) => m.mealType === 'lunch'),
    dinner: record.meals.filter((m) => m.mealType === 'dinner'),
    snack: record.meals.filter((m) => m.mealType === 'snack'),
  };

  const getMealProtein = (items: typeof record.meals) =>
    Math.round(items.reduce((sum, i) => sum + i.food.protein * (i.servings || 1), 0) * 10) / 10;

  const getMealCalories = (items: typeof record.meals) =>
    Math.round(items.reduce((sum, i) => sum + i.food.calories * (i.servings || 1), 0));

  return (
    <div className="space-y-6 pb-20">
      {/* Date Scroller Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-2.5 sm:p-3 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {dateOptions.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            return (
              <button
                key={item.dateStr}
                onClick={() => onSelectDate(item.dateStr)}
                className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap min-w-[54px] ${
                  isSelected
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shadow-md shadow-emerald-950/40 scale-105'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/60'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-80">{item.dayName}</span>
                <span className="text-sm font-extrabold">{item.dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* Date picker jump */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectDate(getDateOffset(selectedDate, -1))}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isToday ? 'Today' : selectedDate}</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && onSelectDate(e.target.value)}
                className="opacity-0 absolute w-6 cursor-pointer"
              />
            </div>
            <button
              onClick={() => onSelectDate(getDateOffset(selectedDate, 1))}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {!isToday && (
            <button
              onClick={() => onSelectDate(todayStr)}
              className="px-2.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-lg hover:bg-emerald-900 transition-colors"
            >
              Jump to Today
            </button>
          )}
        </div>
      </div>

      {/* Pictorial Split Hero: Power Bowl Fuel + Mind-Tree Calisthenics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Today's High-Protein Fuel Feast */}
        <div
          onClick={() => onNavigateTab('nutrition')}
          className="relative overflow-hidden rounded-3xl border border-rose-900/50 p-6 shadow-xl bg-slate-900 cursor-pointer group hover:border-rose-500/80 transition-all flex flex-col justify-between min-h-[190px]"
        >
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700">
            <img
              src={ASSET_IMAGES.powerBowl}
              alt="Vegan Protein Feast"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-10" />

          <div className="relative z-20 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" /> Plant Protein & Feast
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                {nutrition.protein}g
              </span>
              <span className="text-sm font-bold text-rose-300">/ {proteinGoal}g goal ({proteinPct}%)</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">
              {record.meals.length} pictorial items logged · {nutrition.calories} kcal energy
            </p>
          </div>

          <div className="relative z-20 pt-3 flex items-center justify-between border-t border-slate-800/80 text-xs font-bold text-rose-300">
            <span className="flex items-center gap-1">
              <span>{nutrition.mpsTriggerCount > 0 ? '🔥 MPS Trigger Active' : '⚡ Add 25g+ protein meal'}</span>
            </span>
            <span className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
              Open Power Bowl <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Calisthenics Mind-Tree Progression */}
        <div
          onClick={() => onNavigateTab('calisthenics')}
          className="relative overflow-hidden rounded-3xl border border-cyan-900/50 p-6 shadow-xl bg-slate-900 cursor-pointer group hover:border-cyan-500/80 transition-all flex flex-col justify-between min-h-[190px]"
        >
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700">
            <img
              src={ASSET_IMAGES.homeGym}
              alt="Calisthenics Gym"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-10" />

          <div className="relative z-20 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-cyan-400" /> Skill Mind-Tree Overload
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                {workoutStats.totalSets}
              </span>
              <span className="text-sm font-bold text-cyan-300">sets completed</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">
              {workoutStats.totalReps} total reps · {workoutStats.totalExercises} exercises trained
            </p>
          </div>

          <div className="relative z-20 pt-3 flex items-center justify-between border-t border-slate-800/80 text-xs font-bold text-cyan-300">
            <span>
              {workoutStats.totalSets > 0 ? '✨ Gaining Muscle Today' : '⚡ Launch Mind-Tree Practice'}
            </span>
            <span className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
              View Skills <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* PICTORIAL MEAL PLATES GRID: Breakfast, Lunch, Dinner, Snack */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>🍽️</span> Today's Pictorial Meal Bowls
          </h3>
          <span className="text-xs text-slate-400">
            Tap "+ Add to Bowl" to track whole plant foods
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mType) => {
            const items = mealsByType[mType];
            const pTotal = getMealProtein(items);
            const cTotal = getMealCalories(items);
            const label = mType.charAt(0).toUpperCase() + mType.slice(1);
            const icon = mType === 'breakfast' ? '🌅' : mType === 'lunch' ? '☀️' : mType === 'dinner' ? '🌙' : '🍎';

            return (
              <div
                key={mType}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-4 flex flex-col justify-between transition-colors shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>{icon}</span> {label}
                    </span>
                    <span className="text-xs font-black text-rose-400 tabular-nums">
                      {pTotal}g pro
                    </span>
                  </div>

                  {/* Food visual tokens inside the plate */}
                  <div className="my-3 min-h-[70px] flex flex-wrap gap-1.5 items-center">
                    {items.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic block py-4">
                        Bowl is ready for food...
                      </span>
                    ) : (
                      items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white shadow-sm"
                          title={`${it.food.name} (${Math.round(it.food.protein * (it.servings || 1))}g pro)`}
                        >
                          <span className="text-base">{it.food.pictorialEmoji || '🌱'}</span>
                          <span className="text-[11px] font-bold truncate max-w-[80px]">{it.food.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('nutrition', mType)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to {label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Vegan Essentials Checklist */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>🌱</span> Daily Vegan Vitality Essentials
            </h3>
            <p className="text-xs text-slate-400">
              Check off daily habits to ensure complete nourishment alongside high protein.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-full">
            {Object.values(record.essentials).filter(Boolean).length} of 8 Done
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: 'b12' as const, label: 'Vitamin B12 Source', icon: '✨', sub: 'Yeast or sublingual drops' },
            { key: 'vitaminD' as const, label: 'Vitamin D3 / Sun', icon: '☀️', sub: 'Lichen D3 or natural sun' },
            { key: 'calciumFoods' as const, label: 'Calcium-Set Plants', icon: '🧈', sub: 'Tofu, fortified milk, tahini' },
            { key: 'ironWithVitC' as const, label: 'Iron + Vit C Booster', icon: '🫘', sub: 'Lentils with berries/peppers' },
            { key: 'omega3Seeds' as const, label: 'Omega-3 Seeds', icon: '🫐', sub: 'Flax, chia or hemp seeds' },
            { key: 'hydrationTarget' as const, label: '2.5L+ Clean Water', icon: '💧', sub: 'Joint lubrication & focus' },
            { key: 'colorfulPlants' as const, label: 'Rainbow Veggies', icon: '🥦', sub: 'Deep greens & antioxidants' },
            { key: 'movementDone' as const, label: 'Calisthenics Practice', icon: '⚡', sub: 'Push, pull, leg or core drills' },
          ].map((item) => {
            const isChecked = record.essentials[item.key];
            return (
              <label
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-950/40 border-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleEssential(item.key)}
                  className="w-4 h-4 mt-0.5 rounded accent-emerald-500 cursor-pointer shrink-0"
                />
                <div className="min-w-0">
                  <span className={`text-xs font-bold flex items-center gap-1 ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                    <span>{item.icon}</span> {item.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">{item.sub}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
