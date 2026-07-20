import React, { useEffect, useState } from 'react';
import { FaCheck, FaStar, FaFire, FaBolt, FaTrophy } from 'react-icons/fa';

interface MilestoneBadgeProps {
  type: 'lesson-complete' | 'module-complete' | 'streak' | 'xp-milestone' | 'course-complete';
  message?: string;
  duration?: number;
  onDismiss?: () => void;
}

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  'lesson-complete': {
    icon: <FaCheck className="w-5 h-5" />,
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  'module-complete': {
    icon: <FaStar className="w-5 h-5" />,
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  'streak': {
    icon: <FaFire className="w-5 h-5" />,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  'xp-milestone': {
    icon: <FaBolt className="w-5 h-5" />,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  'course-complete': {
    icon: <FaTrophy className="w-5 h-5" />,
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
};

const DEFAULT_MESSAGES: Record<string, string> = {
  'lesson-complete': 'Lesson Completed!',
  'module-complete': 'Module Mastered!',
  'streak': 'Streak Maintained!',
  'xp-milestone': 'XP Milestone Reached!',
  'course-complete': 'Course Complete!',
};

const MilestoneBadge: React.FC<MilestoneBadgeProps> = ({
  type,
  message,
  duration = 2500,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);
  const config = BADGE_CONFIG[type] || BADGE_CONFIG['lesson-complete'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes milestone-slide-in {
          0% { transform: translateY(-20px) scale(0.9); opacity: 0; }
          60% { transform: translateY(4px) scale(1.02); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes milestone-slide-out {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-20px) scale(0.9); opacity: 0; }
        }
        @keyframes milestone-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(224, 100, 56, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(224, 100, 56, 0); }
        }
      `}</style>
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] ${config.bg} ${config.border} border rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3`}
        style={{ animation: 'milestone-slide-in 0.4s ease-out forwards, milestone-pulse 1s ease-in-out 0.4s 2' }}
      >
        <div className={`${config.color}`}>
          {config.icon}
        </div>
        <span className={`font-bold text-sm ${config.color}`}>
          {message || DEFAULT_MESSAGES[type]}
        </span>
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
      </div>
    </>
  );
};

export default MilestoneBadge;
