import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser, loginUser, getProfile } from "./authService";
import { clearToast, showToast } from "../toast/toastSlice";

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

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("auth_user");
      });
  },
});

export const { reset, logout } = authSlice.actions;
export default authSlice.reducer;
