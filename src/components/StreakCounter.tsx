import React, { useState } from 'react';
import { DayRecord, LoggedMeal, UserProfile } from '../types';
import { calculateDayNutrition } from '../utils/nutritionCalculations';
import { getDateOffset, getTodayDateString } from '../utils/storage';
import { Sparkles, Flame, Sprout, ChevronRight, Info, Check, Trophy } from 'lucide-react';

interface StreakCounterProps {
  records?: Record<string, DayRecord>;
  user: UserProfile;
  currentMeals?: LoggedMeal[];
  selectedDate?: string;
}

export interface PlantStageInfo {
  stage: number;
  name: string;
  emoji: string;
  minDays: number;
  description: string;
  auraColor: string;
  gradient: string;
}

export const PLANT_STAGES: PlantStageInfo[] = [
  {
    stage: 0,
    name: 'Dormant Seed',
    emoji: '🌰',
    minDays: 0,
    description: 'A nutrient-rich seed nestled in fertile organic soil, ready to awaken.',
    auraColor: 'border-amber-900/40 text-amber-500',
    gradient: 'from-amber-950/40 to-slate-950',
  },
  {
    stage: 1,
    name: 'First Sprout',
    emoji: '🌱',
    minDays: 1,
    description: 'The first green shoot emerges, powered by clean amino acids.',
    auraColor: 'border-emerald-700/60 text-emerald-400',
    gradient: 'from-emerald-950/40 to-slate-950',
  },
  {
    stage: 2,
    name: 'Rooted Seedling',
    emoji: '🌿',
    minDays: 2,
    description: 'Developing strong roots and multiple leaves for photosynthetic momentum.',
    auraColor: 'border-emerald-600/70 text-emerald-300',
    gradient: 'from-emerald-950/50 via-teal-950/30 to-slate-950',
  },
  {
    stage: 3,
    name: 'Potted Bonsai Bush',
    emoji: '🪴',
    minDays: 3,
    description: 'Firm woody stem and healthy foliage. Habit consistency is taking root.',
    auraColor: 'border-teal-500/70 text-teal-300',
    gradient: 'from-teal-950/50 via-emerald-950/40 to-slate-950',
  },
  {
    stage: 4,
    name: 'Thriving Grain Stalk',
    emoji: '🌾',
    minDays: 4,
    description: 'Plentiful protein and glycogen reserves. Full muscular repair achieved.',
    auraColor: 'border-amber-500/80 text-amber-300',
    gradient: 'from-amber-950/50 via-yellow-950/30 to-slate-950',
  },
  {
    stage: 5,
    name: 'Blooming Sunflower',
    emoji: '🌻',
    minDays: 5,
    description: 'Bright radiating blossom following the sun. Cellular vitality peak.',
    auraColor: 'border-yellow-400/80 text-yellow-300',
    gradient: 'from-yellow-950/50 via-amber-950/40 to-slate-950',
  },
  {
    stage: 6,
    name: 'Canopy Forest Tree',
    emoji: '🌳',
    minDays: 6,
    description: 'Massive trunk and broad leaves sheltering your training resilience.',
    auraColor: 'border-emerald-400 text-emerald-200',
    gradient: 'from-emerald-900/60 via-green-950/50 to-slate-950',
  },
  {
    stage: 7,
    name: 'Golden Harvest Tree',
    emoji: '🌲✨',
    minDays: 7,
    description: 'Legendary 7+ day milestone! Radiant golden foliage of true athletic mastery.',
    auraColor: 'border-amber-300 text-amber-200 shadow-amber-500/30',
    gradient: 'from-amber-900/60 via-yellow-900/40 to-emerald-950/50',
  },
];

