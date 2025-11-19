import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  instructor: any;
  category: string;
  level: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  promoVideo?: string;
  sections: any[];
  requirements: string[];
  whatYouWillLearn: string[];
  tags: string[];
  language: string;
  ratings: {
    average: number;
    count: number;
  };
  enrollmentCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  totalDuration: number;
  totalLessons: number;
}

interface CoursesState {
  courses: Course[];
  featuredCourses: Course[];
  currentCourse: Course | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

const initialState: CoursesState = {
  courses: [],
  featuredCourses: [],
  currentCourse: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0
  }
};

// Get all courses
export const getCourses = createAsyncThunk(
  'courses/getCourses',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/courses', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

// Get featured courses
export const getFeaturedCourses = createAsyncThunk(
  'courses/getFeaturedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/courses/featured');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured courses');
    }
  }
);

// Get single course
export const getCourse = createAsyncThunk(
  'courses/getCourse',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course');
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    }
  },
  extraReducers: (builder) => {
    // Get courses
    builder.addCase(getCourses.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getCourses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.courses = action.payload.courses;
      state.pagination = {
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        total: action.payload.total
      };
    });
    builder.addCase(getCourses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Get featured courses
    builder.addCase(getFeaturedCourses.fulfilled, (state, action) => {
      state.featuredCourses = action.payload;
    });

    // Get single course
    builder.addCase(getCourse.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getCourse.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentCourse = action.payload;
    });
    builder.addCase(getCourse.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearCurrentCourse } = coursesSlice.actions;
export default coursesSlice.reducer;
