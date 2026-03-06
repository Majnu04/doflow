import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import api from '../src/utils/api';
import ReactPlayer from 'react-player';
import { FaArrowLeft, FaCheck, FaLock, FaPlay, FaDownload, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { ThemeToggleCompact } from '../src/components/ThemeToggle';
import RunnableCodeBlock from '../src/components/RunnableCodeBlock';
import InterviewPracticePanel from '../src/components/InterviewPracticePanel';
import DoflowChatWidget from '../src/components/DoflowChatWidget';

type LessonBlock =
  | { type: 'text'; value: string }
  | { type: 'code'; lang: string; value: string };

const splitLessonDescription = (input: string): LessonBlock[] => {
  const raw = String(input || '');
  const blocks: LessonBlock[] = [];
  // Capture any fence language token (supports c++, quizjson, etc.)
  const fenceRe = /```([^\n`]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = fenceRe.exec(raw)) !== null) {
    const start = match.index;
    const end = fenceRe.lastIndex;

    const before = raw.slice(lastIndex, start);
    if (before.trim().length) {
      blocks.push({ type: 'text', value: before.trim() });
    }

    blocks.push({
      type: 'code',
      lang: String(match[1] || '').trim(),
      value: String(match[2] || '').replace(/\s+$/g, ''),
    });

    lastIndex = end;
  }

  const after = raw.slice(lastIndex);
  if (after.trim().length) {
    blocks.push({ type: 'text', value: after.trim() });
  }

  return blocks.length ? blocks : [{ type: 'text', value: raw.trim() }];
};

type TextNode =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; variant: 'info' | 'warning' | 'exam' | 'note'; title: string; text: string }
  | { type: 'table'; rows: string[][] };

type InlinePart = { type: 'text' | 'bold' | 'code'; value: string };

