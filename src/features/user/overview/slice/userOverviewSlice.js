import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUserOverview } from "../service/userOverviewService";

export const loadUserOverview = createAsyncThunk(
  "userOverview/load",
  async (_, thunkAPI) => {
    try {
      return await fetchUserOverview();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load overview",
      );
    }
  },
);

const userOverviewSlice = createSlice({
  name: "userOverview",
  initialState: { data: null, isLoading: false, isError: false, message: "" },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserOverview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(loadUserOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});
export const { reset } = userOverviewSlice.actions;
export default userOverviewSlice.reducer;
