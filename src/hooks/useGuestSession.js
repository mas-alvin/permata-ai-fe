import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setGuestSession,
  updateGuestUsage,
  setGuestLoading,
  setGuestError,
  clearGuestSession,
} from '../store/slices/guestSlice';
import { guestSessionService } from '../services/guestSessionServiceFE';

/**
 * Inisialisasi sesi tamu (guest.md §4.3 alur 1).
 *
 * Saat aplikasi mount dan user terbukti belum login (auth resolved), frontend
 * meminta sesi tamu baru ke backend. Sesi sebelumnya dipakai ulang selama
 * masih ada di localStorage — backend akan menolak jika sudah expired (TTL),
 * dan kita buat ulang otomatis.
 *
 * Mengapa menunggu isAuthResolved? Karena sesi tamu hanya relevan untuk user
 * yang belum login. Jangan buat sesi tamu untuk user yang sedang login.
 */
export function useGuestSession() {
  const dispatch = useAppDispatch();
  const isAuthResolved = useAppSelector((state) => state.auth.isAuthResolved);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const sessionId = useAppSelector((state) => state.guest.sessionId);
  const tokensLimit = useAppSelector((state) => state.guest.tokensLimit);
  const bootstrappedRef = useRef(false);

  // 1) Sesi tamu hanya untuk user belum login.
  useEffect(() => {
    if (!isAuthResolved) return;
    if (isAuthenticated) {
      // User login — tidak butuh sesi tamu.
      dispatch(clearGuestSession());
      return;
    }

    // Hindari request ganda (React StrictMode memanggil effect 2x).
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const init = async () => {
      dispatch(setGuestLoading(true));

      // Coba pakai ulang sesi yang masih valid.
      if (sessionId) {
        try {
          const status = await guestSessionService.status(sessionId);
          dispatch(
            updateGuestUsage({
              tokensUsed: status.tokens_used,
              tokensLimit: status.tokens_limit,
            })
          );
          dispatch(setGuestLoading(false));
          return;
        } catch {
          // Sesi expired / tidak valid → buat ulang di bawah.
        }
      }

      try {
        const session = await guestSessionService.create();
        dispatch(
          setGuestSession({
            sessionId: session.session_id,
            tokensLimit: session.tokens_limit,
            ttlMinutes: session.ttl_minutes,
            model: session.model,
          })
        );
      } catch (err) {
        dispatch(setGuestError(err?.message || 'Gagal memulai sesi tamu'));
      } finally {
        dispatch(setGuestLoading(false));
      }
    };

    init();
  }, [isAuthResolved, isAuthenticated, sessionId, dispatch]);

  // 2) Saat user login/daftar, hapus sesi tamu (guest.md §4.4).
  useEffect(() => {
    if (isAuthResolved && isAuthenticated) {
      dispatch(clearGuestSession());
    }
  }, [isAuthResolved, isAuthenticated, dispatch]);

  return { sessionId, tokensLimit };
}
