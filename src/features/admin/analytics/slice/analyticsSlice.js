import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAnalytics } from "../service/analyticsService";

export const loadAnalytics = createAsyncThunk(
  "analytics/load",
  async (_, thunkAPI) => {
    try {
      return await fetchAnalytics();
    } catch (err) {
      // Consistent error handling logic
      const message =
        err.response?.data?.message || 
        (err.response?.status === 403 ? "Access Denied" : "Failed to load analytics");
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  data: null,
  isLoading: false,
  isError: false,
  message: "",
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    resetAnalytics: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAnalytics.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(loadAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(loadAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;