import React, { useState } from 'react';
import { FoodItem, LoggedMeal, MealType, UserProfile } from '../types';
import { VEGAN_FOOD_DATABASE, VEGAN_MICRONUTRIENT_STANDARDS } from '../data/veganFoods';
import { ASSET_IMAGES } from '../assets/images';
import { calculateDayNutrition } from '../utils/nutritionCalculations';
import {
  Search,
  Plus,
  Trash2,
  Flame,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Layers,
  Heart,
  Droplets,
  Zap,
} from 'lucide-react';

interface NutritionLoggerProps {
  meals: LoggedMeal[];
  user: UserProfile;
  initialMealType?: MealType;
  onAddMeal: (meal: Omit<LoggedMeal, 'id' | 'loggedAt'>) => void;
  onRemoveMeal: (mealId: string) => void;
}

export const NutritionLogger: React.FC<NutritionLoggerProps> = ({
  meals,
  user,
  initialMealType = 'breakfast',
  onAddMeal,
  onRemoveMeal,
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
    <div className="space-y-6 pb-20">
      {/* Pictorial Visual Hero Banner: The Vegan Power Bowl */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-900/60 shadow-2xl bg-slate-900 group">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
          <img
            src={ASSET_IMAGES.powerBowl}
            alt="Vegan High Protein Bowl"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent z-10" />

        <div className="relative z-20 p-5 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Pictorial Power Bowl & Macros
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                {nutrition.protein}g Protein Eaten Today
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Build Your High-Protein Vegan Feast
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track in real food pictures, not just boring tables! Watch your bowl fill with golden crispy tofu, marinated tempeh, hearty edamame, and antioxidant berries.
            </p>

            <div className="flex items-center gap-4 text-xs font-bold pt-1">
              <span className="text-rose-400">🔥 Goal: {proteinGoal}g pro</span>
              <span className="text-amber-400">⚡ Goal: {calorieGoal} kcal</span>
              <span className="text-emerald-400">🥗 {meals.length} items logged</span>
            </div>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="shrink-0 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-black flex items-center gap-2 hover:brightness-110 shadow-lg shadow-rose-950/50 transition-all"
          >
            <Plus className="w-4 h-4" /> Custom Recipe Dish
          </button>
        </div>
      </div>

      {/* Visual Animated Circular Progress Rings: Protein, Carbs, Fats */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" /> Animated Daily Macro Goals
            </h3>
            <p className="text-xs text-slate-400">
              Visual circular meters tracking your plant-based target ratios in real time.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="text-amber-400 tabular-nums">{nutrition.calories} / {calorieGoal} kcal</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">{caloriePct}% Energy Goal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. PROTEIN CIRCULAR RING (CORAL / ROSE) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-rose-950/30 border border-rose-900/50 hover:border-rose-500/80 rounded-3xl p-5 flex flex-col items-center text-center transition-all shadow-xl group">
            <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-3">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Plant Protein Ring
            </span>

            {/* Circular Progress Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center my-1">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-slate-800/90"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-rose-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                  strokeDasharray={`${proteinPct}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white tabular-nums tracking-tight">{proteinPct}%</span>
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Protein</span>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-base font-black text-white tabular-nums">
                {nutrition.protein}g <span className="text-xs font-bold text-rose-300">/ {proteinGoal}g</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                {nutrition.protein >= proteinGoal ? (
                  <span className="text-emerald-400 font-bold">Goal Smashed! 🔥</span>
                ) : (
                  <span>{Math.max(0, Math.round((proteinGoal - nutrition.protein) * 10) / 10)}g remaining to build muscle</span>
                )}
              </div>
              <span className="text-[10px] text-amber-400 font-bold block pt-0.5">
                ⚡ {nutrition.leucineG}g Leucine Tracked
              </span>
            </div>
          </div>

          {/* 2. CARBS CIRCULAR RING (CITRUS AMBER) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-amber-950/30 border border-amber-900/50 hover:border-amber-500/80 rounded-3xl p-5 flex flex-col items-center text-center transition-all shadow-xl group">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Complex Carbs Ring
            </span>

            <div className="relative w-28 h-28 flex items-center justify-center my-1">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-slate-800/90"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  strokeDasharray={`${carbsPct}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white tabular-nums tracking-tight">{carbsPct}%</span>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Carbs</span>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-base font-black text-white tabular-nums">
                {nutrition.carbs}g <span className="text-xs font-bold text-amber-300">/ {carbsGoal}g</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                {nutrition.carbs >= carbsGoal ? (
                  <span className="text-emerald-400 font-bold">Glycogen Full! ⚡</span>
                ) : (
                  <span>{Math.max(0, Math.round((carbsGoal - nutrition.carbs) * 10) / 10)}g remaining</span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block pt-0.5">
                🌾 {nutrition.fiber}g Prebiotic Fiber
              </span>
            </div>
          </div>

          {/* 3. HEALTHY FATS CIRCULAR RING (SKY CYAN) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/30 border border-cyan-900/50 hover:border-cyan-500/80 rounded-3xl p-5 flex flex-col items-center text-center transition-all shadow-xl group">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-3">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Healthy Fats Ring
            </span>

            <div className="relative w-28 h-28 flex items-center justify-center my-1">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-slate-800/90"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  strokeDasharray={`${fatPct}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white tabular-nums tracking-tight">{fatPct}%</span>
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">Fats</span>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-base font-black text-white tabular-nums">
                {nutrition.fat}g <span className="text-xs font-bold text-cyan-300">/ {fatGoal}g</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                {nutrition.fat >= fatGoal ? (
                  <span className="text-emerald-400 font-bold">Lipids Met! 🥑</span>
                ) : (
                  <span>{Math.max(0, Math.round((fatGoal - nutrition.fat) * 10) / 10)}g remaining</span>
                )}
              </div>
              <span className="text-[10px] text-cyan-300 font-bold block pt-0.5">
                🫐 {nutrition.micros.omega3_g}g Omega-3 ALA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Selection Tabs with Pictorial Indicators */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white border-rose-400 shadow-xl shadow-rose-950/50 scale-[1.02]'
                  : 'bg-slate-900/70 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {pSum}g pro
              </span>
            </button>
          );
        })}
      </div>

      {/* INTERACTIVE "VIRTUAL VEGAN POWER BOWL & PLATE" CANVAS */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>🥣</span> Your Virtual {selectedMealType.toUpperCase()} Bowl
            </h3>
            <p className="text-xs text-slate-400">
              See what you are eating in vibrant pictures! Tap any food in the bowl to adjust or remove.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-800/80 px-3 py-1 rounded-full">
              {currentMealProtein}g Protein Total
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-3 py-1 rounded-full">
              {currentMealCalories} kcal
            </span>
          </div>
        </div>

        {/* Visual Plate Surface */}
        <div className="relative min-h-[220px] sm:min-h-[260px] rounded-3xl bg-slate-950/80 border-2 border-dashed border-slate-800 p-6 flex flex-col items-center justify-center">
          {currentMealItems.length === 0 ? (
            <div className="text-center space-y-2 py-6">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl mx-auto shadow-inner text-slate-500">
                🥣
              </div>
              <h4 className="text-sm font-bold text-slate-300">Your bowl is currently empty</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Tap on any delicious plant protein or ingredient card below to toss it directly into your {selectedMealType} bowl!
              </p>
            </div>
          ) : (
            <div className="w-full space-y-4">
              {/* Pictorial Food Tokens Grid inside the bowl */}
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                {currentMealItems.map((item) => {
                  const s = item.servings || 1;
                  const itemProtein = Math.round(item.food.protein * s * 10) / 10;
                  const itemKcal = Math.round(item.food.calories * s);

                  return (
                    <div
                      key={item.id}
                      className="group relative flex items-center gap-3 bg-slate-900/90 border border-slate-700 hover:border-rose-500 rounded-2xl p-2.5 pr-3 shadow-lg hover:scale-105 transition-all cursor-pointer"
                    >
                      {/* Emoji Icon Token */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border shrink-0"
                        style={{
                          backgroundColor: `${item.food.plateColor || '#10B981'}25`,
                          borderColor: `${item.food.plateColor || '#10B981'}60`,
                        }}
                      >
                        {item.food.pictorialEmoji || '🌱'}
                      </div>

                      <div className="text-left min-w-[90px]">
                        <span className="text-xs font-extrabold text-white block truncate max-w-[140px]">
                          {item.food.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-0.5">
                          <span className="font-bold text-rose-400 tabular-nums">+{itemProtein}g pro</span>
                          <span>·</span>
                          <span>{itemKcal} kcal</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {s > 1 ? `${s}x servings` : item.food.servingSize}
                        </span>
                      </div>

                      {/* Remove cross button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveMeal(item.id);
                        }}
                        title="Remove from bowl"
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 flex items-center justify-center text-xs transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bowl Composition breakdown bar */}
              <div className="pt-4 border-t border-slate-800/80 max-w-lg mx-auto space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span>Plate Nutrition Composition:</span>
                  <span className="text-rose-400">{groupCounts.protein} Proteins · {groupCounts.greens} Greens · {groupCounts.seeds_fats} Seeds</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden flex">
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

      {/* PICTORIAL FOOD MARKETPLACE (VISUAL FOOD CARDS) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>🥑</span> Visual Whole-Foods Pantry
            </h3>
            <p className="text-xs text-slate-400">
              Browse real plant foods with pictures and tap to add them to your bowl.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by food name or craving..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Whole Foods', icon: '🌱' },
            { id: 'high_protein', label: '🔥 Maximum Protein (15g+)', icon: '💪' },
            { id: 'tofu_soy', label: 'Tofu, Tempeh & Seitan', icon: '🧈' },
            { id: 'legumes', label: 'Lentils & Beans', icon: '🥣' },
            { id: 'nuts_seeds', label: 'Omega-3 Seeds & Nuts', icon: '✨' },
            { id: 'grains', label: 'Complex Grains', icon: '🍚' },
            { id: 'vegetables', label: 'Greens & Veggies', icon: '🥦' },
            { id: 'shakes_supplements', label: 'Protein Isolates & Nooch', icon: '🥤' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Pictorial Food Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredFoods.map((food) => {
            const isHighProtein = food.protein >= 15;

            return (
              <div
                key={food.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/80 rounded-3xl p-4 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-xl group"
              >
                <div>
                  {/* Top Row with Large Pictorial Token & Protein Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: `${food.plateColor || '#10B981'}25`,
                        borderColor: `${food.plateColor || '#10B981'}60`,
                      }}
                    >
                      {food.pictorialEmoji || '🌱'}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-rose-400 bg-rose-950/90 border border-rose-800/80 px-2 py-0.5 rounded-lg inline-block tabular-nums">
                        {food.protein}g protein
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 tabular-nums">
                        {food.calories} kcal
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-extrabold text-white mt-3 leading-snug group-hover:text-rose-300 transition-colors">
                    {food.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{food.servingSize}</span>

                  {/* Highlights Pill */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {isHighProtein && (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/60">
                        ⚡ Hypertrophy Fuel
                      </span>
                    )}
                    {food.micros.b12_mcg > 0 && (
                      <span className="text-[9px] font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
                        +{food.micros.b12_mcg}mcg B12
                      </span>
                    )}
                    {food.micros.omega3_g >= 2 && (
                      <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        +{food.micros.omega3_g}g Omega-3
                      </span>
                    )}
                  </div>
                </div>

                {/* Toss into Bowl Button */}
                <button
                  onClick={() => handleQuickAdd(food, 1)}
                  className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md group-hover:bg-rose-600 group-hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" /> Toss into Bowl
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Vegan Micronutrient Spotlight */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">✿</span> Vegan Micronutrient Daily Requirements
            </h3>
            <p className="text-xs text-slate-400">
              Essential vitamins and minerals critical for plant-based athletes, joint longevity, and muscle contractions.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400">
              Overall Coverage: {nutrition.overallMicronutrientScore}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {Object.entries(VEGAN_MICRONUTRIENT_STANDARDS).map(([key, standard]) => {
            const microKey = key as keyof typeof nutrition.microScores;
            const score = nutrition.microScores[microKey];
            const isExpanded = expandedMicro === key;

            return (
              <div
                key={key}
                onClick={() => setExpandedMicro(isExpanded ? null : key)}
                className="bg-slate-950/60 border border-slate-800/80 hover:border-emerald-800/80 p-3.5 rounded-2xl cursor-pointer transition-all space-y-2"
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

                <div className="flex items-center justify-between text-[11px] text-slate-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Pick a Food Icon</label>
                <div className="flex gap-2">
                  {['🍲', '🥣', '🥗', '🥠', '🥩', '🥑', '🌯', '🥪'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setCustomEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border ${
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-rose-500"
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
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-rose-400 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-md"
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
