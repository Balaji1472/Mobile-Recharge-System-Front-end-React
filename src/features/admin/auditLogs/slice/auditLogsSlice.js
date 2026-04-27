import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAuditLogs } from '../service/auditLogsService';

/**
 * loadAuditLogs now accepts { page, size } so the page component
 * can request any page from the backend.
 *
 * Usage:
 *   dispatch(loadAuditLogs({ page: 0 }))   ← first page
 *   dispatch(loadAuditLogs({ page: 2 }))   ← third page
 */
export const loadAuditLogs = createAsyncThunk(
  'auditLogs/load',
  async ({ page = 0, size = 10 } = {}, thunkAPI) => {
    try {
      return await fetchAuditLogs(page, size);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to load audit logs'
      );
    }
  }
);

const initialState = {
  data: [],            // always a plain array — the content[] from Spring Page
  totalElements: 0,    // total records in DB
  totalPages: 0,       // total pages available
  currentPage: 0,      // current 0-based page index
  pageSize: 10,        // records per page
  isLoading: false,
  isError: false,
  message: '',
};

const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    resetAuditLogs: (state) => {
      state.isLoading   = false;
      state.isError     = false;
      state.message     = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.isError   = false;
      })
      .addCase(loadAuditLogs.fulfilled, (state, action) => {
        const payload = action.payload;

        state.isLoading = false;

        // Spring Page object → extract content + meta
        if (payload && Array.isArray(payload.content)) {
          state.data          = payload.content;
          state.totalElements = payload.totalElements ?? 0;
          state.totalPages    = payload.totalPages    ?? 0;
          state.currentPage   = payload.number        ?? 0; // Spring uses "number" for page index
          state.pageSize      = payload.size          ?? 10;
        } else {
          // Fallback: if slice receives a plain array (e.g. during testing)
          state.data          = Array.isArray(payload) ? payload : [];
          state.totalElements = state.data.length;
          state.totalPages    = 1;
          state.currentPage   = 0;
        }
      })
      .addCase(loadAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError   = true;
        state.message   = action.payload;
      });
  },
});

export const { resetAuditLogs } = auditLogsSlice.actions;
export default auditLogsSlice.reducer;