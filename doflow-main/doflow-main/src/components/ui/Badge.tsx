import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gold' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/15',
    secondary: 'bg-light-cardAlt text-light-textSecondary border border-border-subtle',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    error: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    gold: 'bg-brand-highlight text-brand-primary border border-brand-primary/10',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/60',
    neutral: 'bg-gray-100 text-gray-600 border border-gray-200/60',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const dotColors: Record<BadgeVariant, string> = {
    primary: 'bg-brand-primary',
    secondary: 'bg-light-textMuted',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    gold: 'bg-brand-accent',
    info: 'bg-sky-500',
    neutral: 'bg-gray-400',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center gap-1.5
        rounded-full font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} flex-shrink-0`} />
      )}
      {children}
    </span>
  );
};

export default React.memo(Badge);
