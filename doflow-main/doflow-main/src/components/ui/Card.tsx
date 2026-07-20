import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'subtle' | 'glass' | 'elevated' | 'interactive';
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  onClick,
  padding = 'md',
}) => {
  const variants = {
    default: 'bg-light-card border border-border-subtle shadow-card dark:bg-dark-card dark:border-dark-border dark:shadow-none',
    bordered: 'bg-light-card border-2 border-brand-primary/20 shadow-xs dark:bg-dark-card dark:border-dark-border dark:shadow-none',
    subtle: 'bg-light-cardAlt border border-border-subtle/60 dark:bg-dark-card dark:border-dark-border/60',
    glass: 'bg-white/80 border border-white/50 backdrop-blur-xl shadow-lg inner-glow dark:bg-dark-card/80 dark:border-white/5 dark:shadow-none',
    elevated: 'bg-light-card border border-border-subtle shadow-elevated dark:bg-dark-card dark:border-dark-border dark:shadow-none',
    interactive: 'bg-light-card border border-border-subtle shadow-card cursor-pointer dark:bg-dark-card dark:border-dark-border dark:shadow-none',
  } as const;

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5 md:p-6',
    lg: 'p-7 md:p-8',
  };

  const hoverStyles = hover
    ? 'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-brand-primary/30 transition-all duration-[220ms] ease-[cubic-bezier(0.33,1,0.68,1)] cursor-pointer'
    : '';

  const interactiveStyles = variant === 'interactive'
    ? 'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-brand-primary/30 active:translate-y-0 transition-all duration-[220ms] ease-[cubic-bezier(0.33,1,0.68,1)] cursor-pointer'
    : '';

  return (
    <div
      className={`
        ${variants[variant]}
        rounded-xl
        ${paddings[padding]}
        ${variant === 'interactive' ? interactiveStyles : hoverStyles}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
};

export default React.memo(Card);
