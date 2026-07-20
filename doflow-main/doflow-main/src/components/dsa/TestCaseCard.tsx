import React, { useState } from 'react';
import { FiCheck, FiX, FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi';

interface TestCaseResult {
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  executionTime?: number;
  memoryUsed?: number;
  error?: string;
  index?: number;
}

interface TestCaseCardProps {
  result: TestCaseResult;
  index: number;
  isHidden?: boolean;
}

const TestCaseCard: React.FC<TestCaseCardProps> = ({ result, index, isHidden }) => {
  const [expanded, setExpanded] = useState(false);
  const passed = result.passed;

  return (
    <div className={`rounded-lg overflow-hidden transition-all duration-200 border ${
      passed
        ? 'border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/20 dark:bg-emerald-900/5'
        : 'border-red-200/50 dark:border-red-800/30 bg-red-50/20 dark:bg-red-900/5'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] ${
            passed
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
              : 'bg-red-100 dark:bg-red-900/30 text-red-500'
          }`}>
            {passed ? <FiCheck className="w-3.5 h-3.5" /> : <FiX className="w-3.5 h-3.5" />}
          </div>
          <div>
            <span className="text-xs font-semibold text-light-text dark:text-dark-text">
              {isHidden ? `Hidden Test ${index + 1}` : `Test Case ${index + 1}`}
            </span>
            {result.executionTime != null && (
              <span className="ml-2 text-[10px] text-light-textSecondary dark:text-dark-muted">
                {result.executionTime.toFixed(2)}ms
              </span>
            )}
          </div>
        </div>
        {expanded ? <FiChevronUp className="w-3.5 h-3.5 text-light-textMuted" /> : <FiChevronDown className="w-3.5 h-3.5 text-light-textMuted" />}
      </button>

      {expanded && (
        <div className="px-3.5 pb-3 space-y-2 border-t border-inherit pt-2.5 mt-0">
          {result.input != null && (
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-muted mb-1">Input</p>
              <pre className="text-[11px] bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg p-2 overflow-x-auto text-light-text dark:text-dark-text font-mono border border-border-subtle/50 dark:border-dark-border/50">{String(result.input)}</pre>
            </div>
          )}
          {result.expectedOutput != null && !isHidden && (
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-muted mb-1">Expected</p>
              <pre className="text-[11px] bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg p-2 overflow-x-auto text-emerald-600 dark:text-emerald-400 font-mono border border-border-subtle/50 dark:border-dark-border/50">{String(result.expectedOutput)}</pre>
            </div>
          )}
          {result.actualOutput != null && (
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-muted mb-1">Actual</p>
              <pre className={`text-[11px] bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg p-2 overflow-x-auto font-mono border border-border-subtle/50 dark:border-dark-border/50 ${
                passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>{String(result.actualOutput)}</pre>
            </div>
          )}
          {result.error && (
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-red-500 mb-1">Error</p>
              <pre className="text-[11px] bg-red-50 dark:bg-red-900/20 rounded-lg p-2 overflow-x-auto text-red-600 dark:text-red-400 font-mono border border-red-200/50 dark:border-red-800/30">{result.error}</pre>
            </div>
          )}
          {result.executionTime != null && (
            <div className="flex items-center gap-3 text-[11px] text-light-textSecondary dark:text-dark-muted pt-1">
              <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {result.executionTime.toFixed(2)}ms</span>
              {result.memoryUsed != null && <span>Memory: {(result.memoryUsed / 1024).toFixed(1)} KB</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(TestCaseCard);
