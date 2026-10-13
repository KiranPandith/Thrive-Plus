import React, { useState, useEffect } from 'react';
import { UserProfile, UserGoals, GenderType, ActivityLevel, FitnessGoal } from '../types';
import {
  calculateBiometricNutrition,
  formatHeight,
  formatWeight,
  ACTIVITY_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
} from '../utils/biometricCalculations';
import {
  X,
  UserPlus,
  Check,
  Trash2,
  Download,
  Upload,
  ShieldCheck,
  Flame,
  Scale,
  Ruler,
  Dumbbell,
  Droplets,
  Activity,
  Sliders,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  activeUserId: string;
  onSelectUser: (userId: string) => void;
  onCreateUser: (user: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  onUpdateGoals: (userId: string, goals: UserGoals) => void;
  onUpdateUserProfile?: (userId: string, updates: Partial<UserProfile>) => void;
  onDeleteUser: (userId: string) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onClearAllData: () => void;
  initialTab?: 'switch' | 'biometrics' | 'new' | 'backup';
}

const AVATAR_OPTIONS = ['🌱', '🌿', '🦁', '⚡', '🥑', '💪', '🔥', '🌾', '🍉', '🥦', '🫐', '🧘'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUserId,
  onSelectUser,
  onCreateUser,
  onUpdateGoals,
  onUpdateUserProfile,
  onDeleteUser,
  onExportBackup,
  onImportBackup,
  onClearAllData,
  initialTab = 'biometrics',
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'biometrics' | 'new' | 'backup'>(initialTab);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  // Active user biometrics editing state
  const [bioHeight, setBioHeight] = useState<number>(activeUser?.heightCm || 178);
  const [bioWeight, setBioWeight] = useState<number>(activeUser?.weightKg || 74);
  const [bioGender, setBioGender] = useState<GenderType>(activeUser?.gender || 'male');
  const [bioAge, setBioAge] = useState<number>(activeUser?.age || 26);
  const [bioActivity, setBioActivity] = useState<ActivityLevel>(activeUser?.activityLevel || 'very_active');
  const [bioGoal, setBioGoal] = useState<FitnessGoal>(activeUser?.fitnessGoal || 'lean_muscle_gain');
  const [autoSyncGoals, setAutoSyncGoals] = useState<boolean>(activeUser?.autoSyncNutritionWithBiometrics ?? true);
  const [manualGoals, setManualGoals] = useState<UserGoals>(activeUser ? { ...activeUser.goals } : {
    calories: 2550,
    protein: 155,
    carbs: 300,
    fat: 65,
    fiber: 45,
    waterMl: 3200,
    sleepHours: 8.0,
    weeklyWorkoutDays: 5,
  });
  const [showManualGoalOverrides, setShowManualGoalOverrides] = useState(false);

  // Sync state when active user changes
  useEffect(() => {
    if (activeUser) {
      setBioHeight(activeUser.heightCm || 178);
      setBioWeight(activeUser.weightKg || 74);
      setBioGender(activeUser.gender || 'male');
      setBioAge(activeUser.age || 26);
      setBioActivity(activeUser.activityLevel || 'very_active');
      setBioGoal(activeUser.fitnessGoal || 'lean_muscle_gain');
      setAutoSyncGoals(activeUser.autoSyncNutritionWithBiometrics ?? true);
      setManualGoals({ ...activeUser.goals });
    }
  }, [activeUser, isOpen]);

  // Live dynamic calculation for active user
  const activeCalc = calculateBiometricNutrition({
    heightCm: bioHeight,
    weightKg: bioWeight,
    gender: bioGender,
    age: bioAge,
    activityLevel: bioActivity,
    fitnessGoal: bioGoal,
  });

  // New user form state
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🌱');
  const [newExperience, setNewExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [newHeight, setNewHeight] = useState(175);
  const [newWeight, setNewWeight] = useState(70);
  const [newGender, setNewGender] = useState<GenderType>('male');
  const [newAge, setNewAge] = useState(25);
  const [newActivity, setNewActivity] = useState<ActivityLevel>('very_active');
  const [newGoal, setNewGoal] = useState<FitnessGoal>('lean_muscle_gain');

  // Live calculation for new user
  const newCalc = calculateBiometricNutrition({
    heightCm: newHeight,
    weightKg: newWeight,
    gender: newGender,
    age: newAge,
    activityLevel: newActivity,
    fitnessGoal: newGoal,
  });

  if (!isOpen) return null;

  // Handle saving biometric details & modified goals
  const handleSaveBiometrics = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalGoals: UserGoals = autoSyncGoals ? activeCalc.goals : manualGoals;

    if (onUpdateUserProfile) {
      onUpdateUserProfile(activeUserId, {
        heightCm: bioHeight,
        weightKg: bioWeight,
        gender: bioGender,
        age: bioAge,
        activityLevel: bioActivity,
        fitnessGoal: bioGoal,
        autoSyncNutritionWithBiometrics: autoSyncGoals,
        goals: finalGoals,
      });
    } else {
      onUpdateGoals(activeUserId, finalGoals);
    }
    onClose();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onCreateUser({
      name: newName.trim(),
      avatar: newAvatar,
      themeColor: '#10B981',
      experienceLevel: newExperience,
      heightCm: newHeight,
      weightKg: newWeight,
      gender: newGender,
      age: newAge,
      activityLevel: newActivity,
      fitnessGoal: newGoal,
      autoSyncNutritionWithBiometrics: true,
      goals: { ...newCalc.goals },
    });

    setNewName('');
    setActiveTab('switch');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-900/60 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-lg">
              {activeUser.avatar || '🌱'}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>Athlete Biometrics & Nutrition</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Height, Weight, Activity & Dynamic Macro Calibration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Ribbon - Touch friendly */}
        <div className="flex border-b border-slate-800 px-4 bg-slate-950/40 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('biometrics')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'biometrics'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Body & Goals</span>
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'switch'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Switch User ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'new'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ＋ Add User
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'backup'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Backup & Reset
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: BODY BIOMETRICS & DYNAMIC CALIBRATION */}
          {activeTab === 'biometrics' && (
            <div className="space-y-4">
              {/* Profile Intro Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{activeUser.avatar}</span>
                  <div>
                    <div className="text-xs font-black text-white">{activeUser.name}</div>
                    <div className="text-[10px] text-cyan-300 font-semibold">
                      Modify physical traits to automatically recalibrate daily nutrition
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">BMI</span>
                  <span className={`text-xs font-black ${activeCalc.bmiColor}`}>
                    {activeCalc.bmi} ({activeCalc.bmiCategory})
                  </span>
                </div>
              </div>

              {/* Physical Details Form */}
              <div className="space-y-3.5 bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
                <div className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Physical Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Height */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <label className="text-slate-300 flex items-center gap-1">
                        <Ruler className="w-3 h-3 text-cyan-400" /> Height
                      </label>
                      <span className="text-cyan-400 font-black">{formatHeight(bioHeight)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="130"
                        max="220"
                        value={bioHeight}
                        onChange={(e) => setBioHeight(Number(e.target.value))}
                        className="flex-1 accent-cyan-400 cursor-pointer"
                      />
                      <input
                        type="number"
                        min="130"
                        max="220"
                        value={bioHeight}
                        onChange={(e) => setBioHeight(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold text-center"
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <label className="text-slate-300 flex items-center gap-1">
                        <Scale className="w-3 h-3 text-emerald-400" /> Weight
                      </label>
                      <span className="text-emerald-400 font-black">{formatWeight(bioWeight)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="35"
                        max="150"
                        value={bioWeight}
                        onChange={(e) => setBioWeight(Number(e.target.value))}
                        className="flex-1 accent-emerald-400 cursor-pointer"
                      />
                      <input
                        type="number"
                        min="35"
                        max="150"
                        value={bioWeight}
                        onChange={(e) => setBioWeight(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold text-center"
                      />
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Gender</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'male' as const, label: '♂ Male' },
                        { id: 'female' as const, label: '♀ Female' },
                        { id: 'non_binary' as const, label: '⚧ Neutral' },
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setBioGender(g.id)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                            bioGender === g.id
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <label className="text-slate-300">Age</label>
                      <span className="text-slate-300 font-black">{bioAge} years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="16"
                        max="85"
                        value={bioAge}
                        onChange={(e) => setBioAge(Number(e.target.value))}
                        className="flex-1 accent-amber-400 cursor-pointer"
                      />
                      <input
                        type="number"
                        min="16"
                        max="85"
                        value={bioAge}
                        onChange={(e) => setBioAge(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Activity Level Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Activity Level & Training Volume
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ACTIVITY_LEVEL_OPTIONS.map((opt) => {
                      const isSelected = bioActivity === opt.level;
                      return (
                        <div
                          key={opt.level}
                          onClick={() => setBioActivity(opt.level)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-cyan-950/60 border-cyan-400 shadow-sm shadow-cyan-950/50'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white flex items-center gap-1.5">
                              <span>{opt.icon}</span> {opt.label}
                            </span>
                            <span className="text-[10px] font-bold text-cyan-300">
                              {opt.multiplier}×
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Training Goal */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Primary Goal & Protein Protocol
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {FITNESS_GOAL_OPTIONS.map((g) => {
                      const isSelected = bioGoal === g.goal;
                      return (
                        <div
                          key={g.goal}
                          onClick={() => setBioGoal(g.goal)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-rose-950/60 border-rose-400 shadow-sm shadow-rose-950/50'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white flex items-center gap-1.5">
                              <span>{g.icon}</span> {g.label}
                            </span>
                            <span className="text-[10px] font-bold text-rose-300">
                              {g.proteinFocus}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{g.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Live Calibrated Nutrition Target Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Auto-Calibrated Targets
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Live Reactive
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Daily Kcal</div>
                    <div className="text-sm font-black text-amber-400">{activeCalc.goals.calories}</div>
                    <div className="text-[9px] text-slate-500">
                      TDEE {activeCalc.tdee} {activeCalc.calorieDelta >= 0 ? `+${activeCalc.calorieDelta}` : activeCalc.calorieDelta}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/90 border border-rose-900/40">
                    <div className="text-[10px] text-rose-300 uppercase font-bold flex items-center justify-center gap-0.5">
                      Max Protein <Zap className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                    </div>
                    <div className="text-sm font-black text-white">{activeCalc.goals.protein}g</div>
                    <div className="text-[9px] text-rose-400 font-semibold">
                      {activeCalc.proteinRatioGPerKg}g / kg bodyweight
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Clean Carbs</div>
                    <div className="text-sm font-black text-cyan-400">{activeCalc.goals.carbs}g</div>
                    <div className="text-[9px] text-slate-500">{activeCalc.goals.fat}g healthy fats</div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Hydration</div>
                    <div className="text-sm font-black text-blue-400">
                      {(activeCalc.goals.waterMl / 1000).toFixed(1)}L
                    </div>
                    <div className="text-[9px] text-slate-500">{activeCalc.waterRatioMlPerKg} ml/kg</div>
                  </div>
                </div>

                {/* Auto-Sync Toggle */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoSyncGoals}
                      onChange={(e) => setAutoSyncGoals(e.target.checked)}
                      className="w-4 h-4 rounded accent-cyan-400"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Auto-modify nutrition goals based on biometrics
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowManualGoalOverrides(!showManualGoalOverrides)}
                    className="text-[11px] text-cyan-400 hover:underline font-semibold"
                  >
                    {showManualGoalOverrides ? 'Hide manual numbers' : 'Fine-tune exact numbers'}
                  </button>
                </div>

                {/* Optional manual override sliders */}
                {showManualGoalOverrides && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 animate-fadeIn">
                    <div className="text-[11px] text-slate-400">
                      Manual fine-tuning (will be saved when auto-sync is off or customized):
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block">Protein (g)</label>
                        <input
                          type="number"
                          value={manualGoals.protein}
                          onChange={(e) => setManualGoals({ ...manualGoals, protein: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Calories (kcal)</label>
                        <input
                          type="number"
                          value={manualGoals.calories}
                          onChange={(e) => setManualGoals({ ...manualGoals, calories: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Carbs (g)</label>
                        <input
                          type="number"
                          value={manualGoals.carbs}
                          onChange={(e) => setManualGoals({ ...manualGoals, carbs: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Fats (g)</label>
                        <input
                          type="number"
                          value={manualGoals.fat}
                          onChange={(e) => setManualGoals({ ...manualGoals, fat: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBiometrics()}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-950/60 active:scale-95 transition-all"
                >
                  Save & Apply All Targets
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SWITCH USER */}
          {activeTab === 'switch' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Select an existing athlete profile. All nutrition logs, mind-trees, and streak data remain independent on-device:
              </p>
              <div className="grid gap-2.5">
                {users.map((u) => {
                  const isActive = u.id === activeUserId;
                  const uBio = calculateBiometricNutrition({
                    heightCm: u.heightCm,
                    weightKg: u.weightKg,
                    gender: u.gender,
                    age: u.age,
                    activityLevel: u.activityLevel,
                    fitnessGoal: u.fitnessGoal,
                  });

                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u.id);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/30'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-2xl border border-slate-800 shrink-0">
                          {u.avatar || '🌱'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white truncate">{u.name}</span>
                            {isActive && (
                              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-900/70 rounded-full px-2 py-0.5">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="font-semibold text-slate-300">
                              {formatHeight(u.heightCm)} · {formatWeight(u.weightKg)}
                            </span>
                            <span>·</span>
                            <span className="text-rose-400 font-bold">{u.goals.protein}g protein</span>
                            <span>·</span>
                            <span className="text-amber-400">{u.goals.calories} kcal</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive ? (
                          <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-sm font-bold">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          users.length > 1 && (
                            <div>
                              {confirmDeleteId === u.id ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteUser(u.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-500"
                                >
                                  Confirm?
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(u.id);
                                  }}
                                  title="Delete profile"
                                  className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setActiveTab('new')}
                className="w-full py-3 rounded-2xl border border-dashed border-cyan-700/60 hover:border-cyan-500 bg-cyan-950/20 text-cyan-300 hover:text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 transition-all mt-2"
              >
                <UserPlus className="w-4 h-4" /> Add Another Athlete Profile
              </button>
            </div>
          )}

          {/* TAB 3: NEW USER WITH BIOMETRIC SETUP */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Athlete Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan (Lean Calisthenics)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Choose Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setNewAvatar(av)}
                      className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition-all ${
                        newAvatar === av
                          ? 'bg-cyan-950 border-cyan-400 scale-105'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Height: <span className="text-cyan-400">{formatHeight(newHeight)}</span>
                  </label>
                  <input
                    type="range"
                    min="130"
                    max="220"
                    value={newHeight}
                    onChange={(e) => setNewHeight(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Weight: <span className="text-emerald-400">{formatWeight(newWeight)}</span>
                  </label>
                  <input
                    type="range"
                    min="35"
                    max="150"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Gender</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'male' as const, label: '♂ M' },
                      { id: 'female' as const, label: '♀ F' },
                      { id: 'non_binary' as const, label: '⚧ N' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setNewGender(g.id)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          newGender === g.id
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Calisthenics Level</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewExperience(lvl)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold capitalize border transition-all ${
                          newExperience === lvl
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated Targets for New User */}
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/40 text-xs">
                <div className="font-bold text-cyan-300 flex items-center justify-between mb-1">
                  <span>Auto-Calculated Daily Blueprint</span>
                  <span className="text-white font-black">{newCalc.goals.calories} kcal</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>
                    Protein: <strong className="text-rose-400">{newCalc.goals.protein}g</strong> ({newCalc.proteinRatioGPerKg}g/kg)
                  </span>
                  <span>·</span>
                  <span>Carbs: {newCalc.goals.carbs}g</span>
                  <span>·</span>
                  <span>Water: {(newCalc.goals.waterMl / 1000).toFixed(1)}L</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('switch')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-xs font-black hover:brightness-110 shadow-lg shadow-cyan-950/50 transition-all"
                >
                  Create Profile & Blueprint
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: BACKUP & DATA CONTROLS */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="text-white block mb-0.5">100% Private On-Device Storage</strong>
                  All logs, meals, workouts, biometrics, and profiles are stored directly in your browser. No data ever leaves your device.
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={onExportBackup}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" /> Download Full JSON Backup
                  </span>
                  <span className="text-[11px] text-slate-400">Save to Files</span>
                </button>

                <label className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center justify-between cursor-pointer transition-colors">
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-400" /> Restore from JSON Backup
                  </span>
                  <span className="text-[11px] text-slate-400">Upload .json</span>
                  <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <p className="text-[11px] text-rose-300 mb-2 font-medium">Danger Zone</p>
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Reset Local App Storage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
