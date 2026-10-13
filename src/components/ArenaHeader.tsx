import React from 'react';
import { UserProfile } from '../types';
import { Trophy, Users, Network, Utensils, Swords, BarChart3, Columns, Award } from 'lucide-react';

export type AppLayout = 'mindtree_arena' | 'bowl_studio' | 'quest_hub' | 'medals' | 'analytics' | 'split_view';

interface ArenaHeaderProps {
  activeLayout: AppLayout;
  setActiveLayout: (mode: AppLayout) => void;
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
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-b border-cyan-900/40 px-3 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2.5 transition-colors shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand & Warrior Badge */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onOpenProfileModal}
              title="Open Athlete Biometrics & Profile Settings"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-amber-400 p-[2px] shadow-lg shadow-cyan-950/60 shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-lg sm:text-xl font-black text-cyan-300">
                {activeUser.avatar || '🌱'}
              </div>
            </button>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-sm sm:text-lg tracking-tight text-white whitespace-nowrap">
                  THRIVE <span className="text-cyan-400">PULSE</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveLayout('medals')}
                  title="View Earned Medals & Trophies"
                  className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-[9px] sm:text-[10px] font-black text-amber-300 flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                >
                  <Trophy className="w-2.5 h-2.5 text-amber-400" /> LVL {warriorLevel}
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
                <span className="text-amber-400 font-bold">{totalXP} XP</span>
                <span>·</span>
                <span className="text-rose-400 font-bold truncate max-w-[120px] sm:max-w-none">{activeUser.goals.protein}g Target</span>
              </div>
            </div>
          </div>

          {/* Mobile Profile Trigger (Touch-friendly 44px) */}
          <button
            onClick={onOpenProfileModal}
            className="md:hidden min-h-[44px] flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs font-bold text-slate-200 active:scale-95 transition-transform"
          >
            <span className="truncate max-w-[80px]">{activeUser.name}</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        {/* Dynamic Layout Switcher: Touch Ribbon for iPhone 14 Pro */}
        <div className="w-full md:w-auto flex items-center justify-start md:justify-center overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner shrink-0">
            {/* 1. Mind-Tree Arena */}
            <button
              onClick={() => setActiveLayout('mindtree_arena')}
              className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeLayout === 'mindtree_arena'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Mind-Tree</span>
            </button>

            {/* 2. Power Bowl Studio */}
            <button
              onClick={() => setActiveLayout('bowl_studio')}
              className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeLayout === 'bowl_studio'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Bowl</span>
            </button>

            {/* 3. Daily Quests */}
            <button
              onClick={() => setActiveLayout('quest_hub')}
              className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeLayout === 'quest_hub'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Quests</span>
            </button>

            {/* 4. Earned Medals & Trophies */}
            <button
              onClick={() => setActiveLayout('medals')}
              className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeLayout === 'medals'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Medals</span>
            </button>

            {/* 5. Visual Insights & Trends */}
            <button
              onClick={() => setActiveLayout('analytics')}
              className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeLayout === 'analytics'
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>

            {/* 6. Split Arena Dual View (Desktop / Tablet) */}
            <button
              onClick={() => setActiveLayout('split_view')}
              title="Dual Arena: Mind-Tree + Power Bowl together"
              className={`hidden xl:flex min-h-[38px] items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeLayout === 'split_view'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-amber-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>
        </div>

        {/* Profile Switcher Trigger (Desktop) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/80 rounded-2xl transition-all shadow-sm"
          >
            <span className="text-xs font-extrabold text-white truncate max-w-[110px]">
              {activeUser.name}
            </span>
            <Users className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
