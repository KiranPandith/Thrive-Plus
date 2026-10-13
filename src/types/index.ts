export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface VeganMicros {
  b12_mcg: number;
  iron_mg: number;
  calcium_mg: number;
  zinc_mg: number;
  vitamin_d_iu: number;
  omega3_g: number;
  iodine_mcg: number;
  magnesium_mg: number;
  vitamin_c_mg: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'legumes' | 'tofu_soy' | 'grains' | 'nuts_seeds' | 'vegetables' | 'fruits' | 'shakes_supplements';
  servingSize: string;
  servingWeightGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  micros: VeganMicros;
  ironType?: 'non-heme';
  leucineEstimateG?: number;
  pictorialEmoji?: string;
  plateColor?: string;
  foodGroup?: 'protein' | 'greens' | 'grains' | 'seeds_fats' | 'antioxidants';
}

export interface LoggedMeal {
  id: string;
  mealType: MealType;
  food: FoodItem;
  servings: number;
  loggedAt: string;
}

export type CalisthenicsBranch = 'push' | 'pull' | 'legs' | 'core';

export interface CalisthenicsExercise {
  id: string;
  branch: CalisthenicsBranch;
  tier: 1 | 2 | 3 | 4; // 1: Beginner, 2: Foundation, 3: Intermediate, 4: Advanced
  name: string;
  subtitle: string;
  targetMuscles: string[];
  formCues: string[];
  progressionGoal: string;
  metricType: 'reps' | 'hold_sec';
  recommendedSets: number;
  recommendedTarget: number;
  prCriteria: number;
  postWorkoutFuelTip: string;
  prerequisiteId?: string; // Node parent in the mind-tree
  xpReward: number;
  pictorialIcon: string;
  mindTreeCoords: { x: number; y: number }; // Relative position on the constellation grid
}

export interface LoggedWorkoutSet {
  setNum: number;
  repsOrSec: number;
  completed: boolean;
}

export interface LoggedWorkoutExercise {
  exerciseId: string;
  branch: CalisthenicsBranch;
  tier: number;
  sets: LoggedWorkoutSet[];
  notes?: string;
  completedAt: string;
}

export interface DailyCare {
  waterMl: number;
  sleepHours: number | null;
  sleepQuality: 'restful' | 'okay' | 'restless' | 'poor' | '';
  sorenessLevel: 'none' | 'mild' | 'moderate' | 'high';
  energyLevel: 1 | 2 | 3 | 4 | 5;
  cycleStatus?: string;
  cycleFlow?: string;
  notes: string;
}

export interface EssentialsChecklist {
  b12: boolean;
  vitaminD: boolean;
  calciumFoods: boolean;
  ironWithVitC: boolean;
  omega3Seeds: boolean;
  hydrationTarget: boolean;
  colorfulPlants: boolean;
  movementDone: boolean;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  meals: LoggedMeal[];
  workouts: LoggedWorkoutExercise[];
  care: DailyCare;
  essentials: EssentialsChecklist;
  reflection?: {
    wins: string;
    focus: string;
  };
}

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  waterMl: number;
  sleepHours: number;
  weeklyWorkoutDays: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  themeColor: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: UserGoals;
  createdAt: string;
}

export interface AppState {
  users: UserProfile[];
  activeUserId: string;
  records: Record<string, Record<string, DayRecord>>; // [userId][date] -> DayRecord
  personalRecords: Record<string, Record<string, number>>; // [userId][exerciseId] -> best reps/hold
}
