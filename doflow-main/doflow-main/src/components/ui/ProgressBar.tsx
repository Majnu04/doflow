import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'sm',
  variant = 'default',
  showLabel = false,
  label,
  className = '',
  animated = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heights = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variants = {
    default: 'bg-brand-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    gradient: 'bg-brand-gradient',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-light-textMuted dark:text-dark-muted">{label}</span>}
          {showLabel && <span className="text-xs font-semibold text-brand-primary">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-border-subtle/50 dark:bg-dark-border/50 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full ${variants[variant]} ${animated ? 'transition-all duration-700 ease-expo' : ''}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export default React.memo(ProgressBar);
