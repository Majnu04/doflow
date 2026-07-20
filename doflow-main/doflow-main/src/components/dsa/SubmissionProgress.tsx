import React, { useEffect, useState } from 'react';
import { FiCheck, FiX, FiClock, FiLoader, FiTerminal, FiSearch, FiZap } from 'react-icons/fi';

export type SubmissionPhase = 'queued' | 'compiling' | 'running' | 'checking' | 'generating' | 'accepted' | 'rejected';

interface PhaseStep {
  key: SubmissionPhase;
  label: string;
  icon: React.ReactNode;
}

const PHASES: PhaseStep[] = [
  { key: 'queued', label: 'Queued', icon: <FiClock className="w-4 h-4" /> },
  { key: 'compiling', label: 'Compiling', icon: <FiTerminal className="w-4 h-4" /> },
  { key: 'running', label: 'Running Tests', icon: <FiZap className="w-4 h-4" /> },
  { key: 'checking', label: 'Evaluating', icon: <FiSearch className="w-4 h-4" /> },
  { key: 'generating', label: 'Generating Report', icon: <FiLoader className="w-4 h-4" /> },
];

interface SubmissionProgressProps {
  phase: SubmissionPhase;
}

const SubmissionProgress: React.FC<SubmissionProgressProps> = ({ phase }) => {
  const isFinal = phase === 'accepted' || phase === 'rejected';
  const isAccepted = phase === 'accepted';
  const isRejected = phase === 'rejected';
  const currentIdx = PHASES.findIndex(p => p.key === phase);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
      {isFinal ? (
        <div className={`p-4 rounded-full animate-pop-in ${isAccepted ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          {isAccepted ? (
            <FiCheck className="w-8 h-8 text-emerald-500" />
          ) : (
            <FiX className="w-8 h-8 text-red-500" />
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="w-12 h-12 border-[3px] border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FiZap className="w-5 h-5 text-brand-primary animate-pulse" />
          </div>
        </div>
      )}

      <div className="text-center">
        <p className={`text-base font-bold font-brand ${
          isAccepted ? 'text-emerald-600 dark:text-emerald-400' :
          isRejected ? 'text-red-600 dark:text-red-400' :
          'text-light-text dark:text-dark-text'
        }`}>
          {isAccepted ? 'Accepted' : isFinal ? 'Rejected' : PHASES[currentIdx]?.label || 'Processing'}
        </p>
        {!isFinal && (
          <p className="text-xs text-light-textSecondary dark:text-dark-muted mt-1">{PHASES[currentIdx]?.label}</p>
        )}
      </div>

      {!isFinal && (
        <div className="w-full max-w-[240px] space-y-2.5">
          {PHASES.map((p, i) => {
            const isActive = i === currentIdx;
            const isPast = i < currentIdx;
            const isPending = i > currentIdx;
            return (
              <div key={p.key} className={`flex items-center gap-3 transition-all duration-500 ${
                isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-30'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition-all duration-500 ${
                  isPast
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-brand-primary text-white shadow-[0_0_12px_rgba(224,100,56,0.4)]'
                    : 'bg-light-cardAlt dark:bg-dark-cardAlt text-light-textMuted dark:text-dark-muted'
                }`}>
                  {isPast ? <FiCheck className="w-3 h-3" /> : p.icon}
                </div>
                <span className={`text-xs font-medium ${
                  isActive ? 'text-light-text dark:text-dark-text' : 'text-light-textSecondary dark:text-dark-muted'
                }`}>
                  {p.label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse ml-auto" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAccepted && (
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-brand-primary rounded-full animate-soft"
              style={{ animationDelay: `${i * 100}ms`, animationDuration: '0.4s' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionProgress;
