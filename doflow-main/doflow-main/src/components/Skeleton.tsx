import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'title' | 'subtitle' | 'avatar' | 'card' | 'button' | 'badge' | 'list-item';
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none';
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  rounded,
  className = '',
  lines = 1,
}) => {
  const getDimensions = () => {
    const defaults: Record<string, { width: string; height: string }> = {
      text: { width: '100%', height: '14px' },
      title: { width: '80%', height: '28px' },
      subtitle: { width: '60%', height: '20px' },
      avatar: { width: '40px', height: '40px' },
      card: { width: '100%', height: '200px' },
      button: { width: '120px', height: '40px' },
      badge: { width: '60px', height: '24px' },
      'list-item': { width: '100%', height: '56px' }
    };
    return defaults[variant];
  };
  
  const getBorderRadius = () => {
    if (rounded) {
      return { 'none': 'rounded-none', 'sm': 'rounded-sm', 'md': 'rounded-md', 'lg': 'rounded-lg', 'xl': 'rounded-xl', 'full': 'rounded-full' }[rounded];
    }
    const radiusMap: Record<string, string> = {
      text: 'rounded-md',
      title: 'rounded-lg',
      subtitle: 'rounded-md',
      avatar: 'rounded-full',
      card: 'rounded-xl',
      button: 'rounded-lg',
      badge: 'rounded-full',
      'list-item': 'rounded-xl'
    };
    return radiusMap[variant];
  };
  
  const dims = getDimensions();
  const finalWidth = width || dims.width;
  const finalHeight = height || dims.height;
  const borderRadius = getBorderRadius();
  
  const widthStyle = typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth;
  const heightStyle = typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight;
  
  const baseClasses = `
    bg-gradient-to-r from-border-subtle/60 via-light-cardAlt to-border-subtle/60
    ${borderRadius}
    animate-pulse
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={baseClasses}
            style={{
              width: index === lines - 1 ? '70%' : widthStyle,
              height: heightStyle
            }}
            role="status"
            aria-label="Loading content"
          >
            <span className="sr-only">Loading...</span>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div
      className={baseClasses}
      style={{ width: widthStyle, height: heightStyle }}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const ModuleSkeleton: React.FC = () => (
  <div className="bg-light-card rounded-xl p-4 border border-border-subtle/40 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton variant="subtitle" width="70%" />
      <Skeleton variant="badge" width="40px" />
    </div>
    <Skeleton variant="text" height="4px" rounded="full" />
    <div className="space-y-2 mt-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton variant="avatar" width="20px" height="20px" />
          <Skeleton variant="text" width={`${60 + i * 5}%`} />
        </div>
      ))}
    </div>
  </div>
);

export const LessonCardSkeleton: React.FC = () => (
  <div className="bg-light-card rounded-xl p-5 border border-border-subtle/40 space-y-3">
    <Skeleton variant="title" width="85%" />
    <Skeleton variant="text" lines={2} />
    <div className="flex items-center gap-3 pt-2">
      <Skeleton variant="badge" width="70px" />
      <Skeleton variant="badge" width="60px" />
    </div>
  </div>
);

export const CourseHeaderSkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Skeleton variant="text" width="50px" height="12px" />
      <Skeleton variant="text" width="70px" height="12px" />
    </div>
    <Skeleton variant="title" width="90%" height="36px" />
    <Skeleton variant="text" lines={2} />
    <div className="flex items-center gap-4 pt-2">
      <Skeleton variant="badge" width="90px" />
      <Skeleton variant="badge" width="100px" />
      <Skeleton variant="badge" width="80px" />
    </div>
  </div>
);

export const ProgressBarSkeleton: React.FC = () => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <Skeleton variant="text" width="100px" height="12px" />
      <Skeleton variant="text" width="35px" height="12px" />
    </div>
    <Skeleton variant="text" height="6px" rounded="full" />
  </div>
);

export const SidebarSkeleton: React.FC = () => (
  <div className="space-y-5 p-4">
    <Skeleton variant="title" width="90%" />
    <ProgressBarSkeleton />
    <div className="space-y-3 mt-4">
      {[1, 2, 3].map((i) => (
        <ModuleSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const LessonContentSkeleton: React.FC = () => (
  <div className="space-y-5 p-6">
    <Skeleton variant="card" height="400px" rounded="xl" />
    <div className="space-y-2">
      <Skeleton variant="title" width="75%" />
      <Skeleton variant="text" lines={2} />
    </div>
    <div className="space-y-3 mt-6">
      <Skeleton variant="subtitle" width="180px" />
      <Skeleton variant="text" lines={4} />
      <Skeleton variant="subtitle" width="160px" className="mt-5" />
      <Skeleton variant="text" lines={3} />
    </div>
    <div className="flex justify-between pt-5">
      <Skeleton variant="button" width="110px" />
      <Skeleton variant="button" width="110px" />
    </div>
  </div>
);

export const useMinimumLoadingTime = (isLoading: boolean, minimumMs: number = 400) => {
  const [showLoading, setShowLoading] = React.useState(isLoading);
  const loadStartTime = React.useRef<number | null>(null);
  
  React.useEffect(() => {
    if (isLoading) {
      loadStartTime.current = Date.now();
      setShowLoading(true);
    } else if (loadStartTime.current) {
      const elapsed = Date.now() - loadStartTime.current;
      const remaining = Math.max(0, minimumMs - elapsed);
      
      setTimeout(() => {
        setShowLoading(false);
        loadStartTime.current = null;
      }, remaining);
    }
  }, [isLoading, minimumMs]);
  
  return showLoading;
};

export default Skeleton;
