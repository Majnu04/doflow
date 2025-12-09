import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface WishlistState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null
};

// Get wishlist
export const getWishlist = createAsyncThunk(
  'wishlist/getWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/wishlist');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

// Add to wishlist
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (courseId: string, { rejectWithValue }) => {
    try {
      await api.post(`/users/wishlist/${courseId}`);
      return courseId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

// Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (courseId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/wishlist/${courseId}`);
      return courseId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

// Clear wishlist
export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/users/wishlist');
      return;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get wishlist
    builder.addCase(getWishlist.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getWishlist.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(getWishlist.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add to wishlist
    builder.addCase(addToWishlist.pending, (state) => {
      // Optionally set a specific loading state
    });
    builder.addCase(addToWishlist.fulfilled, (state, action) => {
      // The getWishlist() thunk will be dispatched from the component
    });
    builder.addCase(addToWishlist.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Remove from wishlist
    builder.addCase(removeFromWishlist.pending, (state) => {
      // Optionally set a specific loading state
    });
    builder.addCase(removeFromWishlist.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    });
    builder.addCase(removeFromWishlist.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Clear wishlist
    builder.addCase(clearWishlist.fulfilled, (state) => {
      state.items = [];
    });
    builder.addCase(clearWishlist.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  }
});

export default wishlistSlice.reducer;