export function getPlantStage(days: number): PlantStageInfo {
  if (days <= 0) return PLANT_STAGES[0];
  if (days === 1) return PLANT_STAGES[1];
  if (days === 2) return PLANT_STAGES[2];
  if (days === 3) return PLANT_STAGES[3];
  if (days === 4) return PLANT_STAGES[4];
  if (days === 5) return PLANT_STAGES[5];
  if (days === 6) return PLANT_STAGES[6];
  return PLANT_STAGES[7];
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  records = {},
  user,
  currentMeals = [],
  selectedDate,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const today = selectedDate || getTodayDateString();
  const proteinGoal = user.goals.protein || 120;

  // Calculate today's logged nutrition
  const todayRecord = records[today];
  const todayMeals = currentMeals.length > 0 ? currentMeals : (todayRecord?.meals || []);
  const todayNut = calculateDayNutrition(todayMeals);
  const isTodayGoalMet = todayNut.protein >= proteinGoal * 0.95; // within 95% of goal or higher

  // Calculate past consecutive streak
  // We check today, then yesterday (offset -1), then -2, etc.
  let currentStreak = 0;
  let maxStreak = 0;

  // Check if today is met
  if (isTodayGoalMet) {
    currentStreak++;
  }

  // Iterate backwards starting from yesterday
  for (let offset = 1; offset <= 60; offset++) {
    const dStr = getDateOffset(today, -offset);
    const dayRec = records[dStr];
    if (!dayRec || dayRec.meals.length === 0) {
      break;
    }
    const dayNut = calculateDayNutrition(dayRec.meals);
    if (dayNut.protein >= proteinGoal * 0.9) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Generate 7-day past history row for the growing plant timeline
  const recent7Days = Array.from({ length: 7 }, (_, i) => {
    const offset = -(6 - i);
    const dStr = getDateOffset(today, offset);
    const isCurrentDate = dStr === today;
    const dayRec = isCurrentDate && currentMeals.length > 0 ? { meals: currentMeals } : records[dStr];
    const nut = dayRec ? calculateDayNutrition(dayRec.meals) : null;
    const protein = nut ? nut.protein : 0;
    const met = protein >= proteinGoal * 0.9;

    const [y, m, d] = dStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
    const shortDate = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

    // Plant growth for this individual day's status
    const plantEmoji = met ? (i === 6 ? '🌻' : i >= 4 ? '🪴' : i >= 2 ? '🌿' : '🌱') : '🌰';

    return {
      dateStr: dStr,
      dayName,
      shortDate,
      isCurrentDate,
      protein,
      met,
      plantEmoji,
    };
  });

  const plantStage = getPlantStage(currentStreak);
  const nextStage = PLANT_STAGES[Math.min(PLANT_STAGES.length - 1, plantStage.stage + 1)];
  const daysToNext = Math.max(0, nextStage.minDays - currentStreak);

  return (
    <>
      {/* Interactive Plant Streak Counter Card */}
      <div
        onClick={() => setShowDetailModal(true)}
        className={`group relative overflow-hidden rounded-3xl border ${plantStage.auraColor} bg-gradient-to-br ${plantStage.gradient} p-4 sm:p-5 shadow-xl hover:border-emerald-400 transition-all cursor-pointer`}
      >
        {/* Glow ambient background aura */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left: Growing Plant Badge & Current Streak */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Visual Plant Avatar Bubble */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/80 border-2 border-emerald-500/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner group-hover:scale-110 transition-transform">
              <span className="filter drop-shadow-md">{plantStage.emoji}</span>

              {/* Flame streak badge */}
              <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-0.5 shadow-md">
                <Flame className="w-2.5 h-2.5 fill-slate-950" />
                <span>{currentStreak}d</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/90 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Sprout className="w-3 h-3 text-emerald-400" /> Plant Macro Streak
                </span>
                <span className="text-xs font-bold text-amber-300">
                  {currentStreak} Day{currentStreak !== 1 ? 's' : ''} Consecutive
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
                <span>{plantStage.name}</span>
                <span className="text-sm">{plantStage.emoji}</span>
              </h3>

              <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
                {isTodayGoalMet ? (
                  <span className="text-emerald-400 font-bold">
                    ✓ Today's protein target met! Your plant is flourishing.
                  </span>
                ) : (
                  <span>
                    Log {Math.max(0, Math.round((proteinGoal - todayNut.protein) * 10) / 10)}g more protein today to grow your streak!
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right: 7-Day Mini Plant Evolution Timeline */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
            {recent7Days.map((d, idx) => (
              <div
                key={d.dateStr}
                className={`flex flex-col items-center p-1.5 sm:p-2 rounded-xl transition-all ${
                  d.isCurrentDate
                    ? 'bg-slate-900 border border-emerald-500/80 shadow-md scale-105'
                    : d.met
                    ? 'bg-emerald-950/40 border border-emerald-800/50'
                    : 'bg-slate-950/60 border border-slate-800/60'
                }`}
              >
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  {d.dayName}
                </span>

                <span className="text-base sm:text-lg my-0.5 transform transition-transform group-hover:scale-110">
                  {d.met ? d.plantEmoji : '🌰'}
                </span>

                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${
                    d.met
                      ? 'bg-emerald-500 text-slate-950'
                      : d.isCurrentDate
                      ? 'bg-amber-500/80 text-slate-950 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {d.met ? '✓' : d.isCurrentDate ? '•' : '✕'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Progress Indicator bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-300">Next Evolution:</span>
            <span className="font-extrabold text-emerald-300 flex items-center gap-1">
              <span>{nextStage.emoji}</span> {nextStage.name}
            </span>
            <span className="text-[10px] text-slate-400">
              ({daysToNext > 0 ? `${daysToNext} more day${daysToNext > 1 ? 's' : ''}` : 'Max Stage Reached!'})
            </span>
          </div>

          <span className="text-[11px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Streak Lore <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Streak Lore & Plant Evolution Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-600/60 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-3xl shadow-xl">
                  {plantStage.emoji}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    Stage {plantStage.stage} of 7 Evolution
                  </span>
                  <h3 className="text-xl font-black text-white">{plantStage.name}</h3>
                  <span className="text-xs font-bold text-amber-300">
                    🔥 {currentStreak} Consecutive Day{currentStreak !== 1 ? 's' : ''} Macro Streak
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Current Stage Description */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">
                Current Plant Form
              </span>
              <p className="text-slate-200 leading-relaxed font-semibold">
                {plantStage.description}
              </p>
            </div>

            {/* All 7 Plant Growth Stages Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Plant Evolution Pathway
              </span>

              <div className="space-y-2">
                {PLANT_STAGES.map((st) => {
                  const isCurrent = st.stage === plantStage.stage;
                  const isUnlocked = currentStreak >= st.minDays;

                  return (
                    <div
                      key={st.stage}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-400 shadow-md'
                          : isUnlocked
                          ? 'bg-slate-950/70 border-slate-800 text-slate-300'
                          : 'bg-slate-950/30 border-slate-900 text-slate-600 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{st.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-white">
                              {st.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950">
                                Active Form
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {st.minDays === 0 ? 'Day 0' : `${st.minDays}+ consecutive days`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isUnlocked ? (
                          <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Reached
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold">
                            {st.minDays - currentStreak}d to unlock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Science Lore Note */}
            <div className="p-3.5 bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-950 rounded-2xl border border-rose-900/40 text-xs space-y-1">
              <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Consistency Fuels Anabolic Momentum
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Consistency is more critical than a single high-protein day. Meeting your protein target day after day maintains an active amino acid pool, elevating whole-body net muscle protein synthesis and tendon remodeling.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs hover:brightness-110 shadow-lg shadow-emerald-950/50"
              >
                Close & Keep Growing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
