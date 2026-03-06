import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import api from '../utils/api';

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type Props = {
  lessonTitle?: string;
  lessonContent?: string;
};

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const DoflowChatWidget: React.FC<Props> = ({ lessonTitle, lessonContent }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const baseWelcome = useMemo(() => {
    const title = String(lessonTitle || '').trim();
    return title
      ? `Hi, I am DOFLOW Chatbot. Ask me anything about: ${title}`
      : 'Hi, I am DOFLOW Chatbot. Ask me your doubt.';
  }, [lessonTitle]);

  const [messages, setMessages] = useState<Msg[]>(() => [
    { id: uid(), role: 'assistant', text: baseWelcome },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset chat when lesson changes so it's lesson-specific.
    setMessages([{ id: uid(), role: 'assistant', text: baseWelcome }]);
    setInput('');
  }, [baseWelcome]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length]);

  const send = async () => {
    const q = input.trim();
    if (!q || sending) return;

    const userMsg: Msg = { id: uid(), role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post('/ai/lesson-chat', {
        lessonTitle: lessonTitle || '',
        lessonContent: lessonContent || '',
        question: q,
      });
      const answer = String(res.data?.answer || '').trim() || 'Sorry, I could not answer.';
      setMessages((prev) => [...prev, { id: uid(), role: 'assistant', text: answer }]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'AI is not available right now.';
      setMessages((prev) => [...prev, { id: uid(), role: 'assistant', text: String(msg) }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="group rounded-full px-4 py-3 bg-gradient-to-r from-brand-primary to-brand-blue text-white shadow-lg hover:opacity-95 transition"
          aria-label="Open DOFLOW Chatbot"
        >
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-white/90" />
            <div className="text-sm font-semibold">DOFLOW Chatbot</div>
          </div>
        </button>
      ) : (
        <div className="w-[340px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-light-text dark:text-dark-text">DOFLOW Chatbot</div>
              <div className="text-xs text-light-textMuted dark:text-dark-muted truncate max-w-[260px]">
                {lessonTitle ? `Lesson: ${lessonTitle}` : 'Lesson chat'}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card hover:border-brand-primary transition"
            >
              Close
            </button>
          </div>

          <div ref={scrollRef} className="p-4 space-y-3 max-h-[360px] overflow-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === 'user'
                    ? 'ml-10 rounded-2xl px-3 py-2 bg-brand-primary/10 border border-brand-primary/20 text-light-text dark:text-dark-text'
                    : 'mr-10 rounded-2xl px-3 py-2 bg-light-cardAlt dark:bg-dark-cardAlt border border-border-subtle dark:border-dark-border text-light-textSecondary dark:text-dark-muted'
                }
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
            ))}
            {sending ? (
              <div className="mr-10 rounded-2xl px-3 py-2 bg-light-cardAlt dark:bg-dark-cardAlt border border-border-subtle dark:border-dark-border text-light-textSecondary dark:text-dark-muted">
                <div className="text-sm">Typing…</div>
              </div>
            ) : null}
          </div>

          <div className="p-3 border-t border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') send();
                }}
                placeholder="Ask your doubt…"
                className="flex-1 px-3 py-2 rounded-xl border-2 border-border-subtle dark:border-slate-600 bg-light-card dark:bg-slate-800 text-sm text-light-textSecondary dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-brand-primary dark:focus:border-brand-primary transition-colors"
                disabled={sending}
              />
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-blue text-white disabled:opacity-60 transition"
                aria-label="Send"
              >
                <FaPaperPlane />
              </button>
            </div>
            <div className="mt-2 text-[11px] text-light-textMuted dark:text-dark-muted">
              Ask only lesson-related doubts for best answers.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoflowChatWidget;
