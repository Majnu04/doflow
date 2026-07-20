import React from 'react';
import { FiPlay, FiClock, FiCheckCircle, FiBookOpen } from 'react-icons/fi';
import { ProgressBar } from '../ui';

interface CourseProgressCardProps {
  courseId: string;
  title: string;
  thumbnail?: string;
  instructor?: string;
  completedLessons: number;
  totalLessons: number;
  lastAccessed?: string;
  onClick?: () => void;
}

const CourseProgressCard: React.FC<CourseProgressCardProps> = ({
  courseId,
  title,
  thumbnail,
  instructor,
  completedLessons,
  totalLessons,
  lastAccessed,
  onClick,
}) => {
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isComplete = progress === 100;

  return (
    <button
      onClick={onClick}
      className="premium-card group text-left flex gap-4 p-4 w-full"
    >
      <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-accent/10 flex items-center justify-center">
            <FiBookOpen className="w-6 h-6 text-brand-primary/40" />
          </div>
        )}
        {isComplete && (
          <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center">
            <FiCheckCircle className="w-6 h-6 text-white" />
          </div>
        )}
        {!isComplete && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <FiPlay className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-light-text truncate group-hover:text-brand-primary transition-colors">
          {title}
        </h4>
        {instructor && (
          <p className="text-[11px] text-light-textMuted mt-0.5 truncate">{instructor}</p>
        )}

        <div className="mt-2.5">
          <ProgressBar
            value={progress}
            variant={isComplete ? 'success' : 'brand'}
            size="sm"
            showLabel
            label={`${completedLessons}/${totalLessons}`}
          />
        </div>

        {lastAccessed && !isComplete && (
          <p className="text-[10px] text-light-textMuted mt-1.5 flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            Last accessed {lastAccessed}
          </p>
        )}
        {isComplete && (
          <p className="text-[10px] text-emerald-500 font-medium mt-1.5 flex items-center gap-1">
            <FiCheckCircle className="w-3 h-3" />
            Course completed
          </p>
        )}
      </div>
    </button>
  );
};

export default React.memo(CourseProgressCard);
