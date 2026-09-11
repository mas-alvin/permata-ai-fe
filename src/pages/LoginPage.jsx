import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import {
  Gem,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Shield,
  Check,
} from 'lucide-react';
import logo from '../assets/permata.png';

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

      dispatch(
        setCredentials({
          token: res.data.token,
          user: res.data.user,
        })
      );

      navigate('/chat/new', { replace: true });
    } catch (err) {
      setError('Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-gray-900 flex antialiased">
      {/* Left Hero */}
      <div className="hidden lg:flex lg:w-[48%] relative bg-gradient-to-br from-[#121316] via-[#1a1417] to-[#241318] text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#800020]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#e69500]/20 rounded-full blur-3xl pointer-events-none" />

        <div
          className="absolute inset-0 pointer-events-none opacity-100"
          style={{
            backgroundImage:
              'radial-gradient(#ffffff0a 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#b45309] flex items-center justify-center shadow-lg shadow-orange-950/30 ring-1 ring-white/20 overflow-hidden">
              <img
                src={logo}
                alt="Permata AI"
                className="w-7 h-7 object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight">
                  Permata AI
                </span>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#800020]/80 text-rose-200 border border-[#800020]">
                  v2.5
                </span>
              </div>

              <p className="text-xs text-gray-400">
                Workspace &amp; Studio AI Premium
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md"
          >
            <span>Kembali ke Beranda</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-amber-300 mb-6">
            <Sparkles className="w-3 h-3" />
            <span>Generasi Baru Penalaran Cerdas</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Think bigger with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-amber-500">
              Permata AI
            </span>
          </h1>

          <p className="text-gray-300 text-base leading-relaxed mb-8">
            Buka potensi tak terbatas dengan model penalaran lanjutan,
            workspace visual, serta kolaborasi AI tercepat untuk tim inovator
            dan desainer.
          </p>

          {/* Preview */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />

                <span className="text-xs font-semibold text-gray-200">
                  Permata Pro Reasoning Core
                </span>
              </div>

              <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                <span>⚡</span>
                1.2M Context
              </span>
            </div>

            <p className="text-xs text-gray-300 italic font-mono leading-relaxed">
              "Mengintegrasikan insight kreatif, arsitektur visual, dan
              formulasi data mutakhir dalam satu perintah terpadu."
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 border-t border-white/10 pt-6 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="w-7 h-7 rounded-full border-2 border-[#121316] bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center"
                >
                  <Gem className="w-3 h-3 text-gray-300" />
                </div>
              ))}
            </div>

            <span className="text-gray-300 font-medium">
              Dipercaya oleh 45.000+ tim kreatif
            </span>
          </div>

          <span>© 2025 Permata AI</span>
        </div>
      </div>

      {/* Right Form */}
      <div
        className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16 min-h-screen overflow-y-auto"
        style={{
          background:
            'radial-gradient(circle at 10% 20%, rgba(128, 0, 32, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(230, 149, 0, 0.06) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(243, 244, 246, 0.6) 0%, #ffffff 100%)',
        }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#b45309] flex items-center justify-center shadow-md overflow-hidden">
              <img
                src={logo}
                alt="Permata AI"
                className="w-6 h-6 object-contain"
              />
            </div>

            <span className="font-bold text-gray-900 tracking-tight">
              Permata AI
            </span>
          </div>

          <div className="ml-auto text-xs sm:text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#800020] hover:text-[#5e0017] transition-colors ml-1 inline-flex items-center gap-1"
            >
              Daftar sekarang
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#800020] text-xs font-semibold mb-3 border border-rose-100">
              <ShieldCheck className="w-3 h-3" />
              Autentikasi Aman
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Selamat Datang Kembali
            </h2>

            <p className="text-gray-500 text-sm mt-1.5">
              Masuk ke ruang kerja cerdas Anda untuk melanjutkan eksplorasi.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" />

              <div>
                <p className="font-semibold">Login gagal</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm transition-all hover:shadow hover:border-gray-300 active:scale-[0.99]"
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

              <span>Lanjutkan dengan Google</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm transition-all hover:shadow hover:border-gray-300 active:scale-[0.99]"
            >
              <span className="text-base font-semibold text-gray-900">●</span>
              <span>Lanjutkan dengan Apple ID</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-200 w-full" />

            <span className="absolute bg-[#fcfcfd] px-3 text-xs uppercase tracking-wider text-gray-400 font-medium">
              atau dengan email
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Alamat Email
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Kata Sandi
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs text-[#800020] hover:underline font-medium"
                >
                  Lupa sandi?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all shadow-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={
                    showPassword
                      ? 'Sembunyikan password'
                      : 'Tampilkan password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#800020] focus:ring-[#800020] border-gray-300 accent-[#800020]"
                />

                <span className="text-xs text-gray-600 font-medium">
                  Ingat saya selama 30 hari
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#800020] to-[#5e0017] hover:from-[#6d001b] hover:to-[#4e0013] text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-950/20 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
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
            </div>
          </form>

          {/* Security */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Enkripsi TLS 256-Bit</span>
            </div>

            <span>•</span>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#800020]" />
              <span>SOC-2 Certified</span>
            </div>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-gray-400 flex items-center justify-center gap-4 pt-4">
          <Link
            to="/privacy"
            className="hover:text-gray-600 transition-colors"
          >
            Kebijakan Privasi
          </Link>

          <span>•</span>

          <Link
            to="/terms"
            className="hover:text-gray-600 transition-colors"
          >
            Ketentuan Layanan
          </Link>

          <span>•</span>

          <Link
            to="/help"
            className="hover:text-gray-600 transition-colors"
          >
            Bantuan
          </Link>
        </div>
      </div>
    </div>
  );
}