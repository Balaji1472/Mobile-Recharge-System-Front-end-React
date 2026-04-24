import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchActivePlanDetails } from "../service/activePlansService";

export const loadActivePlans = createAsyncThunk(
  "activePlans/load",
  async (_, thunkAPI) => {
    try {
      return await fetchActivePlanDetails();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load active plan",
      );
    }
  },
);

const activePlansSlice = createSlice({
  name: "activePlans",
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
      .addCase(loadActivePlans.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadActivePlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(loadActivePlans.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});
export const { reset } = activePlansSlice.actions;
export default activePlansSlice.reducer;
