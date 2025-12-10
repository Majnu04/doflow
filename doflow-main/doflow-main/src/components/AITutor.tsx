import React, { useState } from 'react';
import { FaRobot, FaTimes, FaSpinner } from 'react-icons/fa';
import { explainTopic } from '../../services/geminiService';
import toast from 'react-hot-toast';

interface AITutorProps {
  defaultTopic?: string;
}

const AITutor: React.FC<AITutorProps> = ({ defaultTopic = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState(defaultTopic);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsLoading(true);
    setExplanation('');

    try {
      const result = await explainTopic(topic);
      setExplanation(result);
    } catch (error: any) {
      console.error('AI Tutor Error:', error);
      toast.error(error.message || 'Failed to get explanation');
      setExplanation('Sorry, I couldn\'t generate an explanation. Please try again or rephrase your question.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderExplanation = () => {
    if (!explanation) return null;

    // Parse markdown-style formatting
    const sections = explanation.split(/\*\*(.+?)\*\*/g);
    
    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          if (index % 2 === 1) {
            // This is a heading
            return (
              <h3 key={index} className="text-sm font-semibold text-orange-600 mt-4">
                {section}
              </h3>
            );
          } else if (section.trim()) {
            // Check if it's a code block
            const codeMatch = section.match(/```(\w+)?\n([\s\S]+?)```/);
            if (codeMatch) {
              return (
                <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{codeMatch[2].trim()}</code>
                </pre>
              );
            }
            // Regular text
            return (
              <p key={index} className="text-gray-700 text-sm leading-relaxed">
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
      {/* Floating AI Tutor Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
          title="Ask AI Tutor"
        >
          <FaRobot className="text-2xl" />
          <span className="absolute -top-2 -right-2 bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ask AI Tutor
          </span>
        </button>
      )}

      {/* AI Tutor Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[calc(100vw-3rem)] sm:w-96 max-h-[80vh] sm:max-h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <FaRobot className="text-xl sm:text-2xl" />
              <div>
                <h3 className="font-bold text-sm sm:text-base">AI Tutor</h3>
                <p className="text-xs text-orange-100">Powered by DoFlow</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
            {/* Input Section */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                What would you like to learn?
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                  placeholder="e.g., Python loops, variables..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs sm:text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={handleAskAI}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    'Ask'
                  )}
                </button>
              </div>
            </div>

            {/* Explanation Section */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <FaSpinner className="text-4xl text-orange-500 animate-spin mb-3" />
                <p className="text-gray-600 text-sm">Generating explanation...</p>
              </div>
            )}

            {!isLoading && explanation && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {renderExplanation()}
              </div>
            )}

            {!isLoading && !explanation && (
              <div className="text-center py-8">
                <FaRobot className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Ask me anything about programming!
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  I'll explain it in simple terms with examples.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-gray-500 text-center">
              💡 Tip: Be specific in your questions for better answers
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AITutor;
