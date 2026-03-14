import React, { useMemo, useState } from 'react';
import api from '../utils/api';

type InterviewQuestion = {
  prompt: string;
  sampleAnswer?: string;
};

type InterviewModel = {
  title?: string;
  topic?: string;
  questions: InterviewQuestion[];
};

const normalize = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const keywordFallback = (expected: string, user: string) => {
  const exp = normalize(expected);
  const usr = normalize(user);
  if (!exp) return { score: null, verdict: 'partial', feedback: '- Reference answer not available\n- Try to cover definition + key rule + small example', missingPoints: '' };

  const words = exp.split(' ').filter((w) => w.length >= 5);
  const unique = Array.from(new Set(words)).slice(0, 12);
  const hits = unique.filter((w) => usr.includes(w)).length;
  const ratio = unique.length ? hits / unique.length : 0;

  const score = Math.max(0, Math.min(5, Math.round(ratio * 5)));
  const verdict = score >= 4 ? 'good' : score >= 2 ? 'partial' : 'wrong';
  const feedback = `- Covered ${hits}/${unique.length} key terms (fallback check)\n- Add 1 short example to strengthen answer`;
  const missing = unique.filter((w) => !usr.includes(w)).slice(0, 4);
  const missingPoints = missing.length ? missing.map((w) => `- Mention: ${w}`).join('\n') : '';

  return { score, verdict, feedback, missingPoints };
};

const InterviewPracticePanel: React.FC<{ rawJson: string }> = ({ rawJson }) => {
  const model: InterviewModel | null = useMemo(() => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || !Array.isArray(parsed.questions)) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [rawJson]);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});
  const [checking, setChecking] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<Record<number, { score: number | null; verdict: string; feedback: string; missingPoints: string }>>({});

  if (!model) {
    return (
      <div className="rounded-2xl border-2 border-border-subtle dark:border-slate-600 bg-light-card dark:bg-slate-800 p-4">
        <div className="text-sm font-semibold text-light-text dark:text-white">Interview Practice</div>
        <div className="mt-2 text-sm text-light-textSecondary dark:text-slate-200 whitespace-pre-wrap">Failed to load interview JSON.</div>
      </div>
    );
  }

  const topic = model.topic || 'C';

  const checkOne = async (idx: number) => {
    const q = model.questions[idx];
    const userAnswer = String(answers[idx] || '').trim();
    if (!userAnswer) return;

    setChecking((p) => ({ ...p, [idx]: true }));
    try {
      const expectedAnswer = String(q.sampleAnswer || '').trim();
      const res = await api.post('/ai/evaluate-answer', {
        topic,
        question: q.prompt,
        expectedAnswer,
        userAnswer,
      });
      setResult((p) => ({
        ...p,
        [idx]: {
          score: res.data?.score ?? null,
          verdict: res.data?.verdict ?? 'partial',
          feedback: res.data?.feedback ?? '',
          missingPoints: res.data?.missingPoints ?? '',
        },
      }));
    } catch {
      // Fallback: keyword-ish check from sampleAnswer
      const expected = String(q.sampleAnswer || '').trim();
      setResult((p) => ({ ...p, [idx]: keywordFallback(expected, userAnswer) }));
    } finally {
      setChecking((p) => ({ ...p, [idx]: false }));
    }
  };

  return (
    <div className="rounded-2xl border-2 border-border-subtle dark:border-slate-600 bg-light-card dark:bg-slate-800 p-4 space-y-4">
      <div className="text-sm font-semibold text-light-text dark:text-white">{model.title || 'Interview Practice'}</div>

      {model.questions.map((q, idx) => {
        const r = result[idx];
        const canShowKey = Boolean(q.sampleAnswer && String(q.sampleAnswer).trim());

        return (
          <div key={`int-${idx}`} className="rounded-xl border-2 border-border-subtle dark:border-slate-600 bg-light-cardAlt dark:bg-dark-cardAlt p-4">
            <div className="text-sm font-semibold text-light-text dark:text-white">Q{idx + 1}. {q.prompt}</div>

            <textarea
              className="mt-3 w-full min-h-[96px] rounded-lg border-2 border-border-subtle dark:border-slate-600 bg-light-card dark:bg-slate-800 p-3 text-sm text-light-textSecondary dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-brand-primary dark:focus:border-brand-primary transition-colors"
              placeholder="Type your answer here…"
              value={answers[idx] || ''}
              onChange={(e) => setAnswers((p) => ({ ...p, [idx]: e.target.value }))}
            />

            <div className="mt-3 flex gap-2 flex-wrap">
              <button
                onClick={() => checkOne(idx)}
                disabled={checking[idx] || !String(answers[idx] || '').trim()}
                className="text-xs px-3 py-1.5 rounded-lg border-2 border-border-subtle dark:border-slate-600 bg-light-card dark:bg-slate-800 text-light-text dark:text-white hover:border-brand-primary dark:hover:border-brand-primary transition disabled:opacity-60"
              >
                {checking[idx] ? 'Checking…' : 'Check answer'}
              </button>

              {canShowKey && (
                <button
                  onClick={() => setShowKey((p) => ({ ...p, [idx]: !p[idx] }))}
                  className="text-xs px-3 py-1.5 rounded-lg border-2 border-border-subtle dark:border-slate-600 bg-light-card dark:bg-slate-800 text-light-text dark:text-white hover:border-brand-primary dark:hover:border-brand-primary transition"
                >
                  {showKey[idx] ? 'Hide answer' : 'Show answer'}
                </button>
              )}
            </div>

            {r && (
              <div className="mt-3 rounded-lg border-2 border-border-subtle dark:border-slate-600 bg-light-card dark:bg-slate-800 p-3">
                <div className="text-xs font-semibold text-light-text dark:text-white">
                  Feedback{typeof r.score === 'number' ? ` · Score ${r.score}/5` : ''}{r.verdict ? ` · ${r.verdict}` : ''}
                </div>
                {r.feedback ? (
                  <pre className="mt-2 text-sm whitespace-pre-wrap text-light-textSecondary dark:text-slate-200">{r.feedback}</pre>
                ) : null}
                {r.missingPoints ? (
                  <pre className="mt-2 text-sm whitespace-pre-wrap text-light-textSecondary dark:text-slate-200">{r.missingPoints}</pre>
                ) : null}
              </div>
            )}

            {showKey[idx] && canShowKey && (
              <div className="mt-3 rounded-lg border-2 border-border-subtle dark:border-slate-600 bg-light-card dark:bg-slate-800 p-3">
                <div className="text-xs font-semibold text-light-text dark:text-white">Sample answer</div>
                <div className="mt-2 text-sm whitespace-pre-wrap text-light-textSecondary dark:text-slate-200">{q.sampleAnswer}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InterviewPracticePanel;
