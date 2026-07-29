import Gamification from '../models/Gamification.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const ACHIEVEMENTS_DEFINITIONS = [
  // Learning achievements
  { id: 'first_lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', category: 'learning', total: 1 },
  { id: 'ten_lessons', title: 'Getting Started', description: 'Complete 10 lessons', icon: '📚', category: 'learning', total: 10 },
  { id: 'fifty_lessons', title: 'Knowledge Seeker', description: 'Complete 50 lessons', icon: '🎓', category: 'learning', total: 50 },
  { id: 'hundred_lessons', title: 'Scholar', description: 'Complete 100 lessons', icon: '🏛️', category: 'learning', total: 100 },
  { id: 'first_course', title: 'Course Complete', description: 'Complete your first course', icon: '🏆', category: 'learning', total: 1 },
  { id: 'three_courses', title: 'Multi-Talented', description: 'Complete 3 courses', icon: '🌟', category: 'learning', total: 3 },

  // Coding achievements
  { id: 'first_problem', title: 'Code Warrior', description: 'Solve your first coding problem', icon: '⚔️', category: 'coding', total: 1 },
  { id: 'ten_problems', title: 'Problem Solver', description: 'Solve 10 coding problems', icon: '🧩', category: 'coding', total: 10 },
  { id: 'fifty_problems', title: 'Algorithm Ace', description: 'Solve 50 coding problems', icon: '🧠', category: 'coding', total: 50 },
  { id: 'hundred_problems', title: 'Code Master', description: 'Solve 100 coding problems', icon: '💎', category: 'coding', total: 100 },

  // Streak achievements
  { id: 'streak_3', title: 'Consistent', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streak', total: 3 },
  { id: 'streak_7', title: 'Dedicated', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streak', total: 7 },
  { id: 'streak_14', title: 'Committed', description: 'Maintain a 14-day streak', icon: '🔥', category: 'streak', total: 14 },
  { id: 'streak_30', title: 'Unstoppable', description: 'Maintain a 30-day streak', icon: '🔥', category: 'streak', total: 30 },

  // Social achievements
  { id: 'first_review', title: 'Reviewer', description: 'Leave your first course review', icon: '💬', category: 'social', total: 1 },
];

const getOrCreateGamification = async (userId) => {
  let gamification = await Gamification.findOne({ user: userId });
  if (!gamification) {
    gamification = await Gamification.create({
      user: userId,
      dailyGoals: [
        { id: uuidv4(), title: 'Complete Lessons', target: 3, current: 0, unit: 'lessons', type: 'lessons' },
        { id: uuidv4(), title: 'Solve Problems', target: 2, current: 0, unit: 'problems', type: 'problems' },
        { id: uuidv4(), title: 'Study Time', target: 30, current: 0, unit: 'min', type: 'minutes' },
      ],
      achievements: ACHIEVEMENTS_DEFINITIONS.map(a => ({ ...a, progress: 0, unlockedAt: null })),
      weeklyStats: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        day, lessons: 0, problems: 0, minutes: 0,
      })),
    });
  }
  return gamification;
};

