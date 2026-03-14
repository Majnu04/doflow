import React from 'react';
import { FiGrid, FiAlertTriangle } from 'react-icons/fi';

interface SkeletonCardProps {
  count?: number;
}

export const CourseGridSkeleton: React.FC<SkeletonCardProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-brand-dark/20 border border-gray-700 rounded-lg p-4 animate-pulse">
          <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
          <div className="bg-gray-700 h-6 rounded w-3/4 mb-3"></div>
          <div className="bg-gray-700 h-4 rounded w-1/2 mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="bg-gray-700 h-8 w-1/4 rounded"></div>
            <div className="bg-gray-700 h-8 w-1/4 rounded"></div>
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
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FiGrid className="w-20 h-20 text-gray-500" />,
  title,
  message,
  action,
}) => {
  return (
    <div className="text-center py-16 px-6 bg-brand-dark/20 border border-dashed border-gray-700 rounded-lg">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex justify-center">{icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        {action}
      </div>
    </div>
  );
};

interface ErrorStateProps {
    message: string;
    onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
    return (
        <EmptyState
            icon={<FiAlertTriangle className="w-20 h-20 text-red-500" />}
            title="Something Went Wrong"
            message={message || 'We couldn\'t load the data. Please try again.'}
            action={
                <button
                    onClick={onRetry}
                    className="bg-brand-primary hover:bg-brand-primary/80 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                    Try Again
                </button>
            }
        />
    );
};

export const CourseDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* Breadcrumbs */}
          <div className="h-4 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/3 mb-4"></div>
          {/* Title */}
          <div className="h-10 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-full mb-4"></div>
          {/* Subtitle */}
          <div className="h-6 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-3/4 mb-8"></div>
          
          {/* What you'll learn */}
          <div className="border border-light-border dark:border-dark-border rounded-lg p-6 mb-8">
            <div className="h-8 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/2 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-4 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-full"></div>
              <div className="h-4 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-full"></div>
              <div className="h-4 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-full"></div>
              <div className="h-4 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-full"></div>
            </div>
          </div>

          {/* Course Content */}
          <div className="h-8 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            <div className="h-16 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg w-full"></div>
            <div className="h-16 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg w-full"></div>
            <div className="h-16 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg w-full"></div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="border border-light-border dark:border-dark-border rounded-lg shadow-lg">
              <div className="h-56 bg-light-cardAlt dark:bg-dark-cardAlt rounded-t-lg"></div>
              <div className="p-6">
                <div className="h-10 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/2 mb-6"></div>
                <div className="h-12 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg w-full mb-3"></div>
                <div className="h-12 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg w-full mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-full"></div>
                  <div className="h-4 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-5/6"></div>
                  <div className="h-4 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
