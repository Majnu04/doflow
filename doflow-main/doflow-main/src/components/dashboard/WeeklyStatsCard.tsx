import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

interface DayStats {
  day: string;
  lessons: number;
  problems: number;
  minutes: number;
}

interface WeeklyStatsCardProps {
  stats: DayStats[];
}

const WeeklyStatsCard: React.FC<WeeklyStatsCardProps> = ({ stats }) => {
  const maxMinutes = Math.max(...stats.map(s => s.minutes), 1);
  const totalLessons = stats.reduce((acc, s) => acc + s.lessons, 0);
  const totalProblems = stats.reduce((acc, s) => acc + s.problems, 0);
  const totalMinutes = stats.reduce((acc, s) => acc + s.minutes, 0);

  return (
    <div className="bg-light-card border border-border-subtle rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-light-text">This Week</h3>
        <div className="flex items-center gap-1 text-xs text-light-textMuted">
          <FiTrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          {totalMinutes > 0 ? 'Active' : 'Get started'}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-2 h-28 mb-4">
        {stats.map((stat, i) => {
          const height = maxMinutes > 0 ? (stat.minutes / maxMinutes) * 100 : 0;
          const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0);
          return (
            <div key={stat.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ease-expo min-h-[2px] ${
                    isToday ? 'bg-gradient-to-t from-brand-primary to-brand-accent' :
                    height > 0 ? 'bg-brand-primary/30' : 'bg-border-subtle/30'
                  }`}
                  style={{ height: `${Math.max(height, 3)}%` }}
                />
              </div>
              <span className={`text-[9px] font-medium ${isToday ? 'text-brand-primary' : 'text-light-textMuted'}`}>
                {stat.day.charAt(0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border-subtle/40">
        <div className="text-center">
          <p className="text-lg font-bold text-light-text">{totalLessons}</p>
          <p className="text-[10px] text-light-textMuted">Lessons</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-light-text">{totalProblems}</p>
          <p className="text-[10px] text-light-textMuted">Problems</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-light-text">{totalMinutes}</p>
          <p className="text-[10px] text-light-textMuted">Minutes</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(WeeklyStatsCard);
