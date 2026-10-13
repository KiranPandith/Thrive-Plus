import React from 'react';
import { LayoutDashboard, Utensils, Dumbbell, BarChart3, Heart } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'nutrition' | 'calisthenics' | 'analytics' | 'care';
  setActiveTab: (tab: 'dashboard' | 'nutrition' | 'calisthenics' | 'analytics' | 'care') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 pb-[max(6px,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl py-1 ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-bold bg-emerald-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span className="text-[10px] tracking-tight leading-none">Today</span>
        </button>

        <button
          onClick={() => setActiveTab('nutrition')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl py-1 ${
            activeTab === 'nutrition'
              ? 'text-rose-400 font-bold bg-rose-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Utensils className="w-5 h-5 shrink-0" />
          <span className="text-[10px] tracking-tight leading-none">Food</span>
        </button>

        <button
          onClick={() => setActiveTab('calisthenics')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl py-1 ${
            activeTab === 'calisthenics'
              ? 'text-cyan-400 font-bold bg-cyan-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dumbbell className="w-5 h-5 shrink-0" />
          <span className="text-[10px] tracking-tight leading-none">Skills</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl py-1 ${
            activeTab === 'analytics'
              ? 'text-violet-400 font-bold bg-violet-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 shrink-0" />
          <span className="text-[10px] tracking-tight leading-none">Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('care')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all rounded-xl py-1 ${
            activeTab === 'care'
              ? 'text-lime-400 font-bold bg-lime-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className="w-5 h-5 shrink-0" />
          <span className="text-[10px] tracking-tight leading-none">Care</span>
        </button>
      </div>
    </nav>
  );
};
