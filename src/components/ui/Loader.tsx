import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div
          className={`
            ${sizes[size]}
            border-4 border-light-border/20 dark:border-dark-border/20 border-t-brand-primary
            rounded-full animate-spin
          `}
        />
        {text && <p className="text-light-textMuted dark:text-dark-muted text-sm">{text}</p>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {text && <p className="text-light-textMuted dark:text-dark-muted text-sm">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 bg-brand-primary rounded-full animate-ping opacity-75" />
        <div className="relative bg-brand-primary rounded-full w-full h-full animate-pulse" />
      </div>
      {text && <p className="text-light-textMuted dark:text-dark-muted text-sm">{text}</p>}
    </div>
  );
};

export default Loader;
