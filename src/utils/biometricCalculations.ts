import { ActivityLevel, FitnessGoal, GenderType, UserGoals, UserProfile } from '../types';

export interface BiometricResult {
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  bmr: number;
  tdee: number;
  goals: UserGoals;
  proteinRatioGPerKg: number;
  waterRatioMlPerKg: number;
  calorieDelta: number;
  macroDistributionPct: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const ACTIVITY_LEVEL_OPTIONS: {
  level: ActivityLevel;
  label: string;
  shortLabel: string;
  desc: string;
  multiplier: number;
  icon: string;
}[] = [
  {
    level: 'sedentary',
    label: 'Sedentary',
    shortLabel: 'Sedentary',
    desc: 'Desk work, little to no daily exercise',
    multiplier: 1.2,
    icon: '🪑',
  },
  {
    level: 'lightly_active',
    label: 'Lightly Active',
    shortLabel: 'Light',
    desc: 'Light training or calisthenics 1–2 days/week',
    multiplier: 1.375,
    icon: '🚶',
  },
  {
    level: 'moderately_active',
    label: 'Moderately Active',
    shortLabel: 'Moderate',
    desc: 'Consistent calisthenics/training 3–4 days/week',
    multiplier: 1.55,
    icon: '⚡',
  },
  {
    level: 'very_active',
    label: 'Very Active',
    shortLabel: 'Very Active',
    desc: 'Hard calisthenics & athletic training 5–6 days/week',
    multiplier: 1.725,
    icon: '🔥',
  },
  {
    level: 'extra_active',
    label: 'Extra Active / Elite',
    shortLabel: 'Elite',
    desc: 'High-volume calisthenics & physical vocation daily',
    multiplier: 1.9,
    icon: '🏆',
  },
];

export const FITNESS_GOAL_OPTIONS: {
  goal: FitnessGoal;
  label: string;
  desc: string;
  proteinFocus: string;
  calorieSurplusDeficit: number;
  proteinGPerKg: number;
  fatGPerKg: number;
  icon: string;
}[] = [
  {
    goal: 'lean_muscle_gain',
    label: 'Lean Muscle & Hypertrophy',
    desc: 'Maximum plant protein & clean surplus for explosive calisthenics muscle synthesis',
    proteinFocus: '2.1g / kg bodyweight',
    calorieSurplusDeficit: 275,
    proteinGPerKg: 2.1,
    fatGPerKg: 0.88,
    icon: '💪',
  },
  {
    goal: 'strength_power',
    label: 'Strength & Relative Power',
    desc: 'Optimized power-to-weight ratio for elite bodyweight calisthenics levers',
    proteinFocus: '1.95g / kg bodyweight',
    calorieSurplusDeficit: 150,
    proteinGPerKg: 1.95,
    fatGPerKg: 0.85,
    icon: '⚡',
  },
  {
    goal: 'fat_loss',
    label: 'Lean Cut & Definition',
    desc: 'Caloric deficit while maximizing plant protein to preserve lean muscle tissue',
    proteinFocus: '2.2g / kg bodyweight',
    calorieSurplusDeficit: -400,
    proteinGPerKg: 2.2,
    fatGPerKg: 0.75,
    icon: '🔥',
  },
  {
    goal: 'vitality_maintenance',
    label: 'Plant Vitality & Longevity',
    desc: 'Balanced whole-food plant nourishment for long-term health & steady energy',
    proteinFocus: '1.65g / kg bodyweight',
    calorieSurplusDeficit: 0,
    proteinGPerKg: 1.65,
    fatGPerKg: 0.85,
    icon: '🌱',
  },
];

export function formatHeight(cm?: number): string {
  if (!cm) return '175 cm';
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${cm} cm (${feet}'${inches}")`;
}

export function formatWeight(kg?: number): string {
  if (!kg) return '70 kg';
  const lbs = Math.round(kg * 2.20462);
  return `${kg} kg (${lbs} lbs)`;
}

export function calculateBiometricNutrition(params: {
  heightCm?: number;
  weightKg?: number;
  gender?: GenderType;
  age?: number;
  activityLevel?: ActivityLevel;
  fitnessGoal?: FitnessGoal;
}): BiometricResult {
  const height = params.heightCm && params.heightCm > 50 ? params.heightCm : 175;
  const weight = params.weightKg && params.weightKg > 20 ? params.weightKg : 70;
  const age = params.age && params.age > 10 ? params.age : 26;
  const gender = params.gender || 'male';
  const activity = params.activityLevel || 'very_active';
  const goal = params.fitnessGoal || 'lean_muscle_gain';

  // BMI = weight / (height/100)^2
  const heightM = height / 100;
  const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
  let bmiCategory = 'Normal / Athletic';
  let bmiColor = 'text-emerald-400';

  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-amber-400';
  } else if (bmi <= 24.9) {
    bmiCategory = 'Normal / Athletic';
    bmiColor = 'text-emerald-400';
  } else if (bmi <= 28.5) {
    bmiCategory = 'Athletic / Lean Muscle';
    bmiColor = 'text-cyan-400';
  } else {
    bmiCategory = 'High Mass';
    bmiColor = 'text-indigo-400';
  }

  // BMR: Mifflin-St Jeor Formula
  let bmrRaw = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmrRaw += 5;
  } else if (gender === 'female') {
    bmrRaw -= 161;
  } else {
    bmrRaw -= 78; // neutral midpoint
  }
  const bmr = Math.round(Math.max(1100, bmrRaw));

