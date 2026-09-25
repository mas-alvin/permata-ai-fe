import { useAppSelector } from '../../store/hooks';
import { selectIsGuest } from '../../store/slices/guestSlice';

/**
 * Menyembunyikan komponen yang membutuhkan akun dari tamu (guest.md §4.3).
 *
 * Komponen sidebar seperti PinnedModels, PinnedChats, SavedTopics, dan
 * RecentChats memanggil endpoint yang dilindungi saat mount. Untuk tamu,
 * mereka tidak hanya gagal (401 di console), tapi tidak relevan — tamu
 * tidak punya histori chat maupun model yang disimpan.
 *
 * Anak komponen hanya di-render setelah status login selesai dicek
 * (isAuthResolved), supaya tidak mengedip selama boot.
 *
 * @param {React.ReactNode} children      Komponen yang butuh login
 * @param {React.ReactNode} [fallback]    Tampilan pengganti untuk tamu
 */
export default function RequireAuth({ children, fallback = null }) {
  const isGuest = useAppSelector(selectIsGuest);
  const isAuthResolved = useAppSelector((state) => state.auth.isAuthResolved);

  // Tunggu sampai status login selesai dicek.
  if (!isAuthResolved) return null;

  if (isGuest) return fallback;

  return children;
}
