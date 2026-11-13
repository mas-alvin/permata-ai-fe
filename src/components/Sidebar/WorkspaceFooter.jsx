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
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isAuthResolved = useAppSelector((state) => state.auth.isAuthResolved);
  // Selama bootstrap cookie JWT belum selesai dicek, jangan tampilkan UI apa
  // pun: memunculkan tombol tamu lebih dulu akan membuat user login terlihat
  // "di logout" selama beberapa ms, sementara memunculkan profil lebih dulu
  // memunculkan placeholder palsu "Creative Studio".
  const isGuest = !isAuthenticated;
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
    <div className="w-full">
      {!isAuthResolved ? (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#19151d] border border-slate-100 dark:border-[#2a222c]">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-20 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      ) : isGuest ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go('/login')}
            className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#2a222c] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1f1922] hover:border-amber-500/40 transition-colors"
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => go('/register')}
            className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#40000b] to-[#600016] dark:from-[#570014] dark:to-[#7a0020] border border-[#800020]/40 dark:border-amber-400/30 text-white hover:opacity-90 transition-opacity shadow-xs"
          >
            Daftar
          </button>
        </div>
      ) : (
        <div className="relative" ref={menuRef}>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#19151d] border border-slate-200/70 dark:border-[#2a222c] flex items-center justify-between">
            <button
              type="button"
              onClick={() => go('/profile')}
              className="flex items-center gap-2 min-w-0 flex-1 text-left"
              title="Lihat profil"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#40000b] to-amber-700 text-amber-200 border border-amber-500/30 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0 truncate">
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
                  {displayName}
                </span>
                <CreditBadge />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1 rounded-lg text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-[#201a24] transition-colors shrink-0"
              title="Setelan"
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
            </button>
          </div>

          {menuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-56 bg-white dark:bg-[#19151d] rounded-2xl border border-slate-200 dark:border-[#2a222c] shadow-2xl z-50 overflow-hidden">
              <p className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-[#2a222c]">
                Pengaturan
              </p>

              {/* Tampilan / Tema */}
              <div className="px-2.5 py-2.5 space-y-1.5 border-b border-slate-100 dark:border-[#2a222c]">
                <p className="px-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
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
                        className={`flex flex-col items-center gap-1 px-1 py-2 rounded-sm text-[10px] font-semibold transition-all ${
                          isActive
                            ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#201a24]'
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
              <div className="py-1 border-b border-slate-100 dark:border-[#2a222c]">
                <button type="button" onClick={() => go('/settings')} className={MENU_ROW}>
                  <span className="material-symbols-outlined text-[17px] text-slate-500">settings</span>
                  Pengaturan Aplikasi
                </button>
                <button type="button" onClick={() => go('/profile')} className={MENU_ROW}>
                  <span className="material-symbols-outlined text-[17px] text-slate-500">account_circle</span>
                  Profil
                </button>
                <button type="button" onClick={() => go('/usage')} className={MENU_ROW}>
                  <span className="material-symbols-outlined text-[17px] text-slate-500">monitoring</span>
                  Penggunaan &amp; Aktivitas
                </button>
                {user?.role === 'admin' && (
                  <button type="button" onClick={() => go('/admin')} className={MENU_ROW}>
                    <span className="material-symbols-outlined text-[17px] text-slate-500">admin_panel_settings</span>
                    Admin Panel
                  </button>
                )}
              </div>

              {/* Keluar */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[17px]">logout</span>
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
