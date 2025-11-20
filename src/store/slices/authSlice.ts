import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),
  error: null
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', credentials.email);
      console.log('API URL:', import.meta.env.VITE_API_URL);
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Get current user
export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

// Update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      const { token, ...user } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      const { token, ...user } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Get Me
    builder.addCase(getMe.fulfilled, (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    });

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      const { token, ...user } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
