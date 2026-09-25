import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { clearConversations } from '../../store/slices/conversationSlice';
import { authService } from '../../services/authService';
import { useConfirmModal } from '../../hooks/useConfirmModal';
import CreditBadge from './CreditBadge';
import { useTheme, THEME_CYCLE, THEME_META } from '../../hooks/useTheme';

const ICON_BTN =
  'flex items-center justify-center w-8 h-8 rounded-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors';

// Baris menu umum di dalam panel pengaturan.
const MENU_ROW =
  'flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors';

export default function WorkspaceFooter() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { confirm } = useConfirmModal();
  const user = useAppSelector((state) => state.auth.user);
  // Mode tamu: user belum login. Cookie JWT belum ada / belum terverifikasi
  // (bootstrapAuth sedang jalan). State auth hanya dianggap valid setelah
  // isAuthResolved=true, agar tidak mengedip memutuskan status login.
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isAuthResolved = useAppSelector((state) => state.auth.isAuthResolved);
  const isGuest = isAuthResolved && !isAuthenticated;
  const { theme, setTheme } = useTheme();

  // Satu-satunya menu sekarang: panel dialog pengaturan (tema, logout, dll).
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    setMenuOpen(false);
    const ok = await confirm({
      title: 'Keluar dari akun?',
      message: 'Anda tetap bisa menggunakan AI sebagai tamu, tetapi riwayat percakapan akun Anda tidak akan tersimpan.',
      confirmLabel: 'Keluar',
      cancelLabel: 'Batal',
      danger: true,
    });
    if (!ok) return;

    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Kembali ke mode tamu, bukan halaman login. Cookie JWT sudah dihapus
      // server (jwt_revoked_at), jadi user dianggap tamu.
      dispatch(logout());
      dispatch(clearConversations());
      navigate('/chat/new', { replace: true });
    }
  };

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  // Tutup menu saat klik di luar.
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Satu sumber data: pakai user asli atau fallback statis. Menghapus
  // duplikasi blok render yang dulu ada untuk kondisi !user.
  const displayName = user?.name || 'Creative Studio';
  const displayEmail = user?.email || 'studio@permata.ai';

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PA';


  return (
    <div className="p-3 border-t border-on-surface/10 bg-surface-container-lowest/90 backdrop-blur-md space-y-2">
      <CreditBadge />

      {isGuest ? (
        // ── Mode tamu: tampilkan CTA login/register (funnel konversi) ──
        // guest.md §3.4: tamu tetap bisa chat, tapi fitur akun diblokir dan
        // selalu ada jalur jelas untuk mendaftar.
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go('/login')}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border border-on-surface/15 text-on-surface hover:bg-surface-container-low transition-colors"
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => go('/register')}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-sm"
          >
            Daftar
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          {/* User Account row — klik untuk membuka halaman profil */}
          <button
            type="button"
            onClick={() => go('/profile')}
            className="flex items-center gap-2.5 min-w-0 flex-1 px-1.5 py-1 -mx-1.5 rounded-md hover:bg-surface-container-low transition-colors text-left"
            title="Lihat profil"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0 truncate">
              <p className="text-xs font-semibold text-on-surface truncate leading-tight">{displayName}</p>
              <p className="text-[10px] text-on-surface-variant/60 truncate">{displayEmail}</p>
            </div>
          </button>

          {/* Tombol tunggal — membuka menu dialog pengaturan (tema, logout, dll) */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={ICON_BTN}
              title="Pengaturan"
              aria-label="Pengaturan"
            >
              <span className="material-symbols-outlined text-[17px]">settings</span>
            </button>

            {menuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-surface rounded-md border border-on-surface/10 z-50 overflow-hidden">
                <p className="px-3 py-2 text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wide border-b border-on-surface/8">
                  Pengaturan
                </p>

                {/* Tampilan / Tema — 3 pilihan dalam satu baris */}
                <div className="px-2.5 py-2.5 space-y-1.5 border-b border-on-surface/8">
                  <p className="px-0.5 text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wide">
                    Tampilan
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {THEME_CYCLE.map((value) => {
                      const meta = THEME_META[value];
                      const isActive = theme === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setTheme(value)}
                          title={meta.label}
                          className={`flex flex-col items-center gap-1 px-1 py-2 rounded-md text-[10px] font-semibold transition-all ${
                            isActive
                              ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                              : 'text-on-surface-variant hover:bg-surface-container-low'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[17px]">{meta.icon}</span>
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Menu navigasi */}
                <div className="py-1 border-b border-on-surface/8">
                  <button type="button" onClick={() => go('/settings')} className={MENU_ROW}>
                    <span className="material-symbols-outlined text-[17px] text-on-surface-variant">settings</span>
                    Pengaturan Aplikasi
                  </button>
                  <button type="button" onClick={() => go('/profile')} className={MENU_ROW}>
                    <span className="material-symbols-outlined text-[17px] text-on-surface-variant">account_circle</span>
                    Profil
                  </button>
                  <button type="button" onClick={() => go('/usage')} className={MENU_ROW}>
                    <span className="material-symbols-outlined text-[17px] text-on-surface-variant">monitoring</span>
                    Penggunaan &amp; Aktivitas
                  </button>
                  <button type="button" onClick={() => setMenuOpen(false)} className={MENU_ROW}>
                    <span className="material-symbols-outlined text-[17px] text-on-surface-variant">help</span>
                    Bantuan
                  </button>
                  {user?.role === 'admin' && (
                    <button type="button" onClick={() => go('/admin')} className={MENU_ROW}>
                      <span className="material-symbols-outlined text-[17px] text-on-surface-variant">admin_panel_settings</span>
                      Admin Panel
                    </button>
                  )}
                </div>

                {/* Keluar — dipisah di bagian bawah sebagai aksi berbahaya */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">logout</span>
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
