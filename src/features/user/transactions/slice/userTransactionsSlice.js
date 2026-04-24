import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMyTransactions } from "../service/userTransactionsService";

export const loadMyTransactions = createAsyncThunk(
  "userTransactions/load",
  async (_, thunkAPI) => {
    try {
      return await fetchMyTransactions();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load transactions",
      );
    }
  },
);

const userTransactionsSlice = createSlice({
  name: "userTransactions",
  initialState: { data: [], isLoading: false, isError: false, message: "" },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMyTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadMyTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(loadMyTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});
export const { reset } = userTransactionsSlice.actions;
export default userTransactionsSlice.reducer;
