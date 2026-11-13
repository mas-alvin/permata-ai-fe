import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { clearConversations } from '../store/slices/conversationSlice';
import { authService } from '../services/authService';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import permataIcon from '../assets/permata-icon.png';
import permataIconDark from '../assets/permata-icon-dark.png';
import logoLight from '../assets/permatalight.png';
import logoDark from '../assets/permatadark.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    try {
      const res = await authService.login(email, password);

      // Autentikasi memakai JWT httpOnly cookie — server yang memasang cookie,
      // jadi tidak ada token yang dibaca JS. Simpan hanya data user ke state.
      dispatch(
        setCredentials({
          user: res.data.user,
        })
      );

      // Bersihkan state UI percakapan tamu agar sinkron dengan user baru
      dispatch(clearConversations());

      navigate('/chat/new', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau kata sandi tidak valid');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-[#faf8f6] dark:bg-[#0d0b0e] text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top back navigation link */}
      <div className="w-full max-w-md flex justify-between items-center mb-4 sm:mb-6 px-1 z-10">
        <Link
          to="/"
          className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium"
        >
          <span>← Kembali ke Beranda</span>
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300/60 dark:border-amber-800/60">
          Permata AI
        </span>
      </div>

      {/* Centered Main Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#141116] rounded-2xl border border-slate-200/90 dark:border-[#2a222c] shadow-2xl shadow-[#800020]/10 p-6 sm:p-8 relative z-10 backdrop-blur-md transition-colors">
        {/* Logo & Heading */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link to="/" className="inline-flex items-center justify-center mb-3.5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#19151d] dark:to-[#221a25] border border-amber-200/70 dark:border-white/10 flex items-center justify-center p-2.5 shadow-2xs group-hover:scale-105 transition-transform">
              <img
                src={permataIcon}
                alt="Permata AI Logo"
                className="w-full h-full object-contain dark:hidden"
              />
              <img
                src={permataIconDark}
                alt="Permata AI Logo"
                className="w-full h-full object-contain hidden dark:block"
              />
            </div>
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Masuk ke ruang kerja cerdas Permata AI Anda
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold">Login Gagal</p>
              <p className="mt-0.5 text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#19151d] border border-slate-200 dark:border-[#2a222c] rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-400 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kata Sandi
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-[#19151d] border border-slate-200 dark:border-[#2a222c] rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-amber-700 focus:ring-amber-600 border-slate-300 dark:border-slate-600 accent-[#800020]"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Ingat saya di perangkat ini
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#40000b] via-[#800020] to-[#c58a27] hover:from-[#570013] hover:to-[#b87a1d] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-[#800020]/20 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Akun</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-slate-200 dark:border-[#2a222c] w-full" />
          <span className="absolute bg-white dark:bg-[#141116] px-3 text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            atau
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => alert('Fitur Google login dalam integrasi OAuth')}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-[#19151d] hover:bg-slate-100 dark:hover:bg-[#201a24] border border-slate-200 dark:border-[#2a222c] rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                fill="#4285F4"
              />
              <path
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                fill="#34A853"
              />
              <path
                d="M5.28 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                fill="#EA4335"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Fitur Apple login dalam integrasi OAuth')}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-[#19151d] hover:bg-slate-100 dark:hover:bg-[#201a24] border border-slate-200 dark:border-[#2a222c] rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <span className="text-sm font-bold"></span>
            <span>Apple</span>
          </button>
        </div>

        {/* Register CTA */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#2a222c] text-center text-xs text-slate-500 dark:text-slate-400">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 ml-1 inline-flex items-center gap-0.5"
          >
            Daftar sekarang
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-md text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-3 mt-6 z-10">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Enkripsi Aman &amp; Terlindungi
        </span>
        <span>•</span>
        <span>© 2026 Permata AI</span>
      </div>
    </div>
  );
}
