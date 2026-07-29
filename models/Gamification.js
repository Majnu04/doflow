import mongoose from 'mongoose';

const streakHistorySchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  active: { type: Boolean, default: false },
}, { _id: false });

const achievementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '' },
  category: { type: String, enum: ['learning', 'coding', 'social', 'streak'], default: 'learning' },
  progress: { type: Number, default: 0 },
  total: { type: Number, default: 1 },
  unlockedAt: { type: Date, default: null },
}, { _id: false });

const dailyGoalSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  unit: { type: String, required: true },
  type: { type: String, enum: ['lessons', 'problems', 'minutes', 'streak'], required: true },
}, { _id: false });

const activitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['lesson_completed', 'problem_solved', 'course_enrolled', 'certificate_earned', 'achievement_unlocked'], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  icon: { type: String, default: '' },
}, { _id: false });

const weeklyStatsSchema = new mongoose.Schema({
  day: { type: String, required: true },
  lessons: { type: Number, default: 0 },
  problems: { type: Number, default: 0 },
  minutes: { type: Number, default: 0 },
}, { _id: false });

const gamificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // Streak
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: String, default: null }, // YYYY-MM-DD
  streakHistory: [streakHistorySchema],

  // XP & Leveling
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xpToNextLevel: { type: Number, default: 100 },
  xpThisWeek: { type: Number, default: 0 },
  recentXPGains: [{
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    date: { type: Date, default: Date.now },
  }],

  // Achievements
  achievements: [achievementSchema],

  // Daily Goals
  dailyGoals: [dailyGoalSchema],
  lastGoalReset: { type: String, default: null }, // YYYY-MM-DD

  // Activity
  activities: [activitySchema],

  // Weekly Stats
  weeklyStats: [weeklyStatsSchema],
}, {
  timestamps: true,
});

// XP thresholds per level
const XP_PER_LEVEL = 100;
const XP_MULTIPLIER = 1.5;

gamificationSchema.methods.calculateLevel = function () {
  let level = 1;
  let xpNeeded = XP_PER_LEVEL;
  let totalXP = this.totalXP;

  while (totalXP >= xpNeeded) {
    totalXP -= xpNeeded;
    level++;
    xpNeeded = Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
  }

  this.level = level;
  this.xpToNextLevel = xpNeeded - totalXP;
  return this.level;
};

gamificationSchema.methods.addXP = function (amount, reason) {
  this.totalXP += amount;
  this.xpThisWeek += amount;
  this.recentXPGains.unshift({ amount, reason, date: new Date() });
  if (this.recentXPGains.length > 20) {
    this.recentXPGains = this.recentXPGains.slice(0, 20);
  }
  this.calculateLevel();
};

gamificationSchema.methods.updateStreak = function () {
  const today = new Date().toISOString().split('T')[0];
  if (this.lastActivityDate === today) return; // already active today

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (this.lastActivityDate === yesterday) {
    this.currentStreak += 1;
  } else {
    this.currentStreak = 1;
  }

  this.lastActivityDate = today;
  this.longestStreak = Math.max(this.longestStreak, this.currentStreak);

  // Update streak history (keep last 30 days)
  const existing = this.streakHistory.find(h => h.date === today);
  if (existing) {
    existing.active = true;
  } else {
    this.streakHistory.push({ date: today, active: true });
  }
  if (this.streakHistory.length > 30) {
    this.streakHistory = this.streakHistory.slice(-30);
  }
};

const Gamification = mongoose.model('Gamification', gamificationSchema);

export default Gamification;
