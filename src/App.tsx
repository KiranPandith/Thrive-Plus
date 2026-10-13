import React, { useState, useEffect } from 'react';
import { AppState, DayRecord, LoggedMeal, LoggedWorkoutExercise, UserGoals, UserProfile } from './types';
import {
  createBlankDayRecord,
  exportBackupJson,
  getTodayDateString,
  loadAppState,
  parseBackupFile,
  saveAppState,
} from './utils/storage';
import { CALISTHENICS_EXERCISES } from './data/calisthenicsTree';
import { ArenaHeader, AppLayout } from './components/ArenaHeader';
import { DailyQuestHub } from './components/DailyQuestHub';
import { NutritionLogger } from './components/NutritionLogger';
import { CalisthenicsSkillTree } from './components/CalisthenicsSkillTree';
import { AnalyticsView } from './components/AnalyticsView';
import { AchievementShowcase } from './components/AchievementBadge';
import { ProfileModal } from './components/ProfileModal';
import { AthleteBiometricsCard } from './components/AthleteBiometricsCard';
import { Network, Utensils, Swords, BarChart3, Columns, Award } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [activeLayout, setActiveLayout] = useState<AppLayout>('mindtree_arena');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const activeUser =
    appState.users.find((u) => u.id === appState.activeUserId) || appState.users[0];

  const getActiveDayRecord = (): DayRecord => {
    const userRecords = appState.records[activeUser.id] || {};
    return userRecords[selectedDate] || createBlankDayRecord(selectedDate);
  };

  const currentRecord = getActiveDayRecord();

  const updateCurrentRecord = (updater: (prev: DayRecord) => DayRecord) => {
    setAppState((prev) => {
      const uRecords = { ...(prev.records[activeUser.id] || {}) };
      const current = uRecords[selectedDate] || createBlankDayRecord(selectedDate);
      const updated = updater(current);
      uRecords[selectedDate] = updated;

      return {
        ...prev,
        records: {
          ...prev.records,
          [activeUser.id]: uRecords,
        },
      };
    });
  };

  // Calculate Warrior Level & XP
  const userPrs = appState.personalRecords[activeUser.id] || {};
  const totalXP = Object.entries(userPrs).reduce((acc, [exId, reps]) => {
    const ex = CALISTHENICS_EXERCISES.find((e) => e.id === exId);
    if (!ex || reps <= 0) return acc;
    const ratio = Math.min(1.5, reps / ex.prCriteria);
    return acc + Math.round(ex.xpReward * ratio);
  }, 0);
  const warriorLevel = Math.max(1, Math.floor(totalXP / 350) + 1);

  // Handlers
  const handleSelectUser = (userId: string) => {
    setAppState((prev) => ({ ...prev, activeUserId: userId }));
    const target = appState.users.find((u) => u.id === userId);
    showToast(`Switched to ${target?.name || 'profile'}`);
  };

  const handleCreateUser = (newUserData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const id = `user-${Date.now()}`;
    const newUser: UserProfile = {
      ...newUserData,
      id,
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      activeUserId: id,
      records: {
        ...prev.records,
        [id]: {},
      },
      personalRecords: {
        ...prev.personalRecords,
        [id]: {},
      },
    }));

    showToast(`Created profile "${newUser.name}"`);
  };

  const handleUpdateGoals = (userId: string, goals: UserGoals) => {
    setAppState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, goals } : u)),
    }));
    showToast('Updated personalized goals');
  };

  const handleUpdateUserProfile = (userId: string, updates: Partial<UserProfile>) => {
    setAppState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
    }));
    showToast('Updated physical biometrics & daily targets');
  };

  const handleDeleteUser = (userId: string) => {
    if (appState.users.length <= 1) {
      showToast('⚠️ You must keep at least one profile');
      return;
    }
    setAppState((prev) => {
      const remaining = prev.users.filter((u) => u.id !== userId);
      return {
        ...prev,
        users: remaining,
        activeUserId: prev.activeUserId === userId ? remaining[0].id : prev.activeUserId,
      };
    });
    showToast('Profile deleted');
  };

  const handleAddMeal = (mealData: Omit<LoggedMeal, 'id' | 'loggedAt'>) => {
    const newMeal: LoggedMeal = {
      ...mealData,
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    updateCurrentRecord((rec) => ({
      ...rec,
      meals: [...rec.meals, newMeal],
    }));

    showToast(`Tossed ${newMeal.food.name} into bowl!`);
  };

  const handleRemoveMeal = (mealId: string) => {
    updateCurrentRecord((rec) => ({
      ...rec,
      meals: rec.meals.filter((m) => m.id !== mealId),
    }));
    showToast('Removed from bowl');
  };

  const handleUpdateMealServing = (mealId: string, delta: number) => {
    updateCurrentRecord((rec) => ({
      ...rec,
      meals: rec.meals.map((m) => {
        if (m.id !== mealId) return m;
        const newServ = Math.max(0.5, Math.round(((m.servings || 1) + delta) * 10) / 10);
        return { ...m, servings: newServ };
      }),
    }));
  };

  const handleSaveWorkout = (workout: LoggedWorkoutExercise) => {
    updateCurrentRecord((rec) => {
      const existingIdx = rec.workouts.findIndex((w) => w.exerciseId === workout.exerciseId);
      let updatedWorkouts: LoggedWorkoutExercise[];
      if (existingIdx >= 0) {
        updatedWorkouts = [...rec.workouts];
        updatedWorkouts[existingIdx] = workout;
      } else {
        updatedWorkouts = [...rec.workouts, workout];
      }
      return {
        ...rec,
        workouts: updatedWorkouts,
      };
    });
    showToast('Workout progress unlocked!');
  };

  const handleUpdatePersonalRecord = (exerciseId: string, bestReps: number) => {
    setAppState((prev) => {
      const prs = { ...(prev.personalRecords[activeUser.id] || {}) };
      prs[exerciseId] = bestReps;
      return {
        ...prev,
        personalRecords: {
          ...prev.personalRecords,
          [activeUser.id]: prs,
        },
      };
    });
    showToast(`🔥 New Milestone Record: ${bestReps}!`);
  };

  const handleToggleEssential = (key: keyof DayRecord['essentials']) => {
    updateCurrentRecord((rec) => ({
      ...rec,
      essentials: {
        ...rec.essentials,
        [key]: !rec.essentials[key],
      },
    }));
  };

  const handleUpdateWater = (waterMl: number) => {
    updateCurrentRecord((rec) => ({
      ...rec,
      care: {
        ...(rec.care || {
          waterMl: 0,
          sleepHours: 8,
          sleepQuality: 'good',
          soreness: {},
          cycleDay: null,
          cyclePhase: null,
          recoveryScore: 80,
        }),
        waterMl,
      },
    }));
    showToast(`💧 Water logged: ${waterMl}ml`);
  };

  const handleSaveReflection = (wins: string, focus: string) => {
    updateCurrentRecord((rec) => ({
      ...rec,
      reflection: { wins, focus },
    }));
    showToast('Weekly reflection saved!');
  };

  const handleExportBackup = () => {
    exportBackupJson(appState);
    showToast('Backup downloaded to device');
  };

  const handleImportBackup = async (file: File) => {
    try {
      const restored = await parseBackupFile(file);
      setAppState(restored);
      showToast('Backup successfully restored!');
    } catch (err: unknown) {
      showToast(`⚠️ ${(err as Error).message || 'Failed to parse backup'}`);
    }
  };

  const handleClearAllData = () => {
    localStorage.removeItem('thrive_pulse_app_state_v2');
    const fresh = loadAppState();
    setAppState(fresh);
    showToast('Local storage reset');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Visual Arena Header with iPhone 14 Pro Safe Area */}
      <ArenaHeader
        activeLayout={activeLayout}
        setActiveLayout={setActiveLayout}
        activeUser={activeUser}
        warriorLevel={warriorLevel}
        totalXP={totalXP}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onExportBackup={handleExportBackup}
      />

      {/* Main Viewport Content - Bottom dock safe margin & responsive cards */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3 sm:pt-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:pb-20 space-y-4 sm:space-y-5">
        {/* Dynamic Athlete Biometrics & Personal Details Card */}
        <AthleteBiometricsCard
          user={activeUser}
          warriorLevel={warriorLevel}
          totalXP={totalXP}
          onOpenBiometricsModal={() => setIsProfileModalOpen(true)}
        />

        {activeLayout === 'mindtree_arena' && (
          <CalisthenicsSkillTree
            record={currentRecord}
            user={activeUser}
            personalRecords={userPrs}
            onSaveWorkout={handleSaveWorkout}
            onUpdatePersonalRecord={handleUpdatePersonalRecord}
          />
        )}

        {activeLayout === 'bowl_studio' && (
          <NutritionLogger
            meals={currentRecord.meals}
            user={activeUser}
            records={appState.records[activeUser.id] || {}}
            selectedDate={selectedDate}
            onAddMeal={handleAddMeal}
            onRemoveMeal={handleRemoveMeal}
            onUpdateMealServing={handleUpdateMealServing}
          />
        )}

        {activeLayout === 'quest_hub' && (
          <DailyQuestHub
            record={currentRecord}
            user={activeUser}
            selectedDate={selectedDate}
            onNavigateLayout={setActiveLayout}
            onToggleEssential={handleToggleEssential}
            onUpdateWater={handleUpdateWater}
            personalRecords={userPrs}
            records={appState.records[activeUser.id] || {}}
          />
        )}

        {activeLayout === 'medals' && (
          <AchievementShowcase
            records={appState.records[activeUser.id] || {}}
            personalRecords={userPrs}
            user={activeUser}
            onNavigateLayout={setActiveLayout}
          />
        )}

        {activeLayout === 'analytics' && (
          <AnalyticsView
            records={appState.records[activeUser.id] || {}}
            user={activeUser}
            selectedDate={selectedDate}
            onSaveReflection={handleSaveReflection}
          />
        )}

        {activeLayout === 'split_view' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-amber-900/40 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-300">
              <span className="font-bold flex items-center gap-1.5">
                <Columns className="w-4 h-4" /> Dual Studio View: Calisthenics Mind-Tree & Power Bowl side-by-side
              </span>
              <button
                onClick={() => setActiveLayout('mindtree_arena')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Switch to Full Arena
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div>
                <CalisthenicsSkillTree
                  record={currentRecord}
                  user={activeUser}
                  personalRecords={userPrs}
                  onSaveWorkout={handleSaveWorkout}
                  onUpdatePersonalRecord={handleUpdatePersonalRecord}
                />
              </div>
              <div>
                <NutritionLogger
                  meals={currentRecord.meals}
                  user={activeUser}
                  records={appState.records[activeUser.id] || {}}
                  selectedDate={selectedDate}
                  onAddMeal={handleAddMeal}
                  onRemoveMeal={handleRemoveMeal}
                  onUpdateMealServing={handleUpdateMealServing}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Expressive Mobile Floating Navigation Dock for iPhone 14 Pro */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-cyan-800/60 px-2 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          <button
            onClick={() => setActiveLayout('mindtree_arena')}
            className={`min-h-[46px] flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1 font-black transition-all active:scale-95 ${
              activeLayout === 'mindtree_arena'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-4 h-4" />
            <span className="text-[8px]">Skills</span>
          </button>

          <button
            onClick={() => setActiveLayout('bowl_studio')}
            className={`min-h-[46px] flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1 font-black transition-all active:scale-95 ${
              activeLayout === 'bowl_studio'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span className="text-[8px]">Bowl</span>
          </button>

          <button
            onClick={() => setActiveLayout('quest_hub')}
            className={`min-h-[46px] flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1 font-black transition-all active:scale-95 ${
              activeLayout === 'quest_hub'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span className="text-[8px]">Quests</span>
          </button>

          <button
            onClick={() => setActiveLayout('medals')}
            className={`min-h-[46px] flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1 font-black transition-all active:scale-95 ${
              activeLayout === 'medals'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="text-[8px]">Medals</span>
          </button>

          <button
            onClick={() => setActiveLayout('analytics')}
            className={`min-h-[46px] flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1 font-black transition-all active:scale-95 ${
              activeLayout === 'analytics'
                ? 'bg-violet-500 text-white shadow-lg shadow-violet-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[8px]">Insights</span>
          </button>
        </div>
      </nav>

      {/* Profiles & Data Backup Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        users={appState.users}
        activeUserId={activeUser.id}
        onSelectUser={handleSelectUser}
        onCreateUser={handleCreateUser}
        onUpdateGoals={handleUpdateGoals}
        onUpdateUserProfile={handleUpdateUserProfile}
        onDeleteUser={handleDeleteUser}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearAllData={handleClearAllData}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 border border-cyan-400 text-white text-xs font-black shadow-2xl shadow-cyan-950/80 flex items-center gap-2 animate-bounce max-w-[90vw] truncate">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
