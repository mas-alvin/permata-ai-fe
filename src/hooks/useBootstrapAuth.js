import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials, clearCredentials } from '../store/slices/authSlice';
import { authService } from '../services/authService';

// Promise bootstrap disimpan di level modul: hanya 1x request /me seumur
// halaman, sekalipun effect dijalankan ulang.
let bootPromise = null;

function getBootPromise() {
  if (!bootPromise) {
    bootPromise = authService
      .me()
      .then((res) => ({ ok: true, user: res.data }))
      .catch(() => ({ ok: false }));
  }
  return bootPromise;
}

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
 * ⚠️ Penting: cleanup effect TIDAK BOLEH membatalkan promise bootstrap.
 * React StrictMode (main.jsx) me-mount effect 2x di dev: mount → unmount →
 * mount. Versi lama memakai ref `hasBooted` + `cancelled`, sehingga invokasi
 * kedua skip tapi invokasi pertama sudah ditandai cancelled → dispatch
 * tidak pernah jalan → isAuthResolved selamanya false setelah reload penuh.
 * Akibatnya RequireAuth merender null (sidebar & GuestNotice hilang) dan
 * footer kembali ke profil palsu "Creative Studio".
 */
export function useBootstrapAuth() {
  const dispatch = useAppDispatch();
  const isAuthResolved = useAppSelector((state) => state.auth.isAuthResolved);
  const dispatchedRef = useRef(false);

  useEffect(() => {
    if (isAuthResolved || dispatchedRef.current) return;
    // Tandai sinkron sebelum await. StrictMode menjalankan effect kedua secara
    // sinkron setelah yang pertama, jadi guard ini mencegah dispatch ganda
    // tanpa membatalkan promise yang masih berjalan.
    dispatchedRef.current = true;

    getBootPromise().then((result) => {
      if (result.ok) {
        // Data user (termasuk kredit) sudah didapat di sini — tidak perlu
        // request /me kedua setelah login terkonfirmasi.
        dispatch(setCredentials({ user: result.user }));
      } else {
        // Cookie tidak ada / invalid / sudah logout → mode tamu.
        dispatch(clearCredentials());
      }
    });
  }, [isAuthResolved, dispatch]);
}
