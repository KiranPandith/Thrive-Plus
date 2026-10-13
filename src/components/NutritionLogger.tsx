import React, { useState } from 'react';
import { DayRecord, FoodItem, LoggedMeal, MealType, UserProfile } from '../types';
import { VEGAN_FOOD_DATABASE, VEGAN_MICRONUTRIENT_STANDARDS } from '../data/veganFoods';
import { ASSET_IMAGES } from '../assets/images';
import { calculateDayNutrition } from '../utils/nutritionCalculations';
import { StreakCounter } from './StreakCounter';
import {
  Search,
  Plus,
  Flame,
  Sparkles,
  ChevronDown,
  Droplets,
  Zap,
} from 'lucide-react';

interface NutritionLoggerProps {
  meals: LoggedMeal[];
  user: UserProfile;
  initialMealType?: MealType;
  records?: Record<string, DayRecord>;
  selectedDate?: string;
  onAddMeal: (meal: Omit<LoggedMeal, 'id' | 'loggedAt'>) => void;
  onRemoveMeal: (mealId: string) => void;
  onUpdateMealServing?: (mealId: string, delta: number) => void;
}

export const NutritionLogger: React.FC<NutritionLoggerProps> = ({
  meals,
  user,
  initialMealType = 'breakfast',
  records = {},
  selectedDate,
  onAddMeal,
  onRemoveMeal,
  onUpdateMealServing,
}) => {
  const [selectedMealType, setSelectedMealType] = useState<MealType>(initialMealType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState<number>(1);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [expandedMicro, setExpandedMicro] = useState<string | null>(null);

  // Custom food state
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🥗');
  const [customServing, setCustomServing] = useState('1 bowl (200g)');
  const [customCalories, setCustomCalories] = useState(220);
  const [customProtein, setCustomProtein] = useState(22);
  const [customCarbs, setCustomCarbs] = useState(18);
  const [customFat, setCustomFat] = useState(5);
  const [customFiber, setCustomFiber] = useState(6);

  const nutrition = calculateDayNutrition(meals);
  const proteinGoal = user.goals.protein || 120;
  const carbsGoal = user.goals.carbs || 260;
  const fatGoal = user.goals.fat || 60;
  const calorieGoal = user.goals.calories || 2400;

  const proteinPct = Math.min(100, Math.round((nutrition.protein / proteinGoal) * 100));
  const carbsPct = Math.min(100, Math.round((nutrition.carbs / carbsGoal) * 100));
  const fatPct = Math.min(100, Math.round((nutrition.fat / fatGoal) * 100));
  const caloriePct = Math.min(100, Math.round((nutrition.calories / calorieGoal) * 100));

  // Circular ring SVG constants: Radius 42 -> Circumference = 263.89
  const RING_RADIUS = 42;
  const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ~263.89

  const getRingOffset = (pct: number) => {
    const clamped = Math.min(100, Math.max(0, pct));
    return CIRCUMFERENCE - (CIRCUMFERENCE * clamped) / 100;
  };

  // Filter food database
  const filteredFoods = VEGAN_FOOD_DATABASE.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'high_protein') return f.protein >= 10;
    return f.category === selectedCategory;
  });

  const handleAddSelected = () => {
    if (!selectedFood) return;
    onAddMeal({
      mealType: selectedMealType,
      food: selectedFood,
      servings: Number(servings) || 1,
    });
    setSelectedFood(null);
    setServings(1);
  };

  const handleQuickAdd = (food: FoodItem, serv: number = 1) => {
    onAddMeal({
      mealType: selectedMealType,
      food,
      servings: serv,
    });
  };

  const handleSaveCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: 'shakes_supplements',
      servingSize: customServing.trim(),
      servingWeightGrams: 100,
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      fiber: Number(customFiber) || 0,
      micros: {
        b12_mcg: 0,
        iron_mg: 2.5,
        calcium_mg: 80,
        zinc_mg: 1.5,
        vitamin_d_iu: 0,
        omega3_g: 0.2,
        iodine_mcg: 0,
        magnesium_mg: 40,
        vitamin_c_mg: 5,
      },
      leucineEstimateG: (Number(customProtein) || 0) * 0.08,
      pictorialEmoji: customEmoji,
      plateColor: '#E11D48',
      foodGroup: 'protein',
    };
    onAddMeal({
      mealType: selectedMealType,
      food: newFood,
      servings: 1,
    });
    setShowCustomModal(false);
    setCustomName('');
  };

  const currentMealItems = meals.filter((m) => m.mealType === selectedMealType);
  const currentMealProtein = Math.round(
    currentMealItems.reduce((acc, it) => acc + it.food.protein * (it.servings || 1), 0) * 10
  ) / 10;
  const currentMealCalories = Math.round(
    currentMealItems.reduce((acc, it) => acc + it.food.calories * (it.servings || 1), 0)
  );

  // Calculate plate distribution
  const groupCounts = {
    protein: currentMealItems.filter((i) => i.food.foodGroup === 'protein').length,
    greens: currentMealItems.filter((i) => i.food.foodGroup === 'greens').length,
    grains: currentMealItems.filter((i) => i.food.foodGroup === 'grains').length,
    seeds_fats: currentMealItems.filter((i) => i.food.foodGroup === 'seeds_fats').length,
    antioxidants: currentMealItems.filter((i) => i.food.foodGroup === 'antioxidants').length,
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-20">
      {/* 1. VISUAL PLANT STREAK COUNTER COMPONENT */}
      <StreakCounter
        records={records}
        user={user}
        currentMeals={meals}
        selectedDate={selectedDate}
      />

      {/* 2. PICTORIAL VISUAL HERO BANNER: THE VEGAN POWER BOWL */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-900/60 shadow-2xl bg-slate-900 group">
        <div className="absolute inset-0 z-0 opacity-30 sm:opacity-40 mix-blend-luminosity">
          <img
            src={ASSET_IMAGES.powerBowl}
            alt="Vegan High Protein Bowl"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40 z-10" />

        <div className="relative z-20 p-4 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5">
          <div className="space-y-1.5 sm:space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Flame className="w-3 h-3 fill-rose-500 text-rose-500" /> Power Bowl Studio
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                {nutrition.protein}g Protein Eaten Today
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Build Your High-Protein Vegan Feast
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track in real food pictures! Watch your bowl fill with golden crispy tofu, marinated tempeh, hearty edamame, and antioxidant berries.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-bold pt-0.5">
              <span className="text-rose-400">🔥 Goal: {proteinGoal}g pro</span>
              <span className="text-amber-400">⚡ Goal: {calorieGoal} kcal</span>
              <span className="text-emerald-400">🥗 {meals.length} items logged</span>
            </div>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="w-full sm:w-auto shrink-0 min-h-[44px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-black flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-rose-950/50 transition-all"
          >
            <Plus className="w-4 h-4" /> Custom Recipe Dish
          </button>
        </div>
      </div>

      {/* 3. VISUAL ANIMATED CIRCULAR PROGRESS RINGS: OPTIMIZED 2x2 FOR IPHONE 14 PRO */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" /> Animated Daily Macro & Energy Rings
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Live visual circular meters that animate as you hit your daily plant-based muscle goals.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pt-1 sm:pt-0">
            <span className="text-amber-400 tabular-nums">{nutrition.calories} / {calorieGoal} kcal</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">{caloriePct}% Energy Goal</span>
          </div>
        </div>

        {/* Global SVG Gradients for rings */}
        <svg className="w-0 h-0 absolute pointer-events-none">
          <defs>
            <linearGradient id="ringProteinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
            <linearGradient id="ringCarbsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>
            <linearGradient id="ringFatsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="ringCaloriesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
        </svg>

        {/* 2x2 on Mobile (iPhone 14 Pro), 4-col on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* 1. PROTEIN CIRCULAR RING (CORAL / ROSE) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-rose-950/30 border border-rose-900/50 hover:border-rose-500/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center text-center transition-all shadow-xl group">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1 mb-1.5">
              <Flame className="w-3 h-3 fill-rose-500 text-rose-500" /> Protein Ring
            </span>

            {/* Circular Progress Ring */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center my-0.5">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  stroke="#1E293B"
                  strokeWidth="7"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  stroke="url(#ringProteinGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    strokeDasharray: CIRCUMFERENCE,
                    strokeDashoffset: getRingOffset(proteinPct),
                    transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.6))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg sm:text-2xl font-black text-white tabular-nums tracking-tight">{proteinPct}%</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-rose-300 uppercase tracking-widest">Protein</span>
              </div>
            </div>

            <div className="mt-2 space-y-0.5">
              <div className="text-xs sm:text-base font-black text-white tabular-nums">
                {nutrition.protein}g <span className="text-[10px] sm:text-xs font-bold text-rose-300">/ {proteinGoal}g</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                {nutrition.protein >= proteinGoal ? (
                  <span className="text-emerald-400 font-bold">Goal Smashed! 🔥</span>
                ) : (
                  <span>{Math.max(0, Math.round((proteinGoal - nutrition.protein) * 10) / 10)}g to goal</span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold block pt-0.5">
                ⚡ {nutrition.leucineG}g Leucine
              </span>
            </div>
          </div>

          {/* 2. CARBS CIRCULAR RING (CITRUS AMBER) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-amber-950/30 border border-amber-900/50 hover:border-amber-500/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center text-center transition-all shadow-xl group">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1.5">
              <Zap className="w-3 h-3 text-amber-400" /> Carbs Ring
            </span>

            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center my-0.5">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  stroke="#1E293B"
                  strokeWidth="7"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  stroke="url(#ringCarbsGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    strokeDasharray: CIRCUMFERENCE,
                    strokeDashoffset: getRingOffset(carbsPct),
                    transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg sm:text-2xl font-black text-white tabular-nums tracking-tight">{carbsPct}%</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 uppercase tracking-widest">Carbs</span>
              </div>
            </div>

            <div className="mt-2 space-y-0.5">
              <div className="text-xs sm:text-base font-black text-white tabular-nums">
                {nutrition.carbs}g <span className="text-[10px] sm:text-xs font-bold text-amber-300">/ {carbsGoal}g</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                {nutrition.carbs >= carbsGoal ? (
                  <span className="text-emerald-400 font-bold">Glycogen Full! ⚡</span>
                ) : (
                  <span>{Math.max(0, Math.round((carbsGoal - nutrition.carbs) * 10) / 10)}g to goal</span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block pt-0.5">
                🌾 {nutrition.fiber}g Fiber
              </span>
            </div>
          </div>

          {/* 3. HEALTHY FATS CIRCULAR RING (SKY CYAN) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/30 border border-cyan-900/50 hover:border-cyan-500/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center text-center transition-all shadow-xl group">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1 mb-1.5">
              <Droplets className="w-3 h-3 text-cyan-400" /> Fats Ring
            </span>

            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center my-0.5">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  stroke="#1E293B"
                  strokeWidth="7"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  stroke="url(#ringFatsGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    strokeDasharray: CIRCUMFERENCE,
                    strokeDashoffset: getRingOffset(fatPct),
                    transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg sm:text-2xl font-black text-white tabular-nums tracking-tight">{fatPct}%</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-cyan-300 uppercase tracking-widest">Fats</span>
              </div>
            </div>

            <div className="mt-2 space-y-0.5">
              <div className="text-xs sm:text-base font-black text-white tabular-nums">
                {nutrition.fat}g <span className="text-[10px] sm:text-xs font-bold text-cyan-300">/ {fatGoal}g</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                {nutrition.fat >= fatGoal ? (
                  <span className="text-emerald-400 font-bold">Lipids Met! 🥑</span>
                ) : (
                  <span>{Math.max(0, Math.round((fatGoal - nutrition.fat) * 10) / 10)}g to goal</span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-cyan-300 font-bold block pt-0.5">
                🫐 {nutrition.micros.omega3_g}g Omega-3
              </span>
            </div>
          </div>

          {/* 4. TOTAL ENERGY / CALORIES RING (EMERALD MINT) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/30 border border-emerald-900/50 hover:border-emerald-500/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center text-center transition-all shadow-xl group">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Calories Ring
            </span>

            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center my-0.5">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  stroke="#1E293B"
                  strokeWidth="7"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  stroke="url(#ringCaloriesGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    strokeDasharray: CIRCUMFERENCE,
                    strokeDashoffset: getRingOffset(caloriePct),
                    transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg sm:text-2xl font-black text-white tabular-nums tracking-tight">{caloriePct}%</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Energy</span>
              </div>
            </div>

            <div className="mt-2 space-y-0.5">
              <div className="text-xs sm:text-base font-black text-white tabular-nums">
                {nutrition.calories} <span className="text-[10px] sm:text-xs font-bold text-emerald-300">/ {calorieGoal}</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                {nutrition.calories >= calorieGoal ? (
                  <span className="text-emerald-400 font-bold">100% Fueled!</span>
                ) : (
                  <span>{Math.max(0, calorieGoal - nutrition.calories)} kcal left</span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-emerald-300 font-bold block pt-0.5">
                🛡️ {nutrition.overallMicronutrientScore}% Micros
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MEAL SELECTION TABS: HORIZONTAL ERGONOMIC TOUCH RIBBON */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mType) => {
          const isActive = selectedMealType === mType;
          const items = meals.filter((m) => m.mealType === mType);
          const pSum = Math.round(items.reduce((s, x) => s + x.food.protein * (x.servings || 1), 0));
          const label = mType.charAt(0).toUpperCase() + mType.slice(1);
          const icon = mType === 'breakfast' ? '🌅' : mType === 'lunch' ? '☀️' : mType === 'dinner' ? '🌙' : '🍎';

          return (
            <button
              key={mType}
              onClick={() => setSelectedMealType(mType)}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap border shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white border-rose-400 shadow-xl shadow-rose-950/50 scale-[1.02]'
                  : 'bg-slate-900/70 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-base sm:text-lg">{icon}</span>
              <span>{label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {pSum}g pro
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. INTERACTIVE VIRTUAL POWER BOWL CANVAS */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3 sm:pb-4 mb-4 sm:mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>🥣</span> Your Virtual {selectedMealType.toUpperCase()} Bowl
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              See what you eat in pictures! Tap + / - to adjust servings or ✕ to remove.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] sm:text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2.5 py-1 rounded-full">
              {currentMealProtein}g Protein Total
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-1 rounded-full">
              {currentMealCalories} kcal
            </span>
          </div>
        </div>

        {/* Visual Plate Surface */}
        <div className="relative min-h-[190px] sm:min-h-[260px] rounded-3xl bg-slate-950/80 border-2 border-dashed border-slate-800 p-4 sm:p-6 flex flex-col items-center justify-center">
          {currentMealItems.length === 0 ? (
            <div className="text-center space-y-2 py-4 sm:py-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl sm:text-3xl mx-auto shadow-inner text-slate-500">
                🥣
              </div>
              <h4 className="text-sm font-bold text-slate-300">Your bowl is currently empty</h4>
              <p className="text-xs text-slate-500 max-w-sm px-2">
                Tap on any delicious plant protein or ingredient card below to toss it directly into your {selectedMealType} bowl!
              </p>
            </div>
          ) : (
            <div className="w-full space-y-4">
              {/* Pictorial Food Tokens Grid inside the bowl */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
                {currentMealItems.map((item) => {
                  const s = item.servings || 1;
                  const itemProtein = Math.round(item.food.protein * s * 10) / 10;
                  const itemKcal = Math.round(item.food.calories * s);

                  return (
                    <div
                      key={item.id}
                      className="group relative flex items-center gap-2.5 bg-slate-900/90 border border-slate-700 hover:border-rose-500 rounded-2xl p-2 sm:p-2.5 pr-2.5 sm:pr-3 shadow-lg hover:scale-105 transition-all"
                    >
                      {/* Emoji Icon Token */}
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-inner border shrink-0"
                        style={{
                          backgroundColor: `${item.food.plateColor || '#10B981'}25`,
                          borderColor: `${item.food.plateColor || '#10B981'}60`,
                        }}
                      >
                        {item.food.pictorialEmoji || '🌱'}
                      </div>

                      <div className="text-left min-w-[80px]">
                        <span className="text-xs font-extrabold text-white block truncate max-w-[120px] sm:max-w-[140px]">
                          {item.food.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-0.5">
                          <span className="font-bold text-rose-400 tabular-nums">+{itemProtein}g pro</span>
                          <span>·</span>
                          <span>{itemKcal} kcal</span>
                        </div>
                        {/* Serving adjusters */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-400">
                            {s}x
                          </span>
                          {onUpdateMealServing && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onUpdateMealServing(item.id, -0.5)}
                                title="Decrease serving"
                                className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs font-bold"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateMealServing(item.id, 0.5)}
                                title="Increase serving"
                                className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Remove cross button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveMeal(item.id);
                        }}
                        title="Remove from bowl"
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 flex items-center justify-center text-xs transition-colors ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bowl Composition breakdown bar */}
              <div className="pt-3 border-t border-slate-800/80 max-w-lg mx-auto space-y-1.5">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-300">
                  <span>Plate Composition:</span>
                  <span className="text-rose-400">{groupCounts.protein} Proteins · {groupCounts.greens} Greens · {groupCounts.seeds_fats} Seeds</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
                  {groupCounts.protein > 0 && (
                    <div style={{ flex: groupCounts.protein }} className="bg-rose-500 h-full" title="Protein Powerhouses" />
                  )}
                  {groupCounts.greens > 0 && (
                    <div style={{ flex: groupCounts.greens }} className="bg-emerald-500 h-full" title="Greens & Fiber" />
                  )}
                  {groupCounts.grains > 0 && (
                    <div style={{ flex: groupCounts.grains }} className="bg-amber-500 h-full" title="Grains" />
                  )}
                  {groupCounts.seeds_fats > 0 && (
                    <div style={{ flex: groupCounts.seeds_fats }} className="bg-cyan-500 h-full" title="Omega-3 Seeds & Fats" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. WHOLE FOODS PANTRY: OPTIMIZED FOR IPHONE 14 PRO TOUCH */}
      <div className="space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>🥑</span> Visual Whole-Foods Pantry
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Browse real plant foods with pictures and tap to toss them into your {selectedMealType} bowl!
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search food or craving..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-4 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-1 px-1">
          {[
            { id: 'all', label: 'All Foods', icon: '🌱' },
            { id: 'high_protein', label: '🔥 High-Protein (15g+)', icon: '💪' },
            { id: 'tofu_soy', label: 'Tofu & Seitan', icon: '🧈' },
            { id: 'legumes', label: 'Beans & Lentils', icon: '🥣' },
            { id: 'nuts_seeds', label: 'Omega Seeds', icon: '✨' },
            { id: 'grains', label: 'Complex Grains', icon: '🍚' },
            { id: 'vegetables', label: 'Greens & Veggies', icon: '🥦' },
            { id: 'shakes_supplements', label: 'Protein & Nooch', icon: '🥤' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[40px] flex items-center gap-1.5 px-3 py-2 rounded-2xl font-bold transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Food cards grid: 2-col on iPhone 14 Pro, 4-col on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {filteredFoods.map((food) => {
            const isHighPro = food.protein >= 15;
            return (
              <div
                key={food.id}
                onClick={() => handleQuickAdd(food, 1)}
                className={`group relative bg-slate-900/80 border rounded-2xl p-3 sm:p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between ${
                  isHighPro
                    ? 'border-rose-900/50 hover:border-rose-500/80 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5 mb-2">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-inner border shrink-0"
                      style={{
                        backgroundColor: `${food.plateColor || '#10B981'}25`,
                        borderColor: `${food.plateColor || '#10B981'}50`,
                      }}
                    >
                      {food.pictorialEmoji || '🌱'}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] sm:text-xs font-black text-rose-400 bg-rose-950/80 border border-rose-800/80 px-1.5 sm:px-2 py-0.5 rounded-lg tabular-nums">
                        +{food.protein}g pro
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold mt-0.5">
                        {food.calories} kcal
                      </span>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                    {food.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{food.servingSize}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 mt-2.5 flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate max-w-[70px]">
                    {food.leucineEstimateG ? `⚡~${food.leucineEstimateG}g` : '✨ Whole'}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    + Toss
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. VEGAN MICRONUTRIENT SPOTLIGHT */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>🛡️</span> Vegan Micronutrient Vitality Radar
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Essential plant minerals: B12, Iron, Calcium, Zinc, Vitamin D, and Omega-3 ALA.
            </p>
          </div>
          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
            {nutrition.overallMicronutrientScore}% Optimal Coverage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(VEGAN_MICRONUTRIENT_STANDARDS).map(([key, standard]) => {
            const microKey = key as keyof typeof nutrition.microScores;
            const score = nutrition.microScores[microKey];
            const isExpanded = expandedMicro === key;

            return (
              <div
                key={key}
                onClick={() => setExpandedMicro(isExpanded ? null : key)}
                className="bg-slate-950/60 border border-slate-800/80 hover:border-emerald-800/80 p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all space-y-1.5 sm:space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{standard.name}</span>
                  <span className="text-xs font-extrabold text-emerald-400 tabular-nums">
                    {score.pct}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score.pct >= 100 ? 'bg-emerald-500' : score.pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${score.pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
                  <span>Logged: <strong className="text-white">{score.current} {standard.unit}</strong></span>
                  <span>Target: {standard.target} {standard.unit}</span>
                </div>

                {isExpanded ? (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5 animate-fadeIn">
                    <p className="text-slate-300 leading-relaxed">{standard.importance}</p>
                    <p className="text-emerald-400"><strong>Best plant foods:</strong> {standard.topSources}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-end text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5">Learn more <ChevronDown className="w-3 h-3" /></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Custom Food Creator */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🥑</span> Create Custom Recipe / Meal Dish
            </h3>

            <form onSubmit={handleSaveCustomFood} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grandma's High-Protein Lentil Stew"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Pick a Food Icon</label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {['🍲', '🥣', '🥗', '🥠', '🥩', '🥑', '🌯', '🥪'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setCustomEmoji(em)}
                      className={`min-w-[40px] min-h-[40px] rounded-xl text-lg flex items-center justify-center border ${
                        customEmoji === em ? 'bg-rose-950 border-rose-500' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Portion Description</label>
                <input
                  type="text"
                  placeholder="e.g. 1 big bowl (300g)"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-700 text-rose-400 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 min-h-[44px] py-2 rounded-2xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-md"
                >
                  Save to Bowl
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
