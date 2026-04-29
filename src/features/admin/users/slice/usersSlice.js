import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllUsers, updateUserStatus, fetchRoleCounts } from '../service/usersService';

export const loadUsers = createAsyncThunk('users/load', async (_, thunkAPI) => {
  try {
    return await fetchAllUsers();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to load users');
  }
});

export const changeUserStatus = createAsyncThunk(
  'users/changeStatus',
  async ({ userId, status }, thunkAPI) => {
    try {
      await updateUserStatus(userId, status);
      return { userId, status }; 
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update status');
    }
  }
);

export const loadRoleCounts = createAsyncThunk('users/loadRoleCounts', async (_, thunkAPI) => {
  try {
    return await fetchRoleCounts();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to load role data');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    data:      [],
    isLoading: false,
    isError:   false,
    message:   '',

    // per-user status-change loading/error
    statusUpdating: false,
    statusError:    null,

    // roles
    roles:          [],
    rolesLoading:   false,
    rolesError:     false,
    rolesMessage:   '',
  },
  reducers: {
    reset: (state) => {
      state.isLoading      = false;
      state.isError        = false;
      state.message        = '';
      state.statusUpdating = false;
      state.statusError    = null;
      state.rolesLoading   = false;
      state.rolesError     = false;
      state.rolesMessage   = '';
    },
  },
  extraReducers: (builder) => {
    builder
      /* ── loadUsers ── */
      .addCase(loadUsers.pending, (state) => {
        state.isLoading = true;
        state.isError   = false;
        state.message   = '';
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data      = action.payload;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError   = true;
        state.message   = action.payload;
      })

      /* ── changeUserStatus ── */
      .addCase(changeUserStatus.pending, (state) => {
        state.statusUpdating = true;
        state.statusError    = null;
      })
      .addCase(changeUserStatus.fulfilled, (state, action) => {
        state.statusUpdating = false;
        const { userId, status } = action.payload;
        const user = state.data.find((u) => u.userId === userId);
        if (user) user.status = status;
      })
      .addCase(changeUserStatus.rejected, (state, action) => {
        state.statusUpdating = false;
        state.statusError    = action.payload;
      })

      /* ── loadRoleCounts ── */
      .addCase(loadRoleCounts.pending, (state) => {
        state.rolesLoading = true;
        state.rolesError   = false;
        state.rolesMessage = '';
      })
      .addCase(loadRoleCounts.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles        = action.payload;
      })
      .addCase(loadRoleCounts.rejected, (state, action) => {
        state.rolesLoading = false;
        state.rolesError   = true;
        state.rolesMessage = action.payload;
      });
  },
});

export const { reset } = usersSlice.actions;
export default usersSlice.reducer;