  // Activity Multiplier
  const activityItem = ACTIVITY_LEVEL_OPTIONS.find((a) => a.level === activity) || ACTIVITY_LEVEL_OPTIONS[3];
  const tdee = Math.round(bmr * activityItem.multiplier);

  // Goal Protocol
  const goalItem = FITNESS_GOAL_OPTIONS.find((g) => g.goal === goal) || FITNESS_GOAL_OPTIONS[0];
  const calorieDelta = goalItem.calorieSurplusDeficit;

  const targetCalories = Math.max(1400, Math.round(tdee + calorieDelta));
  // Protein: High focus on hypertrophy (round to 5g for clean sports nutrition)
  const targetProtein = Math.round((weight * goalItem.proteinGPerKg) / 5) * 5;
  const targetFat = Math.round(weight * goalItem.fatGPerKg);

  // Carbs from remaining calories (4 kcal per gram of carb & protein, 9 kcal per gram of fat)
  const proteinKcal = targetProtein * 4;
  const fatKcal = targetFat * 9;
  const carbCalories = Math.max(450, targetCalories - (proteinKcal + fatKcal));
  const targetCarbs = Math.round(carbCalories / 4);

  // Fiber target: ~14-16g per 1000 kcal for clean plant-based gut motility
  const targetFiber = Math.min(60, Math.max(32, Math.round((targetCalories / 1000) * 16)));

  // Water target: 40-45 ml per kg of bodyweight
  const waterBonus = activity === 'very_active' || activity === 'extra_active' ? 500 : 250;
  const targetWater = Math.round((weight * 38 + waterBonus) / 50) * 50;

  // Macro % distribution
  const totalMacroKcal = targetProtein * 4 + targetCarbs * 4 + targetFat * 9;
  const macroDistributionPct = {
    protein: Math.round(((targetProtein * 4) / totalMacroKcal) * 100),
    carbs: Math.round(((targetCarbs * 4) / totalMacroKcal) * 100),
    fat: Math.round(((targetFat * 9) / totalMacroKcal) * 100),
  };

  const weeklyWorkoutDays =
    activity === 'extra_active' ? 6 : activity === 'very_active' ? 5 : activity === 'moderately_active' ? 4 : 3;

  return {
    bmi,
    bmiCategory,
    bmiColor,
    bmr,
    tdee,
    goals: {
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat,
      fiber: targetFiber,
      waterMl: targetWater,
      sleepHours: 8.0,
      weeklyWorkoutDays,
    },
    proteinRatioGPerKg: goalItem.proteinGPerKg,
    waterRatioMlPerKg: Math.round((targetWater / weight) * 10) / 10,
    calorieDelta,
    macroDistributionPct,
  };
}
