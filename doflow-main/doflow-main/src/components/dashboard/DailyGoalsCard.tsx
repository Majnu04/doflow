import React from 'react';
import { DailyGoal } from '../../store/slices/gamificationSlice';
import { FiBookOpen, FiCode, FiClock, FiZap, FiCheck } from 'react-icons/fi';

interface DailyGoalsCardProps {
  goals: DailyGoal[];
}

const goalIcons = {
  lessons: <FiBookOpen className="w-4 h-4" />,
  problems: <FiCode className="w-4 h-4" />,
  minutes: <FiClock className="w-4 h-4" />,
  streak: <FiZap className="w-4 h-4" />,
};

const goalColors = {
  lessons: 'text-sky-600 bg-sky-50',
  problems: 'text-emerald-600 bg-emerald-50',
  minutes: 'text-amber-600 bg-amber-50',
  streak: 'text-orange-600 bg-orange-50',
};

const DailyGoalsCard: React.FC<DailyGoalsCardProps> = ({ goals }) => {
  const completedCount = goals.filter(g => g.current >= g.target).length;

  return (
    <div className="bg-light-card border border-border-subtle rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-light-text">Daily Goals</h3>
        <span className="text-xs text-light-textMuted">
          {completedCount}/{goals.length} completed
        </span>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const isCompleted = goal.current >= goal.target;

          return (
            <div key={goal.id} className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${goalColors[goal.type]} flex-shrink-0`}>
                {isCompleted ? <FiCheck className="w-4 h-4" /> : goalIcons[goal.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-light-text truncate">{goal.title}</span>
                  <span className="text-[10px] text-light-textMuted ml-2 flex-shrink-0">
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-border-subtle/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-expo ${
                      isCompleted ? 'bg-emerald-500' : 'bg-brand-primary'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(DailyGoalsCard);
