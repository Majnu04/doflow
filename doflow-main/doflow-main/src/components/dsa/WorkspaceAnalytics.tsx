import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FiZap, FiTrendingUp, FiCalendar, FiStar, FiAward } from 'react-icons/fi';

interface WorkspaceAnalyticsProps {
  solvedProblems: number;
  totalProblems: number;
  currentStreak: number;
  xp: number;
  acceptanceRate: number;
  difficultyBreakdown: {
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
  };
}

const WorkspaceAnalytics: React.FC<WorkspaceAnalyticsProps> = ({
  solvedProblems,
  totalProblems,
  currentStreak,
  xp,
  acceptanceRate,
  difficultyBreakdown,
}) => {
  const progressPercent = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress Ring */}
      <div className="bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-2xl p-5">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 flex-shrink-0">
            <CircularProgressbar
              value={progressPercent}
              text={`${progressPercent}%`}
              styles={buildStyles({
                textSize: '24px',
                textColor: 'var(--tw-text-color, #1F232E)',
                pathColor: '#e06438',
                trailColor: '#e5ddd2',
              })}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-light-text dark:text-dark-text">
              {solvedProblems}/{totalProblems} solved
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-light-textSecondary dark:text-dark-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> {difficultyBreakdown.easy.solved}E
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> {difficultyBreakdown.medium.solved}M
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> {difficultyBreakdown.hard.solved}H
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <FiZap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-muted">Streak</span>
          </div>
          <p className="text-lg font-bold text-light-text dark:text-dark-text">{currentStreak} days</p>
        </div>
        <div className="bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <FiTrendingUp className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-muted">Acceptance</span>
          </div>
          <p className="text-lg font-bold text-light-text dark:text-dark-text">{acceptanceRate.toFixed(1)}%</p>
        </div>
        <div className="bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <FiAward className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-muted">XP Earned</span>
          </div>
          <p className="text-lg font-bold text-light-text dark:text-dark-text">{xp.toLocaleString()}</p>
        </div>
        <div className="bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <FiStar className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-muted">Rating</span>
          </div>
          <p className="text-lg font-bold text-light-text dark:text-dark-text">—</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(WorkspaceAnalytics);
