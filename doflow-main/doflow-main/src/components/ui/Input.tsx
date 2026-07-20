import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', inputSize = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base',
    };

    const inputClasses = `
      w-full ${sizeClasses[inputSize]} ${icon ? 'pl-11' : ''}
      bg-light-card dark:bg-dark-card
      border ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : 'border-border-subtle dark:border-dark-border focus:border-brand-primary focus:ring-brand-primary/15'}
      rounded-xl text-light-text dark:text-dark-text placeholder-light-textMuted/60 dark:placeholder-dark-muted/60
      focus:ring-4 focus:shadow-[0_0_0_3px_rgba(224,100,56,0.1)]
      transition-all duration-200 ease-smooth
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-light-textMuted dark:text-dark-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-light-textMuted dark:text-dark-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
