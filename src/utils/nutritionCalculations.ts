import { DayRecord, FoodItem, LoggedMeal, VeganMicros } from '../types';
import { VEGAN_MICRONUTRIENT_STANDARDS } from '../data/veganFoods';

export interface DayNutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  leucineG: number;
  micros: VeganMicros;
  proteinRatioPct: number; // % of total kcal from protein
  mpsTriggerCount: number; // Meals with >= 2.5g leucine or >= 25g protein
  ironVitCSynergy: boolean;
  microScores: Record<keyof VeganMicros, { current: number; target: number; pct: number }>;
  overallMicronutrientScore: number; // 0 - 100%
}

export function calculateMealMacros(food: FoodItem, servings: number) {
  return {
    calories: Math.round(food.calories * servings),
    protein: Math.round(food.protein * servings * 10) / 10,
    carbs: Math.round(food.carbs * servings * 10) / 10,
    fat: Math.round(food.fat * servings * 10) / 10,
    fiber: Math.round(food.fiber * servings * 10) / 10,
    leucine: Math.round((food.leucineEstimateG || food.protein * 0.08) * servings * 10) / 10,
  };
}

export function calculateDayNutrition(meals: LoggedMeal[]): DayNutritionSummary {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fiber = 0;
  let leucineG = 0;

  const micros: VeganMicros = {
    b12_mcg: 0,
    iron_mg: 0,
    calcium_mg: 0,
    zinc_mg: 0,
    vitamin_d_iu: 0,
    omega3_g: 0,
    iodine_mcg: 0,
    magnesium_mg: 0,
    vitamin_c_mg: 0,
  };

  // Track per-meal leucine & protein for MPS (Muscle Protein Synthesis) pulse
  const mealsByPeriod: Record<string, { protein: number; leucine: number; hasIron: boolean; hasVitC: boolean }> = {
    breakfast: { protein: 0, leucine: 0, hasIron: false, hasVitC: false },
    lunch: { protein: 0, leucine: 0, hasIron: false, hasVitC: false },
    dinner: { protein: 0, leucine: 0, hasIron: false, hasVitC: false },
    snack: { protein: 0, leucine: 0, hasIron: false, hasVitC: false },
  };

  meals.forEach((m) => {
    const s = m.servings || 1;
    calories += m.food.calories * s;
    protein += m.food.protein * s;
    carbs += m.food.carbs * s;
    fat += m.food.fat * s;
    fiber += m.food.fiber * s;

    const foodLeucine = m.food.leucineEstimateG || m.food.protein * 0.08;
    leucineG += foodLeucine * s;

    if (mealsByPeriod[m.mealType]) {
      mealsByPeriod[m.mealType].protein += m.food.protein * s;
      mealsByPeriod[m.mealType].leucine += foodLeucine * s;
      if (m.food.micros.iron_mg * s >= 2.0) mealsByPeriod[m.mealType].hasIron = true;
      if (m.food.micros.vitamin_c_mg * s >= 15.0) mealsByPeriod[m.mealType].hasVitC = true;
    }

    if (m.food.micros) {
      micros.b12_mcg += (m.food.micros.b12_mcg || 0) * s;
      micros.iron_mg += (m.food.micros.iron_mg || 0) * s;
      micros.calcium_mg += (m.food.micros.calcium_mg || 0) * s;
      micros.zinc_mg += (m.food.micros.zinc_mg || 0) * s;
      micros.vitamin_d_iu += (m.food.micros.vitamin_d_iu || 0) * s;
      micros.omega3_g += (m.food.micros.omega3_g || 0) * s;
      micros.iodine_mcg += (m.food.micros.iodine_mcg || 0) * s;
      micros.magnesium_mg += (m.food.micros.magnesium_mg || 0) * s;
      micros.vitamin_c_mg += (m.food.micros.vitamin_c_mg || 0) * s;
    }
  });

  // Calculate MPS triggers (meals hitting >= 25g protein or >= 2.3g leucine)
  let mpsTriggerCount = 0;
  let ironVitCSynergy = false;

  Object.values(mealsByPeriod).forEach((p) => {
    if (p.protein >= 25 || p.leucine >= 2.3) {
      mpsTriggerCount++;
    }
    if (p.hasIron && p.hasVitC) {
      ironVitCSynergy = true;
    }
  });

  const proteinKcal = protein * 4;
  const proteinRatioPct = calories > 0 ? Math.round((proteinKcal / calories) * 100) : 0;

  // Micronutrient percentages against scientific plant-based standards
  const microScores: Record<keyof VeganMicros, { current: number; target: number; pct: number }> = {
    b12_mcg: {
      current: Math.round(micros.b12_mcg * 10) / 10,
      target: VEGAN_MICRONUTRIENT_STANDARDS.b12_mcg.target,
      pct: Math.min(100, Math.round((micros.b12_mcg / VEGAN_MICRONUTRIENT_STANDARDS.b12_mcg.target) * 100)),
    },
    iron_mg: {
      current: Math.round(micros.iron_mg * 10) / 10,
      target: VEGAN_MICRONUTRIENT_STANDARDS.iron_mg.target,
      pct: Math.min(100, Math.round((micros.iron_mg / VEGAN_MICRONUTRIENT_STANDARDS.iron_mg.target) * 100)),
    },
    vitamin_c_mg: {
      current: Math.round(micros.vitamin_c_mg * 10) / 10,
      target: VEGAN_MICRONUTRIENT_STANDARDS.vitamin_c_mg.target,
      pct: Math.min(100, Math.round((micros.vitamin_c_mg / VEGAN_MICRONUTRIENT_STANDARDS.vitamin_c_mg.target) * 100)),
    },
    calcium_mg: {
      current: Math.round(micros.calcium_mg),
      target: VEGAN_MICRONUTRIENT_STANDARDS.calcium_mg.target,
      pct: Math.min(100, Math.round((micros.calcium_mg / VEGAN_MICRONUTRIENT_STANDARDS.calcium_mg.target) * 100)),
    },
    zinc_mg: {
      current: Math.round(micros.zinc_mg * 10) / 10,
      target: VEGAN_MICRONUTRIENT_STANDARDS.zinc_mg.target,
      pct: Math.min(100, Math.round((micros.zinc_mg / VEGAN_MICRONUTRIENT_STANDARDS.zinc_mg.target) * 100)),
    },
    vitamin_d_iu: {
      current: Math.round(micros.vitamin_d_iu),
      target: VEGAN_MICRONUTRIENT_STANDARDS.vitamin_d_iu.target,
      pct: Math.min(100, Math.round((micros.vitamin_d_iu / VEGAN_MICRONUTRIENT_STANDARDS.vitamin_d_iu.target) * 100)),
    },
    omega3_g: {
      current: Math.round(micros.omega3_g * 10) / 10,
      target: VEGAN_MICRONUTRIENT_STANDARDS.omega3_g.target,
      pct: Math.min(100, Math.round((micros.omega3_g / VEGAN_MICRONUTRIENT_STANDARDS.omega3_g.target) * 100)),
    },
    iodine_mcg: {
      current: Math.round(micros.iodine_mcg),
      target: VEGAN_MICRONUTRIENT_STANDARDS.iodine_mcg.target,
      pct: Math.min(100, Math.round((micros.iodine_mcg / VEGAN_MICRONUTRIENT_STANDARDS.iodine_mcg.target) * 100)),
    },
    magnesium_mg: {
      current: Math.round(micros.magnesium_mg),
      target: VEGAN_MICRONUTRIENT_STANDARDS.magnesium_mg.target,
      pct: Math.min(100, Math.round((micros.magnesium_mg / VEGAN_MICRONUTRIENT_STANDARDS.magnesium_mg.target) * 100)),
    },
  };

  // Average coverage score
  const pcts = Object.values(microScores).map((m) => m.pct);
  const overallMicronutrientScore = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);

  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    fiber: Math.round(fiber * 10) / 10,
    leucineG: Math.round(leucineG * 10) / 10,
    micros,
    proteinRatioPct,
    mpsTriggerCount,
    ironVitCSynergy,
    microScores,
    overallMicronutrientScore,
  };
}

export function calculateWorkoutStats(record: DayRecord) {
  let totalSets = 0;
  let totalReps = 0;
  let totalHoldSec = 0;

  record.workouts.forEach((w) => {
    w.sets.forEach((s) => {
      if (s.completed) {
        totalSets++;
        if (w.branch === 'core' && s.repsOrSec > 20) {
          totalHoldSec += s.repsOrSec;
        } else {
          totalReps += s.repsOrSec;
        }
      }
    });
  });

  return {
    totalExercises: record.workouts.length,
    totalSets,
    totalReps,
    totalHoldSec,
  };
}
