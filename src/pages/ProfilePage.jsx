import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setUser } from '../store/slices/authSlice';
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  KeyIcon,
  BoltIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    // Simulasi simpan profil (endpoint update profil belum tersedia).
    setTimeout(() => {
      dispatch(setUser({ ...user, name, email }));
      setLoading(false);
      setSuccessMessage('Profil berhasil diperbarui!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 600);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PA';

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar bg-surface-container-low/30">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 space-y-8">

        {/* Page Header */}
        <header>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Profil Pengguna</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">
            Kelola informasi akun, preferensi, dan pantau penggunaan kredit Anda.
          </p>
        </header>

        {/* Profile Banner Card */}
        <div className="relative bg-surface-container rounded-md border border-on-surface/10 shadow-sm overflow-hidden p-6 sm:p-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <SparklesIcon className="w-40 h-40 text-primary" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-pro p-1 shadow-inner">
                <div className="w-full h-full rounded-full bg-dark-sidebar flex items-center justify-center text-primary text-3xl font-bold">
                  {initials}
                </div>
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-surface-container-highest rounded-full" title="Aktif" />
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-bold text-on-surface truncate">{user?.name || 'Pengguna Permata'}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold w-fit mx-auto sm:mx-0">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  {user?.role || 'Free Tier'}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant/70 mt-1 truncate">{user?.email || 'email@domain.com'}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 pt-4 border-t border-on-surface/5">
                <div className="flex items-center gap-2">
                  <BoltIcon className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-on-surface-variant">Sisa Kredit:</span>
                  <span className="text-xs font-bold text-on-surface">{user?.credits ?? 0} poin</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Tracking Shortcut */}
        <button
          type="button"
          onClick={() => navigate('/usage')}
          className="group w-full flex items-center justify-between gap-4 px-5 py-4 rounded-md border border-on-surface/10 bg-surface-container hover:border-primary/30 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <ChartBarIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Penggunaan & Aktivitas</h3>
              <p className="text-xs text-on-surface-variant/70">Lacak penggunaan token LLM, kredit, dan aktivitas harian.</p>
            </div>
          </div>
          <ArrowRightIcon className="w-4 h-4 text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* Success Alert */}
        {successMessage && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-fadeIn">
            <CheckCircleIcon className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Edit Form Section */}
        <div className="bg-surface-container rounded-md border border-on-surface/10 shadow-sm p-6 sm:p-8">
          <h3 className="text-base font-semibold text-on-surface mb-4">Informasi Pribadi</h3>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/50">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low/50 border border-on-surface/15 rounded-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="Nama Anda"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/50">
                    <EnvelopeIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low/50 border border-on-surface/15 rounded-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-on-surface/5">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-pro text-white text-xs font-semibold hover:opacity-95 transition-opacity shadow-md disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        {/* Security / Password Section */}
        <div className="bg-surface-container rounded-md border border-on-surface/10 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-on-surface/10 flex items-center justify-center text-on-surface-variant">
                <KeyIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-on-surface">Keamanan & Sandi</h3>
                <p className="text-xs text-on-surface-variant/70">Perbarui kata sandi akun Anda secara berkala.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert('Fitur ubah sandi segera hadir.')}
              className="px-4 py-2 rounded-xl border border-on-surface/15 text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Ubah Sandi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}