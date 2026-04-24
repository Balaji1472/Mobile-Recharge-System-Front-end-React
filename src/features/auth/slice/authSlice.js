import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  getProfile,
  requestPasswordReset,
  verifyAndResetPassword,
} from "../service/authService";
import { clearToast, showToast } from "../../toast/slice/toastSlice";

// ── Register ──────────────────────────────────────────────────────────────
export const register = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const result = await registerUser(data);
      thunkAPI.dispatch(
        showToast({ message: "Registered successfully!", type: "success" }),
      );
      return result;
    } catch (err) {
      const errMsg = err.response?.data?.fields
        ? Object.values(err.response.data.fields).join(", ")
        : err.response?.data?.message || "Registration failed";
      thunkAPI.dispatch(showToast({ message: errMsg, type: "error" }));
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);

// ── Login ─────────────────────────────────────────────────────────────────
export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const result = await loginUser(data);
    thunkAPI.dispatch(
      showToast({ message: "Logged in successfully!", type: "success" }),
    );
    setTimeout(() => {
      thunkAPI.dispatch(clearToast());
    }, 3000);
    return result;
  } catch (err) {
    const errMsg = err.response?.data?.message || "Login failed";
    thunkAPI.dispatch(showToast({ message: errMsg, type: "error" }));
    return thunkAPI.rejectWithValue(err.response?.data);
  }
});

// ── Fetch Profile ─────────────────────────────────────────────────────────
export const fetchProfile = createAsyncThunk(
  "auth/profile",
  async (_, thunkAPI) => {
    try {
      return await getProfile();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);

// ── Forgot Password — Step 1: Request OTP ────────────────────────────────
export const forgotPasswordRequest = createAsyncThunk(
  "auth/forgotPasswordRequest",
  async (email, thunkAPI) => {
    try {
      const result = await requestPasswordReset(email);
      thunkAPI.dispatch(
        showToast({ message: "OTP sent to your email!", type: "success" }),
      );
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      thunkAPI.dispatch(showToast({ message: msg, type: "error" }));
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);

// ── Forgot Password — Step 2: Verify OTP + Reset ─────────────────────────
export const resetPasswordVerify = createAsyncThunk(
  "auth/resetPasswordVerify",
  async (resetData, thunkAPI) => {
    try {
      const result = await verifyAndResetPassword(resetData);
      thunkAPI.dispatch(
        showToast({
          message: "Password updated successfully!",
          type: "success",
        }),
      );
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || "Reset failed";
      thunkAPI.dispatch(showToast({ message: msg, type: "error" }));
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);

// ── Initial State ─────────────────────────────────────────────────────────
const storedUser = (() => {
  try {
    const u = localStorage.getItem("auth_user");
    return u ? JSON.parse(u) : null;
  } catch {
    localStorage.removeItem("auth_user");
    return null;
  }
})();

const initialState = {
  user: storedUser,
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// ── Slice ─────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("auth_user");
    },
  },
  extraReducers: (builder) => {
    builder
      // register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Registration failed";
      })
      // login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Login failed";
      })
      // fetchProfile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("auth_user");
      })
      // forgotPasswordRequest — no state changes needed, toast handled inside thunk
      .addCase(forgotPasswordRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPasswordRequest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPasswordRequest.rejected, (state) => {
        state.isLoading = false;
      })
      // resetPasswordVerify — no state changes needed, toast handled inside thunk
      .addCase(resetPasswordVerify.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPasswordVerify.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPasswordVerify.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { reset, logout } = authSlice.actions;
export default authSlice.reducer;
