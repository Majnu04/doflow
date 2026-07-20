import React from 'react';
import { FaLightbulb, FaInfoCircle, FaExclamationTriangle, FaBullseye, FaCode } from 'react-icons/fa';

interface CalloutProps {
  type: 'tip' | 'note' | 'warning' | 'interview' | 'example';
  children: React.ReactNode;
}

const CALLOUT_CONFIG = {
  tip: {
    icon: FaLightbulb,
    label: 'Tip',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/15',
    border: 'border-amber-200 dark:border-amber-700/30',
    text: 'text-amber-800 dark:text-amber-200',
    iconBg: 'bg-amber-100 dark:bg-amber-800/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  note: {
    icon: FaInfoCircle,
    label: 'Note',
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-900/15',
    border: 'border-blue-200 dark:border-blue-700/30',
    text: 'text-blue-800 dark:text-blue-200',
    iconBg: 'bg-blue-100 dark:bg-blue-800/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: FaExclamationTriangle,
    label: 'Warning',
    gradient: 'from-red-500 to-rose-500',
    bg: 'bg-red-50 dark:bg-red-900/15',
    border: 'border-red-200 dark:border-red-700/30',
    text: 'text-red-800 dark:text-red-200',
    iconBg: 'bg-red-100 dark:bg-red-800/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  interview: {
    icon: FaBullseye,
    label: 'Interview Tip',
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50 dark:bg-purple-900/15',
    border: 'border-purple-200 dark:border-purple-700/30',
    text: 'text-purple-800 dark:text-purple-200',
    iconBg: 'bg-purple-100 dark:bg-purple-800/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  example: {
    icon: FaCode,
    label: 'Example',
    gradient: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50 dark:bg-teal-900/15',
    border: 'border-teal-200 dark:border-teal-700/30',
    text: 'text-teal-800 dark:text-teal-200',
    iconBg: 'bg-teal-100 dark:bg-teal-800/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
};

const Callout: React.FC<CalloutProps> = ({ type, children }) => {
  const config = CALLOUT_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} my-6`}>
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${config.gradient}`} />
      <div className="relative p-5 pl-7">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold ${config.iconColor} uppercase tracking-wider`}>
              {config.label}
            </span>
            <div className={`mt-1 text-sm leading-relaxed ${config.text}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callout;
