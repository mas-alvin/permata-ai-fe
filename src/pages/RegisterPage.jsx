import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import logo from '../assets/permata.png';

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
      return { score, label: 'Lemah', color: 'bg-red-500', textColor: 'text-red-600' };
    }
    if (score === 2) {
      return { score, label: 'Sedang', color: 'bg-amber-500', textColor: 'text-amber-600' };
    }
    if (score === 3) {
      return { score, label: 'Baik', color: 'bg-emerald-400', textColor: 'text-emerald-600' };
    }
    return { score, label: 'Kuat', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Password tidak cocok');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }
    if (!agree) {
      setError('Anda harus menyetujui Ketentuan Layanan dan Kebijakan Privasi');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.register(name, email, password, confirm);
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      navigate('/chat/new', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Pendaftaran gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const Input = ({ label, type, value, onChange, placeholder, icon, children, required }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-700">{label}</label>
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-[19px] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all shadow-sm"
        />
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-gray-900 flex antialiased selection:bg-[#800020] selection:text-white">
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-[48%] relative bg-gradient-to-br from-[#121316] via-[#1a1417] to-[#241318] text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#e69500]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#800020]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#b45309] flex items-center justify-center shadow-lg shadow-orange-950/30 ring-1 ring-white/20 overflow-hidden">
              <img src={logo} alt="Permata AI" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight">Permata AI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#800020]/80 text-rose-200 border border-[#800020]">v2.5</span>
              </div>
              <p className="text-xs text-gray-400">Workspace & Studio AI Premium</p>
            </div>
          </div>
          <Link to="/" className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <span>Kembali ke Beranda</span>
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-xs font-medium text-amber-300 mb-6">
            <span className="material-symbols-outlined text-[14px]">card_giftcard</span>
            <span>Uji Coba Gratis 14 Hari • 80 Kredit Eksplorasi</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Mulai berkarya bersama <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-amber-500">Permata AI</span>
          </h1>
          <p className="text-gray-300 text-base leading-relaxed mb-8">Gabung dengan ribuan desainer, engineer, dan inovator produk yang membangun masa depan dengan kekuatan AI terpadu.</p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30"><span className="material-symbols-outlined text-[18px]">bolt</span></div>
              <div>
                <h4 className="text-sm font-bold text-white">Model Penalaran Permata Pro v2.5</h4>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">Eksekusi logika kompleks, analisis dokumen, dan arsitektur desain dalam hitungan detik.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 border border-rose-500/30"><span className="material-symbols-outlined text-[18px]">auto_awesome</span></div>
              <div>
                <h4 className="text-sm font-bold text-white">Canvas Workspace & Studio Interaktif</h4>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">Ruang kreatif multi-modal dengan integrasi langsung ke Figma, Canva, dan aset cloud Anda.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30"><span className="material-symbols-outlined text-[18px]">verified_user</span></div>
              <div>
                <h4 className="text-sm font-bold text-white">Privasi Data & Kepemilikan Penuh</h4>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">Data tim Anda dienkripsi penuh dan tidak digunakan untuk melatih model publik tanpa izin.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-6 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-amber-400 text-[14px]">shield</span><span>Standar keamanan level perusahaan • Tanpa perlu kartu kredit</span></div>
          <span>© 2025 Permata AI</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 min-h-screen overflow-y-auto" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(128, 0, 32, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(230, 149, 0, 0.06) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(243, 244, 246, 0.6) 0%, #ffffff 100%)' }}>
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#b45309] flex items-center justify-center shadow-md overflow-hidden"><img src={logo} alt="Permata AI" className="w-6 h-6 object-contain" /></div>
            <span className="font-bold text-gray-900 tracking-tight">Permata AI</span>
          </div>
          <div className="ml-auto text-xs sm:text-sm text-gray-600">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="font-semibold text-[#800020] hover:text-[#5e0017] transition-colors ml-1 inline-flex items-center gap-1">
              Masuk di sini <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-6">
          <div className="mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2.5 border border-amber-200">
              <span className="material-symbols-outlined text-[13px] text-amber-600">auto_awesome</span> Akun Gratis Selamanya
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Buat Akun Permata AI</h2>
            <p className="text-gray-500 text-sm mt-1">Daftar dalam 1 menit dan dapatkan bonus 80 kredit pertama Anda.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <button type="button" className="flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 shadow-sm transition-all hover:shadow hover:border-gray-300 active:scale-[0.99]">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"/><path fill="#FBBC05" d="M5.28 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/></svg>
              <span>Google</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 shadow-sm transition-all hover:shadow hover:border-gray-300 active:scale-[0.99]">
              <span className="material-symbols-outlined text-[20px] text-gray-900">apple</span><span>Apple ID</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-5"><div className="border-t border-gray-200 w-full" /><span className="absolute bg-white px-3 text-[11px] uppercase tracking-wider text-gray-400 font-medium">atau daftar dengan email</span></div>

          {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input label="Nama Lengkap" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex Pratama" icon="person" required />
            <Input label="Alamat Email Kerja" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@studio.com" icon="mail" required />
            
            <Input 
              label="Kata Sandi" 
              type={showPassword ? 'text' : 'password'} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Minimal 8 karakter" 
              icon="lock" 
              required 
              minLength={8}
              children={
                <>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    <span className="material-symbols-outlined text-[19px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                  <div className="mt-2 flex items-center gap-1.5">
                    {[0,1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200'}`} />)}
                    {passwordStrength.label && <span className={`text-[11px] font-medium ml-1 ${passwordStrength.textColor}`}>{passwordStrength.label}</span>}
                  </div>
                </>
              }
            />
            
            <Input 
              label="Konfirmasi Password" 
              type={showPassword ? 'text' : 'password'} 
              value={confirm} 
              onChange={e => setConfirm(e.target.value)} 
              placeholder="Ulangi password" 
              icon="lock_reset" 
              required
              children={
                confirm && <p className={`text-[11px] mt-1.5 ${password === confirm ? 'text-emerald-600' : 'text-red-500'}`}>{password === confirm ? 'Password cocok' : 'Password belum cocok'}</p>
              }
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fokus Utama Anda</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-[19px] pointer-events-none">explore</span>
                <select value={focus} onChange={e => setFocus(e.target.value)} className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all shadow-sm appearance-none cursor-pointer">
                  <option value="designer">Desain & Creative Studio</option>
                  <option value="developer">Engineering & Software AI</option>
                  <option value="product">Product Management & Research</option>
                  <option value="student">Edukasi & Riset Akademis</option>
                </select>
                <span className="material-symbols-outlined absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 text-[16px] pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-[#800020] shrink-0" />
                <span className="text-xs text-gray-600 leading-normal">Saya menyetujui <a href="#" className="text-[#800020] hover:underline font-medium">Ketentuan Layanan</a> dan <a href="#" className="text-[#800020] hover:underline font-medium">Kebijakan Privasi</a> Permata AI.</span>
              </label>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#800020] to-[#5e0017] hover:from-[#6d001b] hover:to-[#4e0013] text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-950/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</>) : (<><span>Daftar Akun Gratis</span><span className="material-symbols-outlined text-[16px]">arrow_forward</span></>)}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-emerald-500 text-[14px]">check</span>Tanpa Kartu Kredit</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-emerald-500 text-[14px]">check</span>Batalkan Kapan Saja</span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto text-center text-xs text-gray-400 flex items-center justify-center gap-4 pt-3 pb-2">
          <a href="#" className="hover:text-gray-600 transition-colors">Kebijakan Privasi</a><span>•</span><a href="#" className="hover:text-gray-600 transition-colors">Ketentuan Layanan</a><span>•</span><a href="#" className="hover:text-gray-600 transition-colors">Bantuan</a>
        </div>
      </div>
    </div>
  );
}