import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { isDsaCourse } from '../../utils/courseUtils';

export interface Course {
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
  isDSA?: boolean; // Add this line
  averageRating?: number;
  originalPrice?: number;
  estimatedDuration?: string;
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

const normalizeCourse = (course: any): Course => ({
  ...(course as Course),
  isDSA: isDsaCourse(course)
});

const normalizeCourseList = (courses: any[] = []): Course[] => courses.map((course) => normalizeCourse(course));

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

// Admin: Create a new course
export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/courses', courseData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course');
    }
  }
);

// Admin: Update a course
export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, courseData }: { id: string, courseData: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/courses/${id}`, courseData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course');
    }
  }
);

// Admin: Delete a course
export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/courses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearCoursesError: (state) => {
      state.error = null;
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
      state.courses = normalizeCourseList(action.payload.courses);
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
    builder.addCase(getFeaturedCourses.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getFeaturedCourses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.featuredCourses = Array.isArray(action.payload)
        ? normalizeCourseList(action.payload)
        : [];
    });
    builder.addCase(getFeaturedCourses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Get single course
    builder.addCase(getCourse.pending, (state) => {
      state.isLoading = true;
      state.currentCourse = null; // Clear previous course
      state.error = null;
    });
    builder.addCase(getCourse.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentCourse = action.payload ? normalizeCourse(action.payload) : null;
    });
    builder.addCase(getCourse.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create course
    builder.addCase(createCourse.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createCourse.fulfilled, (state, action) => {
      state.isLoading = false;
      state.courses.push(action.payload);
    });
    builder.addCase(createCourse.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update course
    builder.addCase(updateCourse.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateCourse.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.courses.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
      if (state.currentCourse?._id === action.payload._id) {
        state.currentCourse = action.payload;
      }
    });
    builder.addCase(updateCourse.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete course
    builder.addCase(deleteCourse.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteCourse.fulfilled, (state, action) => {
      state.isLoading = false;
      state.courses = state.courses.filter(c => c._id !== action.payload);
    });
    builder.addCase(deleteCourse.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearCurrentCourse, clearCoursesError } = coursesSlice.actions;
export default coursesSlice.reducer;
