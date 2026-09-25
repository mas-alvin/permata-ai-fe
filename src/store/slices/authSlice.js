import { createSlice } from '@reduxjs/toolkit';

// Status auth ditentukan oleh httpOnly cookie JWT, bukan localStorage.
// Awalnya asumsikan belum login; App akan memanggil bootstrapAuth() yang
// mengecek cookie via /me. Mencegah kedipan "sudah login" palsu dari
// sisa-sisa token lama di localStorage.
const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isAuthResolved: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Dipanggil setelah login/register berhasil: cookie sudah dipasai server,
    // simpan user ke state. Token JWT sendiri tidak bisa dibaca JS (httpOnly).
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token ?? null;
      state.isAuthenticated = true;
      state.isAuthResolved = true;
      localStorage.removeItem('token');
    },
    // Cookie tidak ada / invalid → pastikan state bersih (mode tamu).
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isAuthResolved = true;
      localStorage.removeItem('token');
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isAuthResolved = true;
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

export const { setCredentials, clearCredentials, logout, setUser, setCredits, decrementCredits } = authSlice.actions;
export default authSlice.reducer;
