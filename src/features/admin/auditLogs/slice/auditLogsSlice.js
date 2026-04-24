import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAuditLogs } from '../service/auditLogsService';

export const loadAuditLogs = createAsyncThunk(
  'auditLogs/load', 
  async (_, thunkAPI) => {
    try { 
      return await fetchAuditLogs(); 
    } catch (err) { 
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to load audit logs'); 
    }
});

const initialState = { 
  data: [], 
  isLoading: false, 
  isError: false, 
  message: '' 
};

const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: { 
    resetAuditLogs: (state) => { 
      state.isLoading = false; 
      state.isError = false; 
      state.message = ''; 
    } 
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAuditLogs.pending, (state) => { 
        state.isLoading = true; 
        state.isError = false;
      })
      .addCase(loadAuditLogs.fulfilled, (state, action) => { 
        state.isLoading = false; 
        state.data = action.payload; 
      })
      .addCase(loadAuditLogs.rejected, (state, action) => { 
        state.isLoading = false; 
        state.isError = true; 
        state.message = action.payload; 
      });
  },
});

export const { resetAuditLogs } = auditLogsSlice.actions;
export default auditLogsSlice.reducer;