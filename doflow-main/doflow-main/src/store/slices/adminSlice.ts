import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { User } from './authSlice'; 
import { Course } from './coursesSlice';

// --- Interfaces ---
export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentUsers: User[];
  recentCourses: Course[];
}

export interface RevenueSummary {
  totalRevenue: number;
  totalEnrollments: number;
  averageOrderValue: number;
}

export interface RevenueMonthlyPoint {
  month: number;
  label: string;
  year: number;
  revenue: number;
  enrollments: number;
}

export interface RevenueCourseBreakdown {
  courseId: string | null;
  courseTitle: string;
  revenue: number;
  enrollments: number;
}

export interface RevenueAnalytics {
  summary: RevenueSummary;
  monthlyRevenue: RevenueMonthlyPoint[];
  courseRevenue: RevenueCourseBreakdown[];
  availableFilters: {
    years: number[];
    courses: { _id: string; title: string }[];
  };
  appliedFilters: {
    year: number;
    month?: number | null;
    courseId?: string | null;
  };
}

export interface RevenueAnalyticsFilters {
  year?: number;
  month?: number | null;
  courseId?: string | null;
}

interface AdminState {
  data: AdminDashboardData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  revenueAnalytics: RevenueAnalytics | null;
  revenueStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  revenueError: string | null;
}

// --- Initial State ---
const initialState: AdminState = {
  data: null,
  status: 'idle',
  error: null,
  revenueAnalytics: null,
  revenueStatus: 'idle',
  revenueError: null,
};

// --- Async Thunks ---
export const getAdminDashboardData = createAsyncThunk<AdminDashboardData>(
  'admin/getAdminDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      // This assumes a single, aggregated endpoint for dashboard data.
      // If endpoints are separate, Promise.all would be used here.
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin dashboard data');
    }
  }
);

export const getRevenueAnalytics = createAsyncThunk<RevenueAnalytics, RevenueAnalyticsFilters | undefined>(
  'admin/getRevenueAnalytics',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/revenue-analytics', { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue analytics');
    }
  }
);

// --- Slice Definition ---
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAdminDashboardData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getAdminDashboardData.fulfilled, (state, action: PayloadAction<AdminDashboardData>) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(getAdminDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(getRevenueAnalytics.pending, (state) => {
        state.revenueStatus = 'loading';
        state.revenueError = null;
      })
      .addCase(getRevenueAnalytics.fulfilled, (state, action: PayloadAction<RevenueAnalytics>) => {
        state.revenueStatus = 'succeeded';
        state.revenueAnalytics = action.payload;
      })
      .addCase(getRevenueAnalytics.rejected, (state, action) => {
        state.revenueStatus = 'failed';
        state.revenueError = action.payload as string;
      });
  },
});

export default adminSlice.reducer;
