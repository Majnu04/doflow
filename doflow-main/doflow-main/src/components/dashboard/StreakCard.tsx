import React from 'react';
import { StreakData } from '../../store/slices/gamificationSlice';
import { FiZap } from 'react-icons/fi';

interface StreakCardProps {
  streak: StreakData | null;
}

const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const history = streak?.streakHistory || [];

  const getStreakColor = () => {
    if (currentStreak >= 30) return 'from-orange-500 to-red-500';
    if (currentStreak >= 14) return 'from-orange-400 to-orange-600';
    if (currentStreak >= 7) return 'from-amber-400 to-orange-500';
    if (currentStreak >= 3) return 'from-amber-300 to-amber-500';
    return 'from-gray-300 to-gray-400';
  };

  return (
    <div className="bg-light-card border border-border-subtle rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-light-text">Study Streak</h3>
        <span className="text-xs text-light-textMuted">Best: {longestStreak} days</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={`relative p-3 bg-gradient-to-br ${getStreakColor()} rounded-2xl shadow-lg`}>
          <FiZap className="w-8 h-8 text-white" />
          {currentStreak >= 7 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[8px]">✨</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-3xl font-bold text-light-text">{currentStreak}</p>
          <p className="text-xs text-light-textMuted">
            {currentStreak === 0 ? 'Start your streak today!' :
             currentStreak === 1 ? 'day streak' : 'day streak'}
          </p>
        </div>
      </div>

      {/* 7-day history */}
      <div className="flex items-end gap-1.5">
        {history.slice(-7).map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`
              w-full h-6 rounded-md transition-all duration-300
              ${day.active
                ? 'bg-gradient-to-t from-brand-primary to-brand-accent'
                : 'bg-border-subtle/40'
              }
            `} />
            <span className="text-[9px] text-light-textMuted">
              {new Date(day.date).toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(StreakCard);
