import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  calculateBiometricNutrition,
  formatHeight,
  formatWeight,
  ACTIVITY_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
} from '../utils/biometricCalculations';
import {
  Activity,
  Flame,
  ChevronDown,
  ChevronUp,
  Sliders,
  Scale,
  Ruler,
  Dumbbell,
  Droplets,
  HeartPulse,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AthleteBiometricsCardProps {
  user: UserProfile;
  warriorLevel: number;
  totalXP: number;
  onOpenBiometricsModal: () => void;
  className?: string;
}

export const AthleteBiometricsCard: React.FC<AthleteBiometricsCardProps> = ({
  user,
  warriorLevel,
  totalXP,
  onOpenBiometricsModal,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const biometric = calculateBiometricNutrition({
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    gender: user.gender,
    age: user.age,
    activityLevel: user.activityLevel,
    fitnessGoal: user.fitnessGoal,
  });

  const activityItem =
    ACTIVITY_LEVEL_OPTIONS.find((a) => a.level === user.activityLevel) || ACTIVITY_LEVEL_OPTIONS[3];
  const goalItem =
    FITNESS_GOAL_OPTIONS.find((g) => g.goal === user.fitnessGoal) || FITNESS_GOAL_OPTIONS[0];

  const genderLabel =
    user.gender === 'female'
      ? '♀ Female'
      : user.gender === 'male'
      ? '♂ Male'
      : user.gender === 'non_binary'
      ? '⚧ Non-Binary'
      : 'Athlete';

  return (
    <section
      aria-label="Athlete Profile & Biometrics"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-cyan-900/40 shadow-2xl backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      {/* Subtle ambient sport gradient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-gradient-to-br from-cyan-500/10 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 bg-gradient-to-tr from-rose-500/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Bar: Compact & Touch-optimized for iPhone 14 Pro */}
      <div className="p-3.5 sm:p-4.5 relative z-10">
        <div className="flex items-center justify-between gap-3">
          {/* User Identity & Avatar */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-emerald-400 to-amber-400 p-[2px] shadow-lg shadow-cyan-950/60">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl select-none">
                  {user.avatar || '🌱'}
                </div>
              </div>
              <div
                title="Warrior Rank"
                className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-slate-950 border border-amber-400/80 rounded-md text-[9px] font-black text-amber-300 shadow-md"
              >
                L{warriorLevel}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm sm:text-base text-white truncate tracking-tight">
                  {user.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 shrink-0">
                  {genderLabel}
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300">
                  {goalItem.label}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                <span className="font-semibold text-slate-300">
                  {formatHeight(user.heightCm)}
                </span>
                <span>·</span>
                <span className="font-semibold text-slate-300">
                  {formatWeight(user.weightKg)}
                </span>
                <span>·</span>
                <span className={`font-black ${biometric.bmiColor}`}>
                  BMI {biometric.bmi}
                </span>
                <span className="hidden xs:inline text-slate-500">
                  ({biometric.bmiCategory})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onOpenBiometricsModal}
              title="Edit Biometrics (Height, Weight, Activity)"
              className="min-h-[42px] px-2.5 sm:px-3 py-2 rounded-2xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Modify Biometrics</span>
              <span className="sm:hidden text-[11px]">Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse biometric details' : 'Expand biometric details'}
              className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-cyan-400" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Live Quick Dynamic Target Chips (Modified automatically based on biometrics!) */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Calorie Target Chip */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Daily Kcal
              </div>
              <div className="text-xs sm:text-sm font-black text-white flex items-baseline gap-1">
                {user.goals.calories.toLocaleString()}
                <span className="text-[10px] text-amber-400 font-semibold">
                  {biometric.calorieDelta >= 0 ? `+${biometric.calorieDelta}` : biometric.calorieDelta}
                </span>
              </div>
            </div>
          </div>

          {/* Maximum Protein Target Chip */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/60 border border-rose-900/40 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1">
                Max Protein <Zap className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
              </div>
              <div className="text-xs sm:text-sm font-black text-white flex items-baseline gap-1">
                {user.goals.protein}g
                <span className="text-[10px] text-slate-400 font-normal">
                  ({biometric.proteinRatioGPerKg}g/kg)
                </span>
              </div>
            </div>
          </div>

          {/* Carbs & Energy Chip */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Clean Carbs
              </div>
              <div className="text-xs sm:text-sm font-black text-white">
                {user.goals.carbs}g
                <span className="text-[10px] text-slate-400 font-normal ml-1">
                  ({user.goals.fat}g fat)
                </span>
              </div>
            </div>
          </div>

          {/* Hydration Target Chip */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Hydration
              </div>
              <div className="text-xs sm:text-sm font-black text-white">
                {(user.goals.waterMl / 1000).toFixed(1)}L
                <span className="text-[10px] text-slate-400 font-normal ml-1">
                  ({biometric.waterRatioMlPerKg}ml/kg)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Deep Dive: Biometric Formulas & Body Composition */}
        {isExpanded && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-800/90 animate-fadeIn space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* BMR & Energy Expenditure */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Basal Metabolism (BMR)</span>
                  <span className="text-amber-400">{biometric.bmr} kcal</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Mifflin-St Jeor formula based on {user.gender || 'male'}, {user.age || 26} yrs,{' '}
                  {user.weightKg || 74} kg.
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">TDEE with Activity ({activityItem.multiplier}×)</span>
                  <span className="font-bold text-white">{biometric.tdee} kcal</span>
                </div>
              </div>

              {/* Activity Level & Training Frequency */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                  <span className="flex items-center gap-1">
                    {activityItem.icon} {activityItem.label}
                  </span>
                  <span className="text-cyan-400 font-black">{activityItem.multiplier}× Multiplier</span>
                </div>
                <p className="text-[11px] text-slate-400">{activityItem.desc}</p>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Weekly Calisthenics Days</span>
                  <span className="font-bold text-cyan-300">{user.goals.weeklyWorkoutDays} days / wk</span>
                </div>
              </div>

              {/* Muscle Protein Synthesis Protocol */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-950 border border-rose-900/40">
                <div className="flex items-center justify-between text-xs font-bold text-rose-300 mb-1">
                  <span className="flex items-center gap-1">
                    {goalItem.icon} {goalItem.label}
                  </span>
                  <span className="text-amber-300 font-black">{goalItem.proteinFocus}</span>
                </div>
                <p className="text-[11px] text-slate-400">{goalItem.desc}</p>
                <div className="mt-2 pt-2 border-t border-rose-900/30 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Surplus</span>
                  <span className="font-bold text-emerald-400">
                    {biometric.calorieDelta > 0 ? `+${biometric.calorieDelta} kcal / day` : `${biometric.calorieDelta} kcal`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-cyan-900/30 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  Modifying your Height, Weight, Gender, or Activity Level will automatically recalibrate your daily targets across the entire app.
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenBiometricsModal}
                className="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all"
              >
                Open Body Calibrator →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
