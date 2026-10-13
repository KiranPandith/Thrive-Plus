import React, { useState } from 'react';
import { UserProfile, UserGoals } from '../types';
import { X, UserPlus, Check, Trash2, Download, Upload, ShieldCheck, Flame } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  activeUserId: string;
  onSelectUser: (userId: string) => void;
  onCreateUser: (user: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  onUpdateGoals: (userId: string, goals: UserGoals) => void;
  onDeleteUser: (userId: string) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onClearAllData: () => void;
}

const AVATAR_OPTIONS = ['🌱', '🌿', '🦁', '⚡', '🥑', '💪', '🔥', '🌾', '🍉', '🥦'];

const GOAL_PRESETS = [
  {
    name: 'Lean Hypertrophy Beast',
    desc: 'Maximum vegan protein for serious muscle gain & calisthenics power',
    goals: { calories: 2500, protein: 145, carbs: 290, fat: 65, fiber: 45, waterMl: 3200, sleepHours: 8.0, weeklyWorkoutDays: 4 },
  },
  {
    name: 'Calisthenics Athlete',
    desc: 'High protein with optimized power-to-weight body composition',
    goals: { calories: 2200, protein: 115, carbs: 260, fat: 58, fiber: 40, waterMl: 2800, sleepHours: 8.0, weeklyWorkoutDays: 4 },
  },
  {
    name: 'Plant Vitality & Maintenance',
    desc: 'Balanced nourishment for everyday lean fitness & health',
    goals: { calories: 1950, protein: 85, carbs: 240, fat: 52, fiber: 35, waterMl: 2400, sleepHours: 7.5, weeklyWorkoutDays: 3 },
  },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUserId,
  onSelectUser,
  onCreateUser,
  onUpdateGoals,
  onDeleteUser,
  onExportBackup,
  onImportBackup,
  onClearAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'new' | 'edit_goals' | 'backup'>('switch');

  // New user form state
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🌱');
  const [newExperience, setNewExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);

  // Edit goals state
  const activeUser = users.find((u) => u.id === activeUserId) || users[0];
  const [editGoals, setEditGoals] = useState<UserGoals>(activeUser ? { ...activeUser.goals } : GOAL_PRESETS[0].goals);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const preset = GOAL_PRESETS[selectedPresetIdx];
    onCreateUser({
      name: newName.trim(),
      avatar: newAvatar,
      themeColor: '#10B981',
      experienceLevel: newExperience,
      goals: { ...preset.goals },
    });
    setNewName('');
    setActiveTab('switch');
  };

  const handleGoalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoals(activeUserId, editGoals);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-900/60 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">✿</span> User Profiles & Storage
            </h2>
            <p className="text-xs text-slate-400">100% On-Device · Instant Local Switching</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/20">
          <button
            onClick={() => setActiveTab('switch')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'switch'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Switch User ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'new'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ＋ Add User
          </button>
          <button
            onClick={() => {
              if (activeUser) setEditGoals({ ...activeUser.goals });
              setActiveTab('edit_goals');
            }}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'edit_goals'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Edit Goals
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'backup'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Backup & Reset
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: SWITCH USER */}
          {activeTab === 'switch' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Select an existing profile to load their personal nutrition logs, calisthenics skill trees, and goals:
              </p>
              <div className="grid gap-2.5">
                {users.map((u) => {
                  const isActive = u.id === activeUserId;
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u.id);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-900/20'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-2xl border border-slate-800">
                          {u.avatar || '🌱'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{u.name}</span>
                            {isActive && (
                              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/70 rounded-full px-2 py-0.5">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="text-rose-400 font-semibold">{u.goals.protein}g protein</span>
                            <span>·</span>
                            <span>{u.goals.calories} kcal</span>
                            <span>·</span>
                            <span className="capitalize">{u.experienceLevel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          users.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete profile "${u.name}" and their data?`)) {
                                  onDeleteUser(u.id);
                                }
                              }}
                              title="Delete profile"
                              className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setActiveTab('new')}
                className="w-full py-2.5 rounded-xl border border-dashed border-emerald-700/60 hover:border-emerald-500 bg-emerald-950/20 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all mt-2"
              >
                <UserPlus className="w-4 h-4" /> Add Another Profile
              </button>
            </div>
          )}

          {/* TAB 2: NEW USER FORM */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">User Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leo (Lean Muscle)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 outline-none"
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
                          ? 'bg-emerald-950 border-emerald-500 scale-105'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Calisthenics Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewExperience(lvl)}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        newExperience === lvl
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Starting Goal Preset</label>
                <div className="grid gap-2">
                  {GOAL_PRESETS.map((preset, idx) => (
                    <div
                      key={preset.name}
                      onClick={() => setSelectedPresetIdx(idx)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedPresetIdx === idx
                          ? 'bg-emerald-950/40 border-emerald-500'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-rose-400" /> {preset.name}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">{preset.goals.protein}g Protein</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{preset.desc}</p>
                    </div>
                  ))}
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-emerald-950/50 transition-all"
                >
                  Create Profile
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EDIT GOALS */}
          {activeTab === 'edit_goals' && (
            <form onSubmit={handleGoalsSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300">
                Customizing daily goals for <strong className="text-white">{activeUser.name}</strong>. Maximum protein and progressive overload are emphasized.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Daily Protein Target (g)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="300"
                    value={editGoals.protein}
                    onChange={(e) => setEditGoals({ ...editGoals, protein: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-rose-400 font-bold text-sm focus:border-rose-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Aim for 1.6-2.2g/kg for muscle gain</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Daily Calories (kcal)
                  </label>
                  <input
                    type="number"
                    min="1200"
                    max="5000"
                    value={editGoals.calories}
                    onChange={(e) => setEditGoals({ ...editGoals, calories: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-sm focus:border-amber-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Energy for calisthenics recovery</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Complex Carbs (g)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="600"
                    value={editGoals.carbs}
                    onChange={(e) => setEditGoals({ ...editGoals, carbs: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Healthy Fats (g)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="150"
                    value={editGoals.fat}
                    onChange={(e) => setEditGoals({ ...editGoals, fat: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Fiber Target (g)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={editGoals.fiber}
                    onChange={(e) => setEditGoals({ ...editGoals, fiber: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Hydration Target (ml)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="6000"
                    step="100"
                    value={editGoals.waterMl}
                    onChange={(e) => setEditGoals({ ...editGoals, waterMl: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-400 font-bold text-sm focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-emerald-950/50 transition-all"
                >
                  Save Goals
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
                  All logs, meals, workouts, and user profiles are stored directly in your browser. No data ever leaves your device.
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
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all tracker data from this device? This cannot be undone unless you have a backup.')) {
                      onClearAllData();
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All Local Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
