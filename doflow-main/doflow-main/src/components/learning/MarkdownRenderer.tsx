import React, { useMemo, useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export type { Heading };

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onHeadings?: (headings: Heading[]) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `h-${Math.random().toString(36).slice(2, 7)}`;
}

function childrenToString(children: React.ReactNode): string {
  let result = '';
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') result += child;
    else if (typeof child === 'number') result += String(child);
    else if (React.isValidElement(child)) {
      result += childrenToString(child.props.children);
    }
  });
  return result;
}

function getCalloutType(text: string): string | null {
  const clean = text.replace(/[*`]/g, '').trim().toLowerCase();
  if (/^(💡\s*)?tip/i.test(clean)) return 'tip';
  if (/^(📝\s*)?(note|important)/i.test(clean)) return 'note';
  if (/^(⚠️\s*)?warning/i.test(clean)) return 'warning';
  if (/^(🎯\s*)?interview\s*tip/i.test(clean)) return 'interview';
  if (/^(example)\s*\d*:?/i.test(clean)) return 'example';
  return null;
}

function stripCalloutPrefix(text: string): string {
  return text.replace(/^(💡|📝|⚠️|🎯)?\s*(Tip|Note|Important|Warning|Interview Tip|Example\s*\d*)\s*:?\s*/i, '').trim();
}

const CALLOUT_STYLES: Record<string, { gradient: string; bg: string; border: string; text: string; iconBg: string; iconColor: string; label: string }> = {
  tip: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/15',
    border: 'border-amber-200 dark:border-amber-700/30',
    text: 'text-amber-800 dark:text-amber-200',
    iconBg: 'bg-amber-100 dark:bg-amber-800/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    label: 'Tip',
  },
  note: {
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-900/15',
    border: 'border-blue-200 dark:border-blue-700/30',
    text: 'text-blue-800 dark:text-blue-200',
    iconBg: 'bg-blue-100 dark:bg-blue-800/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    label: 'Note',
  },
  warning: {
    gradient: 'from-red-500 to-rose-500',
    bg: 'bg-red-50 dark:bg-red-900/15',
    border: 'border-red-200 dark:border-red-700/30',
    text: 'text-red-800 dark:text-red-200',
    iconBg: 'bg-red-100 dark:bg-red-800/30',
    iconColor: 'text-red-600 dark:text-red-400',
    label: 'Warning',
  },
  interview: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50 dark:bg-purple-900/15',
    border: 'border-purple-200 dark:border-purple-700/30',
    text: 'text-purple-800 dark:text-purple-200',
    iconBg: 'bg-purple-100 dark:bg-purple-800/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    label: 'Interview Tip',
  },
  example: {
    gradient: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50 dark:bg-teal-900/15',
    border: 'border-teal-200 dark:border-teal-700/30',
    text: 'text-teal-800 dark:text-teal-200',
    iconBg: 'bg-teal-100 dark:bg-teal-800/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    label: 'Example',
  },
};

function extractHeadings(markdown: string): Heading[] {
  const result: Heading[] = [];
  const usedIds = new Set<string>();

  const lines = markdown.split('\n');
  for (const line of lines) {
    const mdMatch = line.match(/^(#{2,3})\s+(.+)/);
    if (mdMatch) {
      const level = mdMatch[1].length as 2 | 3;
      const text = mdMatch[2].trim();
      let id = slugify(text);
      if (usedIds.has(id)) { let s = 2; while (usedIds.has(`${id}-${s}`)) s++; id = `${id}-${s}`; }
      usedIds.add(id);
      result.push({ id, text, level });
      continue;
    }
    const htmlMatch = line.match(/<h([23])(?:\s[^>]*)?>(.*?)<\/h[23]>/i);
    if (htmlMatch) {
      const level = parseInt(htmlMatch[1]) as 2 | 3;
      const text = htmlMatch[2].replace(/<[^>]*>/g, '').trim();
      if (!text) continue;
      let id = slugify(text);
      if (usedIds.has(id)) { let s = 2; while (usedIds.has(`${id}-${s}`)) s++; id = `${id}-${s}`; }
      usedIds.add(id);
      result.push({ id, text, level });
    }
  }
  return result;
}

const CodeBlock: React.FC<{ className?: string; children: React.ReactNode; inline?: boolean }> = ({ className, children, inline }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const codeText = childrenToString(children);

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 bg-[var(--page-accent-soft)] text-[var(--page-accent)] rounded-md text-[0.875em] font-['IBM_Plex_Mono',monospace] font-medium break-words">
        {children}
      </code>
    );
  }

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [codeText]);

  return (
    <div className="relative group my-6 rounded-2xl overflow-hidden border border-gray-700 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/90 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <span className="text-[11px] text-gray-400 ml-1.5 font-mono font-medium">{lang || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-[11px] text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600 px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" /></svg> Copied!</>
          ) : (
            <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy</>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="!m-0 !rounded-none !border-0 !bg-gray-900">
          <code className={`${className || ''} !bg-transparent !p-5 !text-sm !leading-relaxed`}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '', onHeadings }) => {
  const headings = useMemo(() => {
    if (!content) return [];
    return extractHeadings(content);
  }, [content]);

  const usedIdsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    usedIdsRef.current = new Set();
  }, [content]);

  React.useEffect(() => {
    if (onHeadings) {
      onHeadings(headings);
    }
  }, [headings, onHeadings]);

  const generateId = useCallback((text: string): string => {
    let id = slugify(text);
    const used = usedIdsRef.current;
    if (used.has(id)) {
      let suffix = 2;
      while (used.has(`${id}-${suffix}`)) suffix++;
      id = `${id}-${suffix}`;
    }
    used.add(id);
    return id;
  }, []);

  if (!content) return null;

  return (
    <div className={`prose prose-lg max-w-none [--tw-prose-body:var(--page-text)] [--tw-prose-headings:var(--page-text)] [--tw-prose-links:var(--page-accent)] [--tw-prose-bold:var(--page-text)] [--tw-prose-code:var(--page-accent)] [--tw-prose-quotes:var(--page-text-muted)] [--tw-prose-quote-borders:var(--page-accent)] [--tw-prose-hr:var(--page-border)] [--tw-prose-th-borders:var(--page-border)] [--tw-prose-td-borders:var(--page-border)] prose-headings:font-bold prose-headings:tracking-tight prose-headings:font-[Plus_Jakarta_Sans,system-ui] prose-p:text-[var(--page-text)] prose-p:leading-relaxed prose-a:font-medium prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-[var(--page-accent-soft)] prose-code:text-[var(--page-accent)] prose-code:rounded-md prose-code:text-[0.875em] prose-code:font-['IBM_Plex_Mono',monospace] prose-pre:!p-0 prose-pre:!bg-transparent prose-pre:!border-0 prose-pre:!rounded-none prose-img:rounded-xl prose-img:shadow-md ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          h2: ({ children, ...props }) => {
            const text = childrenToString(children);
            const id = generateId(text);
            return <h2 id={id} className="text-2xl font-bold mt-10 mb-5 scroll-mt-24" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }} {...props}>{children}</h2>;
          },
          h3: ({ children, ...props }) => {
            const text = childrenToString(children);
            const id = generateId(text);
            return <h3 id={id} className="text-xl font-bold mt-8 mb-4 scroll-mt-24" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }} {...props}>{children}</h3>;
          },
          pre: ({ children, ...props }) => {
            const child = React.Children.toArray(children)[0] as React.ReactElement;
            const codeString = childrenToString(child?.props?.children);
            const className = child?.props?.className || '';
            return <CodeBlock className={className}>{codeString}</CodeBlock>;
          },
          code: ({ className, children, ...props }) => {
            const inline = !className && typeof children === 'string';
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 bg-[var(--page-accent-soft)] text-[var(--page-accent)] rounded-md text-[0.875em] font-['IBM_Plex_Mono',monospace] font-medium" {...props}>
                  {children}
                </code>
              );
            }
            return <code className={className} {...props}>{children}</code>;
          },
          blockquote: ({ children, ...props }) => {
            const text = childrenToString(children);
            const calloutType = getCalloutType(text);
            if (calloutType) {
              const styles = CALLOUT_STYLES[calloutType];
              const stripped = stripCalloutPrefix(text);
              return (
                <div className={`relative overflow-hidden rounded-2xl border ${styles.border} ${styles.bg} my-6`}>
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${styles.gradient}`} />
                  <div className="relative p-5 pl-7">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <span className={`text-sm ${styles.iconColor} font-bold`}>
                          {calloutType === 'tip' ? '\uD83D\uDCA1' : calloutType === 'note' ? '\u2139\uFE0F' : calloutType === 'warning' ? '\u26A0\uFE0F' : calloutType === 'interview' ? '\uD83C\uDFAF' : '\uD83D\uDCCB'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-bold ${styles.iconColor} uppercase tracking-wider`}>
                          {styles.label}
                        </span>
                        <div className={`mt-1 text-sm leading-relaxed ${styles.text}`}>
                          {stripped || children}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div className="relative my-6 pl-5 py-4 border-l-4 border-[var(--page-accent)] bg-[var(--page-accent-soft)] rounded-r-xl">
                <div className="text-[var(--page-text-muted)] italic leading-relaxed">
                  {children}
                </div>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-[var(--page-border)] shadow-sm">
              <table className="min-w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-xs font-bold text-[var(--page-text-muted)] uppercase tracking-wider border-b-2 border-[var(--page-border)] bg-[var(--page-section)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-[var(--page-text)] border-b border-[var(--page-border)]">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[var(--page-section)]/50 transition-colors">{children}</tr>
          ),
          hr: () => (
            <hr className="border-none h-px bg-gradient-to-r from-transparent via-[var(--page-border)] to-transparent my-10" />
          ),
          img: ({ src, alt }) => (
            <img src={src || ''} alt={alt || ''} loading="lazy" className="max-w-full rounded-xl shadow-md my-6" />
          ),
          a: ({ href, children }) => (
            <a href={href || '#'} target="_blank" rel="noopener noreferrer" className="text-[var(--page-accent)] underline decoration-2 decoration-[var(--page-accent)]/30 hover:decoration-[var(--page-accent)] transition-colors">
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-5 space-y-2 marker:text-[var(--page-accent)]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-5 space-y-2 marker:font-semibold">{children}</ol>
          ),
          li: ({ children, ...props }) => {
            if (props.className?.includes('task-list-item')) {
              return <li className="flex items-start gap-2 text-[var(--page-text)] list-none -ml-6">{children}</li>;
            }
            return <li className="text-[var(--page-text)] pl-1">{children}</li>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
