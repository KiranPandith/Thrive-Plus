import { AppState, DayRecord, UserProfile } from '../types';
import { VEGAN_FOOD_DATABASE } from '../data/veganFoods';

const STORAGE_KEY = 'thrive_pulse_app_state_v2';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-athlete',
    name: 'Alex (Vegan Athlete)',
    avatar: '🌱',
    themeColor: '#10B981', // emerald
    experienceLevel: 'intermediate',
    heightCm: 178,
    weightKg: 74,
    gender: 'male',
    age: 26,
    activityLevel: 'very_active',
    fitnessGoal: 'lean_muscle_gain',
    autoSyncNutritionWithBiometrics: true,
    goals: {
      calories: 2550,
      protein: 155, // 2.1g per kg bodyweight for lean muscle hypertrophy
      carbs: 300,
      fat: 65,
      fiber: 45,
      waterMl: 3200,
      sleepHours: 8.0,
      weeklyWorkoutDays: 5,
    },
    createdAt: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'user-beginner',
    name: 'Maya (Plant Starter)',
    avatar: '🌿',
    themeColor: '#F59E0B', // citrus amber
    experienceLevel: 'beginner',
    heightCm: 165,
    weightKg: 58,
    gender: 'female',
    age: 24,
    activityLevel: 'moderately_active',
    fitnessGoal: 'vitality_maintenance',
    autoSyncNutritionWithBiometrics: true,
    goals: {
      calories: 1950,
      protein: 95,
      carbs: 240,
      fat: 52,
      fiber: 35,
      waterMl: 2400,
      sleepHours: 7.5,
      weeklyWorkoutDays: 4,
    },
    createdAt: '2026-10-05T08:00:00.000Z',
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffset(baseDate: string, daysOffset: number): string {
  const [y, m, d] = baseDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + daysOffset);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createBlankDayRecord(date: string): DayRecord {
  return {
    date,
    meals: [],
    workouts: [],
    care: {
      waterMl: 1250,
      sleepHours: 7.5,
      sleepQuality: 'restful',
      sorenessLevel: 'mild',
      energyLevel: 4,
      cycleStatus: 'no',
      cycleFlow: '',
      notes: '',
    },
    essentials: {
      b12: false,
      vitaminD: false,
      calciumFoods: false,
      ironWithVitC: false,
      omega3Seeds: false,
      hydrationTarget: false,
      colorfulPlants: false,
      movementDone: false,
    },
    reflection: {
      wins: '',
      focus: '',
    },
  };
}

