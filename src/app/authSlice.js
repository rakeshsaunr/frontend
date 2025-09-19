// src/app/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.token = "";
    },
  },
});

export const { setUser, setToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
