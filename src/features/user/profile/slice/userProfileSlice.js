import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchProfile, updateProfile } from "../service/userProfileService";

export const loadUserProfile = createAsyncThunk(
  "userProfile/load",
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
export const saveUserProfile = createAsyncThunk(
  "userProfile/save",
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

const userProfileSlice = createSlice({
  name: "userProfile",
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
      .addCase(loadUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(saveUserProfile.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});
export const { reset } = userProfileSlice.actions;
export default userProfileSlice.reducer;
