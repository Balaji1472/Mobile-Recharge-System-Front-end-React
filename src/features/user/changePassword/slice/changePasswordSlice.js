import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { changePassword } from "../service/changePasswordService";

export const submitPasswordChange = createAsyncThunk(
  "changePassword/submit",
  async (payload, thunkAPI) => {
    try {
      return await changePassword(payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to change password",
      );
    }
  },
);

const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState: {
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPasswordChange.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(submitPasswordChange.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(submitPasswordChange.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});
export const { reset } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;
