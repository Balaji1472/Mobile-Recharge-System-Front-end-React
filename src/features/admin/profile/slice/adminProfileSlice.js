import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchProfile, updateProfile } from "../service/adminProfileService";

export const loadProfile = createAsyncThunk(
  "adminProfile/load",
  async (_, thunkAPI) => {
    try {
      return await fetchProfile();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load profile",
      );
    }
  },
);
export const saveProfile = createAsyncThunk(
  "adminProfile/save",
  async (payload, thunkAPI) => {
    try {
      return await updateProfile(payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update profile",
      );
    }
  },
);

const adminProfileSlice = createSlice({
  name: "adminProfile",
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
      .addCase(loadProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});
export const { reset } = adminProfileSlice.actions;
export default adminProfileSlice.reducer;