const parseInline = (input: string): InlinePart[] => {
  const text = String(input ?? '');
  const parts: InlinePart[] = [];

  // First split on inline code `...`
  const codeChunks = text.split(/(`[^`]*`)/g);
  for (const chunk of codeChunks) {
    if (!chunk) continue;
    if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length >= 2) {
      parts.push({ type: 'code', value: chunk.slice(1, -1) });
      continue;
    }

    // Then split remaining on **bold**
    const boldChunks = chunk.split(/(\*\*[^*]+\*\*)/g);
    for (const b of boldChunks) {
      if (!b) continue;
      if (b.startsWith('**') && b.endsWith('**') && b.length >= 4) {
        parts.push({ type: 'bold', value: b.slice(2, -2) });
      } else {
        parts.push({ type: 'text', value: b });
      }
    }
  }

  return parts.length ? parts : [{ type: 'text', value: text }];
};

const InlineText: React.FC<{ text: string }> = ({ text }) => {
  const parts = parseInline(text);
  return (
    <>
      {parts.map((p, i) => {
        if (p.type === 'code') {
          return (
            <code
              key={`c-${i}`}
              className="px-1.5 py-0.5 rounded-md border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card font-mono text-[0.95em] text-light-text dark:text-dark-text"
            >
              {p.value}
            </code>
          );
        }
        if (p.type === 'bold') {
          return (
            <span key={`b-${i}`} className="font-semibold text-light-text dark:text-dark-text">
              {p.value}
            </span>
          );
        }
        return <span key={`t-${i}`}>{p.value}</span>;
      })}
    </>
  );
};

const isHeadingLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^#{1,6}\s+/.test(trimmed)) return true;
  if (/^Quick Practice\b/i.test(trimmed)) return true;
  if (/^Checkpoint\b/i.test(trimmed)) return true;
  if (/^Quiz\b/i.test(trimmed)) return true;
  if (/^Interview\s*Q\b/i.test(trimmed)) return true;
  if (/^Important\b/i.test(trimmed)) return true;
  if (/^Example\b/i.test(trimmed)) return true;
  if (/^Rule\b/i.test(trimmed)) return true;
  if (/:$/.test(trimmed) && trimmed.length <= 60) return true;
  if (/^\*\*.+\*\*$/.test(trimmed)) return true;
  return false;
};

const detectCallout = (paragraph: string): TextNode | null => {
  const text = paragraph.trim();
  if (!text) return null;

  const pick = (variant: TextNode['variant'], title: string, rest: string) => ({
    type: 'callout' as const,
    variant,
    title,
    text: rest.trim(),
  });

  if (/^(warning|caution)\b\s*[:\-]?/i.test(text)) {
    return pick('warning', 'Warning', text.replace(/^(warning|caution)\b\s*[:\-]?/i, ''));
  }
  if (/^exam\b\s*(line|point)?\s*[:\-]?/i.test(text)) {
    return pick('exam', 'Exam', text.replace(/^exam\b\s*(line|point)?\s*[:\-]?/i, ''));
  }
  if (/^important\b\s*[:\-]?/i.test(text)) {
    return pick('info', 'Important', text.replace(/^important\b\s*[:\-]?/i, ''));
  }
  if (/^note\b\s*[:\-]?/i.test(text)) {
    return pick('note', 'Note', text.replace(/^note\b\s*[:\-]?/i, ''));
  }
  return null;
};

const parseTextToNodes = (text: string): TextNode[] => {
  const lines = String(text || '').split(/\r?\n/);
  const nodes: TextNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Simple pipe-table support: consecutive lines containing '|'
    if (trimmed.includes('|')) {
      const tableLines: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].trim() && lines[j].includes('|')) {
        tableLines.push(lines[j]);
        j += 1;
      }

      const rows = tableLines
        .map((l) => l.trim())
        .filter((l) => l && !/^[-\s\|]+$/.test(l))
        .map((l) => l.split('|').map((c) => c.trim()).filter((c) => c.length));

      if (rows.length >= 2) {
        nodes.push({ type: 'table', rows });
        i = j;
        continue;
      }
    }

    // Headings
    if (isHeadingLine(trimmed)) {
      const cleaned = trimmed
        .replace(/^#{1,6}\s+/, '')
        .replace(/^\*\*(.+)\*\*$/, '$1')
        .replace(/:$/, '')
        .trim();
      const level: 2 | 3 = /^(Quick Practice|Checkpoint|Interview\s*Q)/i.test(cleaned) ? 2 : 3;
      nodes.push({ type: 'heading', level, text: cleaned });
      i += 1;
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^[-*]\s+/.test(lines[j].trim())) {
        items.push(lines[j].trim().replace(/^[-*]\s+/, ''));
        j += 1;
      }
      nodes.push({ type: 'ul', items });
      i = j;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\d+\.\s+/.test(lines[j].trim())) {
        items.push(lines[j].trim().replace(/^\d+\.\s+/, ''));
        j += 1;
      }
      nodes.push({ type: 'ol', items });
      i = j;
      continue;
    }

    // Paragraph (consume until blank line)
    const paraLines: string[] = [];
    let j = i;
    while (j < lines.length && lines[j].trim()) {
      // stop paragraph before a new list starts
      if (j !== i && (isHeadingLine(lines[j].trim()) || /^[-*]\s+/.test(lines[j].trim()) || /^\d+\.\s+/.test(lines[j].trim()))) {
        break;
      }
      paraLines.push(lines[j]);
      j += 1;
    }

    const paragraph = paraLines.join('\n').trim();
    const callout = detectCallout(paragraph);
    if (callout) {
      nodes.push(callout);
    } else {
      nodes.push({ type: 'paragraph', text: paragraph });
    }
    i = j;
  }

  return nodes;
};

const Callout: React.FC<{ node: Extract<TextNode, { type: 'callout' }> }> = ({ node }) => {
  const base = 'rounded-2xl border p-4';
  const variantClass =
    node.variant === 'warning'
      ? 'border-amber-200 bg-amber-50 dark:border-amber-200/40 dark:bg-amber-50/10'
      : node.variant === 'exam'
        ? 'border-brand-primary/30 bg-brand-primary/5 dark:bg-brand-primary/10'
        : node.variant === 'note'
          ? 'border-border-subtle bg-light-card dark:bg-dark-card dark:border-dark-border'
          : 'border-border-subtle bg-light-cardAlt dark:bg-dark-cardAlt dark:border-dark-border';

  return (
    <div className={`${base} ${variantClass}`}>
      <div className="text-sm font-semibold text-light-text dark:text-dark-text">{node.title}</div>
      <div className="mt-1 text-sm whitespace-pre-wrap leading-relaxed text-light-textSecondary dark:text-dark-muted">
        <InlineText text={node.text} />
      </div>
    </div>
  );
};

type QuizModel = {
  title?: string;
  questions: Array<{
    prompt: string;
    options?: string[];
    answerIndex?: number;
    expectedAnswer?: string;
    explanation?: string;
  }>;
};

const QuizPanel: React.FC<{ rawJson: string }> = ({ rawJson }) => {
  const [selected, setSelected] = useState<Record<number, number>>({});

  let model: QuizModel | null = null;
  try {
    const parsed = JSON.parse(rawJson);
    if (parsed && Array.isArray(parsed.questions)) model = parsed;
  } catch {
    model = null;
  }

  if (!model) {
    return (
      <div className="rounded-2xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card p-4">
        <div className="text-sm font-semibold text-light-text dark:text-dark-text">Quiz</div>
        <div className="mt-2 text-sm text-light-textSecondary dark:text-dark-muted whitespace-pre-wrap">
          Failed to load quiz JSON.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card p-4 space-y-4">
      <div className="text-sm font-semibold text-light-text dark:text-dark-text">{model.title || 'Quiz'}</div>
      {model.questions.map((q, qi) => {
        const hasOptions = Array.isArray(q.options) && q.options.length > 0 && Number.isInteger(q.answerIndex);
        const chosen = selected[qi];
        const answered = hasOptions && typeof chosen === 'number';
        const correct = answered && chosen === q.answerIndex;

        return (
          <div key={`q-${qi}`} className="rounded-xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt p-4">
            <div className="text-sm font-semibold text-light-text dark:text-dark-text">Q{qi + 1}. {q.prompt}</div>

            {hasOptions ? (
              <>
                <div className="mt-3 grid gap-2">
                  {q.options!.map((opt, oi) => {
                    const isChosen = chosen === oi;
                    const isAnswer = oi === q.answerIndex;

                    const base = 'w-full text-left px-3 py-2 rounded-lg border text-sm transition text-light-text dark:text-white';
                    const idle = 'border-border-subtle dark:border-slate-600 bg-light-card dark:bg-slate-800 hover:border-brand-primary/40 dark:hover:border-brand-primary';
                    const chosenCls = 'border-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20';
                    const correctCls = 'border-green-500/40 bg-green-500/10 dark:bg-green-500/20 dark:border-green-500';
                    const wrongCls = 'border-brand-primary/40 bg-brand-primary/10 dark:bg-red-500/20 dark:border-red-500';

                    const cls =
                      answered
                        ? isAnswer
                          ? `${base} ${correctCls}`
                          : isChosen
                            ? `${base} ${wrongCls}`
                            : `${base} ${idle}`
                        : isChosen
                          ? `${base} ${chosenCls}`
                          : `${base} ${idle}`;

                    return (
                      <button
                        key={`q-${qi}-o-${oi}`}
                        onClick={() => setSelected((prev) => ({ ...prev, [qi]: oi }))}
                        className={cls}
                        disabled={answered}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <div className="mt-3 text-sm">
                    <div className={correct ? 'text-green-600' : 'text-brand-primary'}>
                      {correct ? 'Correct' : 'Not correct'}
                    </div>
                    {q.explanation ? (
                      <div className="mt-1 text-light-textSecondary dark:text-dark-muted whitespace-pre-wrap">{q.explanation}</div>
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-3 text-sm text-light-textSecondary dark:text-dark-muted whitespace-pre-wrap">
                <div className="font-semibold text-light-text dark:text-dark-text">Sample answer:</div>
                <div className="mt-1">{q.expectedAnswer || '—'}</div>
                {q.explanation ? (
                  <div className="mt-2">
                    <div className="font-semibold text-light-text dark:text-dark-text">Explanation:</div>
                    <div className="mt-1">{q.explanation}</div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const LessonDescription: React.FC<{ value: string }> = ({ value }) => {
  const blocks = splitLessonDescription(value);
  return (
    <div className="space-y-6">
      {blocks.map((b, idx) => {
        if (b.type === 'code') {
          const lang = String(b.lang || '').toLowerCase();

          if (lang === 'quizjson') {
            return <QuizPanel key={`quiz-${idx}`} rawJson={b.value} />;
          }

          if (lang === 'interviewjson') {
            return <InterviewPracticePanel key={`interview-${idx}`} rawJson={b.value} />;
          }

          if (lang === 'c' || lang === 'cpp') {
            return (
              <RunnableCodeBlock
                key={`run-${idx}`}
                language={lang as 'c' | 'cpp'}
                initialCode={b.value}
                headerLabel={lang ? lang.toUpperCase() : 'CODE'}
              />
            );
          }

          return (
            <div key={`code-${idx}`} className="rounded-2xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt overflow-hidden">
              <div className="px-4 py-2 text-xs text-light-textMuted dark:text-dark-muted border-b border-border-subtle dark:border-dark-border">
                {b.lang ? b.lang.toUpperCase() : 'CODE'}
              </div>
              <pre className="p-4 overflow-auto text-sm leading-relaxed text-light-textSecondary dark:text-dark-muted">
                <code>{b.value}</code>
              </pre>
            </div>
          );
        }

        const nodes = parseTextToNodes(b.value);
        return (
          <div key={`text-${idx}`} className="space-y-4">
            {nodes.map((node, nIdx) => {
              if (node.type === 'heading') {
                const cls = node.level === 2
                  ? 'text-xl font-bold text-light-text dark:text-dark-text border-b border-border-subtle dark:border-dark-border pb-2'
                  : 'text-base font-semibold text-light-text dark:text-dark-text';
                return (
                  <div key={`h-${nIdx}`} className={cls}>
                    {node.text}
                  </div>
                );
              }

              if (node.type === 'paragraph') {
                return (
                  <div key={`p-${nIdx}`} className="text-sm whitespace-pre-wrap leading-relaxed text-light-textSecondary dark:text-dark-muted">
                    <InlineText text={node.text} />
                  </div>
                );
              }

              if (node.type === 'ul') {
                return (
                  <ul key={`ul-${nIdx}`} className="list-disc pl-6 space-y-2 text-sm text-light-textSecondary dark:text-dark-muted">
                    {node.items.map((it, k) => (
                      <li key={`uli-${nIdx}-${k}`}>
                        <InlineText text={it} />
                      </li>
                    ))}
                  </ul>
                );
              }

              if (node.type === 'ol') {
                return (
                  <ol key={`ol-${nIdx}`} className="list-decimal pl-6 space-y-2 text-sm text-light-textSecondary dark:text-dark-muted">
                    {node.items.map((it, k) => (
                      <li key={`oli-${nIdx}-${k}`}>
                        <InlineText text={it} />
                      </li>
                    ))}
                  </ol>
                );
              }

              if (node.type === 'callout') {
                return <Callout key={`c-${nIdx}`} node={node} />;
              }

              if (node.type === 'table') {
                const [header, ...body] = node.rows;
                return (
                  <div key={`t-${nIdx}`} className="rounded-2xl border border-border-subtle dark:border-dark-border overflow-hidden bg-light-card dark:bg-dark-card">
                    <div className="overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-light-cardAlt dark:bg-dark-cardAlt">
                          <tr>
                            {(header || []).map((h, k) => (
                              <th key={`th-${nIdx}-${k}`} className="text-left px-4 py-3 font-semibold text-light-text dark:text-dark-text border-b border-border-subtle dark:border-dark-border">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {body.map((row, rIdx) => (
                            <tr key={`tr-${nIdx}-${rIdx}`} className="border-b border-border-subtle dark:border-dark-border last:border-b-0">
                              {row.map((cell, cIdx) => (
                                <td key={`td-${nIdx}-${rIdx}-${cIdx}`} className="px-4 py-3 text-light-textSecondary dark:text-dark-muted align-top whitespace-pre-wrap">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        );
      })}
    </div>
  );
};

interface LearningPageProps {
  courseId: string;
}

const pythonNavGroupOrder = [
  { key: 'INTRO_BASICS', label: '1. INTRODUCTION & BASICS' },
  { key: 'FLOW_CONTROL', label: '2. FLOW CONTROL' },
  { key: 'STRINGS', label: '3. STRINGS' },
  { key: 'LISTS', label: '4. LISTS' },
  { key: 'TUPLES', label: '5. TUPLES' },
  { key: 'SETS', label: '6. SETS' },
  { key: 'DICTIONARIES', label: '7. DICTIONARIES' },
  { key: 'FUNCTIONS', label: '8. FUNCTIONS' },
  { key: 'MODULES_PACKAGES', label: '9. MODULES & PACKAGES' },
  { key: 'OOP_PART_1', label: '10. OBJECT ORIENTED PROGRAMMING – PART 1' },
  { key: 'EXCEPTIONS', label: '11. EXCEPTION HANDLING' },
  { key: 'DECORATORS', label: '12. DECORATORS' },
  { key: 'GENERATORS', label: '13. GENERATORS' },
  { key: 'ASSERTIONS', label: '14. ASSERTIONS' },
  { key: 'FILE_HANDLING', label: '15. FILE HANDLING' },
  { key: 'SERIALIZATION', label: '16. OBJECT SERIALIZATION' },
  { key: 'OOP_PART_2', label: '17. OOP – PART 2 (INHERITANCE & RELATIONSHIPS)' },
  { key: 'OOP_PART_3', label: '18. OOP – PART 3 (POLYMORPHISM)' },
  { key: 'OOP_PART_4', label: '19. OOP – PART 4 (ADVANCED OOP)' },
  { key: 'LOGGING', label: '20. LOGGING' },
] as const;

const pythonTitleKey = (title: string) =>
  String(title || '')
    .trim()
    .replace(/^\s*(LESSON\s*)?\d+(?:\.\d+)*\s*[:\-\)]\s*/i, '')
    .replace(/^\s*\d+(?:\.\d+)*\s+/, '')
    .replace(/\s+/g, ' ')
    .toUpperCase();

const guessPythonNavGroupKey = (lessonTitle: string): (typeof pythonNavGroupOrder)[number]['key'] => {
  const t = pythonTitleKey(lessonTitle);

  if (
    t.startsWith('INTRO') ||
    t.startsWith('IDENTIFIER') ||
    t.startsWith('RESERVED WORD') ||
    t.startsWith('DATA TYPE') ||
    t.startsWith('TYPE CAST') ||
    t.includes('IMMUTABIL') ||
    t.includes('ESCAPE CHARACTER') ||
    t.startsWith('CONSTANT') ||
    t.startsWith('OPERATOR') ||
    t.includes('DYNAMIC INPUT') ||
    t.includes('KEYBOARD') ||
    t.includes('COMMAND LINE ARG') ||
    t.startsWith('OUTPUT')
  ) {
    return 'INTRO_BASICS';
  }

  if (
    t.startsWith('FLOW CONTROL') ||
    t.startsWith('CONDITIONAL') ||
    t.startsWith('ITERATIVE') ||
    t.startsWith('TRANSFER STATEMENT') ||
    t.startsWith('DEL ')
  ) {
    return 'FLOW_CONTROL';
  }

  if (t.startsWith('STRING')) return 'STRINGS';
  if (t.startsWith('LIST')) return 'LISTS';
  if (t.startsWith('TUPLE')) return 'TUPLES';
  if (t.startsWith('SET')) return 'SETS';
  if (t.startsWith('DICT') || t.startsWith('DICTIONARY')) return 'DICTIONARIES';

  if (t.includes('FUNCTION')) return 'FUNCTIONS';
  if (t.includes('MODULE') || t.includes('PACKAGE')) return 'MODULES_PACKAGES';

  if (t.includes('LOGGING')) return 'LOGGING';

  if (t.includes('SERIALIZATION') || t.includes('PICKLE') || t === 'JSON' || t.startsWith('JSON ') || t.includes('YAML')) {
    return 'SERIALIZATION';
  }

  if (t.includes('FILE ') || t.startsWith('FILE') || t.includes('PATHLIB') || t.includes('CSV') || t.includes('ZIP') || t.includes('DIRECTOR')) {
    return 'FILE_HANDLING';
  }

  if (t.includes('ASSERT')) return 'ASSERTIONS';
  if (t.includes('GENERATOR') || t.includes('YIELD') || t.includes('STOPITERATION')) return 'GENERATORS';
  if (t.includes('DECORATOR') || t.includes('@')) return 'DECORATORS';
  if (t.includes('EXCEPTION') || t.includes('TRY') || t.includes('FINALLY') || t.includes('CUSTOM EXCEPTION')) return 'EXCEPTIONS';

  // OOP parts are usually distinguishable by title keywords.
  if (t.includes('INHERIT') || t.includes('MRO') || t.includes('HAS-A') || t.includes('IS-A') || t.includes('SUPER(')) return 'OOP_PART_2';
  if (t.includes('POLYMORPH') || t.includes('DUCK TYP') || t.includes('OVERRID') || t.includes('OVERLOAD')) return 'OOP_PART_3';
  if (t.includes('ABSTRACT') || t.includes('INTERFACE') || t.includes('PUBLIC') || t.includes('PROTECTED') || t.includes('PRIVATE') || t.includes('__STR__') || t.includes('__REPR__')) {
    return 'OOP_PART_4';
  }

  if (t.includes('OOP') || t.includes('CLASS') || t.includes('OBJECT') || t.includes('CONSTRUCTOR') || t.includes('__INIT__') || t.includes('INSTANCE') || t.includes('STATIC') || t.includes('GETTER') || t.includes('SETTER')) {
    return 'OOP_PART_1';
  }

  return 'INTRO_BASICS';
};

const LearningPage: React.FC<LearningPageProps> = ({ courseId }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any>({});
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const isPythonCourse = useMemo(() => /python/i.test(String(course?.title || '')), [course?.title]);

  const pythonGroupedLessons = useMemo(() => {
    const sections = Array.isArray(course?.sections) ? course.sections : [];
    const allLessons = sections.flatMap((s: any) => (Array.isArray(s?.lessons) ? s.lessons : []));

    const buckets = new Map<string, any[]>();
    for (const g of pythonNavGroupOrder) buckets.set(g.key, []);

    for (const lesson of allLessons) {
      const key = guessPythonNavGroupKey(String(lesson?.title || ''));
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(lesson);
    }

    return pythonNavGroupOrder
      .map((g) => ({ ...g, lessons: buckets.get(g.key) || [] }))
      .filter((g) => g.lessons.length > 0);
  }, [course]);

  const goBack = () => {
    try {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
    } catch {
      // ignore and fall back
    }
    window.location.hash = '/dashboard';
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/progress/${courseId}`)
      ]);

      setCourse(courseRes.data);
      setProgress(progressRes.data);

      // Set first lesson as current
      if (courseRes.data.sections.length > 0 && courseRes.data.sections[0].lessons.length > 0) {
        selectLesson(courseRes.data.sections[0].lessons[0]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
      toast.error('Failed to load course');
      setIsLoading(false);
    }
  };

  const selectLesson = async (lesson: any) => {
    setCurrentLesson(lesson);
    // Reset scroll to top when navigating to a new lesson so content starts at the top
    try {
      // small delay to allow render then jump to top
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
    } catch (e) {
      try { window.scrollTo(0, 0); } catch {};
    }

    if (!lesson?.videoUrl) {
      setVideoUrl('');
      return;
    }

    const isExternalUrl = /^https?:\/\//i.test(lesson.videoUrl);
    const isPublicPath = typeof lesson.videoUrl === 'string' && lesson.videoUrl.startsWith('/');

    if (isExternalUrl) {
      setVideoUrl(lesson.videoUrl);
      return;
    }

    if (isPublicPath) {
      setVideoUrl(lesson.videoUrl);
      return;
    }

    try {
      const response = await api.get('/upload/signed-url', {
        params: { key: lesson.videoUrl }
      });
      setVideoUrl(response.data.url);
    } catch (error) {
      console.error('Failed to get video URL:', error);
      toast.error('Video is temporarily unavailable.');
      setVideoUrl(lesson.videoUrl);
    }
  };

  const markLessonComplete = async () => {
    if (!currentLesson) return;

    try {
      await api.post('/progress', {
        courseId,
        lessonId: currentLesson._id,
        isCompleted: true
      });

      toast.success('Lesson marked as complete!');
      fetchCourseData(); // Refresh progress
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
      toast.error('Failed to update progress');
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.progress?.some((p: any) => p.lesson === lessonId && p.isCompleted);
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <a href="/#/dashboard" className="btn-primary">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="border-b border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt text-sm font-semibold text-light-text dark:text-dark-text hover:bg-brand-primary/5 transition"
              aria-label="Go back"
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>

            <div>
              <div className="text-xs uppercase tracking-wide text-light-textMuted dark:text-dark-muted">Interactive Tutorial</div>
              <div className="text-lg font-semibold text-light-text dark:text-dark-text">{course?.title || 'Course'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-light-textMuted dark:text-dark-muted">Navigation</div>
            <ThemeToggleCompact />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar navigation */}
          <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-120px)] lg:overflow-auto rounded-2xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card">
            <div className="p-5 border-b border-border-subtle dark:border-dark-border">
              <div className="text-sm font-semibold text-light-text dark:text-dark-text">Lesson Navigator</div>
              <div className="mt-2 flex items-center gap-4 text-xs text-light-textMuted dark:text-dark-muted">
                <span>{progress.enrollment?.progress || 0}% Complete</span>
                <span>{progress.enrollment?.completedLessons?.length || 0} / {course.totalLessons}</span>
              </div>
              <div className="w-full bg-border-subtle rounded-full h-2 mt-3">
                <div
                  className="bg-gradient-to-r from-brand-primary to-brand-blue h-2 rounded-full"
                  style={{ width: `${progress.enrollment?.progress || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4">
              {isPythonCourse ? (
                pythonGroupedLessons.map((group: any, groupIndex: number) => (
                  <div key={group.key} className="mb-3">
                    <button
                      onClick={() => toggleSection(groupIndex)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt hover:bg-brand-primary/5 transition text-left"
                    >
                      <span className="text-sm font-semibold text-light-text dark:text-dark-text">{group.label}</span>
                      {expandedSections.has(groupIndex)
                        ? <FaChevronUp className="text-light-textMuted dark:text-dark-muted" />
                        : <FaChevronDown className="text-light-textMuted dark:text-dark-muted" />}
                    </button>

                    {expandedSections.has(groupIndex) && (
                      <div className="mt-2 space-y-1">
                        {group.lessons.map((lesson: any) => {
                          const isCompleted = isLessonCompleted(lesson._id);
                          const isCurrent = currentLesson?._id === lesson._id;
                          const isLocked = !lesson.isPreview && !isCompleted;

                          const dotClass = isCurrent
                            ? 'bg-gradient-to-r from-brand-primary to-brand-blue'
                            : isCompleted
                              ? 'bg-green-500'
                              : isLocked
                                ? 'bg-border-subtle dark:bg-dark-border'
                                : 'bg-brand-primary/40';

                          return (
                            <button
                              key={lesson._id}
                              onClick={() => selectLesson(lesson)}
                              className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                                isCurrent
                                  ? 'bg-brand-primary/10 border-brand-primary'
                                  : 'bg-transparent border-transparent hover:bg-brand-primary/5'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-light-text dark:text-dark-text truncate">{lesson.title}</div>
                                  <div className="text-xs text-light-textMuted dark:text-dark-muted">{lesson.duration} min</div>
                                </div>
                                {isCurrent ? (
                                  <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-brand-primary to-brand-blue" />
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                course.sections.map((section: any, sectionIndex: number) => (
                  <div key={sectionIndex} className="mb-3">
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt hover:bg-brand-primary/5 transition text-left"
                    >
                      <span className="text-sm font-semibold text-light-text dark:text-dark-text">{section.title}</span>
                      {expandedSections.has(sectionIndex)
                        ? <FaChevronUp className="text-light-textMuted dark:text-dark-muted" />
                        : <FaChevronDown className="text-light-textMuted dark:text-dark-muted" />}
                    </button>

                    {expandedSections.has(sectionIndex) && (
                      <div className="mt-2 space-y-1">
                        {section.lessons.map((lesson: any) => {
                          const isCompleted = isLessonCompleted(lesson._id);
                          const isCurrent = currentLesson?._id === lesson._id;
                          const isLocked = !lesson.isPreview && !isCompleted;

                          const dotClass = isCurrent
                            ? 'bg-gradient-to-r from-brand-primary to-brand-blue'
                            : isCompleted
                              ? 'bg-green-500'
                              : isLocked
                                ? 'bg-border-subtle dark:bg-dark-border'
                                : 'bg-brand-primary/40';

                          return (
                            <button
                              key={lesson._id}
                              onClick={() => selectLesson(lesson)}
                              className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                                isCurrent
                                  ? 'bg-brand-primary/10 border-brand-primary'
                                  : 'bg-transparent border-transparent hover:bg-brand-primary/5'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-light-text dark:text-dark-text truncate">{lesson.title}</div>
                                  <div className="text-xs text-light-textMuted dark:text-dark-muted">{lesson.duration} min</div>
                                </div>
                                {isCurrent ? (
                                  <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-brand-primary to-brand-blue" />
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Main lesson */}
          <main className="rounded-2xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card overflow-hidden">
            {currentLesson && (
              <div>
                {videoUrl ? (
                  <div className="aspect-video bg-black">
                    {(/\.pdf(\?|#|$)/i.test(videoUrl) ? (
                      <iframe
                        src={videoUrl}
                        title={currentLesson.title || 'Lesson PDF'}
                        className="w-full h-full"
                      />
                    ) : (
                      <ReactPlayer
                        url={videoUrl}
                        width="100%"
                        height="100%"
                        controls
                        playing
                        config={{
                          file: {
                            attributes: {
                              controlsList: 'nodownload'
                            }
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-b border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card">
                    <div className="p-6">
                      <div className="text-xs uppercase tracking-wide text-light-textMuted dark:text-dark-muted mb-2">Notes Lesson</div>
                      <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">{currentLesson.title}</h1>
                    </div>
                  </div>
                )}

                <div className="bg-light-bg dark:bg-dark-bg p-6 space-y-8">
                  {videoUrl ? <h1 className="text-2xl font-bold mb-2 text-light-text dark:text-dark-text">{currentLesson.title}</h1> : null}
                  <LessonDescription
                    key={`lesson-desc-${currentLesson?._id || currentLesson?.title || 'unknown'}`}
                    value={currentLesson.content || currentLesson.description}
                  />

                  {/* Quiz Section */}
                  {currentLesson?.quiz && (
                    <div className="mt-8 pt-6 border-t border-border-subtle dark:border-dark-border">
                      <h2 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Quiz: Test Your Knowledge</h2>
                      {currentLesson.quiz.questions && currentLesson.quiz.questions.length > 0 ? (
                        <QuizPanel
                          key={`lesson-quiz-${currentLesson?._id || currentLesson?.title || 'unknown'}`}
                          rawJson={JSON.stringify(currentLesson.quiz)}
                        />
                      ) : null}
                    </div>
                  )}

                  {/* Interview Section */}
                  {currentLesson?.interview && (
                    <div className="mt-8 pt-6 border-t border-border-subtle dark:border-dark-border">
                      <h2 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Interview Practice: {currentLesson.interview.topic || 'This Topic'}</h2>
                      {currentLesson.interview.questions && currentLesson.interview.questions.length > 0 ? (
                        <InterviewPracticePanel
                          key={`lesson-interview-${currentLesson?._id || currentLesson?.title || 'unknown'}`}
                          rawJson={JSON.stringify(currentLesson.interview)}
                        />
                      ) : null}
                    </div>
                  )}

                  <div className="flex gap-4 flex-wrap mt-6">
                    <button
                      onClick={markLessonComplete}
                      className="btn-primary"
                    >
                      <FaCheck className="inline mr-2" />
                      Mark as Complete
                    </button>

                    {currentLesson.resources && currentLesson.resources.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {currentLesson.resources.map((resource: any, index: number) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                          >
                            <FaDownload className="inline mr-2" />
                            {resource.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <DoflowChatWidget
        lessonTitle={currentLesson?.title}
        lessonContent={currentLesson?.description}
      />
    </div>
  );
};

export default LearningPage;
