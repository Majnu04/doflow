import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bar';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
}) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={`${sizes[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-2 border-brand-primary/15" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-primary animate-spin" />
        </div>
        {text && <p className="text-light-textMuted dark:text-dark-muted text-sm font-medium">{text}</p>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex gap-1.5">
          <div
            className="w-2 h-2 bg-brand-primary rounded-full"
            style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 bg-brand-accent rounded-full"
            style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '0.2s' }}
          />
          <div
            className="w-2 h-2 bg-brand-primary rounded-full"
            style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '0.4s' }}
          />
        </div>
        {text && <p className="text-light-textMuted dark:text-dark-muted text-sm font-medium">{text}</p>}
        <style>{`
          @keyframes dot-bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-6px); }
          }
        `}</style>
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 w-full max-w-xs">
        <div className="w-full h-1 bg-border-subtle dark:bg-dark-border rounded-full overflow-hidden">
          <div className="h-full bg-brand-gradient rounded-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        </div>
        {text && <p className="text-light-textMuted dark:text-dark-muted text-sm font-medium">{text}</p>}
      </div>
    );
  }

  // Pulse variant
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-ping" />
        <div className="relative bg-brand-primary rounded-full w-full h-full opacity-60" />
      </div>
      {text && <p className="text-light-textMuted dark:text-dark-muted text-sm font-medium">{text}</p>}
    </div>
  );
};

export default Loader;
