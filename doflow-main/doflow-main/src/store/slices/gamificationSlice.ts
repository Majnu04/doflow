import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { retryWithBackoff } from '../../utils/retryUtil';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakHistory: Array<{ date: string; active: boolean }>;
}

export interface XPData {
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  xpThisWeek: number;
  recentXPGains: Array<{ amount: number; reason: string; date: string }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  total: number;
  category: 'learning' | 'coding' | 'social' | 'streak';
}

export interface DailyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  type: 'lessons' | 'problems' | 'minutes' | 'streak';
}

export interface Activity {
  id: string;
  type: 'lesson_completed' | 'problem_solved' | 'course_enrolled' | 'certificate_earned' | 'achievement_unlocked';
  title: string;
  description: string;
  timestamp: string;
  courseId?: string;
  icon: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

interface GamificationState {
  streak: StreakData | null;
  xp: XPData | null;
  achievements: Achievement[];
  dailyGoals: DailyGoal[];
  activities: Activity[];
  leaderboard: LeaderboardEntry[];
  weeklyStats: Array<{ day: string; lessons: number; problems: number; minutes: number }>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: GamificationState = {
  streak: null,
  xp: null,
  achievements: [],
  dailyGoals: [],
  activities: [],
  leaderboard: [],
  weeklyStats: [],
  status: 'idle',
  error: null,
};

export const getGamificationData = createAsyncThunk(
  'gamification/getData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await retryWithBackoff(() => api.get('/gamification/me'), 2, 1000);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to load gamification data';
      return rejectWithValue(message);
    }
  }
);

export const recordLessonCompletion = createAsyncThunk(
  'gamification/recordLesson',
  async (payload: { courseId?: string; lessonTitle?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/gamification/lesson-completed', payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record lesson');
    }
  }
);

export const recordProblemCompletion = createAsyncThunk(
  'gamification/recordProblem',
  async (payload: { problemTitle?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/gamification/problem-solved', payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record problem');
    }
  }
);

export const getLeaderboard = createAsyncThunk(
  'gamification/getLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await retryWithBackoff(() => api.get('/gamification/leaderboard'), 2, 1000);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load leaderboard');
    }
  }
);

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGamificationData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getGamificationData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.streak = action.payload.streak;
        state.xp = action.payload.xp;
        state.achievements = action.payload.achievements;
        state.dailyGoals = action.payload.dailyGoals;
        state.activities = action.payload.activities;
        state.leaderboard = action.payload.leaderboard;
        state.weeklyStats = action.payload.weeklyStats;
      })
      .addCase(getGamificationData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.streak = state.streak || {
          currentStreak: 0, longestStreak: 0, lastActivityDate: null,
          streakHistory: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
            active: false,
          })),
        };
        state.xp = state.xp || { totalXP: 0, level: 1, xpToNextLevel: 100, xpThisWeek: 0, recentXPGains: [] };
        state.dailyGoals = state.dailyGoals.length ? state.dailyGoals : [
          { id: '1', title: 'Complete Lessons', target: 3, current: 0, unit: 'lessons', type: 'lessons' as const },
          { id: '2', title: 'Solve Problems', target: 2, current: 0, unit: 'problems', type: 'problems' as const },
          { id: '3', title: 'Study Time', target: 30, current: 0, unit: 'min', type: 'minutes' as const },
        ];
        state.weeklyStats = state.weeklyStats.length ? state.weeklyStats : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
          day, lessons: 0, problems: 0, minutes: 0,
        }));
      })
      .addCase(recordLessonCompletion.fulfilled, (state, action) => {
        if (state.xp) {
          state.xp.totalXP = action.payload.xp;
          state.xp.level = action.payload.level;
        }
        if (state.streak) {
          state.streak.currentStreak = action.payload.streak;
        }
      })
      .addCase(recordProblemCompletion.fulfilled, (state, action) => {
        if (state.xp) {
          state.xp.totalXP = action.payload.xp;
          state.xp.level = action.payload.level;
        }
        if (state.streak) {
          state.streak.currentStreak = action.payload.streak;
        }
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload;
      })
      .addCase(getLeaderboard.rejected, (state) => {
        state.leaderboard = [];
      });
  },
});

export default gamificationSlice.reducer;
