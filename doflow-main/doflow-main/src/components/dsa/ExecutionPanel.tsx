import React, { useMemo, useState } from 'react';
import {
  FiBarChart2, FiClock, FiHardDrive, FiTerminal, FiChevronDown, FiChevronUp,
  FiCheckCircle, FiXCircle, FiZap,
} from 'react-icons/fi';
import TestCaseCard from './TestCaseCard';
import SubmissionProgress, { SubmissionPhase } from './SubmissionProgress';

interface TestResult {
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  executionTime?: number;
  memoryUsed?: number;
  error?: string;
  isHidden?: boolean;
}

interface ExecutionPanelProps {
  results: TestResult[];
  isRunning: boolean;
  submitPhase: SubmissionPhase | null;
  performanceSummary?: {
    averageMs: number | null;
    fastestMs: number | null;
    slowestMs: number | null;
    peakMemoryKb: number | null;
  } | null;
  executionTime?: number | null;
  memoryUsed?: number | null;
  languageVersion?: string;
  error?: string;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  results, isRunning, submitPhase, performanceSummary,
  executionTime, memoryUsed, languageVersion, error,
}) => {
  const passedCount = useMemo(() => results.filter(r => r.passed).length, [results]);
  const totalCount = results.length;
  const allPassed = passedCount === totalCount && totalCount > 0;
  const [expandedResults, setExpandedResults] = useState(true);

  if (submitPhase && submitPhase !== 'idle') {
    return <SubmissionProgress phase={submitPhase} />;
  }

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="relative">
          <div className="w-10 h-10 border-[3px] border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FiZap className="w-4 h-4 text-brand-primary" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-light-text dark:text-dark-text">Running tests...</p>
          <p className="text-[11px] text-light-textSecondary dark:text-dark-muted mt-0.5">Executing against test cases</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
          <FiTerminal className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-red-600 dark:text-red-400">Execution Error</p>
            <pre className="mt-1.5 text-[11px] text-red-500 dark:text-red-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">{error}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
        <FiTerminal className="w-6 h-6 text-light-textMuted/20 dark:text-dark-muted/20" />
        <div className="text-center">
          <p className="text-xs text-light-textMuted dark:text-dark-muted">No results yet</p>
          <p className="text-[10px] text-light-textMuted/60 dark:text-dark-muted/60 mt-0.5">Run or Submit to see test results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-2.5 space-y-2">
        {/* Summary Bar */}
        <div className={`rounded-xl p-3 border ${
          allPassed
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-amber-500/5 border-amber-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {allPassed ? (
                <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <FiXCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm font-bold ${
                  allPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {allPassed ? 'Accepted' : `${passedCount}/${totalCount} passed`}
                </p>
                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-light-textSecondary dark:text-dark-muted">
                  {executionTime != null && (
                    <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {(executionTime / 1000).toFixed(3)}s</span>
                  )}
                  {memoryUsed != null && (
                    <span className="flex items-center gap-1"><FiHardDrive className="w-3 h-3" /> {(memoryUsed / 1024).toFixed(1)} KB</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setExpandedResults(!expandedResults)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors">
              {expandedResults ? <FiChevronUp className="w-3 h-3 text-light-textMuted" /> : <FiChevronDown className="w-3 h-3 text-light-textMuted" />}
            </button>
          </div>
          <div className="mt-2 h-1 bg-gray-200/50 dark:bg-dark-cardAlt rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ease-out ${allPassed ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${totalCount > 0 ? (passedCount / totalCount) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Performance Summary */}
        {performanceSummary && (
          <div className="workspace-card p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <FiBarChart2 className="w-3 h-3 text-brand-primary" />
              <span className="workspace-label">Performance</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Avg', value: performanceSummary.averageMs != null ? `${performanceSummary.averageMs.toFixed(1)}ms` : '—' },
                { label: 'Fast', value: performanceSummary.fastestMs != null ? `${performanceSummary.fastestMs.toFixed(1)}ms` : '—' },
                { label: 'Slow', value: performanceSummary.slowestMs != null ? `${performanceSummary.slowestMs.toFixed(1)}ms` : '—' },
                { label: 'Mem', value: performanceSummary.peakMemoryKb != null ? `${(performanceSummary.peakMemoryKb / 1024).toFixed(1)}MB` : '—' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-1.5 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg">
                  <p className="text-xs font-bold text-light-text dark:text-dark-text">{stat.value}</p>
                  <p className="text-[9px] text-light-textSecondary dark:text-dark-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Cases */}
        {expandedResults && (
          <div className="space-y-1">
            {results.map((result, i) => (
              <TestCaseCard key={i} result={result} index={i} isHidden={result.isHidden} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ExecutionPanel);
