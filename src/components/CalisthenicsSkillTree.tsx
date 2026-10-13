import React, { useState, useEffect } from 'react';
import { CalisthenicsBranch, CalisthenicsExercise, DayRecord, LoggedWorkoutExercise, UserProfile } from '../types';
import { CALISTHENICS_EXERCISES } from '../data/calisthenicsTree';
import { ASSET_IMAGES } from '../assets/images';
import { playCountdownBeep, playCelebrationChime } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Dumbbell,
  CheckCircle2,
  Lock,
  Play,
  Trophy,
  Flame,
  Zap,
  Clock,
  Sparkles,
  Network,
  ListTree,
  Star,
  Check,
  ChevronRight,
} from 'lucide-react';

interface CalisthenicsSkillTreeProps {
  record: DayRecord;
  user: UserProfile;
  personalRecords: Record<string, number>;
  onSaveWorkout: (workout: LoggedWorkoutExercise) => void;
  onUpdatePersonalRecord: (exerciseId: string, bestReps: number) => void;
}

export const CalisthenicsSkillTree: React.FC<CalisthenicsSkillTreeProps> = ({
  record,
  user,
  personalRecords,
  onSaveWorkout,
  onUpdatePersonalRecord,
}) => {
  const [activeBranch, setActiveBranch] = useState<CalisthenicsBranch>('push');
  const [viewMode, setViewMode] = useState<'mindtree' | 'cards'>('mindtree');
  const [activeExercise, setActiveExercise] = useState<CalisthenicsExercise | null>(null);

  // Active workout session state
  const [sessionSets, setSessionSets] = useState<{ setNum: number; repsOrSec: number; completed: boolean }[]>([
    { setNum: 1, repsOrSec: 10, completed: false },
    { setNum: 2, repsOrSec: 10, completed: false },
    { setNum: 3, repsOrSec: 10, completed: false },
  ]);

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Calculate User XP & Calisthenics Warrior Level
  const branchExercises = CALISTHENICS_EXERCISES.filter((ex) => ex.branch === activeBranch);

  const isExerciseUnlocked = (ex: CalisthenicsExercise): boolean => {
    if (!ex.prerequisiteId) return true; // Root tier
    const parentPr = personalRecords[ex.prerequisiteId] || 0;
    const parentEx = CALISTHENICS_EXERCISES.find((p) => p.id === ex.prerequisiteId);
    if (!parentEx) return true;
    // Unlocked if parent was logged or reached 60% of PR criteria
    return parentPr >= Math.floor(parentEx.prCriteria * 0.6) || parentPr > 0;
  };

  const isExerciseMastered = (ex: CalisthenicsExercise): boolean => {
    const pr = personalRecords[ex.id] || 0;
    return pr >= ex.prCriteria;
  };

  // Total XP across all recorded PRs
  const totalXP = Object.entries(personalRecords).reduce((acc, [exId, reps]) => {
    const ex = CALISTHENICS_EXERCISES.find((e) => e.id === exId);
    if (!ex || reps <= 0) return acc;
    const ratio = Math.min(1.5, reps / ex.prCriteria);
    return acc + Math.round(ex.xpReward * ratio);
  }, 0);

  const warriorLevel = Math.max(1, Math.floor(totalXP / 350) + 1);
  const currentLevelXP = totalXP % 350;
  const levelProgressPct = Math.min(100, Math.round((currentLevelXP / 350) * 100));

  // Timer countdown hook
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 4 && prev > 1) {
            playCountdownBeep(false);
          } else if (prev === 1) {
            playCountdownBeep(true);
            playCelebrationChime();
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const startRestTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const stopRestTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleLaunchExercise = (ex: CalisthenicsExercise) => {
    if (!isExerciseUnlocked(ex)) {
      alert(`🔒 Locked! Train and hit targets on "${CALISTHENICS_EXERCISES.find(p => p.id === ex.prerequisiteId)?.name}" first to unlock this skill node.`);
      return;
    }
    setActiveExercise(ex);
    const setsCount = ex.recommendedSets || 3;
    const defaultReps = ex.recommendedTarget || 10;
    setSessionSets(
      Array.from({ length: setsCount }, (_, i) => ({
        setNum: i + 1,
        repsOrSec: defaultReps,
        completed: false,
      }))
    );
  };

  const handleToggleSet = (index: number) => {
    const updated = [...sessionSets];
    const wasCompleted = updated[index].completed;
    updated[index].completed = !wasCompleted;
    setSessionSets(updated);

    if (!wasCompleted) {
      const currentReps = updated[index].repsOrSec;
      const currentPr = personalRecords[activeExercise?.id || ''] || 0;

      if (currentReps > currentPr && activeExercise) {
        onUpdatePersonalRecord(activeExercise.id, currentReps);
        playCelebrationChime();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#06B6D4', '#F59E0B', '#F43F5E'],
        });
      }

      startRestTimer(60);
    }
  };

  const handleSaveSession = () => {
    if (!activeExercise) return;
    const completedSets = sessionSets.filter((s) => s.completed);
    if (completedSets.length === 0) {
      alert('Please mark at least one completed set before saving.');
      return;
    }

    onSaveWorkout({
      exerciseId: activeExercise.id,
      branch: activeExercise.branch,
      tier: activeExercise.tier,
      sets: sessionSets,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    playCelebrationChime();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    setActiveExercise(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Pictorial Hero Card with Level & Mind-Tree Art */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-800/60 shadow-2xl bg-slate-900 group">
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity">
          <img
            src={ASSET_IMAGES.mindTreeArt}
            alt="Calisthenics Mind Tree"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent z-10" />

        <div className="relative z-20 p-5 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Skill Mind-Tree Progression
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">
                {totalXP} Total XP
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Level {warriorLevel} Calisthenics Master
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every unlocked movement opens new branching paths. Build the foundation, master clean bodyweight leverage, and fuel recovery with high plant protein!
            </p>

            {/* Level XP Progress Bar */}
            <div className="pt-2 max-w-md space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-cyan-300">Level {warriorLevel} Progress</span>
                <span className="text-slate-400">{currentLevelXP} / 350 XP to Level {warriorLevel + 1}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950/90 border border-slate-700/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 transition-all duration-700"
                  style={{ width: `${levelProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3 shrink-0">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-700/80 rounded-2xl shadow-inner">
              <button
                onClick={() => setViewMode('mindtree')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'mindtree'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" /> Mind-Tree Map
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" /> Pathway Cards
              </button>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Completed Today</span>
              <span className="text-sm font-extrabold text-cyan-300">
                {record.workouts.length} Movements · {record.workouts.reduce((acc, w) => acc + w.sets.filter((s) => s.completed).length, 0)} Sets
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Tabs: Push / Pull / Legs / Core */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { id: 'push' as const, label: 'Push Constellation', icon: '⚡', color: 'from-cyan-500 to-blue-600', muscles: 'Chest · Triceps · Delts' },
          { id: 'pull' as const, label: 'Pull Constellation', icon: '🧗', color: 'from-amber-500 to-rose-600', muscles: 'Lats · Biceps · Rhomboids' },
          { id: 'legs' as const, label: 'Legs Constellation', icon: '🦵', color: 'from-emerald-500 to-teal-600', muscles: 'Quads · Glutes · Pistol' },
          { id: 'core' as const, label: 'Core Constellation', icon: '🔥', color: 'from-violet-500 to-indigo-600', muscles: 'Hollow · Abs · L-Sit' },
        ].map((branch) => {
          const isActive = activeBranch === branch.id;
          const branchTotal = CALISTHENICS_EXERCISES.filter((e) => e.branch === branch.id).length;
          const branchMastered = CALISTHENICS_EXERCISES.filter((e) => e.branch === branch.id && isExerciseMastered(e)).length;

          return (
            <button
              key={branch.id}
              onClick={() => setActiveBranch(branch.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all ${
                isActive
                  ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-950/50 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{branch.icon}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {branchMastered}/{branchTotal} Mastered
                </span>
              </div>
              <div className="font-extrabold text-sm text-white mt-2">{branch.label}</div>
              <div className="text-[11px] text-slate-400">{branch.muscles}</div>
            </button>
          );
        })}
      </div>

      {/* VIEW MODE 1: VISUAL MIND-TREE RPG CONSTELLATION MAP */}
      {viewMode === 'mindtree' && (
        <div className="bg-slate-950 border border-cyan-900/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>🌌</span> {activeBranch.toUpperCase()} Mind-Tree Network
              </h3>
              <p className="text-xs text-slate-400">
                Click any unlocked node to start training. Completing sets powers up the next branch node!
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-500" /> Mastered</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Unlocked</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" /> Locked</span>
            </div>
          </div>

          {/* Dynamic SVG MindTree Canvas */}
          <div className="relative w-full overflow-x-auto pb-4 scrollbar-none">
            <div className="min-w-[850px] sm:min-w-[950px] relative h-[360px] p-4">
              {/* SVG Connecting Branch Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <linearGradient id="unlockedBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="lockedBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                </defs>

                {branchExercises.map((ex) => {
                  if (!ex.prerequisiteId) return null;
                  const parent = branchExercises.find((p) => p.id === ex.prerequisiteId);
                  if (!parent) return null;

                  const isConnUnlocked = isExerciseUnlocked(ex);
                  const isConnMastered = isExerciseMastered(parent);

                  return (
                    <g key={`conn-${parent.id}-${ex.id}`}>
                      <line
                        x1={parent.mindTreeCoords.x + 36}
                        y1={parent.mindTreeCoords.y + 36}
                        x2={ex.mindTreeCoords.x + 36}
                        y2={ex.mindTreeCoords.y + 36}
                        stroke={isConnMastered ? '#10B981' : isConnUnlocked ? '#06B6D4' : '#334155'}
                        strokeWidth={isConnUnlocked ? 3.5 : 2}
                        strokeDasharray={isConnUnlocked ? 'none' : '4,4'}
                        className={isConnUnlocked ? 'transition-all duration-700' : ''}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Node Bubbles */}
              {branchExercises.map((ex) => {
                const unlocked = isExerciseUnlocked(ex);
                const mastered = isExerciseMastered(ex);
                const pr = personalRecords[ex.id] || 0;
                const isLoggedToday = record.workouts.some((w) => w.exerciseId === ex.id);

                return (
                  <div
                    key={ex.id}
                    style={{
                      left: `${ex.mindTreeCoords.x}px`,
                      top: `${ex.mindTreeCoords.y}px`,
                    }}
                    onClick={() => handleLaunchExercise(ex)}
                    className={`absolute z-10 w-[72px] h-[72px] rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                      mastered
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-2 border-emerald-300 shadow-xl shadow-emerald-500/40 hover:scale-110'
                        : unlocked
                        ? isLoggedToday
                          ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 border-2 border-cyan-300 shadow-xl shadow-cyan-500/40 hover:scale-110 animate-pulse'
                          : 'bg-slate-900 border-2 border-cyan-500/80 hover:border-cyan-300 shadow-lg shadow-cyan-950/50 hover:scale-110'
                        : 'bg-slate-950 border border-slate-800 opacity-60 hover:opacity-80'
                    }`}
                  >
                    {/* Pictorial Icon */}
                    <span className="text-2xl filter drop-shadow">{ex.pictorialIcon}</span>

                    {/* Status badge */}
                    <div className="absolute -top-1.5 -right-1.5">
                      {mastered ? (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow">
                          ★
                        </div>
                      ) : !unlocked ? (
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow">
                          ⚡
                        </div>
                      )}
                    </div>

                    {/* Tooltip on node hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-14 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-center pointer-events-none shadow-2xl z-30 whitespace-nowrap">
                      <div className="text-xs font-bold">{ex.name}</div>
                      <div className="text-[10px] text-cyan-300">
                        {mastered ? `Mastered (${pr} reps)` : unlocked ? `Tap to Train (+${ex.xpReward} XP)` : 'Requires parent milestone'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: PATHWAY CARDS WITH PICTORIAL DETAILS */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <span>📜</span> {activeBranch.toUpperCase()} Movement Disciplines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branchExercises.map((ex) => {
            const unlocked = isExerciseUnlocked(ex);
            const mastered = isExerciseMastered(ex);
            const pr = personalRecords[ex.id] || 0;
            const isLoggedToday = record.workouts.some((w) => w.exerciseId === ex.id);

            return (
              <div
                key={ex.id}
                className={`bg-slate-900/90 border rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all hover:border-slate-700 ${
                  mastered
                    ? 'border-emerald-600/70 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30'
                    : unlocked
                    ? 'border-slate-800 hover:border-cyan-500/60'
                    : 'border-slate-800/60 opacity-60 bg-slate-950/60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-2xl border border-slate-800 shadow-inner shrink-0">
                        {ex.pictorialIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                            Tier {ex.tier}
                          </span>
                          {mastered && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.2 rounded-full border border-amber-800/60 flex items-center gap-0.5">
                              ★ Mastered
                            </span>
                          )}
                          {!unlocked && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.2 rounded-full flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Locked
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-extrabold text-white mt-0.5">{ex.name}</h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 rounded-xl px-2.5 py-1 inline-block">
                        +{ex.xpReward} XP
                      </span>
                    </div>
                  </div>

                  {/* Muscles */}
                  <div className="flex flex-wrap gap-1">
                    {ex.targetMuscles.map((m) => (
                      <span key={m} className="text-[10px] font-semibold text-slate-300 bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5">
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Form cues */}
                  <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/80 space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Execution Cues
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {ex.formCues.map((cue, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                          <span className="text-cyan-400 shrink-0">·</span>
                          <span>{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Post-Workout Fuel Pairing */}
                  <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-3 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-400" /> Post-Workout Plant Fuel
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {ex.postWorkoutFuelTip}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    PR: <strong className="text-white">{pr > 0 ? `${pr} reps` : 'None yet'}</strong> · Goal: {ex.recommendedTarget}
                  </div>

                  <button
                    onClick={() => handleLaunchExercise(ex)}
                    disabled={!unlocked}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      !unlocked
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : isLoggedToday
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white'
                    }`}
                  >
                    {!unlocked ? (
                      <>
                        <Lock className="w-3 h-3" /> Locked
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        {isLoggedToday ? 'Train Again' : 'Start Session'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE WORKOUT SESSION MODAL */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-900/60 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeExercise.pictorialIcon}</span>
                <div>
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                    Tier {activeExercise.tier} · {activeExercise.branch.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-extrabold text-white">{activeExercise.name}</h3>
                </div>
              </div>

              <button
                onClick={() => setActiveExercise(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Rest Timer Widget */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Rest Interval Timer</span>
                  <span className="text-[11px] text-slate-400">
                    {isTimerRunning ? 'Resting between sets...' : 'Ready for next set'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isTimerRunning ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-amber-400 tabular-nums animate-pulse">
                      {timerSeconds}s
                    </span>
                    <button
                      onClick={stopRestTimer}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                    >
                      Skip
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {[30, 60, 90, 120].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => startRestTimer(sec)}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Set by Set Logger */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Log Sets & Reps
              </span>

              <div className="space-y-2">
                {sessionSets.map((s, idx) => (
                  <div
                    key={s.setNum}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      s.completed
                        ? 'bg-emerald-950/40 border-emerald-500'
                        : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                        #{s.setNum}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={s.repsOrSec}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            const updated = [...sessionSets];
                            updated[idx].repsOrSec = val;
                            setSessionSets(updated);
                          }}
                          className="w-16 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm text-center focus:border-cyan-500 outline-none"
                        />
                        <span className="text-xs text-slate-400">
                          {activeExercise.metricType === 'hold_sec' ? 'seconds' : 'reps'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSet(idx)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        s.completed
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {s.completed ? 'Done' : 'Mark Done'}
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  setSessionSets([
                    ...sessionSets,
                    {
                      setNum: sessionSets.length + 1,
                      repsOrSec: activeExercise.recommendedTarget || 10,
                      completed: false,
                    },
                  ])
                }
                className="w-full py-2 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-semibold"
              >
                ＋ Add Extra Set
              </button>
            </div>

            {/* Post-Workout Nutrition Fuel Reminder */}
            <div className="p-3.5 bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-950 rounded-2xl border border-rose-900/50 text-xs space-y-1">
              <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> Post-Session Leucine & Protein Recommendation
              </span>
              <p className="text-[11px] text-slate-300">
                {activeExercise.postWorkoutFuelTip}
              </p>
            </div>

            {/* Modal Bottom Save */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setActiveExercise(null)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSession}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-950/50"
              >
                Save Workout (+{activeExercise.xpReward} XP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
