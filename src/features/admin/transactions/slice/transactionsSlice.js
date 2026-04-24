import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllTransactions,
  fetchAllRefunds,
} from "../service/transactionsService";

/* ── Thunks ── */

export const loadTransactions = createAsyncThunk(
  "transactions/load",
  async (_, thunkAPI) => {
    try {
      return await fetchAllTransactions();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load transactions",
      );
    }
  },
);

export const loadRefunds = createAsyncThunk(
  "transactions/loadRefunds",
  async (_, thunkAPI) => {
    try {
      return await fetchAllRefunds();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load refunds",
      );
    }
  },
);

/* ── Slice ── */

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: {
    transactions: [],
    refunds: [],
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

      /* loadTransactions */
      .addCase(loadTransactions.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(loadTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* loadRefunds */
      .addCase(loadRefunds.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(loadRefunds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.refunds = action.payload;
      })
      .addCase(loadRefunds.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = transactionsSlice.actions;
export default transactionsSlice.reducer;