// @desc    Get gamification data for current user
// @route   GET /api/gamification/me
// @access  Private
export const getGamificationData = async (req, res) => {
  try {
    const gamification = await getOrCreateGamification(req.user._id);

    // Reset daily goals if new day
    const today = new Date().toISOString().split('T')[0];
    if (gamification.lastGoalReset !== today) {
      gamification.dailyGoals.forEach(goal => { goal.current = 0; });
      gamification.lastGoalReset = today;
      gamification.xpThisWeek = 0;
      await gamification.save();
    }

    res.json({
      streak: {
        currentStreak: gamification.currentStreak,
        longestStreak: gamification.longestStreak,
        lastActivityDate: gamification.lastActivityDate,
        streakHistory: gamification.streakHistory,
      },
      xp: {
        totalXP: gamification.totalXP,
        level: gamification.level,
        xpToNextLevel: gamification.xpToNextLevel,
        xpThisWeek: gamification.xpThisWeek,
        recentXPGains: gamification.recentXPGains,
      },
      achievements: gamification.achievements,
      dailyGoals: gamification.dailyGoals,
      activities: gamification.activities.slice(0, 20),
      leaderboard: [],
      weeklyStats: gamification.weeklyStats,
    });
  } catch (error) {
    logger.error('Get gamification data error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a lesson completion (updates streak, XP, goals)
// @route   POST /api/gamification/lesson-completed
// @access  Private
export const recordLessonCompleted = async (req, res) => {
  try {
    const { courseId, lessonTitle } = req.body;
    const gamification = await getOrCreateGamification(req.user._id);

    // Update streak
    gamification.updateStreak();

    // Add XP
    gamification.addXP(10, `Completed lesson: ${lessonTitle || 'Lesson'}`);

    // Update daily goals
    const lessonGoal = gamification.dailyGoals.find(g => g.type === 'lessons');
    if (lessonGoal) lessonGoal.current += 1;

    // Add activity
    gamification.activities.unshift({
      id: uuidv4(),
      type: 'lesson_completed',
      title: lessonTitle || 'Lesson completed',
      description: `Completed a lesson`,
      timestamp: new Date(),
      courseId,
      icon: '📚',
    });
    if (gamification.activities.length > 50) {
      gamification.activities = gamification.activities.slice(0, 50);
    }

    // Update weekly stats
    const dayIndex = new Date().getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = dayNames[dayIndex];
    const weekStat = gamification.weeklyStats.find(w => w.day === todayName);
    if (weekStat) weekStat.lessons += 1;

    // Check achievements
    const totalLessonsCompleted = gamification.activities.filter(a => a.type === 'lesson_completed').length;
    gamification.achievements.forEach(a => {
      if (!a.unlockedAt) {
        if (a.id === 'first_lesson' && totalLessonsCompleted >= 1) {
          a.progress = 1; a.unlockedAt = new Date();
        } else if (a.id === 'ten_lessons' && totalLessonsCompleted >= 10) {
          a.progress = 10; a.unlockedAt = new Date();
        } else if (a.id === 'fifty_lessons' && totalLessonsCompleted >= 50) {
          a.progress = 50; a.unlockedAt = new Date();
        } else if (a.id === 'hundred_lessons' && totalLessonsCompleted >= 100) {
          a.progress = 100; a.unlockedAt = new Date();
        }
      }
    });

    await gamification.save();

    res.json({
      message: 'Lesson completion recorded',
      xp: gamification.totalXP,
      level: gamification.level,
      streak: gamification.currentStreak,
    });
  } catch (error) {
    logger.error('Record lesson completion error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a problem solved (updates streak, XP, goals)
// @route   POST /api/gamification/problem-solved
// @access  Private
export const recordProblemSolved = async (req, res) => {
  try {
    const { problemTitle } = req.body;
    const gamification = await getOrCreateGamification(req.user._id);

    gamification.updateStreak();
    gamification.addXP(15, `Solved problem: ${problemTitle || 'Problem'}`);

    const problemGoal = gamification.dailyGoals.find(g => g.type === 'problems');
    if (problemGoal) problemGoal.current += 1;

    gamification.activities.unshift({
      id: uuidv4(),
      type: 'problem_solved',
      title: problemTitle || 'Problem solved',
      description: 'Solved a coding problem',
      timestamp: new Date(),
      icon: '🧩',
    });
    if (gamification.activities.length > 50) {
      gamification.activities = gamification.activities.slice(0, 50);
    }

    const dayIndex = new Date().getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = dayNames[dayIndex];
    const weekStat = gamification.weeklyStats.find(w => w.day === todayName);
    if (weekStat) weekStat.problems += 1;

    const totalProblemsSolved = gamification.activities.filter(a => a.type === 'problem_solved').length;
    gamification.achievements.forEach(a => {
      if (!a.unlockedAt) {
        if (a.id === 'first_problem' && totalProblemsSolved >= 1) {
          a.progress = 1; a.unlockedAt = new Date();
        } else if (a.id === 'ten_problems' && totalProblemsSolved >= 10) {
          a.progress = 10; a.unlockedAt = new Date();
        } else if (a.id === 'fifty_problems' && totalProblemsSolved >= 50) {
          a.progress = 50; a.unlockedAt = new Date();
        } else if (a.id === 'hundred_problems' && totalProblemsSolved >= 100) {
          a.progress = 100; a.unlockedAt = new Date();
        }
      }
    });

    await gamification.save();

    res.json({
      message: 'Problem completion recorded',
      xp: gamification.totalXP,
      level: gamification.level,
      streak: gamification.currentStreak,
    });
  } catch (error) {
    logger.error('Record problem completion error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record study minutes
// @route   POST /api/gamification/study-time
// @access  Private
export const recordStudyTime = async (req, res) => {
  try {
    const { minutes } = req.body;
    const gamification = await getOrCreateGamification(req.user._id);

    gamification.addXP(Math.floor(minutes / 5), `Studied for ${minutes} minutes`);

    const timeGoal = gamification.dailyGoals.find(g => g.type === 'minutes');
    if (timeGoal) timeGoal.current += minutes;

    const dayIndex = new Date().getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = dayNames[dayIndex];
    const weekStat = gamification.weeklyStats.find(w => w.day === todayName);
    if (weekStat) weekStat.minutes += minutes;

    await gamification.save();

    res.json({
      message: 'Study time recorded',
      xp: gamification.totalXP,
      level: gamification.level,
    });
  } catch (error) {
    logger.error('Record study time error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await Gamification.find({})
      .sort({ totalXP: -1 })
      .limit(20)
      .populate('user', 'name avatar');

    const leaderboard = topUsers.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user?._id,
      name: entry.user?.name || 'Anonymous',
      avatar: entry.user?.avatar,
      xp: entry.totalXP,
      streak: entry.currentStreak,
      isCurrentUser: entry.user?._id?.toString() === req.user._id.toString(),
    }));

    res.json(leaderboard);
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({ message: error.message });
  }
};
