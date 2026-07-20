import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { FiCpu, FiClock, FiHardDrive, FiTarget, FiBookOpen, FiFileText } from 'react-icons/fi';

interface Example {
  input?: string;
  output?: string;
  explanation?: string;
}

interface ProblemDescriptionProps {
  title: string;
  difficulty: string;
  description: string;
  examples: Example[];
  constraints: string[];
  hints?: string[];
  tags?: string[];
  acceptanceRate?: number;
  timeLimit?: number;
  memoryLimit?: number;
}

const sanitize = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'img', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class'],
  });

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  title,
  difficulty,
  description,
  examples,
  constraints,
  hints,
  tags,
  acceptanceRate,
  timeLimit,
  memoryLimit,
}) => {
  const difficultyColors: Record<string, { text: string; bg: string }> = {
    Easy: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-500/10' },
    Medium: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-500/10' },
    Hard: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10 dark:bg-red-500/10' },
  };

  const dc = difficultyColors[difficulty] || difficultyColors.Easy;

  return (
    <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-base font-bold text-light-text dark:text-dark-text font-brand truncate">{title}</h2>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${dc.text} ${dc.bg}`}>{difficulty}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-light-textSecondary dark:text-dark-muted">
          {acceptanceRate != null && (
            <span className="flex items-center gap-1"><FiTarget className="w-3 h-3" /> {acceptanceRate.toFixed(1)}%</span>
          )}
          {timeLimit != null && (
            <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {timeLimit}ms</span>
          )}
          {memoryLimit != null && (
            <span className="flex items-center gap-1"><FiHardDrive className="w-3 h-3" /> {memoryLimit} MB</span>
          )}
          {tags && tags.length > 0 && (
            <span className="flex items-center gap-1 text-brand-primary">
              <FiCpu className="w-3 h-3" />
              {tags.slice(0, 3).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4 space-y-4">
          {/* Description */}
          <div className="workspace-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiFileText className="w-3.5 h-3.5 text-brand-primary" />
              <span className="workspace-label">Problem</span>
            </div>
            <div
              className="workspace-text prose-sm max-w-none [&_code]:text-brand-primary [&_code]:bg-brand-primary/5 [&_code]:px-1 [&_code]:rounded [&_code]:text-[12px] [&_pre]:bg-light-cardAlt dark:[&_pre]:bg-dark-cardAlt [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:text-[12px] [&_pre]:font-mono [&_pre]:overflow-x-auto [&_pre]:leading-relaxed [&_pre]:border [&_pre]:border-border-subtle dark:[&_pre]:border-dark-border [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:my-2 [&_li>p]:mb-0"
              dangerouslySetInnerHTML={{ __html: sanitize(description) }}
            />
          </div>

          {/* Examples */}
          {examples.length > 0 && (
            <div className="workspace-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border-subtle dark:border-dark-border bg-light-cardAlt/30 dark:bg-dark-cardAlt/30">
                <div className="flex items-center gap-2">
                  <FiBookOpen className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="workspace-label">Examples</span>
                </div>
              </div>
              <div className="divide-y divide-border-subtle dark:divide-dark-border">
                {examples.map((ex, i) => (
                  <div key={i} className="p-4 space-y-2">
                    <span className="text-[10px] font-bold text-light-textMuted dark:text-dark-muted uppercase tracking-wider">Example {i + 1}</span>
                    {ex.input && (
                      <div>
                        <span className="text-[10px] font-semibold text-light-textSecondary dark:text-dark-muted uppercase tracking-wider">Input</span>
                        <pre className="mt-1 text-[12px] bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg p-2.5 font-mono overflow-x-auto border border-border-subtle/50 dark:border-dark-border/50 text-light-text dark:text-dark-text">{ex.input}</pre>
                      </div>
                    )}
                    {ex.output && (
                      <div>
                        <span className="text-[10px] font-semibold text-light-textSecondary dark:text-dark-muted uppercase tracking-wider">Output</span>
                        <pre className="mt-1 text-[12px] bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg p-2.5 font-mono overflow-x-auto border border-border-subtle/50 dark:border-dark-border/50 text-emerald-600 dark:text-emerald-400">{ex.output}</pre>
                      </div>
                    )}
                    {ex.explanation && (
                      <div>
                        <span className="text-[10px] font-semibold text-light-textSecondary dark:text-dark-muted uppercase tracking-wider">Explanation</span>
                        <p className="mt-1 text-[12px] text-light-text dark:text-dark-text leading-relaxed">{ex.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {constraints.length > 0 && (
            <div className="workspace-card p-4 border-amber-500/20 dark:border-amber-500/10 bg-amber-50/30 dark:bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <FiTarget className="w-3.5 h-3.5 text-amber-500" />
                <span className="workspace-label text-amber-600 dark:text-amber-400">Constraints</span>
              </div>
              <ul className="space-y-1">
                {constraints.map((c, i) => (
                  <li key={i} className="text-[12px] text-light-text dark:text-dark-text font-mono leading-relaxed flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">&bull;</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hints */}
          {hints && hints.length > 0 && (
            <div className="workspace-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiTarget className="w-3.5 h-3.5 text-amber-500" />
                <span className="workspace-label">Hints</span>
              </div>
              <ul className="space-y-2">
                {hints.map((hint, i) => (
                  <li key={i} className="text-[12px] text-light-textSecondary dark:text-dark-muted leading-relaxed flex items-start gap-2">
                    <span className="text-brand-primary font-bold mt-0.5">{i + 1}.</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProblemDescription);
