import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { Course } from './coursesSlice';
import { retryWithBackoff } from '../../utils/retryUtil';

// --- Interfaces ---
export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemTestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface ProblemStarterCode {
  language: 'javascript' | 'python' | 'java' | 'cpp' | 'c';
  code?: string;
  visibleCode?: string;
  adapterCode?: string;
}

export interface Problem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leetcodeLink?: string;
  section: string;
  order: number;
  isFree: boolean;
  description: string;
  examples?: ProblemExample[];
  constraints?: string[];
  hints?: string[];
  starterCode: ProblemStarterCode[];
  testCases: ProblemTestCase[];
  course: string;
}

export interface Section {
  _id: string;
  title: string;
  order: number;
  course: string;
}

export interface DsaProgress {
  courseId: string;
  totalProblems: number;
  solvedProblems: number;
  percentage: number;
  solvedProblemIds: string[];
}

interface DsaState {
  course: Course | null;
  sections: Section[];
  problems: Problem[];
  isEnrolled: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  progress: DsaProgress | null;
  progressStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  progressError: string | null;
}

// --- Initial State ---
const initialState: DsaState = {
  course: null,
  sections: [],
  problems: [],
  isEnrolled: false,
  status: 'idle',
  error: null,
  progress: null,
  progressStatus: 'idle',
  progressError: null,
};

// --- Async Thunks ---
export const fetchDsaCourseData = createAsyncThunk(
  'dsa/fetchDsaCourseData',
  async (courseId: string, { rejectWithValue }) => {
    try {
      // Retry critical data fetches
      const [sectionsRes, problemsRes, courseRes, enrollmentsRes] = await Promise.all([
        retryWithBackoff(() => api.get(`/dsa/sections?courseId=${courseId}`), 2, 500),
        retryWithBackoff(() => api.get(`/dsa/problems?courseId=${courseId}`), 2, 500),
        retryWithBackoff(() => api.get(`/courses/${courseId}`), 2, 500),
        retryWithBackoff(() => api.get('/payment/enrollments'), 2, 500)
      ]);

      const isEnrolled = enrollmentsRes.data.some((enrollment: any) => 
        enrollment.course._id === courseId || enrollment.course === courseId
      );

      return {
        sections: sectionsRes.data,
        problems: problemsRes.data.problems || problemsRes.data, // Handle both array and paginated response
        course: courseRes.data,
        isEnrolled,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch DSA course data');
    }
  }
);

export const fetchDsaProgress = createAsyncThunk(
  'dsa/fetchDsaProgress',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await retryWithBackoff(() => api.get(`/dsa/progress/${courseId}`), 2, 500);
      return response.data as DsaProgress;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return rejectWithValue('unauthorized');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch DSA progress');
    }
  }
);

// --- Slice Definition ---
const dsaSlice = createSlice({
  name: 'dsa',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDsaCourseData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.progressError = null;
      })
      .addCase(fetchDsaCourseData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sections = action.payload.sections.sort((a: Section, b: Section) => a.order - b.order);
        state.problems = action.payload.problems;
        state.course = action.payload.course;
        state.isEnrolled = action.payload.isEnrolled;
      })
      .addCase(fetchDsaCourseData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchDsaProgress.pending, (state) => {
        state.progressStatus = 'loading';
        state.progressError = null;
      })
      .addCase(fetchDsaProgress.fulfilled, (state, action) => {
        state.progressStatus = 'succeeded';
        state.progress = action.payload;
      })
      .addCase(fetchDsaProgress.rejected, (state, action) => {
        if (action.payload === 'unauthorized') {
          state.progressStatus = 'idle';
          state.progress = null;
          state.progressError = null;
          return;
        }
        state.progressStatus = 'failed';
        state.progressError = action.payload as string;
      });
  },
});

export default dsaSlice.reducer;
