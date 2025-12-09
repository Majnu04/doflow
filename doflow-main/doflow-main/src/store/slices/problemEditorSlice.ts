import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { Problem, DsaProgress, fetchDsaProgress } from './dsaSlice';
import { getStudentDashboardData } from './dashboardSlice';

export interface PerformanceSummary {
  averageMs: number | null;
  fastestMs: number | null;
  slowestMs: number | null;
  peakMemoryKb: number | null;
}

export interface Submission {
  _id: string;
  code: string;
  language: string;
  status: 'pending' | 'accepted' | 'wrong-answer' | 'runtime-error' | 'time-limit-exceeded' | 'rejected';
  output?: any;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  problemTitle?: string;
  results?: any[];
  testResults?: any[];
  passedTests: number;
  totalTests: number;
  allPassed: boolean;
  executionTime?: number | null;
  memory?: number | null;
  performanceSummary?: PerformanceSummary | null;
}

interface SubmissionResponse {
  submission: Submission;
  hiddenFailures?: any[];
  performanceSummary?: PerformanceSummary | null;
  message?: string;
  progressOverview?: DsaProgress | null;
}

interface NotePayload {
  _id?: string;
  problem?: string;
  problemTitle?: string;
  content?: string;
  updatedAt?: string;
}

interface ProblemEditorState {
  problem: Problem | null;
  submissions: Submission[];
  notes: NotePayload | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  runStatus: 'idle' | 'running' | 'succeeded' | 'failed';
  runResults: any | null;
  runError: string | null;
  submitStatus: 'idle' | 'running' | 'succeeded' | 'failed';
  submitResults: SubmissionResponse | null;
  submitError: string | null;
}

const initialState: ProblemEditorState = {
  problem: null,
  submissions: [],
  notes: null,
  status: 'idle',
  error: null,
  runStatus: 'idle',
  runResults: null,
  runError: null,
  submitStatus: 'idle',
  submitResults: null,
  submitError: null,
};

export const fetchProblemData = createAsyncThunk(
  'problemEditor/fetchProblemData',
  async (problemId: string, { rejectWithValue }) => {
    try {
      const problemRes = await api.get(`/dsa/problems/${problemId}`);

      let submissions: Submission[] = [];
      try {
        const submissionsRes = await api.get(`/submissions/problem/${problemId}`);
        // Handle paginated API response: backend returns { submissions: [], totalPages, currentPage, total }
        // Also support legacy array response for backward compatibility
        const submissionsData = submissionsRes.data;
        submissions = Array.isArray(submissionsData)
          ? submissionsData
          : (submissionsData?.submissions || submissionsData?.data || []);
      } catch (submissionsError: any) {
        if (submissionsError.response?.status !== 401) {
          console.warn('Unable to load submissions for problem', problemId, submissionsError);
        }
      }

      let note: NotePayload | null = null;
      try {
        const noteRes = await api.get(`/notes/problem/${problemId}`);
        note = noteRes.data || null;
      } catch (noteError: any) {
        if (noteError.response?.status !== 404 && noteError.response?.status !== 401) {
          console.warn('Failed to load note for problem', problemId, noteError);
        }
      }

      return {
        problem: problemRes.data,
        submissions,
        notes: note,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const runCode = createAsyncThunk(
  'problemEditor/runCode',
  async (payload: { code: string; language: string; testCases: any[]; problemId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/submissions/run', payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const submitCode = createAsyncThunk(
  'problemEditor/submitCode',
  async (payload: { code: string; language: string; problemId: string; problemTitle: string; testCases: any[]; courseId?: string; roadmapId?: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/submissions/submit', payload);

      const progressSnapshot = response.data?.progressOverview;
      if (progressSnapshot?.courseId && payload.courseId) {
        dispatch(fetchDsaProgress(payload.courseId));
        dispatch(getStudentDashboardData());
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const saveProblemNote = createAsyncThunk(
  'problemEditor/saveProblemNote',
  async (payload: { problemId: string; problemTitle: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/notes', {
        problemId: payload.problemId,
        problemTitle: payload.problemTitle,
        content: payload.content,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const problemEditorSlice = createSlice({
  name: 'problemEditor',
  initialState,
  reducers: {
    clearRunResults: (state) => {
      state.runStatus = 'idle';
      state.runResults = null;
      state.runError = null;
    },
    clearSubmitResults: (state) => {
        state.submitStatus = 'idle';
        state.submitResults = null;
        state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Problem Data
      .addCase(fetchProblemData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProblemData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.problem = action.payload.problem;
        state.submissions = action.payload.submissions;
        state.notes = action.payload.notes;
      })
      .addCase(fetchProblemData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Run Code
      .addCase(runCode.pending, (state) => {
        state.runStatus = 'running';
        state.runError = null;
      })
      .addCase(runCode.fulfilled, (state, action) => {
        state.runStatus = 'succeeded';
        state.runResults = action.payload;
      })
      .addCase(runCode.rejected, (state, action) => {
        state.runStatus = 'failed';
        state.runError = action.payload as string;
      })
      // Submit Code
      .addCase(submitCode.pending, (state) => {
        state.submitStatus = 'running';
        state.submitError = null;
      })
      .addCase(submitCode.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        state.submitResults = action.payload;
        // Add to submissions list if it's a new one
        const existingIndex = state.submissions.findIndex(s => s._id === action.payload.submission._id);
        if (existingIndex === -1) {
            state.submissions.unshift(action.payload.submission);
        } else {
            state.submissions[existingIndex] = action.payload.submission;
        }
      })
      .addCase(submitCode.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.submitError = action.payload as string;
      })
      // Save note
      .addCase(saveProblemNote.fulfilled, (state, action) => {
        state.notes = action.payload;
      })
      .addCase(saveProblemNote.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearRunResults, clearSubmitResults } = problemEditorSlice.actions;

export default problemEditorSlice.reducer;
