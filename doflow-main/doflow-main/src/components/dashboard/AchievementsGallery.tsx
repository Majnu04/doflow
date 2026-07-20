import React, { useState } from 'react';
import { FiAward, FiLock, FiCheck } from 'react-icons/fi';
import { Achievement } from '../../store/slices/gamificationSlice';
import { ProgressBar, Badge, Tooltip } from '../ui';

interface AchievementsGalleryProps {
  achievements: Achievement[];
  compact?: boolean;
  maxDisplay?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  learning: { bg: 'bg-sky-50', text: 'text-sky-600', accent: 'bg-sky-100' },
  coding: { bg: 'bg-emerald-50', text: 'text-emerald-600', accent: 'bg-emerald-100' },
  social: { bg: 'bg-purple-50', text: 'text-purple-600', accent: 'bg-purple-100' },
  streak: { bg: 'bg-amber-50', text: 'text-amber-600', accent: 'bg-amber-100' },
};

const AchievementsGallery: React.FC<AchievementsGalleryProps> = ({
  achievements,
  compact = false,
  maxDisplay,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const categories = [...new Set(achievements.map(a => a.category))];

  const filteredAchievements = selectedCategory
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements;

  const displayAchievements = maxDisplay
    ? filteredAchievements.slice(0, maxDisplay)
    : filteredAchievements;

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  if (compact) {
    return (
      <div className="bg-light-card border border-border-subtle rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-light-text flex items-center gap-2">
            <FiAward className="w-4 h-4 text-brand-primary" />
            Achievements
          </h3>
          <Badge variant="primary" size="xs">
            {unlockedCount}/{achievements.length}
          </Badge>
        </div>

        <div className="flex gap-2 flex-wrap">
          {displayAchievements.slice(0, 8).map((achievement) => {
            const isUnlocked = !!achievement.unlockedAt;
            return (
              <Tooltip
                key={achievement.id}
                content={`${achievement.title}: ${achievement.description}`}
                position="top"
              >
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center text-lg
                    transition-all duration-200
                    ${isUnlocked
                      ? 'bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 hover:scale-110 cursor-pointer'
                      : 'bg-border-subtle/30 opacity-40 grayscale'
                    }
                  `}
                >
                  {achievement.icon}
                </div>
              </Tooltip>
            );
          })}
          {displayAchievements.length > 8 && (
            <div className="w-10 h-10 rounded-xl bg-border-subtle/20 flex items-center justify-center text-[10px] font-bold text-light-textMuted">
              +{displayAchievements.length - 8}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-card border border-border-subtle rounded-2xl overflow-hidden shadow-card">
      {/* Header */}
      <div className="p-5 pb-3 border-b border-border-subtle/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-light-text flex items-center gap-2">
            <FiAward className="w-4 h-4 text-brand-primary" />
            Achievements
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="xs" dot>
              {unlockedCount} unlocked
            </Badge>
            <Badge variant="secondary" size="xs">
              {achievements.length - unlockedCount} remaining
            </Badge>
          </div>
        </div>

        {/* Progress overview */}
        <div className="mb-3">
          <ProgressBar
            value={achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}
            variant="brand"
            size="sm"
            showLabel
            label={`${Math.round(achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0)}%`}
          />
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
                !selectedCategory
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-light-textMuted hover:text-light-text hover:bg-light-cardAlt'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? `${CATEGORY_COLORS[cat]?.bg} ${CATEGORY_COLORS[cat]?.text}`
                    : 'text-light-textMuted hover:text-light-text hover:bg-light-cardAlt'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Achievement Grid */}
      <div className="p-5">
        {displayAchievements.length === 0 ? (
          <div className="text-center py-8">
            <FiAward className="w-10 h-10 text-light-textMuted mx-auto mb-3" />
            <p className="text-sm text-light-textMuted font-medium">No achievements yet</p>
            <p className="text-[11px] text-light-textMuted/70 mt-1">
              Complete lessons and challenges to earn badges
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayAchievements.map((achievement) => {
              const isUnlocked = !!achievement.unlockedAt;
              const progress = achievement.total > 0
                ? Math.round((achievement.progress / achievement.total) * 100)
                : 0;
              const colors = CATEGORY_COLORS[achievement.category] || CATEGORY_COLORS.learning;

              return (
                <div
                  key={achievement.id}
                  onMouseEnter={() => setHoveredId(achievement.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    relative p-4 rounded-xl border transition-all duration-300
                    ${isUnlocked
                      ? `border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent ${hoveredId === achievement.id ? 'shadow-md scale-[1.02]' : 'shadow-sm'}`
                      : 'border-border-subtle/40 bg-light-cardAlt/30 opacity-60'
                    }
                  `}
                >
                  {/* Badge icon */}
                  <div className="relative mb-3">
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                      ${isUnlocked ? colors.accent : 'bg-border-subtle/30'}
                      transition-all duration-300
                    `}>
                      {isUnlocked ? (
                        achievement.icon
                      ) : (
                        <FiLock className="w-5 h-5 text-light-textMuted" />
                      )}
                    </div>
                    {isUnlocked && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h4 className="text-xs font-bold text-light-text mb-0.5 leading-tight">
                    {achievement.title}
                  </h4>
                  <p className="text-[10px] text-light-textMuted leading-snug line-clamp-2">
                    {achievement.description}
                  </p>

                  {/* Progress bar */}
                  {!isUnlocked && achievement.total > 0 && (
                    <div className="mt-2.5">
                      <ProgressBar
                        value={progress}
                        variant="brand"
                        size="sm"
                      />
                      <p className="text-[9px] text-light-textMuted mt-1">
                        {achievement.progress}/{achievement.total}
                      </p>
                    </div>
                  )}

                  {/* Unlock date */}
                  {isUnlocked && achievement.unlockedAt && (
                    <p className="text-[9px] text-emerald-500 font-medium mt-2">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsGallery;
