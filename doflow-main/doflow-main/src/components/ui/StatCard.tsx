import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  accent?: string;
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel = 'vs last period',
  accent = 'bg-brand-primary/10 text-brand-primary',
  onClick,
  className = '',
}) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={`
        stat-card
        ${onClick ? 'cursor-pointer hover:border-brand-primary/30' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${accent}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`
            inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
            ${isPositive
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
              : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
            }
          `}>
            <svg
              className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">{value}</p>
        <p className="text-xs text-light-textMuted dark:text-dark-muted mt-0.5">{title}</p>
        {change !== undefined && (
          <p className="text-[10px] text-light-textMuted/60 dark:text-dark-muted/60 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
};

export default React.memo(StatCard);
