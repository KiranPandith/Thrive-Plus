import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Trophy, Users, Download, Network, Utensils, Swords } from 'lucide-react';

interface ArenaHeaderProps {
  activeLayout: 'mindtree_arena' | 'bowl_studio' | 'quest_hub';
  setActiveLayout: (mode: 'mindtree_arena' | 'bowl_studio' | 'quest_hub') => void;
  activeUser: UserProfile;
  warriorLevel: number;
  totalXP: number;
  onOpenProfileModal: () => void;
  onExportBackup: () => void;
}

export const ArenaHeader: React.FC<ArenaHeaderProps> = ({
  activeLayout,
  setActiveLayout,
  activeUser,
  warriorLevel,
  totalXP,
  onOpenProfileModal,
  onExportBackup,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-cyan-900/40 px-3 sm:px-6 py-3 transition-colors shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Warrior Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-amber-400 p-[2px] shadow-lg shadow-cyan-950/60">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-black text-cyan-300">
              {activeUser.avatar || '🌱'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
                THRIVE <span className="text-cyan-400">PULSE</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-[10px] font-black text-cyan-300 flex items-center gap-1 shadow-sm">
                <Trophy className="w-2.5 h-2.5 text-amber-400" /> LVL {warriorLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="text-amber-400 font-bold">{totalXP} XP</span>
              <span>·</span>
              <span className="text-rose-400 font-bold">{activeUser.goals.protein}g Protein Target</span>
            </div>
          </div>
        </div>

        {/* Layout Switcher (Mode Switcher) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner">
          <button
            onClick={() => setActiveLayout('mindtree_arena')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeLayout === 'mindtree_arena'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mind-Tree Arena</span>
            <span className="sm:hidden">Skills</span>
          </button>

          <button
            onClick={() => setActiveLayout('bowl_studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeLayout === 'bowl_studio'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Power Bowl Studio</span>
            <span className="sm:hidden">Bowl</span>
          </button>

          <button
            onClick={() => setActiveLayout('quest_hub')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeLayout === 'quest_hub'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daily Quest Hub</span>
            <span className="sm:hidden">Quests</span>
          </button>
        </div>

        {/* Profile Switcher Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/80 rounded-2xl transition-all shadow-sm"
          >
            <span className="text-xs font-extrabold text-white hidden md:inline truncate max-w-[100px]">
              {activeUser.name}
            </span>
            <Users className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
