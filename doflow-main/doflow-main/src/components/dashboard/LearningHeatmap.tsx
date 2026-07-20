import React from 'react';

interface LearningHeatmapProps {
  data?: Array<{ date: string; intensity: number }>;
}

const LearningHeatmap: React.FC<LearningHeatmapProps> = ({ data = [] }) => {
  // Generate last 16 weeks (112 days) of data
  const weeks = 16;
  const days = 7;
  const today = new Date();

  const getIntensity = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];
    const entry = data.find(d => d.date === dateStr);
    return entry?.intensity || 0;
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-border-subtle/30';
    if (intensity <= 0.25) return 'bg-brand-primary/20';
    if (intensity <= 0.5) return 'bg-brand-primary/40';
    if (intensity <= 0.75) return 'bg-brand-primary/60';
    return 'bg-brand-primary';
  };

  const grid: Array<Array<{ date: Date; intensity: number }>> = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * 7 - 1) + (6 - today.getDay()));

  for (let w = 0; w < weeks; w++) {
    const week: Array<{ date: Date; intensity: number }> = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + w * 7 + d);
      if (date <= today) {
        week.push({ date, intensity: getIntensity(date) });
      }
    }
    grid.push(week);
  }

  const totalActiveDays = data.filter(d => d.intensity > 0).length;

  return (
    <div className="bg-light-card border border-border-subtle rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-light-text">Learning Activity</h3>
        <span className="text-xs text-light-textMuted">{totalActiveDays} active days</span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-fit">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-[2px] ${getColor(day.intensity)} transition-colors duration-200 hover:ring-1 hover:ring-brand-primary/30`}
                  title={`${day.date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}: ${Math.round(day.intensity * 100)}% activity`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[9px] text-light-textMuted">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((level, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-[1px] ${getColor(level)}`}
          />
        ))}
        <span className="text-[9px] text-light-textMuted">More</span>
      </div>
    </div>
  );
};

export default LearningHeatmap;
