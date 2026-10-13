import React from 'react';
import { DayRecord, UserProfile } from '../types';
import { calculateDayNutrition, calculateWorkoutStats } from '../utils/nutritionCalculations';
import { ASSET_IMAGES } from '../assets/images';
import { Flame, Dumbbell, Shield, Droplets, CheckCircle, Trophy, ArrowRight, Sparkles } from 'lucide-react';

interface DailyQuestHubProps {
  record: DayRecord;
  user: UserProfile;
  selectedDate: string;
  onNavigateLayout: (mode: 'mindtree_arena' | 'bowl_studio' | 'quest_hub') => void;
  onToggleEssential: (key: keyof DayRecord['essentials']) => void;
}

export const DailyQuestHub: React.FC<DailyQuestHubProps> = ({
  record,
  user,
  selectedDate,
  onNavigateLayout,
  onToggleEssential,
}) => {
  const nutrition = calculateDayNutrition(record.meals);
  const workoutStats = calculateWorkoutStats(record);

  const proteinGoal = user.goals.protein || 120;
  const isProteinQuestComplete = nutrition.protein >= proteinGoal;
  const isWorkoutQuestComplete = workoutStats.totalSets >= 6;
  const isHydrationQuestComplete = (record.care?.waterMl || 0) >= (user.goals.waterMl || 2500);
  const isMicroQuestComplete = nutrition.overallMicronutrientScore >= 70;

  const quests = [
    {
      id: 'protein-quest',
      title: 'High-Protein Hypertrophy Trial',
      desc: `Log at least ${proteinGoal}g plant protein to activate full muscle repair.`,
      current: `${nutrition.protein}g / ${proteinGoal}g`,
      pct: Math.min(100, Math.round((nutrition.protein / proteinGoal) * 100)),
      completed: isProteinQuestComplete,
      xp: 300,
      icon: '🔥',
      color: 'from-rose-500 to-amber-500',
      actionLabel: 'Toss Food in Bowl',
      onAction: () => onNavigateLayout('bowl_studio'),
    },
    {
      id: 'workout-quest',
      title: 'Calisthenics Mind-Tree Challenge',
      desc: 'Complete at least 6 heavy progressive bodyweight sets.',
      current: `${workoutStats.totalSets} sets / 6 target`,
      pct: Math.min(100, Math.round((workoutStats.totalSets / 6) * 100)),
      completed: isWorkoutQuestComplete,
      xp: 350,
      icon: '⚡',
      color: 'from-cyan-500 to-blue-600',
      actionLabel: 'Train Skills in Arena',
      onAction: () => onNavigateLayout('mindtree_arena'),
    },
    {
      id: 'micro-quest',
      title: 'Rainbow Micronutrient Shield',
      desc: 'Hit essential B12, Iron + Vitamin C booster, and Calcium requirements.',
      current: `${nutrition.overallMicronutrientScore}% covered`,
      pct: nutrition.overallMicronutrientScore,
      completed: isMicroQuestComplete,
      xp: 200,
      icon: '🛡️',
      color: 'from-emerald-500 to-teal-500',
      actionLabel: 'Inspect Micronutrients',
      onAction: () => onNavigateLayout('bowl_studio'),
    },
    {
      id: 'water-quest',
      title: 'Hydration & Joint Lubrication',
      desc: 'Drink at least 2500ml clean water for tendon recovery.',
      current: `${record.care?.waterMl || 0}ml / ${user.goals.waterMl || 2500}ml`,
      pct: Math.min(100, Math.round(((record.care?.waterMl || 0) / (user.goals.waterMl || 2500)) * 100)),
      completed: isHydrationQuestComplete,
      xp: 150,
      icon: '💧',
      color: 'from-blue-500 to-cyan-400',
      actionLabel: 'Log Water',
      onAction: () => onNavigateLayout('bowl_studio'),
    },
  ];

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Visual Adventure Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-900/60 shadow-2xl bg-slate-900 group">
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity">
          <img
            src={ASSET_IMAGES.homeGym || ASSET_IMAGES.mindTreeArt}
            alt="Daily Quest Adventure"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent z-10" />

        <div className="relative z-20 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Daily Warrior Questline
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {completedCount === 4
                ? '🏆 All Quests Complete! Peak Recovery Reached'
                : `${completedCount} of 4 Daily Quests Accomplished`}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every day is an adventure in physical mastery and high-protein plant vitality. Complete your daily challenges to earn XP and level up your athlete status!
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigateLayout('mindtree_arena')}
              className="px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950/60 transition-all"
            >
              <Dumbbell className="w-4 h-4" /> Open Mind-Tree
            </button>
            <button
              onClick={() => onNavigateLayout('bowl_studio')}
              className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/60 transition-all"
            >
              <span>🥣</span> Open Bowl Studio
            </button>
          </div>
        </div>
      </div>

      {/* Quests Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quests.map((q) => (
          <div
            key={q.id}
            className={`p-5 rounded-3xl border transition-all shadow-xl flex flex-col justify-between ${
              q.completed
                ? 'bg-slate-900/90 border-emerald-500/80 shadow-emerald-950/20'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {q.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">{q.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{q.desc}</p>
                  </div>
                </div>

                <span className="text-xs font-black text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-1 rounded-xl shrink-0">
                  +{q.xp} XP
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-300">{q.current}</span>
                  <span className={q.completed ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}>
                    {q.pct}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${q.color} transition-all duration-700`}
                    style={{ width: `${q.pct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
              {q.completed ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Quest Completed
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-medium">In Progress...</span>
              )}

              <button
                onClick={q.onAction}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
              >
                {q.actionLabel} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pictorial Food Showcase of Today */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>🥣</span> What You Ate Today In Pictures
          </h3>
          <button
            onClick={() => onNavigateLayout('bowl_studio')}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            Add More to Bowl <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {record.meals.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No whole-foods in your bowl yet today. Tap "Open Bowl Studio" to toss delicious plant proteins in!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {record.meals.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center shadow-md hover:scale-105 transition-transform"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border mb-2"
                  style={{
                    backgroundColor: `${item.food.plateColor || '#10B981'}25`,
                    borderColor: `${item.food.plateColor || '#10B981'}60`,
                  }}
                >
                  {item.food.pictorialEmoji || '🌱'}
                </div>
                <span className="text-xs font-extrabold text-white truncate w-full">{item.food.name}</span>
                <span className="text-[10px] font-bold text-rose-400 mt-0.5">
                  +{Math.round(item.food.protein * (item.servings || 1))}g protein
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider">{item.mealType}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
