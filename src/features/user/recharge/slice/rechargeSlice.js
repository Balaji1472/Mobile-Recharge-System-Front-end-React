
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchPlansByMobile,
  fetchConnectionId,
  initiateRecharge,
  verifyPayment,
} from "../service/rechargeService";

// ─── Thunks ───────────────────────────────────────────────────────────────────

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
  }
);

/**
 * submitRecharge
 *
 * Payload from UI: { planId, paymentMethod }
 * This thunk:
 *   1. Reads mobileNumber from Redux state
 *   2. Calls GET /recharges/connection to resolve connectionId
 *   3. Calls POST /recharges with { connectionId, planId, paymentMethod }
 *   4. Returns the order data (razorpayOrderId etc.) → PlanDetailModal opens Razorpay
 */
export const submitRecharge = createAsyncThunk(
  "recharge/submitRecharge",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const mobileNumber = getState().recharge.mobileNumber;

      if (!mobileNumber) {
        return rejectWithValue(
          "Mobile number is missing. Please go back and re-enter."
        );
      }

      // Step 1 — resolve connectionId
      const connectionId = await fetchConnectionId(mobileNumber);

      if (!connectionId || connectionId <= 0) {
        return rejectWithValue(
          "Could not find an active connection for this mobile number."
        );
      }

      // Step 2 — initiate recharge and get Razorpay orderId
      const data = await initiateRecharge({
        connectionId,
        planId: payload.planId,
        paymentMethod: payload.paymentMethod,
      });

      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message || "Recharge failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

/**
 * confirmPayment
 *
 * Called after Razorpay popup fires its success handler.
 * Sends the 3 Razorpay params to POST /payments/verify.
 * Backend verifies HMAC signature and updates payment + recharge in DB.
 *
 * Payload: { razorpayOrderId, razorpayPaymentId, razorpaySignature, planName, validityDays, finalAmount }
 */
export const confirmPayment = createAsyncThunk(
  "recharge/confirmPayment",
  async (payload, { rejectWithValue }) => {
    try {
      await verifyPayment({
        razorpayOrderId: payload.razorpayOrderId,
        razorpayPaymentId: payload.razorpayPaymentId,
        razorpaySignature: payload.razorpaySignature,
      });
      // Return UI display data alongside verification success
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
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  // Step: 'input' | 'plans'
  step: "input",
  mobileNumber: "",

  // Plans
  plans: [],
  plansLoading: false,
  plansError: null,

  // Active filter tab
  activeCategory: "ALL",

  // Search
  searchQuery: "",

  // Modal
  selectedPlan: null,

  // Payment method selected in PlanDetailModal
  paymentMethod: "UPI",

  // Recharge submission
  rechargeLoading: false,
  rechargeError: null,

  // Razorpay order data returned from POST /recharges
  razorpayOrderData: null,

  // true while POST /payments/verify is in flight
  verifying: false,

  // Final payment outcome set after backend verification completes
  // Shape: { success: bool, razorpayPaymentId?, rechargeId, finalAmount, planName }
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
export const selectRazorpayOrderData = (state) => state.recharge.razorpayOrderData;
export const selectPaymentResult = (state) => state.recharge.paymentResult;
export const selectVerifying = (state) => state.recharge.verifying;