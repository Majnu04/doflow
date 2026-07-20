import React, { useState } from 'react';
import { FiTrendingUp, FiZap, FiAward, FiChevronRight } from 'react-icons/fi';
import { LeaderboardEntry } from '../../store/slices/gamificationSlice';
import { Avatar, Badge } from '../ui';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  period?: 'weekly' | 'monthly' | 'allTime';
  onPeriodChange?: (period: 'weekly' | 'monthly' | 'allTime') => void;
  compact?: boolean;
  maxEntries?: number;
}

const RANK_STYLES: Record<number, { bg: string; border: string; text: string; icon?: string }> = {
  1: { bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', border: 'border-amber-300', text: 'text-amber-700', icon: '🥇' },
  2: { bg: 'bg-gradient-to-r from-gray-50 to-slate-50', border: 'border-gray-300', text: 'text-gray-600', icon: '🥈' },
  3: { bg: 'bg-gradient-to-r from-orange-50 to-amber-50', border: 'border-orange-300', text: 'text-orange-700', icon: '🥉' },
};

const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  period = 'weekly',
  onPeriodChange,
  compact = false,
  maxEntries = compact ? 5 : 10,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);

  const displayEntries = entries.slice(0, maxEntries);
  const topThree = displayEntries.slice(0, 3);
  const rest = displayEntries.slice(3);

  return (
    <div className="bg-light-card border border-border-subtle rounded-2xl overflow-hidden shadow-card">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border-subtle/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-light-text flex items-center gap-2">
            <FiAward className="w-4 h-4 text-brand-primary" />
            Leaderboard
          </h3>
          {onPeriodChange && (
            <div className="flex gap-0.5 bg-light-cardAlt rounded-lg p-0.5">
              {(['weekly', 'monthly', 'allTime'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                    period === p
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-light-textMuted hover:text-light-text'
                  }`}
                >
                  {p === 'allTime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && !compact && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-end justify-center gap-2">
            {[topThree[1], topThree[0], topThree[2]].map((entry, i) => {
              const isFirst = entry.rank === 1;
              const heights = ['h-16', 'h-20', 'h-14'];
              return (
                <div
                  key={entry.userId}
                  className="flex flex-col items-center"
                  onMouseEnter={() => setHoveredRank(entry.rank)}
                  onMouseLeave={() => setHoveredRank(null)}
                >
                  <Avatar
                    src={entry.avatar}
                    name={entry.name}
                    size={isFirst ? 'lg' : 'md'}
                    showStatus={false}
                    className={isFirst ? 'ring-2 ring-amber-400' : ''}
                  />
                  <p className="text-[10px] font-bold text-light-text mt-1.5 text-center max-w-[60px] truncate">
                    {entry.name}
                  </p>
                  <p className="text-[9px] text-brand-primary font-semibold">{entry.xp} XP</p>
                  <div
                    className={`${heights[i]} w-16 mt-2 rounded-t-lg bg-gradient-to-t ${
                      isFirst ? 'from-amber-400 to-yellow-300' :
                      entry.rank === 2 ? 'from-gray-300 to-gray-200' :
                      'from-orange-300 to-orange-200'
                    } transition-all duration-300 ${hoveredRank === entry.rank ? 'scale-105' : ''}`}
                  />
                  <span className="text-lg -mt-8">{RANK_STYLES[entry.rank]?.icon}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List */}
      <div className="divide-y divide-border-subtle/30">
        {(compact ? displayEntries : rest).map((entry) => {
          const rankStyle = RANK_STYLES[entry.rank];
          const isCurrentUser = entry.userId === user?._id || entry.isCurrentUser;

          return (
            <div
              key={entry.userId}
              className={`
                flex items-center gap-3 px-4 py-2.5 transition-colors duration-200
                ${rankStyle?.bg || ''}
                ${isCurrentUser ? 'bg-brand-primary/5 ring-1 ring-brand-primary/20' : ''}
                hover:bg-light-cardAlt/60
              `}
            >
              <span className={`text-xs font-bold w-6 text-center ${rankStyle?.text || 'text-light-textMuted'}`}>
                {rankStyle?.icon || `#${entry.rank}`}
              </span>

              <Avatar
                src={entry.avatar}
                name={entry.name}
                size="sm"
                showStatus={false}
              />

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-light-text truncate">
                  {entry.name}
                  {isCurrentUser && (
                    <span className="ml-1.5 text-[9px] text-brand-primary">(You)</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 text-[10px] flex-shrink-0">
                <span className="flex items-center gap-0.5 text-amber-600">
                  <FiZap className="w-3 h-3" />
                  {entry.xp}
                </span>
                <span className="flex items-center gap-0.5 text-orange-500">
                  <FiTrendingUp className="w-3 h-3" />
                  {entry.streak}d
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length > maxEntries && (
        <div className="p-3 text-center border-t border-border-subtle/50">
          <button className="text-[11px] text-brand-primary font-medium flex items-center gap-1 mx-auto hover:gap-2 transition-all">
            View full leaderboard <FiChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {entries.length === 0 && (
        <div className="p-8 text-center">
          <FiAward className="w-8 h-8 text-light-textMuted mx-auto mb-2" />
          <p className="text-xs text-light-textMuted">No leaderboard data yet</p>
          <p className="text-[10px] text-light-textMuted/70 mt-1">Complete lessons to start climbing</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(Leaderboard);
