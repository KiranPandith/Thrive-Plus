import React from 'react';
import { DailyCare, DayRecord, UserProfile } from '../types';
import { Droplets, Moon, Activity, Calendar, Heart, Save, Check } from 'lucide-react';

interface DailyCareViewProps {
  record: DayRecord;
  user: UserProfile;
  onUpdateCare: (care: DailyCare) => void;
}

export const DailyCareView: React.FC<DailyCareViewProps> = ({
  record,
  user,
  onUpdateCare,
}) => {
  const care = record.care || {
    waterMl: 1500,
    sleepHours: 7.5,
    sleepQuality: 'restful',
    sorenessLevel: 'mild',
    energyLevel: 4,
    cycleStatus: 'no',
    cycleFlow: '',
    notes: '',
  };

  const waterTarget = user.goals.waterMl || 3000;
  const waterPct = Math.min(100, Math.round((care.waterMl / waterTarget) * 100));

  const handleAddWater = (amount: number) => {
    onUpdateCare({
      ...care,
      waterMl: Math.max(0, (care.waterMl || 0) + amount),
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-900/60 rounded-3xl p-5 shadow-xl">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-emerald-400" /> Daily Care, Hydration & Recovery
        </span>
        <h2 className="text-xl font-extrabold text-white mt-1">
          Nourish Your Body Between Calisthenics Sessions
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Muscle recovery, joint connective tissue, and cognitive energy rely heavily on adequate hydration, quality deep sleep, and recognizing muscle soreness patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hydration Tracker */}
        <div className="bg-slate-900/80 border border-cyan-900/50 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-400" /> Hydration & Joint Lubrication
            </h3>
            <span className="text-xs font-bold text-cyan-400 tabular-nums">
              {care.waterMl} / {waterTarget} ml ({waterPct}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${waterPct}%` }}
            />
          </div>

          {/* Quick-tap glasses */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[250, 500, 750, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleAddWater(amt)}
                className="py-2.5 px-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 hover:bg-cyan-900/60 text-cyan-200 text-xs font-bold flex flex-col items-center justify-center transition-colors"
              >
                <span>+{amt}ml</span>
                <span className="text-[10px] text-cyan-400/80">Glass</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span>Manual adjustment:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAddWater(-250)}
                className="px-2 py-1 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              >
                -250ml
              </button>
              <button
                onClick={() => onUpdateCare({ ...care, waterMl: 0 })}
                className="px-2 py-1 bg-slate-800 rounded-lg text-slate-300 hover:text-rose-400"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="bg-slate-900/80 border border-violet-900/50 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Moon className="w-5 h-5 text-violet-400" /> Sleep & Cellular Rejuvenation
            </h3>
            <span className="text-xs font-bold text-violet-400 tabular-nums">
              {care.sleepHours != null ? `${care.sleepHours} hours` : 'Not recorded'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hours Slept</label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.25"
                value={care.sleepHours ?? ''}
                onChange={(e) =>
                  onUpdateCare({
                    ...care,
                    sleepHours: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder="e.g. 8.0"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Sleep Quality</label>
              <select
                value={care.sleepQuality}
                onChange={(e) =>
                  onUpdateCare({
                    ...care,
                    sleepQuality: e.target.value as DailyCare['sleepQuality'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-violet-500"
              >
                <option value="restful">Deep & Restful 🌟</option>
                <option value="okay">Moderate / Okay</option>
                <option value="restless">Restless / Toss & Turn</option>
                <option value="poor">Poor / Woke Up Fatigued</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            During deep slow-wave sleep, human growth hormone (HGH) peaks to repair microscopic muscle tears induced during your calisthenics sessions.
          </p>
        </div>

        {/* Muscle Soreness & Fatigue */}
        <div className="bg-slate-900/80 border border-amber-900/50 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" /> Muscle Soreness & Readiness
            </h3>
            <span className="text-xs font-bold text-amber-400 capitalize">
              {care.sorenessLevel} Soreness
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(['none', 'mild', 'moderate', 'high'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onUpdateCare({ ...care, sorenessLevel: lvl })}
                className={`py-2 px-1 rounded-xl text-xs font-bold capitalize border transition-all ${
                  care.sorenessLevel === lvl
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {care.sorenessLevel === 'high'
              ? 'High DOMS (delayed onset muscle soreness): Prioritize active mobility, foam rolling, 400mg plant magnesium, and extra water today.'
              : care.sorenessLevel === 'moderate'
              ? 'Moderate soreness: Prime day for light warmups or training a different muscle group (e.g. Legs if upper body is sore).'
              : 'Muscles feel fresh and ready for calisthenics progressive overload.'}
          </p>
        </div>

        {/* Gentle Cycle & Wellness Diary */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🩸</span> Private Cycle & Wellbeing Journal
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Cycle Status</label>
              <select
                value={care.cycleStatus || 'no'}
                onChange={(e) => onUpdateCare({ ...care, cycleStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-rose-500"
              >
                <option value="no">No Bleeding / Regular</option>
                <option value="period">Period Day</option>
                <option value="spotting">Spotting</option>
                <option value="na">Prefer Not to Say / N/A</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Flow</label>
              <select
                value={care.cycleFlow || ''}
                onChange={(e) => onUpdateCare({ ...care, cycleFlow: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
              >
                <option value="">Not Recorded</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Daily Notes / Symptoms</label>
            <textarea
              rows={2}
              placeholder="Any joint sensations, digestion remarks, or mood details..."
              value={care.notes || ''}
              onChange={(e) => onUpdateCare({ ...care, notes: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
