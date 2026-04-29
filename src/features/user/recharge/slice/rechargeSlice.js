import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchPlansByMobile,
  fetchConnectionId,
  initiateRecharge,
  verifyPayment,
  cancelPayment,
} from "../service/rechargeService";


export const lookupPlans = createAsyncThunk(
  "recharge/lookupPlans",
  async (mobileNumber, { rejectWithValue }) => {
    try {
      const data = await fetchPlansByMobile(mobileNumber);
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to fetch plans. Please check the mobile number.";
      return rejectWithValue(message);
    }
  },
);

export const submitRecharge = createAsyncThunk(
  "recharge/submitRecharge",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const mobileNumber = getState().recharge.mobileNumber;

      if (!mobileNumber) {
        return rejectWithValue(
          "Mobile number is missing. Please go back and re-enter.",
        );
      }

      const connectionId = await fetchConnectionId(mobileNumber);

      if (!connectionId || connectionId <= 0) {
        return rejectWithValue(
          "Could not find an active connection for this mobile number.",
        );
      }

      const data = await initiateRecharge({
        connectionId,
        planId: payload.planId,
        paymentMethod: payload.paymentMethod,
      });

      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message || "Can't recharge, Please login first";
      return rejectWithValue(message);
    }
  },
);

export const confirmPayment = createAsyncThunk(
  "recharge/confirmPayment",
  async (payload, { rejectWithValue }) => {
    try {
      await verifyPayment({
        razorpayOrderId: payload.razorpayOrderId,
        razorpayPaymentId: payload.razorpayPaymentId,
        razorpaySignature: payload.razorpaySignature,
      });
      return {
        success: true,
        razorpayPaymentId: payload.razorpayPaymentId,
        razorpayOrderId: payload.razorpayOrderId,
        rechargeId: payload.rechargeId,
        finalAmount: payload.finalAmount,
        planName: payload.planName,
        validityDays: payload.validityDays,
      };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Payment verification failed. Please contact support.";
      return rejectWithValue(message);
    }
  },
);

export const cancelRecharge = createAsyncThunk(
  "recharge/cancelRecharge",
  async (razorpayOrderId, { rejectWithValue }) => {
    try {
      await cancelPayment(razorpayOrderId);
    } catch (err) {
      console.error("Failed to cancel payment on backend:", err);
    }
    return { success: false };
  },
);


const initialState = {
  step: "input",
  mobileNumber: "",
  plans: [],
  plansLoading: false,
  plansError: null,

  activeCategory: "ALL",
  searchQuery: "",
  selectedPlan: null,

  paymentMethod: "UPI",

  rechargeLoading: false,
  rechargeError: null,

  razorpayOrderData: null,

  verifying: false,

  paymentResult: null,
};

const rechargeSlice = createSlice({
  name: "recharge",
  initialState,
  reducers: {
    setMobileNumber(state, action) {
      state.mobileNumber = action.payload;
    },
    setStep(state, action) {
      state.step = action.payload;
    },
    setActiveCategory(state, action) {
      state.activeCategory = action.payload;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setSelectedPlan(state, action) {
      state.selectedPlan = action.payload;
    },
    clearSelectedPlan(state) {
      state.selectedPlan = null;
    },
    setPaymentMethod(state, action) {
      state.paymentMethod = action.payload;
    },
    // Used only for failure/dismiss — success goes through confirmPayment thunk
    setPaymentResult(state, action) {
      state.paymentResult = action.payload;
      state.razorpayOrderData = null;
      state.rechargeLoading = false;
      state.verifying = false;
    },
    clearPaymentResult(state) {
      state.paymentResult = null;
    },
    resetRecharge(state) {
      state.step = "input";
      state.mobileNumber = "";
      state.plans = [];
      state.plansError = null;
      state.activeCategory = "ALL";
      state.searchQuery = "";
      state.selectedPlan = null;
      state.paymentMethod = "UPI";
      state.rechargeLoading = false;
      state.rechargeError = null;
      state.razorpayOrderData = null;
      state.verifying = false;
      state.paymentResult = null;
    },
    clearRechargeStatus(state) {
      state.rechargeError = null;
      state.razorpayOrderData = null;
      state.paymentResult = null;
      state.verifying = false;
    },
  },
  extraReducers: (builder) => {
    // ── Lookup Plans ──────────────────────────────────────────────────────────
    builder
      .addCase(lookupPlans.pending, (state) => {
        state.plansLoading = true;
        state.plansError = null;
        state.plans = [];
      })
      .addCase(lookupPlans.fulfilled, (state, action) => {
        state.plansLoading = false;
        state.plans = action.payload;
        state.step = "plans";
      })
      .addCase(lookupPlans.rejected, (state, action) => {
        state.plansLoading = false;
        state.plansError = action.payload;
      });

    // ── Submit Recharge ───────────────────────────────────────────────────────
    builder
      .addCase(submitRecharge.pending, (state) => {
        state.rechargeLoading = true;
        state.rechargeError = null;
        state.razorpayOrderData = null;
      })
      .addCase(submitRecharge.fulfilled, (state, action) => {
        state.rechargeLoading = false;
        state.razorpayOrderData = action.payload; // triggers Razorpay popup in PlanDetailModal
      })
      .addCase(submitRecharge.rejected, (state, action) => {
        state.rechargeLoading = false;
        state.rechargeError = action.payload;
      });

    // ── Confirm Payment (backend verification) ────────────────────────────────
    builder
      .addCase(confirmPayment.pending, (state) => {
        state.verifying = true;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.verifying = false;
        state.razorpayOrderData = null;
        state.paymentResult = action.payload; // { success: true, ... }
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.verifying = false;
        state.razorpayOrderData = null;
        // Show failure result with the backend error message
        state.paymentResult = {
          success: false,
          errorMsg: action.payload,
        };
      });
    // ── Cancel / Dismiss ──
    builder.addCase(cancelRecharge.fulfilled, (state, action) => {
      state.razorpayOrderData = null;
      state.rechargeLoading = false;
      state.verifying = false;
      state.paymentResult = { success: false };
    });
  },
});

export const {
  setMobileNumber,
  setStep,
  setActiveCategory,
  setSearchQuery,
  setSelectedPlan,
  clearSelectedPlan,
  setPaymentMethod,
  setPaymentResult,
  clearPaymentResult,
  resetRecharge,
  clearRechargeStatus,
} = rechargeSlice.actions;

export default rechargeSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectStep = (state) => state.recharge.step;
export const selectMobileNumber = (state) => state.recharge.mobileNumber;
export const selectPlans = (state) => state.recharge.plans;
export const selectPlansLoading = (state) => state.recharge.plansLoading;
export const selectPlansError = (state) => state.recharge.plansError;
export const selectActiveCategory = (state) => state.recharge.activeCategory;
export const selectSearchQuery = (state) => state.recharge.searchQuery;
export const selectSelectedPlan = (state) => state.recharge.selectedPlan;
export const selectPaymentMethod = (state) => state.recharge.paymentMethod;
export const selectRechargeLoading = (state) => state.recharge.rechargeLoading;
export const selectRechargeError = (state) => state.recharge.rechargeError;
export const selectRazorpayOrderData = (state) =>
  state.recharge.razorpayOrderData;
export const selectPaymentResult = (state) => state.recharge.paymentResult;
export const selectVerifying = (state) => state.recharge.verifying;
