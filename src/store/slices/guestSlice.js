import { createSlice } from '@reduxjs/toolkit';

/**
 * State sesi tamu (guest.md §4.3).
 *
 * Sesi tamu disimpan di Redis backend dengan TTL otomatis — frontend hanya
 * menyimpan guest_session_id (UUID) di localStorage + token yang sudah
 * terpakai untuk menampilkan indikator sisa kuota.
 *
 * Catatan penting:
 *  - session_id diterima dari backend (POST /guest/v2/session), bukan dibuat
 *    di frontend. Backend yang mengatur TTL & kuota.
 *  - Token dihitung backend berdasarkan output Ollama aktual
 *    (prompt_eval_count + eval_count); frontend hanya sinkron tampilan.
 */
const GUEST_SESSION_KEY = 'guest_session_id';

function loadSessionId() {
  try {
    return localStorage.getItem(GUEST_SESSION_KEY) || null;
  } catch {
    return null;
  }
}

function persistSessionId(id) {
  try {
    if (id) localStorage.setItem(GUEST_SESSION_KEY, id);
    else localStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    // localStorage tidak tersedia (mode privat dll) — lanjut tanpa persist.
  }
}

const initialState = {
  sessionId: loadSessionId(),
  tokensUsed: 0,
  tokensLimit: 0,
  ttlMinutes: 0,
  model: null,
  isQuotaExceeded: false,
  isLoading: false,
  error: null,
};

const guestSlice = createSlice({
  name: 'guest',
  initialState,
  reducers: {
    // Sesi baru dibuat di backend; simpan id + kuota awal.
    setGuestSession(state, action) {
      const { sessionId, tokensLimit, ttlMinutes, model } = action.payload;
      state.sessionId = sessionId;
      state.tokensLimit = tokensLimit;
      state.ttlMinutes = ttlMinutes;
      state.model = model;
      state.tokensUsed = 0;
      state.isQuotaExceeded = false;
      state.error = null;
      persistSessionId(sessionId);
    },
    // Sinkronisasi pemakaian token setelah streaming / cek status.
    updateGuestUsage(state, action) {
      const { tokensUsed, tokensLimit } = action.payload;
      state.tokensUsed = tokensUsed;
      if (typeof tokensLimit === 'number' && tokensLimit > 0) {
        state.tokensLimit = tokensLimit;
      }
      state.isQuotaExceeded = state.tokensLimit > 0 && state.tokensUsed >= state.tokensLimit;
    },
    setGuestLoading(state, action) {
      state.isLoading = !!action.payload;
    },
    setGuestError(state, action) {
      state.error = action.payload;
    },
    // Hapus sesi tamu (mis. setelah login/daftar berhasil).
    clearGuestSession() {
      persistSessionId(null);
      return { ...initialState, sessionId: null };
    },
  },
});

export const {
  setGuestSession,
  updateGuestUsage,
  setGuestLoading,
  setGuestError,
  clearGuestSession,
} = guestSlice.actions;

export const selectTokensRemaining = (state) => {
  const { tokensLimit, tokensUsed } = state.guest;
  if (!tokensLimit) return null;
  return Math.max(0, tokensLimit - tokensUsed);
};

export const selectIsGuest = (state) => {
  const isAuthResolved = state.auth.isAuthResolved;
  const isAuthenticated = state.auth.isAuthenticated;
  return isAuthResolved && !isAuthenticated;
};

export default guestSlice.reducer;
