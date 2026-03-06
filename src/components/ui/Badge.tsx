import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gold';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  size = 'md',
  className = '',
}) => {
  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-brand-accentSoft text-brand-primary border border-brand-primary/20',
    secondary: 'bg-light-cardAlt text-light-textSecondary border border-border-subtle',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-rose-50 text-rose-700 border border-rose-200',
    gold: 'bg-brand-highlight text-brand-primary border border-brand-primary/10',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const variantClass = variant ? variants[variant] : '';

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full font-medium
        ${variantClass}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
