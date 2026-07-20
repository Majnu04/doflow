import React from 'react';
import { FiGrid, FiAlertTriangle, FiSearch, FiInbox } from 'react-icons/fi';

interface SkeletonCardProps {
  count?: number;
}

export const CourseGridSkeleton: React.FC<SkeletonCardProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-light-card border border-border-subtle rounded-2xl overflow-hidden animate-pulse">
          <div className="bg-light-cardAlt h-48 w-full" />
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-light-cardAlt h-5 w-16 rounded-full" />
              <div className="bg-light-cardAlt h-5 w-12 rounded-full" />
            </div>
            <div className="bg-light-cardAlt h-6 rounded-lg w-3/4" />
            <div className="bg-light-cardAlt h-4 rounded-lg w-1/2" />
            <div className="flex items-center gap-3 pt-2">
              <div className="bg-light-cardAlt h-4 w-16 rounded-full" />
              <div className="bg-light-cardAlt h-4 w-20 rounded-full" />
              <div className="bg-light-cardAlt h-4 w-14 rounded-full" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50">
              <div className="bg-light-cardAlt h-7 w-20 rounded-lg" />
              <div className="bg-light-cardAlt h-7 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
  variant?: 'default' | 'search' | 'courses';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  variant = 'default',
}) => {
  const defaultIcons = {
    default: <FiInbox className="w-14 h-14 text-light-textMuted/40" />,
    search: <FiSearch className="w-14 h-14 text-light-textMuted/40" />,
    courses: <FiGrid className="w-14 h-14 text-light-textMuted/40" />,
  };

  return (
    <div className="text-center py-16 px-6">
      <div className="max-w-sm mx-auto">
        <div className="mb-5 flex justify-center">
          {icon || defaultIcons[variant]}
        </div>
        <h3 className="text-xl font-bold text-light-text mb-2">{title}</h3>
        <p className="text-light-textSecondary text-sm leading-relaxed mb-6">{message}</p>
        {action}
      </div>
    </div>
  );
};

interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
    return (
        <div className="text-center py-16 px-6">
            <div className="max-w-sm mx-auto">
                <div className="mb-5 flex justify-center">
                    <div className="p-4 bg-rose-50 rounded-2xl">
                        <FiAlertTriangle className="w-10 h-10 text-rose-400" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-light-text mb-2">Something went wrong</h3>
                <p className="text-light-textSecondary text-sm leading-relaxed mb-6">
                    {message || "We couldn't load the data. Please try again."}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-brand hover:shadow-brand-lg"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

export const CourseDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-4 bg-light-cardAlt rounded-lg w-1/3" />
          <div className="h-10 bg-light-cardAlt rounded-xl w-full" />
          <div className="h-6 bg-light-cardAlt rounded-lg w-3/4" />
          
          <div className="border border-border-subtle rounded-2xl p-6 space-y-4">
            <div className="h-7 bg-light-cardAlt rounded-lg w-1/2" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-light-cardAlt flex-shrink-0" />
                  <div className="h-4 bg-light-cardAlt rounded-lg flex-1" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-7 bg-light-cardAlt rounded-lg w-1/4" />
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-light-cardAlt rounded-xl w-full" />
            ))}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="border border-border-subtle rounded-2xl overflow-hidden shadow-card">
              <div className="h-52 bg-light-cardAlt" />
              <div className="p-6 space-y-4">
                <div className="h-10 bg-light-cardAlt rounded-lg w-1/2" />
                <div className="h-12 bg-light-cardAlt rounded-xl w-full" />
                <div className="h-12 bg-light-cardAlt rounded-xl w-full" />
                <div className="space-y-2 pt-2">
                  <div className="h-4 bg-light-cardAlt rounded-lg w-full" />
                  <div className="h-4 bg-light-cardAlt rounded-lg w-5/6" />
                  <div className="h-4 bg-light-cardAlt rounded-lg w-4/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
