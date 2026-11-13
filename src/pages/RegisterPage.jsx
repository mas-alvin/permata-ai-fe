import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { clearConversations } from '../store/slices/conversationSlice';
import { authService } from '../services/authService';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Check,
} from 'lucide-react';
import permataIcon from '../assets/permata-icon.png';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (!password) {
      return {
        score: 0,
        label: '',
        color: 'bg-slate-200 dark:bg-slate-700',
        textColor: 'text-slate-400',
      };
    }

    if (score <= 1) {
      return {
        score,
        label: 'Lemah',
        color: 'bg-red-500',
        textColor: 'text-red-500',
      };
    }

    if (score === 2) {
      return {
        score,
        label: 'Sedang',
        color: 'bg-amber-500',
        textColor: 'text-amber-500',
      };
    }

    if (score === 3) {
      return {
        score,
        label: 'Baik',
        color: 'bg-emerald-400',
        textColor: 'text-emerald-500',
      };
    }

    return {
      score,
      label: 'Kuat',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
    };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama lengkap wajib diisi');
      return;
    }

    if (!email.trim()) {
      setError('Alamat email wajib diisi');
      return;
    }

    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter');
      return;
    }

    if (!agree) {
      setError('Anda harus menyetujui Ketentuan Layanan dan Kebijakan Privasi');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.register(name, email, password, confirm);

      // Autentikasi memakai JWT httpOnly cookie — server yang memasang cookie.
      dispatch(
        setCredentials({
          user: res.data.user,
        })
      );

      // Bersihkan chat tamu lokal
      dispatch(clearConversations());

      navigate('/chat/new', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Pendaftaran akun gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top back navigation link */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4 sm:mb-6 px-1 z-10">
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
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-[#800020]/5 p-6 sm:p-8 relative z-10 backdrop-blur-md">
        {/* Logo & Heading */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link to="/" className="inline-flex items-center justify-center mb-3.5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border border-amber-200/70 dark:border-slate-700 flex items-center justify-center p-2.5 shadow-2xs group-hover:scale-105 transition-transform">
              <img
                src={permataIcon}
                alt="Permata AI Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Buat Akun Permata AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mulai pengalaman eksplorasi cerdas bersama model Permata Flash 1.0
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold">Pendaftaran Gagal</p>
              <p className="mt-0.5 text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                required
                autoComplete="name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-400 transition-all"
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-400 transition-all"
              />
            </div>
          </div>

          {/* Password & Confirm Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Konfirmasi Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 dark:focus:border-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Kekuatan Sandi</span>
                <span className={`font-semibold ${passwordStrength.textColor}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-colors ${
                      step <= passwordStrength.score
                        ? passwordStrength.color
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Agreement Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-700 focus:ring-amber-600 border-slate-300 dark:border-slate-600 accent-[#800020]"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Saya menyetujui{' '}
                <a href="#" className="text-amber-700 dark:text-amber-400 hover:underline font-medium">
                  Ketentuan Layanan
                </a>{' '}
                dan{' '}
                <a href="#" className="text-amber-700 dark:text-amber-400 hover:underline font-medium">
                  Kebijakan Privasi
                </a>{' '}
                Permata AI.
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
                <span>Mendaftarkan Akun...</span>
              </>
            ) : (
              <>
                <span>Daftar Akun Baru</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login CTA */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 ml-1 inline-flex items-center gap-0.5"
          >
            Masuk ke Akun
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-lg text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-3 mt-6 z-10">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Data Aman &amp; Terproteksi
        </span>
        <span>•</span>
        <span>© 2026 Permata AI</span>
      </div>
    </div>
  );
}
