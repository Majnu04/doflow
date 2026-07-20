import React from 'react';
import { Activity } from '../../store/slices/gamificationSlice';
import { FiBookOpen, FiCode, FiShoppingCart, FiAward, FiStar, FiClock } from 'react-icons/fi';

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityIcons: Record<string, React.ReactNode> = {
  lesson_completed: <FiBookOpen className="w-3.5 h-3.5" />,
  problem_solved: <FiCode className="w-3.5 h-3.5" />,
  course_enrolled: <FiShoppingCart className="w-3.5 h-3.5" />,
  certificate_earned: <FiAward className="w-3.5 h-3.5" />,
  achievement_unlocked: <FiStar className="w-3.5 h-3.5" />,
};

const activityColors: Record<string, string> = {
  lesson_completed: 'text-sky-600 bg-sky-50',
  problem_solved: 'text-emerald-600 bg-emerald-50',
  course_enrolled: 'text-violet-600 bg-violet-50',
  certificate_earned: 'text-amber-600 bg-amber-50',
  achievement_unlocked: 'text-rose-600 bg-rose-50',
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en', { month: 'short', day: 'numeric' });
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="bg-light-card border border-border-subtle rounded-2xl p-5 shadow-card">
        <h3 className="text-sm font-bold text-light-text mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <FiClock className="w-8 h-8 text-light-textMuted/40 mx-auto mb-2" />
          <p className="text-sm text-light-textMuted">No recent activity</p>
          <p className="text-xs text-light-textMuted/60">Start learning to see your activity here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-card border border-border-subtle rounded-2xl p-5 shadow-card">
      <h3 className="text-sm font-bold text-light-text mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.slice(0, 8).map((activity, i) => (
          <div key={activity.id || i} className="flex items-start gap-3">
            <div className={`p-1.5 rounded-lg ${activityColors[activity.type] || 'text-gray-500 bg-gray-50'} flex-shrink-0 mt-0.5`}>
              {activityIcons[activity.type] || <FiClock className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-light-text truncate">{activity.title}</p>
              <p className="text-[10px] text-light-textMuted">{formatTimeAgo(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
