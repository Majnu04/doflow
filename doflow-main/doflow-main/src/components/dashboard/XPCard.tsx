import React from 'react';
import { XPData } from '../../store/slices/gamificationSlice';
import { FiZap } from 'react-icons/fi';

interface XPCardProps {
  xp: XPData | null;
}

const XPCard: React.FC<XPCardProps> = ({ xp }) => {
  const level = xp?.level || 1;
  const totalXP = xp?.totalXP || 0;
  const xpToNext = xp?.xpToNextLevel || 100;
  const xpThisWeek = xp?.xpThisWeek || 0;
  const progress = xpToNext > 0 ? (totalXP % xpToNext) / xpToNext * 100 : 0;

  const getLevelTitle = (lvl: number) => {
    if (lvl >= 50) return 'Grandmaster';
    if (lvl >= 30) return 'Master';
    if (lvl >= 20) return 'Expert';
    if (lvl >= 10) return 'Advanced';
    if (lvl >= 5) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div className="bg-light-card border border-border-subtle rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-light-text">Experience Points</h3>
        <span className="text-xs text-light-textMuted">+{xpThisWeek} this week</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/20">
          <FiZap className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-light-text">{totalXP.toLocaleString()}</p>
            <span className="text-xs text-light-textMuted">XP</span>
          </div>
          <p className="text-xs text-light-textMuted">Level {level} · {getLevelTitle(level)}</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-light-textMuted">Level {level}</span>
          <span className="text-light-textMuted">Level {level + 1}</span>
        </div>
        <div className="h-2 bg-border-subtle/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-700 ease-expo"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-light-textMuted text-right">
          {xpToNext - (totalXP % xpToNext)} XP to next level
        </p>
      </div>
    </div>
  );
};

export default React.memo(XPCard);
