import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAISummary } from "../service/aiSummaryService";

export const loadAISummary = createAsyncThunk(
  "aiSummary/load",
  async ({ role, token }, thunkAPI) => {
    try {
      return await fetchAISummary(role, token);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to generate AI summary"
      );
    }
  }
);

const aiSummarySlice = createSlice({
  name: "aiSummary",
  initialState: {
    summary: null,
    isLoading: false,
    isError: false,
    message: "",
  },
  reducers: {
    resetAISummary: (state) => {
      state.summary   = null;
      state.isLoading = false;
      state.isError   = false;
      state.message   = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAISummary.pending, (state) => {
        state.isLoading = true;
        state.isError   = false;
        state.message   = "";
      })
      .addCase(loadAISummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary   = action.payload;
      })
      .addCase(loadAISummary.rejected, (state, action) => {
        state.isLoading = false;
        state.isError   = true;
        state.message   = action.payload;
      });
  },
});

export const { resetAISummary } = aiSummarySlice.actions;
export default aiSummarySlice.reducer;