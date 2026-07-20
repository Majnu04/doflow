import React, { useState } from 'react';
import { FaRobot, FaTimes, FaLightbulb, FaListUl, FaPuzzlePiece, FaFileAlt, FaCommentDots, FaCode, FaChevronUp, FaSpinner } from 'react-icons/fa';

interface AIFloatingPanelProps {
  currentLesson: any;
}

const ACTIONS = [
  { id: 'explain', label: 'Explain', icon: FaLightbulb, color: '#f59e0b', description: 'Simplify this concept' },
  { id: 'summarize', label: 'Summarize', icon: FaListUl, color: '#3b82f6', description: 'Key takeaways' },
  { id: 'quiz', label: 'Quiz Me', icon: FaPuzzlePiece, color: '#10b981', description: 'Test your knowledge' },
  { id: 'notes', label: 'Notes', icon: FaFileAlt, color: '#8b5cf6', description: 'Generate study notes' },
  { id: 'ask', label: 'Ask', icon: FaCommentDots, color: '#ec4899', description: 'Ask a question' },
  { id: 'code', label: 'Code', icon: FaCode, color: '#06b6d4', description: 'Generate examples' },
];

const AIFloatingPanel: React.FC<AIFloatingPanelProps> = ({ currentLesson }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (actionId: string) => {
    setLoadingAction(actionId);
    // Placeholder — integrate with backend AI endpoint when ready
    setTimeout(() => setLoadingAction(null), 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-2xl border border-[var(--page-border)] p-4 w-[280px] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center">
                <FaRobot className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-[var(--page-text)]" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>AI Tutor</span>
            </div>
            <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-[var(--page-section)] rounded-lg transition-colors">
              <FaTimes className="w-3.5 h-3.5 text-[var(--page-text-muted)]" />
            </button>
          </div>

          <p className="text-[11px] text-[var(--page-text-muted)] mb-3 line-clamp-1">
            {currentLesson?.title || 'Current lesson'}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map((action) => {
              const Icon = action.icon;
              const isLoading = loadingAction === action.id;
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  disabled={isLoading}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--page-border)] hover:border-[var(--page-accent)]/30 hover:bg-[var(--page-accent-soft)] transition-all duration-200 group text-left"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${action.color}15`, color: action.color }}
                  >
                    {isLoading ? <FaSpinner className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[var(--page-text)] leading-tight">{action.label}</div>
                    <div className="text-[9px] text-[var(--page-text-muted)] leading-tight mt-0.5">{action.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
          ${isExpanded
            ? 'bg-[var(--page-text)] text-white'
            : 'bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white'
          }`}
        style={{ boxShadow: isExpanded ? 'var(--shadow-lg)' : 'var(--shadow-brand)' }}
      >
        {isExpanded ? <FaChevronUp className="w-5 h-5" /> : <FaRobot className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default React.memo(AIFloatingPanel);
