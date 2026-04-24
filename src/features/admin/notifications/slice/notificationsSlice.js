import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllNotifications } from '../service/notificationsService';

// Thunk for fetching all notifications
export const loadNotifications = createAsyncThunk(
  'adminNotifications/load', 
  async (_, thunkAPI) => {
    try { 
      return await fetchAllNotifications(); 
    } catch (err) { 
      // Extracts error message from the response or uses a fallback
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to load notifications'
      ); 
    }
});

const initialState = { 
  data: [], 
  isLoading: false, 
  isError: false, 
  message: '' 
};

const notificationsSlice = createSlice({
  name: 'adminNotifications',
  initialState,
  reducers: { 
    // Clears state when leaving the page or on logout
    reset: (state) => { 
      state.isLoading = false; 
      state.isError = false; 
      state.message = ''; 
      state.data = [];
    } 
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.pending, (state) => { 
        state.isLoading = true; 
        state.isError = false;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => { 
        state.isLoading = false; 
        state.data = action.payload; 
      })
      .addCase(loadNotifications.rejected, (state, action) => { 
        state.isLoading = false; 
        state.isError = true; 
        state.message = action.payload; 
      });
  },
});

export const { reset } = notificationsSlice.actions;
export default notificationsSlice.reducer;