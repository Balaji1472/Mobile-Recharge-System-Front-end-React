import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchMyInvoices,
  fetchInvoiceById,
} from "../service/invoiceService";


export const loadMyInvoices = createAsyncThunk(
  "invoice/loadMyInvoices",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchMyInvoices();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to load invoices.";
      return rejectWithValue(message);
    }
  }
);

export const loadInvoiceById = createAsyncThunk(
  "invoice/loadInvoiceById",
  async (invoiceId, { rejectWithValue }) => {
    try {
      return await fetchInvoiceById(invoiceId);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to load invoice details.";
      return rejectWithValue(message);
    }
  }
);


const initialState = {
  invoices: [],
  loading: false,
  error: null,

  selectedInvoice: null,
  selectedLoading: false,
  selectedError: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setSelectedInvoice(state, action) {
      state.selectedInvoice = action.payload;
      state.selectedError = null;
    },
    clearSelectedInvoice(state) {
      state.selectedInvoice = null;
      state.selectedError = null;
      state.selectedLoading = false;
    },
    clearInvoiceError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMyInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.invoices = [];
      })
      .addCase(loadMyInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(loadMyInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Load single invoice
    builder
      .addCase(loadInvoiceById.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
      })
      .addCase(loadInvoiceById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(loadInvoiceById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload;
      });
  },
});

export const {
  setSelectedInvoice,
  clearSelectedInvoice,
  clearInvoiceError,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;

export const selectInvoices        = (state) => state.invoice.invoices;
export const selectInvoicesLoading = (state) => state.invoice.loading;
export const selectInvoicesError   = (state) => state.invoice.error;
export const selectSelectedInvoice = (state) => state.invoice.selectedInvoice;
export const selectSelectedLoading = (state) => state.invoice.selectedLoading;
export const selectSelectedError   = (state) => state.invoice.selectedError;