import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface CartState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null
};

// Get cart
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/cart');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// Add to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (courseId: string, { rejectWithValue }) => {
    try {
      await api.post(`/users/cart/${courseId}`);
      return courseId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (courseId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/cart/${courseId}`);
      return courseId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

// Clear cart (local and server)
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/users/cart');
      return;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get cart
    builder.addCase(getCart.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getCart.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(getCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add to cart
    builder.addCase(addToCart.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(addToCart.fulfilled, (state, action) => {
      state.isLoading = false;
      // The getCart() thunk will be dispatched from the component to get the updated cart
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Remove from cart
    builder.addCase(removeFromCart.pending, (state) => {
      // Optionally set a specific loading state for removing an item
    });
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    });
    builder.addCase(removeFromCart.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Clear cart
    builder.addCase(clearCart.fulfilled, (state) => {
      state.items = [];
    });
    builder.addCase(clearCart.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  }
});

export default cartSlice.reducer;
