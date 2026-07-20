import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { Course } from './coursesSlice';
import { retryWithBackoff } from '../../utils/retryUtil';

// --- Interfaces ---
export interface Enrollment {
  _id: string;
  course: Course;
  progress: number;
  certificateIssued: boolean;
  completedAt?: string;
  enrolledAt: string;
}

export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  certificatesEarned: number;
  totalHoursLearned: number;
}

interface DashboardState {
  enrollments: Enrollment[];
  stats: DashboardStats;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// --- Initial State ---
const initialState: DashboardState = {
  enrollments: [],
  stats: {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificatesEarned: 0,
    totalHoursLearned: 0,
  },
  status: 'idle',
  error: null,
};

// --- Async Thunks ---
export const getStudentDashboardData = createAsyncThunk(
  'dashboard/getStudentDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      // Retry on network failures
      const response = await retryWithBackoff(() => api.get('/payment/enrollments'), 2, 1000);
      const enrollments: Enrollment[] = response.data;

      // Calculate stats from the enrollments data
      const completed = enrollments.filter(e => e.progress === 100).length;
      const inProgress = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
      const certificates = enrollments.filter(e => e.certificateIssued).length;
      const totalHours = Math.floor(
        enrollments.reduce((acc, e) => acc + (e.course?.totalDuration || 0), 0) / 60
      );

      const stats: DashboardStats = {
        totalCourses: enrollments.length,
        completedCourses: completed,
        inProgressCourses: inProgress,
        certificatesEarned: certificates,
        totalHoursLearned: totalHours,
      };

      return { enrollments, stats };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

// --- Slice Definition ---
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStudentDashboardData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getStudentDashboardData.fulfilled, (state, action: PayloadAction<{ enrollments: Enrollment[], stats: DashboardStats }>) => {
        state.status = 'succeeded';
        state.enrollments = action.payload.enrollments;
        state.stats = action.payload.stats;
      })
      .addCase(getStudentDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
