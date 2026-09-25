import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import logo from '../assets/permata.png';

const Input = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  required = false,
  minLength,
  rightElement,
  bottomElement,
}) => (
  <div className="space-y-2">
    <label className="block text-[13px] font-semibold text-gray-700">
      {label}
    </label>

    <div className="relative">
      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[19px] pointer-events-none">
        {icon}
      </span>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className={`w-full h-[46px] pl-11 ${rightElement ? 'pr-12' : 'pr-4'
          } rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:border-[#800020] focus:outline-none focus:ring-4 focus:ring-[#800020]/10 hover:border-gray-300`}
      />

      {rightElement}
    </div>

    {bottomElement}
  </div>
);

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focus, setFocus] = useState('designer');
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
        color: 'bg-gray-200',
        textColor: 'text-gray-400',
      };
    }

    if (score <= 1) {
      return {
        score,
        label: 'Lemah',
        color: 'bg-red-500',
        textColor: 'text-red-600',
      };
    }

    if (score === 2) {
      return {
        score,
        label: 'Sedang',
        color: 'bg-amber-500',
        textColor: 'text-amber-600',
      };
    }

    if (score === 3) {
      return {
        score,
        label: 'Baik',
        color: 'bg-emerald-400',
        textColor: 'text-emerald-600',
      };
    }

    return {
      score,
      label: 'Kuat',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
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
      setError('Password tidak cocok');
      return;
    }

    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (!agree) {
      setError(
        'Anda harus menyetujui Ketentuan Layanan dan Kebijakan Privasi'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.register(
        name,
        email,
        password,
        confirm
      );

      // Autentikasi memakai JWT httpOnly cookie — server yang memasang cookie.
      dispatch(
        setCredentials({
          user: res.data.user,
        })
      );

      navigate('/chat/new', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Pendaftaran gagal'
      );
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex bg-white text-gray-900 antialiased">
      <section className="hidden lg:flex lg:w-[48%] xl:w-[46%] relative overflow-hidden bg-[#111114] text-white">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-amber-500/20 blur-[110px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#800020]/40 blur-[110px]" />

        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(#ffffff10 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 w-full min-h-screen px-10 xl:px-12 py-9 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src={logo}
                  alt="Permata AI"
                  className="w-7 h-7 object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold tracking-tight">
                    Permata AI
                  </h2>

                  <span className="px-2 py-0.5 rounded-full bg-[#800020] text-rose-200 border border-rose-500/20 text-[10px] font-bold">
                    V2.5
                  </span>
                </div>

                <p className="text-[11px] text-gray-400">
                  Workspace & Studio AI Premium
                </p>
              </div>
            </div>

            <Link
              to="/"
              className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition"
            >
              <span>Kembali ke Beranda</span>
              <span className="material-symbols-outlined text-[16px]">
                open_in_new
              </span>
            </Link>
          </div>

          <div className="flex-1 flex items-center">
            <div className="max-w-[590px] py-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs font-semibold mb-7">
                <span className="material-symbols-outlined text-[16px]">
                  card_giftcard
                </span>
                <span>
                  Uji Coba Gratis 14 Hari • 80 Kredit Eksplorasi
                </span>
              </div>

              <h1 className="text-4xl xl:text-[52px] leading-[1.08] font-extrabold tracking-tight">
                Mulai berkarya
                <br />
                bersama{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-amber-500">
                  Permata AI
                </span>
              </h1>

              <p className="mt-6 max-w-[520px] text-gray-300 text-[15px] leading-7">
                Gabung dengan ribuan desainer, engineer, dan inovator produk
                yang membangun masa depan dengan kekuatan AI terpadu.
              </p>

              <div className="mt-8 space-y-3">
                <Feature
                  icon="bolt"
                  iconClass="bg-amber-500/15 text-amber-400 border-amber-500/20"
                  title="Model Penalaran Permata Pro v2.5"
                  description="Eksekusi logika kompleks, analisis dokumen, dan arsitektur desain dalam hitungan detik."
                />

                <Feature
                  icon="auto_awesome"
                  iconClass="bg-rose-500/15 text-rose-300 border-rose-500/20"
                  title="Canvas Workspace & Studio Interaktif"
                  description="Ruang kreatif multi-modal dengan integrasi langsung ke Figma, Canva, dan aset cloud Anda."
                />

                <Feature
                  icon="verified_user"
                  iconClass="bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                  title="Privasi Data & Kepemilikan Penuh"
                  description="Data tim Anda dienkripsi penuh dan tidak digunakan untuk melatih model publik tanpa izin."
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[15px]">
                shield
              </span>
              <span>
                Standar keamanan level perusahaan • Tanpa perlu kartu kredit
              </span>
            </div>

            <span>© 2025 Permata AI</span>
          </div>
        </div>
      </section>

      <section className="flex-1 min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_10%_20%,rgba(128,0,32,0.05),transparent_35%),radial-gradient(circle_at_90%_80%,rgba(230,149,0,0.07),transparent_35%),#ffffff]">
        <div className="min-h-screen w-full px-5 py-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-[560px] mx-auto min-h-[calc(100vh-48px)] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex lg:hidden items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={logo}
                    alt="Permata AI"
                    className="w-6 h-6 object-contain"
                  />
                </div>

                <span className="font-bold">
                  Permata AI
                </span>
              </div>

              <div className="ml-auto text-xs sm:text-sm text-gray-500">
                Sudah memiliki akun?{' '}
                <Link
                  to="/login"
                  className="font-bold text-[#800020] hover:text-[#5e0017]"
                >
                  Masuk di sini
                </Link>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-7">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-4">
                  <span className="material-symbols-outlined text-[15px]">
                    auto_awesome
                  </span>
                  Akun Gratis Selamanya
                </div>

                <h2 className="text-3xl sm:text-[34px] font-extrabold tracking-tight text-gray-900">
                  Buat Akun Permata AI
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Daftar dalam 1 menit dan dapatkan bonus 80 kredit pertama Anda.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  className="h-12 flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                    />
                  </svg>

                  Google
                </button>

                <button
                  type="button"
                  className="h-12 flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <svg
                    className="w-5 h-5 text-black"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.32 2.99-2.54 4.09l.01-.01zM12.03 7.25C11.88 5.02 13.69 3.18 15.82 3c.3 2.58-2.32 4.5-3.79 4.25z" />
                  </svg>

                  <span>Apple ID</span>
                </button>
              </div>

              <div className="relative flex items-center mb-6">
                <div className="w-full border-t border-gray-200" />

                <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-4 text-[10px] uppercase tracking-wider text-gray-400">
                  atau daftar dengan email
                </span>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Nama Lengkap"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Pratama"
                  icon="person"
                  required
                />

                <Input
                  label="Alamat Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@studio.com"
                  icon="mail"
                  required
                />

                <Input
                  label="Kata Sandi"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  icon="lock"
                  required
                  minLength={8}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-[19px]">
                        {showPassword
                          ? 'visibility_off'
                          : 'visibility'}
                      </span>
                    </button>
                  }
                  bottomElement={
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${i < passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-gray-200'
                            }`}
                        />
                      ))}

                      {passwordStrength.label && (
                        <span
                          className={`text-[11px] font-semibold ml-1 ${passwordStrength.textColor}`}
                        >
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                  }
                />

                <Input
                  label="Konfirmasi Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ulangi password"
                  icon="lock_reset"
                  required
                  bottomElement={
                    confirm ? (
                      <p
                        className={`text-[11px] ${password === confirm
                            ? 'text-emerald-600'
                            : 'text-red-500'
                          }`}
                      >
                        {password === confirm
                          ? '✓ Password cocok'
                          : 'Password belum cocok'}
                      </p>
                    ) : null
                  }
                />

                <div className="space-y-2">
                  <label className="block text-[13px] font-semibold text-gray-700">
                    Fokus Utama Anda
                  </label>

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[19px] pointer-events-none">
                      explore
                    </span>

                    <select
                      value={focus}
                      onChange={(e) => setFocus(e.target.value)}
                      className="w-full h-[46px] pl-11 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm appearance-none cursor-pointer focus:outline-none focus:border-[#800020] focus:ring-4 focus:ring-[#800020]/10"
                    >
                      <option value="designer">
                        Desain & Creative Studio
                      </option>
                      <option value="developer">
                        Engineering & Software AI
                      </option>
                      <option value="product">
                        Product Management & Research
                      </option>
                      <option value="student">
                        Edukasi & Riset Akademis
                      </option>
                    </select>

                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-[#800020]"
                  />

                  <span className="text-xs leading-5 text-gray-500">
                    Saya menyetujui{' '}
                    <a
                      href="#"
                      className="font-semibold text-[#800020] hover:underline"
                    >
                      Ketentuan Layanan
                    </a>{' '}
                    dan{' '}
                    <a
                      href="#"
                      className="font-semibold text-[#800020] hover:underline"
                    >
                      Kebijakan Privasi
                    </a>{' '}
                    Permata AI.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#800020] to-[#5e0017] text-white text-sm font-bold shadow-lg shadow-[#800020]/20 hover:from-[#72001d] hover:to-[#4e0013] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Daftar Akun Gratis
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 pt-5 border-t border-gray-100 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-500 text-[14px]">
                    check
                  </span>
                  Tanpa Kartu Kredit
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-500 text-[14px]">
                    check
                  </span>
                  Batalkan Kapan Saja
                </span>
              </div>
            </div>

            <footer className="pt-8 pb-2 text-center">
              <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400">
                <a href="#" className="hover:text-gray-600">
                  Kebijakan Privasi
                </a>

                <span>•</span>

                <a href="#" className="hover:text-gray-600">
                  Ketentuan Layanan
                </a>

                <span>•</span>

                <a href="#" className="hover:text-gray-600">
                  Bantuan
                </a>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  iconClass,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.045] hover:bg-white/[0.07] transition">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${iconClass}`}
      >
        <span className="material-symbols-outlined text-[19px]">
          {icon}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-bold text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}