// Generate rich, realistic seed records for Alex for the last 6 days + today
function generateSeedRecords(): Record<string, Record<string, DayRecord>> {
  const today = getTodayDateString();
  const records: Record<string, Record<string, DayRecord>> = {
    'user-athlete': {},
    'user-beginner': {},
  };

  const tvp = VEGAN_FOOD_DATABASE.find(f => f.id === 'tvp-textured-soy')!;
  const tofu = VEGAN_FOOD_DATABASE.find(f => f.id === 'tofu-extra-firm')!;
  const tempeh = VEGAN_FOOD_DATABASE.find(f => f.id === 'tempeh-organic')!;
  const seitan = VEGAN_FOOD_DATABASE.find(f => f.id === 'seitan-wheat-gluten')!;
  const lentils = VEGAN_FOOD_DATABASE.find(f => f.id === 'lentils-cooked')!;
  const proteinPowder = VEGAN_FOOD_DATABASE.find(f => f.id === 'pea-rice-protein')!;
  const oats = VEGAN_FOOD_DATABASE.find(f => f.id === 'rolled-oats')!;
  const hemp = VEGAN_FOOD_DATABASE.find(f => f.id === 'hemp-hearts')!;
  const soyMilk = VEGAN_FOOD_DATABASE.find(f => f.id === 'soy-milk-fortified')!;
  const broccoli = VEGAN_FOOD_DATABASE.find(f => f.id === 'steamed-broccoli')!;
  const nooch = VEGAN_FOOD_DATABASE.find(f => f.id === 'nooch-fortified')!;
  const berries = VEGAN_FOOD_DATABASE.find(f => f.id === 'strawberries-blueberries')!;

  // Past 6 days + today for Alex
  for (let i = 6; i >= 0; i--) {
    const dStr = getDateOffset(today, -i);
    const day = createBlankDayRecord(dStr);

    // Varied daily data
    if (i === 0) {
      // Today: 2 meals logged already, ready to add more
      day.meals = [
        {
          id: `m-today-1`,
          mealType: 'breakfast',
          food: oats,
          servings: 1.5,
          loggedAt: '08:30 AM',
        },
        {
          id: `m-today-2`,
          mealType: 'breakfast',
          food: soyMilk,
          servings: 1.5,
          loggedAt: '08:32 AM',
        },
        {
          id: `m-today-3`,
          mealType: 'breakfast',
          food: hemp,
          servings: 1.0,
          loggedAt: '08:35 AM',
        },
        {
          id: `m-today-4`,
          mealType: 'lunch',
          food: tvp,
          servings: 1.5, // 39g protein!
          loggedAt: '01:15 PM',
        },
        {
          id: `m-today-5`,
          mealType: 'lunch',
          food: broccoli,
          servings: 1.5,
          loggedAt: '01:20 PM',
        },
        {
          id: `m-today-6`,
          mealType: 'lunch',
          food: nooch,
          servings: 1.0,
          loggedAt: '01:22 PM',
        },
      ];
      day.workouts = [
        {
          exerciseId: 'push-standard',
          branch: 'push',
          tier: 2,
          sets: [
            { setNum: 1, repsOrSec: 15, completed: true },
            { setNum: 2, repsOrSec: 15, completed: true },
            { setNum: 3, repsOrSec: 14, completed: true },
          ],
          completedAt: '11:30 AM',
        },
      ];
      day.care = {
        waterMl: 2250,
        sleepHours: 8.25,
        sleepQuality: 'restful',
        sorenessLevel: 'mild',
        energyLevel: 5,
        cycleStatus: 'no',
        notes: 'Feeling explosive on push-ups today. TVP lunch hit 39g protein easily!',
      };
      day.essentials = {
        b12: true,
        vitaminD: true,
        calciumFoods: true,
        ironWithVitC: true,
        omega3Seeds: true,
        hydrationTarget: true,
        colorfulPlants: true,
        movementDone: true,
      };
    } else {
      // Past days
      const mult = 1 + (i % 3) * 0.1;
      day.meals = [
        {
          id: `m-${i}-1`,
          mealType: 'breakfast',
          food: proteinPowder,
          servings: 1.0,
          loggedAt: '08:00 AM',
        },
        {
          id: `m-${i}-2`,
          mealType: 'breakfast',
          food: oats,
          servings: 1.0,
          loggedAt: '08:15 AM',
        },
        {
          id: `m-${i}-3`,
          mealType: 'breakfast',
          food: berries,
          servings: 1.0,
          loggedAt: '08:16 AM',
        },
        {
          id: `m-${i}-4`,
          mealType: 'lunch',
          food: i % 2 === 0 ? seitan : tempeh,
          servings: 1.25,
          loggedAt: '01:00 PM',
        },
        {
          id: `m-${i}-5`,
          mealType: 'dinner',
          food: lentils,
          servings: 1.5,
          loggedAt: '07:30 PM',
        },
        {
          id: `m-${i}-6`,
          mealType: 'dinner',
          food: tofu,
          servings: 1.5,
          loggedAt: '07:45 PM',
        },
      ];
      if (i % 2 === 0) {
        day.workouts = [
          {
            exerciseId: 'pull-australian-rows',
            branch: 'pull',
            tier: 2,
            sets: [
              { setNum: 1, repsOrSec: 12, completed: true },
              { setNum: 2, repsOrSec: 12, completed: true },
              { setNum: 3, repsOrSec: 11, completed: true },
            ],
            completedAt: '05:30 PM',
          },
          {
            exerciseId: 'core-hollow-body',
            branch: 'core',
            tier: 2,
            sets: [
              { setNum: 1, repsOrSec: 35, completed: true },
              { setNum: 2, repsOrSec: 30, completed: true },
            ],
            completedAt: '05:50 PM',
          },
        ];
      }
      day.care = {
        waterMl: Math.round(2800 * mult),
        sleepHours: 7.5 + (i % 2) * 0.5,
        sleepQuality: 'restful',
        sorenessLevel: i % 2 === 0 ? 'moderate' : 'none',
        energyLevel: 4,
        notes: 'Good muscle fullness and sustained focus.',
      };
      day.essentials = {
        b12: true,
        vitaminD: true,
        calciumFoods: true,
        ironWithVitC: true,
        omega3Seeds: true,
        hydrationTarget: true,
        colorfulPlants: true,
        movementDone: i % 2 === 0,
      };
    }
    records['user-athlete'][dStr] = day;
  }

  return records;
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
        // Ensure every user has biometric fields for dynamic calculations
        const enrichedUsers = parsed.users.map((u: UserProfile) => ({
          ...u,
          heightCm: u.heightCm ?? (u.id === 'user-beginner' ? 165 : 178),
          weightKg: u.weightKg ?? (u.id === 'user-beginner' ? 58 : 74),
          gender: u.gender ?? (u.id === 'user-beginner' ? 'female' : 'male'),
          age: u.age ?? (u.id === 'user-beginner' ? 24 : 26),
          activityLevel: u.activityLevel ?? (u.id === 'user-beginner' ? 'moderately_active' : 'very_active'),
          fitnessGoal: u.fitnessGoal ?? (u.id === 'user-beginner' ? 'vitality_maintenance' : 'lean_muscle_gain'),
          autoSyncNutritionWithBiometrics: u.autoSyncNutritionWithBiometrics ?? true,
        }));
        return {
          ...parsed,
          users: enrichedUsers,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load local app state:', err);
  }

  // Initial state if nothing saved
  const initialState: AppState = {
    users: DEFAULT_USERS,
    activeUserId: 'user-athlete',
    records: generateSeedRecords(),
    personalRecords: {
      'user-athlete': {
        'push-standard': 22,
        'pull-australian-rows': 15,
        'core-hollow-body': 45,
        'legs-air-squats': 35,
      },
      'user-beginner': {
        'push-wall': 18,
        'pull-doorway-rows': 14,
        'legs-chair-squat': 15,
      },
    },
  };

  saveAppState(initialState);
  return initialState;
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function exportBackupJson(state: AppState): void {
  const payload = {
    app: 'Thrive Pulse — Vegan Nutrition & Calisthenics Tracker',
    version: 2,
    exportedAt: new Date().toISOString(),
    data: state,
  };
  const str = JSON.stringify(payload, null, 2);
  const blob = new Blob([str], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `thrive-pulse-backup-${getTodayDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function parseBackupFile(file: File): Promise<AppState> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const data = parsed.data || parsed;
  if (!data || !Array.isArray(data.users) || !data.records) {
    throw new Error('Invalid Thrive Pulse backup format. Missing user or record collections.');
  }
  return data as AppState;
}
