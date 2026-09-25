import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials, clearCredentials } from '../store/slices/authSlice';
import { authService } from '../services/authService';

/**
 * Cek sesi JWT httpOnly cookie saat aplikasi pertama kali dimuat.
 *
 * Cookie httpOnly tidak bisa dibaca JavaScript, jadi satu-satunya cara untuk
 * tahu apakah user masih login adalah menanyakan backend (/me). Ini membuat
 * sesi tetap bertahan setelah reload — sesuai permintaan: session hanya
 * berakhir saat user klik logout (backend menandai jwt_revoked_at).
 *
 * Catatan: untuk tamu, request /me ini memang akan 401 sekali saat boot.
 * Itu cara normal mendeteksi "belum login" — bukan bug. Setelah itu,
 * isAuthResolved=true dan tidak ada lagi request endpoint login.
 *
 * Selama pengecekan, isAuthResolved=false agar UI tidak mengedip memutuskan
 * status login. Hanya /chat/* yang butuh auth; halaman lain (login/register)
 * tetap bisa diakses tanpa menunggu.
 */
export function useBootstrapAuth() {
  const dispatch = useAppDispatch();
  const isAuthResolved = useAppSelector((state) => state.auth.isAuthResolved);
  // Guard: React StrictMode (main.jsx) double-invoke useEffect di dev.
  // Tanpa ini /me dipanggil 2x untuk tamu → 2 error 401 identik di console.
  // Ref tetap valid lintas re-invoke StrictMode, jadi panggilan kedua skip.
  const hasBooted = useRef(false);

  useEffect(() => {
    if (isAuthResolved || hasBooted.current) return;
    hasBooted.current = true;

    let cancelled = false;

    authService
      .me()
      .then((res) => {
        if (cancelled) return;
        // Data user (termasuk kredit) sudah didapat di sini — tidak perlu
        // request /me kedua setelah login terkonfirmasi.
        dispatch(setCredentials({ user: res.data }));
      })
      .catch(() => {
        if (cancelled) return;
        // Cookie tidak ada / invalid / sudah logout → mode tamu.
        dispatch(clearCredentials());
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthResolved, dispatch]);
}
