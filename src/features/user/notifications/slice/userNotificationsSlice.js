import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchUnreadNotifications,
  fetchReadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../service/userNotificationsService";

export const loadUnread = createAsyncThunk(
  "userNotifications/loadUnread",
  async (_, thunkAPI) => {
    try {
      return await fetchUnreadNotifications();
    } catch (err) {
      if (err.response?.status === 404) return [];
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  },
);
export const loadRead = createAsyncThunk(
  "userNotifications/loadRead",
  async (_, thunkAPI) => {
    try {
      return await fetchReadNotifications();
    } catch (err) {
      if (err.response?.status === 404) return [];
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  },
);
export const markRead = createAsyncThunk(
  "userNotifications/markRead",
  async (id, thunkAPI) => {
    try {
      await markNotificationRead(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  },
);
export const markAllRead = createAsyncThunk(
  "userNotifications/markAllRead",
  async (_, thunkAPI) => {
    try {
      await markAllNotificationsRead();
      return true;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  },
);

const userNotificationsSlice = createSlice({
  name: "userNotifications",
  initialState: {
    unread: [],
    read: [],
    isLoading: false,
    isError: false,
    message: "",
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUnread.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUnread.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unread = action.payload;
      })
      .addCase(loadUnread.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(loadRead.fulfilled, (state, action) => {
        state.read = action.payload;
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const id = action.payload;
        const moved = state.unread.find((n) => n.notificationId === id);
        if (moved) {
          state.unread = state.unread.filter((n) => n.notificationId !== id);
          state.read = [{ ...moved, readStatus: true }, ...state.read];
        }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        const movedAll = state.unread.map((n) => ({ ...n, readStatus: true }));
        state.read = [...movedAll, ...state.read];
        state.unread = [];
      });
  },
});
export const { reset } = userNotificationsSlice.actions;
export default userNotificationsSlice.reducer;
