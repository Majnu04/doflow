import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'soft' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  fullWidth = false,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center gap-2 font-semibold tracking-tight rounded-lg transition-all duration-[220ms] ease-[cubic-bezier(0.33,1,0.68,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-brand-primary text-white shadow-brand hover:bg-brand-primaryHover hover:shadow-brand-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-brand',
    secondary: 'bg-brand-accentSoft text-brand-primary hover:bg-brand-accent/20 shadow-xs hover:shadow-sm',
    gold: 'bg-brand-accent text-white shadow-lg shadow-brand-accent/30 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0',
    outline: 'border border-border-subtle text-light-text hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 hover:shadow-sm dark:border-dark-border dark:text-dark-text dark:hover:border-brand-primary dark:hover:text-brand-primary dark:hover:bg-brand-primary/5',
    ghost: 'text-light-textMuted bg-transparent hover:bg-light-cardAlt hover:text-light-text dark:text-dark-muted dark:hover:bg-dark-card dark:hover:text-dark-text',
    soft: 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15 hover:shadow-sm',
    danger: 'bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600 hover:-translate-y-0.5 active:translate-y-0',
    success: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:-translate-y-0.5 active:translate-y-0',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs min-h-[30px]',
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-5 py-2.5 text-sm min-h-[42px]',
    lg: 'px-7 py-3 text-base min-h-[48px]',
    xl: 'px-9 py-4 text-lg min-h-[56px]',
    icon: 'h-10 w-10 p-0',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          {size !== 'xs' && <span>Loading...</span>}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
