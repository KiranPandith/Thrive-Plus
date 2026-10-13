import React, { useState } from 'react';
import { AchievementBadgeData, DayRecord, MedalTier, UserProfile } from '../types';
import { EVALUATE_ACHIEVEMENTS } from '../data/achievements';
import { AppLayout } from './ArenaHeader';
import {
  Trophy,
  Lock,
  Sparkles,
  Flame,
  Dumbbell,
  Shield,
  ArrowRight,
  X,
  Zap,
} from 'lucide-react';

interface AchievementBadgeProps {
  badge: AchievementBadgeData;
  onClick?: () => void;
  compact?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  badge,
  onClick,
  compact = false,
}) => {
  const getTierStyles = (tier: MedalTier, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        bg: 'bg-slate-950/70 border-slate-800/80',
        ring: 'border-slate-800',
        glow: '',
        text: 'text-slate-400',
        badgeColor: 'bg-slate-800 text-slate-400',
        iconBg: 'bg-slate-900 border-slate-800 text-slate-500',
        ribbon: 'from-slate-700 to-slate-800',
      };
    }

    switch (tier) {
      case 'bronze':
        return {
          bg: 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-950/20 border-amber-700/60 hover:border-amber-500',
          ring: 'border-amber-600',
          glow: 'shadow-amber-900/40',
          text: 'text-amber-300',
          badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-800',
          iconBg: 'bg-gradient-to-tr from-amber-900 via-amber-800 to-amber-700 border-amber-500/80 text-amber-200',
          ribbon: 'from-amber-600 to-amber-800',
        };
      case 'silver':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/40 border-slate-400/60 hover:border-slate-300',
          ring: 'border-slate-300',
          glow: 'shadow-slate-500/30',
          text: 'text-slate-200',
          badgeColor: 'bg-slate-800/90 text-slate-200 border-slate-600',
          iconBg: 'bg-gradient-to-tr from-slate-700 via-slate-600 to-slate-500 border-slate-300 text-white',
          ribbon: 'from-slate-400 to-slate-600',
        };
      case 'gold':
        return {
          bg: 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-yellow-950/30 border-yellow-500/70 hover:border-yellow-400',
          ring: 'border-yellow-400',
          glow: 'shadow-yellow-500/40',
          text: 'text-yellow-300',
          badgeColor: 'bg-yellow-950/90 text-yellow-300 border-yellow-700',
          iconBg: 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 border-yellow-300 text-slate-950',
          ribbon: 'from-yellow-500 to-amber-600',
        };
      case 'diamond':
        return {
          bg: 'bg-gradient-to-br from-cyan-950/50 via-slate-900 to-blue-950/30 border-cyan-400/80 hover:border-cyan-300',
          ring: 'border-cyan-400',
          glow: 'shadow-cyan-500/40',
          text: 'text-cyan-300',
          badgeColor: 'bg-cyan-950/90 text-cyan-300 border-cyan-700',
          iconBg: 'bg-gradient-to-tr from-cyan-600 via-cyan-400 to-blue-500 border-cyan-200 text-slate-950',
          ribbon: 'from-cyan-400 to-blue-600',
        };
      case 'mythic':
        return {
          bg: 'bg-gradient-to-br from-purple-950/50 via-slate-900 to-rose-950/40 border-rose-400/80 hover:border-purple-300',
          ring: 'border-rose-400',
          glow: 'shadow-rose-500/50',
          text: 'text-rose-300',
          badgeColor: 'bg-purple-950/90 text-purple-200 border-purple-700',
          iconBg: 'bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-400 border-rose-200 text-white',
          ribbon: 'from-purple-500 to-rose-500',
        };
    }
  };

  const style = getTierStyles(badge.tier, badge.isUnlocked);

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`group relative p-3 rounded-2xl border transition-all cursor-pointer shadow-lg hover:scale-105 flex items-center gap-3 ${style.bg} ${style.glow}`}
      >
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-lg border shrink-0 ${style.iconBg}`}
        >
          {badge.isUnlocked ? badge.icon : <Lock className="w-4 h-4 text-slate-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white truncate">{badge.title}</span>
            {badge.isUnlocked ? (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                ★ Earned
              </span>
            ) : (
              <span className="text-[9px] font-bold text-slate-500">
                {badge.progressPct}%
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">{badge.subtitle}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group relative p-5 rounded-3xl border transition-all cursor-pointer shadow-xl hover:scale-[1.02] flex flex-col justify-between ${style.bg} ${style.glow}`}
    >
      {/* Top row: Medal Ribbon & XP */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Medal Emblem with 3D Ring */}
          <div className="relative">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl border-2 transition-transform group-hover:rotate-6 ${style.iconBg}`}
            >
              {badge.isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-500" />}
            </div>

            {/* Glowing Star Tag */}
            {badge.isUnlocked && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-md">
                ★
              </div>
            )}
          </div>

          <div className="text-right">
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${style.badgeColor}`}
            >
              {badge.tier} medal
            </span>
            <span className="text-[11px] font-bold text-amber-400 block mt-1">
              +{badge.xpReward} XP
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
            {badge.title}
          </h4>
          <span className="text-xs font-semibold text-cyan-300 block mt-0.5">{badge.subtitle}</span>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
            {badge.description}
          </p>
        </div>
      </div>

      {/* Progress / Status Bottom */}
      <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-400">
            {badge.isUnlocked ? 'Unlocked & Active' : `${badge.currentValueText} / ${badge.targetValueText}`}
          </span>
          <span className={badge.isUnlocked ? 'text-emerald-400' : 'text-slate-400'}>
            {badge.progressPct}%
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              badge.isUnlocked
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                : 'bg-gradient-to-r from-slate-600 to-cyan-500'
            }`}
            style={{ width: `${badge.progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// FULL MEDALS & TROPHY SHOWCASE COMPONENT
// =====================================================================

interface AchievementShowcaseProps {
  records: Record<string, DayRecord>;
  personalRecords: Record<string, number>;
  user: UserProfile;
  onNavigateLayout: (layout: AppLayout) => void;
}

export const AchievementShowcase: React.FC<AchievementShowcaseProps> = ({
  records,
  personalRecords,
  user,
  onNavigateLayout,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'protein' | 'calisthenics' | 'vitality'>('all');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadgeData | null>(null);

  const allBadges = EVALUATE_ACHIEVEMENTS(records, personalRecords, user);
  const unlockedBadges = allBadges.filter((b) => b.isUnlocked);
  const completionPct = Math.round((unlockedBadges.length / allBadges.length) * 100);

  const filteredBadges = allBadges.filter((b) => {
    if (activeCategory === 'all') return true;
    return b.category === activeCategory;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Visual Trophy Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-900/60 shadow-2xl bg-slate-900 p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-amber-950/30 z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Athlete Trophy Case & Medals
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {unlockedBadges.length} of {allBadges.length} Medals Unlocked
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Earn medals by hitting high plant protein milestones, mastering progressive calisthenics skills in the Mind-Tree, and maintaining optimal cellular hydration.
            </p>

            {/* Overall Medal Progress */}
            <div className="pt-2 max-w-md space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-amber-300">Total Medal Progress</span>
                <span className="text-slate-400">{completionPct}% Completed</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-400 transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Counter */}
          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Protein Medals</span>
              <span className="text-lg font-black text-rose-400">
                {allBadges.filter((b) => b.category === 'protein' && b.isUnlocked).length} / {allBadges.filter((b) => b.category === 'protein').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Calisthenics Medals</span>
              <span className="text-lg font-black text-cyan-400">
                {allBadges.filter((b) => b.category === 'calisthenics' && b.isUnlocked).length} / {allBadges.filter((b) => b.category === 'calisthenics').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all' as const, label: 'All Medals', icon: <Trophy className="w-3.5 h-3.5" /> },
          { id: 'protein' as const, label: '🥩 Plant Protein & Muscle', icon: <Flame className="w-3.5 h-3.5" /> },
          { id: 'calisthenics' as const, label: '🤸 Calisthenics Mastery', icon: <Dumbbell className="w-3.5 h-3.5" /> },
          { id: 'vitality' as const, label: '🛡️ Plant Vitality & Care', icon: <Shield className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border ${
              activeCategory === tab.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-950/50 scale-[1.02]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Medals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => (
          <AchievementBadge
            key={badge.id}
            badge={badge}
            onClick={() => setSelectedBadge(badge)}
          />
        ))}
      </div>

      {/* Medal Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 border-2 border-yellow-300 flex items-center justify-center text-3xl shadow-xl text-slate-950">
                  {selectedBadge.isUnlocked ? selectedBadge.icon : '🔒'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800">
                      {selectedBadge.tier} Medal
                    </span>
                    <span className="text-xs font-black text-amber-400">
                      +{selectedBadge.xpReward} XP
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">{selectedBadge.title}</h3>
                  <span className="text-xs font-bold text-cyan-300">{selectedBadge.subtitle}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Criteria & Lore */}
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Achievement Criteria
                </span>
                <p className="text-sm font-bold text-white leading-relaxed">
                  {selectedBadge.description}
                </p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Current Progress:</span>
                  <strong className={selectedBadge.isUnlocked ? 'text-emerald-400 font-extrabold' : 'text-slate-200'}>
                    {selectedBadge.currentValueText} / {selectedBadge.targetValueText} ({selectedBadge.progressPct}%)
                  </strong>
                </div>
              </div>

              {/* Science & Lore */}
              <div className="p-4 bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-950 rounded-2xl border border-rose-900/50 space-y-1">
                <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Plant Athlete Science & Strategy
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedBadge.fuelLore}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedBadge(null)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Close
              </button>

              {selectedBadge.category === 'protein' ? (
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    onNavigateLayout('bowl_studio');
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-xs hover:brightness-110 shadow-lg shadow-rose-950/50 flex items-center justify-center gap-1.5"
                >
                  <span>🥣</span> Open Bowl Studio <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : selectedBadge.category === 'calisthenics' ? (
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    onNavigateLayout('mindtree_arena');
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs hover:brightness-110 shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-1.5"
                >
                  <Dumbbell className="w-3.5 h-3.5" /> Train in Mind-Tree <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    onNavigateLayout('quest_hub');
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Open Quests <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
