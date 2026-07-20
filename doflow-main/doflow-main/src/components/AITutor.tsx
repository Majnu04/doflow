import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageCircle, FiCode, FiBookOpen, FiTarget, FiCpu, FiLayers, FiZap, FiHelpCircle } from 'react-icons/fi';
import { askMentor } from '../../services/geminiService';
import toast from 'react-hot-toast';
import { Button } from './ui';

interface AITutorProps {
  defaultTopic?: string;
}

type MentorMode = 'explain' | 'code-review' | 'study-plan' | 'career' | 'summarize' | 'flashcards' | 'quiz';

const MODES: { id: MentorMode; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'explain', label: 'Explain', icon: <FiBookOpen className="w-4 h-4" />, description: 'Get personalized explanations' },
  { id: 'summarize', label: 'Summarize', icon: <FiLayers className="w-4 h-4" />, description: 'Summarize lesson content' },
  { id: 'flashcards', label: 'Flashcards', icon: <FiZap className="w-4 h-4" />, description: 'Generate study flashcards' },
  { id: 'quiz', label: 'Quiz', icon: <FiHelpCircle className="w-4 h-4" />, description: 'Test your knowledge' },
  { id: 'code-review', label: 'Code Review', icon: <FiCode className="w-4 h-4" />, description: 'Review your code' },
  { id: 'study-plan', label: 'Study Plan', icon: <FiTarget className="w-4 h-4" />, description: 'Create a learning plan' },
  { id: 'career', label: 'Career', icon: <FiCpu className="w-4 h-4" />, description: 'Career guidance' },
];

const PLACEHOLDERS: Record<MentorMode, string> = {
  explain: 'e.g., Explain binary search trees...',
  summarize: 'Paste lesson content to summarize...',
  flashcards: 'e.g., Create flashcards for Python data types...',
  quiz: 'e.g., Quiz me on JavaScript closures...',
  'code-review': 'Paste your code and I\'ll review it...',
  'study-plan': 'e.g., Create a 4-week DSA study plan...',
  career: 'e.g., How to prepare for FAANG interviews?',
};

const AITutor: React.FC<AITutorProps> = ({ defaultTopic = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<MentorMode>('explain');
  const [topic, setTopic] = useState(defaultTopic);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAskAI = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const userMessage = topic.trim();
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setExplanation('');
    setTopic('');

    try {
      const result = await askMentor(mode, userMessage);
      setExplanation(result);
      setChatHistory(prev => [...prev, { role: 'ai', content: result }]);
    } catch (error: any) {
      console.error('AI Mentor Error:', error);
      const errorMsg = 'Sorry, I couldn\'t generate a response. Please try again.';
      setExplanation(errorMsg);
      setChatHistory(prev => [...prev, { role: 'ai', content: errorMsg }]);
      toast.error(error.message || 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (text: string) => {
    const sections = text.split(/\*\*(.+?)\*\*/g);
    return (
      <div className="space-y-3 text-sm leading-relaxed">
        {sections.map((section, index) => {
          if (index % 2 === 1) {
            return (
              <h4 key={index} className="text-sm font-bold text-brand-primary mt-4 first:mt-0">
                {section}
              </h4>
            );
          } else if (section.trim()) {
            const codeMatch = section.match(/```(\w+)?\n([\s\S]+?)```/);
            if (codeMatch) {
              return (
                <pre key={index} className="bg-neutral-dusk text-gray-100 p-3 rounded-lg overflow-x-auto text-xs font-mono">
                  <code>{codeMatch[2].trim()}</code>
                </pre>
              );
            }
            return (
              <p key={index} className="text-light-textSecondary">
                {section.trim()}
              </p>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-brand-primary to-brand-accent text-white p-3.5 rounded-2xl shadow-brand-lg hover:shadow-brand-xl transition-all duration-300 hover:scale-105 z-50 group"
          title="AI Mentor"
        >
          <FiMessageCircle className="text-xl" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse-glow" />
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-neutral-dusk text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium shadow-lg">
            AI Mentor
          </span>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[85vh] sm:max-h-[640px] bg-light-card rounded-2xl shadow-2xl border border-border-subtle flex flex-col z-50 animate-pop-in overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-accent text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiMessageCircle className="text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Mentor</h3>
                <p className="text-[11px] text-white/70">Powered by DoFlow</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="px-4 py-2.5 border-b border-border-subtle/50 flex gap-1 overflow-x-auto flex-shrink-0">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                  ${mode === m.id
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-light-textMuted hover:text-light-text hover:bg-light-cardAlt'
                  }
                `}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {chatHistory.length === 0 && !isLoading && (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiMessageCircle className="w-7 h-7 text-brand-primary" />
                </div>
                <h4 className="font-bold text-light-text mb-1">AI Mentor</h4>
                <p className="text-sm text-light-textSecondary mb-1">
                  {MODES.find(m => m.id === mode)?.description}
                </p>
                <p className="text-xs text-light-textMuted mb-4">
                  Ask anything about programming, code, or your career.
                </p>

                {/* Quick Actions */}
                {defaultTopic && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-light-textMuted uppercase tracking-wider font-medium">Quick actions for this lesson</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {[
                        { label: 'Explain this', mode: 'explain' as MentorMode, prefix: 'Explain: ' },
                        { label: 'Summarize', mode: 'summarize' as MentorMode, prefix: 'Summarize this lesson: ' },
                        { label: 'Flashcards', mode: 'flashcards' as MentorMode, prefix: 'Create flashcards for: ' },
                        { label: 'Quiz me', mode: 'quiz' as MentorMode, prefix: 'Quiz me on: ' },
                      ].map((action) => (
                        <button
                          key={action.label}
                          onClick={() => {
                            setMode(action.mode);
                            setTopic(action.prefix + defaultTopic);
                          }}
                          className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-lg hover:bg-brand-primary/20 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[85%] rounded-2xl px-4 py-3
                  ${msg.role === 'user'
                    ? 'bg-brand-primary text-white rounded-br-md'
                    : 'bg-light-cardAlt border border-border-subtle/40 rounded-bl-md'
                  }
                `}>
                  {msg.role === 'ai' ? renderContent(msg.content) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-light-cardAlt border border-border-subtle/40 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-light-textMuted">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border-subtle/50 p-3 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAskAI()}
                placeholder={PLACEHOLDERS[mode]}
                className="flex-1 px-4 py-2.5 bg-light-cardAlt/60 border border-border-subtle/40 rounded-xl text-sm text-light-text placeholder:text-light-textMuted/60 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleAskAI}
                disabled={isLoading || !topic.trim()}
                className="p-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AITutor;
