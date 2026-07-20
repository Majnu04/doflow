import React, { useEffect, useState } from 'react';
import { FaTrophy, FaStar, FaCertificate, FaRocket, FaCheck } from 'react-icons/fa';

interface CourseCompletionProps {
  courseTitle: string;
  totalLessons: number;
  sessionTime?: string;
  onDismiss?: () => void;
  onGoToDashboard?: () => void;
  onDownloadCertificate?: () => void;
}

const CONFETTI_COLORS = ['#E06438', '#F3A45C', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

const ConfettiPiece: React.FC<{ color: string; delay: number; x: number }> = ({ color, delay, x }) => (
  <div
    className="fixed pointer-events-none z-[100]"
    style={{
      left: `${x}%`,
      top: '-10px',
      animation: `confetti-fall ${2 + Math.random() * 2}s ease-in ${delay}s forwards`,
    }}
  >
    <div
      style={{
        width: `${6 + Math.random() * 6}px`,
        height: `${6 + Math.random() * 6}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  </div>
);

const CourseCompletion: React.FC<CourseCompletionProps> = ({
  courseTitle,
  totalLessons,
  sessionTime,
  onDismiss,
  onGoToDashboard,
  onDownloadCertificate,
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Confetti overlay */}
      <div className="fixed inset-0 z-[99] pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <ConfettiPiece
            key={i}
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
            delay={Math.random() * 1.5}
            x={Math.random() * 100}
          />
        ))}
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes scale-in {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onDismiss}>
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          style={{ animation: 'scale-in 0.5s ease-out forwards' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Trophy Header */}
          <div className="relative p-10 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-16 h-16 border-2 border-white/30 rounded-full"
                  style={{
                    left: `${10 + (i * 12)}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animation: `scale-in ${0.3 + i * 0.1}s ease-out ${0.2 + i * 0.05}s both`,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ animation: 'scale-in 0.6s ease-out 0.3s both' }}>
                <FaTrophy className="text-white text-3xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ animation: 'scale-in 0.5s ease-out 0.5s both' }}>
                Congratulations!
              </h1>
              <p className="text-white/90 text-lg font-medium" style={{ animation: 'scale-in 0.5s ease-out 0.6s both' }}>
                You completed the course!
              </p>
            </div>
          </div>

          {showContent && (
            <div className="p-8">
              {/* Course info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{courseTitle}</h2>
                <p className="text-gray-500 text-sm">{totalLessons} lessons completed{sessionTime ? ` in ${sessionTime}` : ''}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: <FaStar className="text-yellow-500" />, label: 'XP Earned', value: `+${totalLessons * 50}` },
                  { icon: <FaRocket className="text-orange-500" />, label: 'Streak', value: 'Maintained' },
                  { icon: <FaCertificate className="text-blue-500" />, label: 'Certificate', value: 'Ready' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="flex justify-center mb-1">{icon}</div>
                    <div className="text-xs font-bold text-gray-900">{value}</div>
                    <div className="text-[10px] text-gray-500">{label}</div>
                  </div>
                ))}
              </div>

              {/* Achievements unlocked */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 mb-6">
                <p className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                  <FaCheck className="text-green-500" /> Achievements Unlocked
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Course Graduate', 'Dedicated Learner', 'Knowledge Seeker'].map((badge) => (
                    <span key={badge} className="px-2.5 py-1 bg-white text-orange-700 text-xs font-medium rounded-full border border-orange-200 shadow-sm">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {onDownloadCertificate && (
                  <button
                    onClick={onDownloadCertificate}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <FaCertificate /> Download Certificate
                  </button>
                )}
                {onGoToDashboard && (
                  <button
                    onClick={onGoToDashboard}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all"
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>

              {onDismiss && (
                <button onClick={onDismiss} className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  Continue browsing
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseCompletion;
