import React from 'react';
import { UserProfile } from '../types';
import { Dumbbell, Utensils, BarChart3, Heart, LayoutDashboard, Users, Download, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'nutrition' | 'calisthenics' | 'analytics' | 'care';
  setActiveTab: (tab: 'dashboard' | 'nutrition' | 'calisthenics' | 'analytics' | 'care') => void;
  activeUser: UserProfile;
  onOpenProfileModal: () => void;
  onExportBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeUser,
  onOpenProfileModal,
  onExportBackup,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-emerald-900/40 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-[1.5px] shadow-lg shadow-emerald-950/40">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400 font-bold text-lg">
              ✿
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
                THRIVE <span className="text-emerald-400">PULSE</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 rounded-full px-2 py-0.5">
                <Sparkles className="w-2.5 h-2.5" /> 100% On-Device
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[200px] md:max-w-none">
              Maximum Vegan Protein · Home Calisthenics Mastery
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop / Tablet) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('nutrition')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'nutrition'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Food & Protein
          </button>

          <button
            onClick={() => setActiveTab('calisthenics')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'calisthenics'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Calisthenics Tree
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>

          <button
            onClick={() => setActiveTab('care')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'care'
                ? 'bg-gradient-to-r from-emerald-500 to-lime-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Daily Care
          </button>
        </nav>

        {/* Right Actions: User Switcher & Backup */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onExportBackup}
            title="Download full JSON data backup"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Backup</span>
          </button>

          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-emerald-900/50 hover:border-emerald-600/80 rounded-xl transition-all shadow-sm group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-950 flex items-center justify-center text-sm border border-emerald-500/30">
              {activeUser.avatar || '🌱'}
            </div>
            <div className="text-left hidden xs:block">
              <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate max-w-[90px] sm:max-w-[120px]">
                {activeUser.name}
              </div>
              <div className="text-[10px] text-slate-400 leading-none">
                {activeUser.goals.protein}g protein goal
              </div>
            </div>
            <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0 ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
