import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    user: null,
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setCredits(state, action) {
      if (!state.user) return;
      state.user = { ...state.user, credits: action.payload };
    },
    decrementCredits(state, action) {
      if (!state.user) return;
      const current = state.user.credits ?? 0;
      state.user = { ...state.user, credits: Math.max(0, current - action.payload) };
    },
  },
});

export const { setCredentials, logout, setUser, setCredits, decrementCredits } = authSlice.actions;
export default authSlice.reducer;
