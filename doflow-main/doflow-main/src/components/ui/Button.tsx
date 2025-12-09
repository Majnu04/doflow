import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center gap-2 font-semibold tracking-tight rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 hover:-translate-y-0.5 hover:bg-brand-primaryHover',
    secondary: 'bg-brand-accentSoft text-brand-primary hover:bg-brand-accentSoft/80 shadow-sm',
    gold: 'bg-brand-accent text-white shadow-lg shadow-brand-accent/30 hover:brightness-110',
    outline: 'border border-border-subtle text-light-text hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5',
    ghost: 'text-light-textMuted bg-transparent hover:bg-light-cardAlt',
    soft: 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[38px]',
    md: 'px-6 py-2.5 text-base min-h-[44px]',
    lg: 'px-8 py-3 text-lg min-h-[50px]',
    xl: 'px-10 py-4 text-xl min-h-[56px]',
    icon: 'h-11 w-11',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && !children && <span>{icon}</span>}
          {icon && children && <span className="mr-2">{icon}</span>}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
