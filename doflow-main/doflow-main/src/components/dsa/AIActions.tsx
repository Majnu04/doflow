import React from 'react';
import { FiCpu, FiCode, FiZap, FiSearch, FiEdit3, FiBarChart2, FiGrid, FiBookOpen, FiCopy } from 'react-icons/fi';

interface AIActionButton {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ACTIONS: AIActionButton[] = [
  { key: 'explain', label: 'Explain Problem', icon: <FiBookOpen className="w-4 h-4" />, description: 'Break down the problem in simple terms' },
  { key: 'approach', label: 'Generate Approach', icon: <FiZap className="w-4 h-4" />, description: 'Get a step-by-step solution strategy' },
  { key: 'review', label: 'Review My Code', icon: <FiSearch className="w-4 h-4" />, description: 'Analyze your current solution' },
  { key: 'optimize', label: 'Optimize Code', icon: <FiCpu className="w-4 h-4" />, description: 'Improve time & space complexity' },
  { key: 'complexity', label: 'Explain Complexity', icon: <FiBarChart2 className="w-4 h-4" />, description: 'Analyze Big-O of your solution' },
  { key: 'edge-cases', label: 'Generate Edge Cases', icon: <FiGrid className="w-4 h-4" />, description: 'Find corner cases to test' },
  { key: 'dry-run', label: 'Generate Dry Run', icon: <FiEdit3 className="w-4 h-4" />, description: 'Trace through an example manually' },
  { key: 'similar', label: 'Similar Problems', icon: <FiCopy className="w-4 h-4" />, description: 'Find related practice problems' },
];

interface AIActionsProps {
  onAction: (action: string) => void;
  loadingAction?: string | null;
  compact?: boolean;
}

const AIActions: React.FC<AIActionsProps> = ({ onAction, loadingAction, compact }) => {
  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 mb-2 px-0.5">
          <FiCpu className="w-3 h-3 text-brand-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-light-textSecondary dark:text-dark-muted">Quick Actions</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {ACTIONS.slice(0, 6).map(action => (
            <button
              key={action.key}
              onClick={() => onAction(action.key)}
              disabled={loadingAction === action.key}
              className="flex items-center gap-1.5 px-2 py-1.5 bg-brand-primary/5 hover:bg-brand-primary/10 border border-brand-primary/15 rounded-lg text-[10px] font-semibold text-brand-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAction === action.key ? (
                <div className="w-2.5 h-2.5 border-1.5 border-brand-primary border-t-transparent rounded-full animate-spin" />
              ) : action.icon}
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-brand-primary/10 rounded-lg">
          <FiCpu className="w-4 h-4 text-brand-primary" />
        </div>
        <span className="text-sm font-bold text-light-text dark:text-dark-text">AI Assistant</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map(action => (
          <button
            key={action.key}
            onClick={() => onAction(action.key)}
            disabled={loadingAction === action.key}
            className="flex items-start gap-2.5 p-3 rounded-xl border border-border-subtle dark:border-dark-border hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-1.5 bg-brand-primary/5 rounded-lg text-brand-primary group-hover:bg-brand-primary/10 transition-colors mt-0.5">
              {loadingAction === action.key ? (
                <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              ) : action.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-light-text dark:text-dark-text group-hover:text-brand-primary transition-colors">{action.label}</p>
              <p className="text-[10px] text-light-textSecondary dark:text-dark-muted leading-tight mt-0.5">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(AIActions);
