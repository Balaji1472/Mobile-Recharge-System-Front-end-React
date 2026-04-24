import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
  name: "toast",
  initialState: {
    message: "",
    type: "info", 
    show: false,
  },
  reducers: {
    showToast: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type || "info";
      state.show = true;
    },
    clearToast: (state) => {
      state.message = "";
      state.type = "info";
      state.show = false;
    },
  },
});

export const { showToast, clearToast } = toastSlice.actions;
export default toastSlice.reducer;
