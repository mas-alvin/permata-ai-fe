import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Search, 
  Sparkles, 
  Code2, 
  LayoutGrid, 
  Palette, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Check, 
  ArrowRight, 
  Wand2, 
  Terminal, 
  BookOpen, 
  Layers,
  Clock,
  FileCheck2
} from 'lucide-react';

const FEATURE_TEMPLATES = [
  // 💻 Koding & Developer
  {
    id: 'crud-architecture',
    category: 'coding',
    categoryLabel: 'Koding & Teknis',
    icon: Terminal,
    title: 'Arsitektur CRUD Lengkap',
    desc: 'Rancang kode CRUD modern dan clean architecture (frontend + API + database).',
    prompt: 'Bantu saya membuat aplikasi CRUD lengkap untuk entitas [Nama Entitas/Produk] menggunakan [React/Vue/Laravel/Node.js]. Sertakan struktur data, validasi, dan penanganan error.',
    tag: 'Populer'
  },
  {
    id: 'code-review',
    category: 'coding',
    categoryLabel: 'Koding & Teknis',
    icon: Code2,
    title: 'Code Review & Refactoring',
    desc: 'Analisis kelemahan kode, optimasi performa, dan tingkatkan keterbacaan.',
    prompt: 'Tolong lakukan review pada potongan kode berikut ini. Berikan saran refactoring untuk meningkatkan efisiensi algoritma, keterbacaan, dan keamanan:\n\n```\n[Tempel kode Anda di sini]\n```',
  },
  {
    id: 'sql-query-builder',
    category: 'coding',
    categoryLabel: 'Koding & Teknis',
    icon: Code2,
    title: 'SQL & Database Query Builder',
    desc: 'Rancang query SQL kompleks, relasi antartabel, dan index database.',
    prompt: 'Bantu saya menulis query SQL untuk kebutuhan berikut: [Jelaskan kebutuhan data atau relasi antar tabel]. Optimalkan agar query efisien saat menangani data besar.',
  },

  // 💡 Ide & Bisnis
  {
    id: 'swot-analysis',
    category: 'business',
    categoryLabel: 'Ide & Bisnis',
    icon: Briefcase,
    title: 'Analisis SWOT & Strategi',
    desc: 'Evaluasi kekuatan, kelemahan, peluang, dan ancaman bisnis Anda.',
    prompt: 'Bantu saya menyusun Analisis SWOT komprehensif untuk [Nama Produk/Usaha]. Jelaskan Strengths, Weaknesses, Opportunities, dan Threats serta 3 strategi prioritas untuk dijalankan.',
    tag: 'Strategi'
  },
  {
    id: 'startup-validation',
    category: 'business',
    categoryLabel: 'Ide & Bisnis',
    icon: LayoutGrid,
    title: 'Validasi Ide & Target Pasar',
    desc: 'Uji hipotesis masalah, profil persona pengguna, dan keunggulan kompetitif.',
    prompt: 'Saya punya ide proyek: [Jelaskan ide Anda]. Bantu saya menganalisis: 1. Masalah utama yang diselesaikan, 2. Siapa target pengguna ideal, 3. Value proposition unik dibanding kompetitor.',
  },
  {
    id: 'pitch-deck-outline',
    category: 'business',
    categoryLabel: 'Ide & Bisnis',
    icon: Briefcase,
    title: 'Struktur Slide Pitch Deck',
    desc: 'Rancang narasi 10 slide presentasi investor yang meyakinkan.',
    prompt: 'Bantu rancang alur 10 slide Pitch Deck profesional untuk startup di bidang [Bidang Industri]. Sertakan poin pesan inti untuk setiap slide mulai dari Problem, Solution, Market Size, hingga Traction.',
  },

  // ✍️ Konten & Penulisan
  {
    id: 'seo-article',
    category: 'writing',
    categoryLabel: 'Konten & Penulisan',
    icon: FileText,
    title: 'Artikel SEO-Friendly',
    desc: 'Buat draf artikel terstruktur dengan kata kunci dan meta deskripsi.',
    prompt: 'Tuliskan artikel berkualitas tinggi dan SEO-friendly dengan topik: "[Topik Artikel]". Targetkan pembaca [Target Audiens], sertakan subjudul (H2, H3), meta description, dan kesimpulan bernilai aksi.',
    tag: 'SEO'
  },
  {
    id: 'professional-email',
    category: 'writing',
    categoryLabel: 'Konten & Penulisan',
    icon: FileText,
    title: 'Email Negosiasi & Bisnis',
    desc: 'Tulis email diplomatis, persuasif, dan bernada profesional.',
    prompt: 'Tolong buatkan draf email formal dan profesional kepada [Pihak Penerima] mengenai [Tujuan Email, misal: permohonan kerjasama / penawaran harga]. Nada bicara sopan, jelas, dan tegas.',
  },
  {
    id: 'copywriting-landing',
    category: 'writing',
    categoryLabel: 'Konten & Penulisan',
    icon: Sparkles,
    title: 'Copywriting Landing Page',
    desc: 'Formula headline, benefit, social proof, dan Call-To-Action kuat.',
    prompt: 'Buatkan teks copywriting konversi tinggi untuk halaman landing page produk [Nama Produk/Layanan]. Gunakan formula Hook, Problem, Solution, Benefits, dan CTA yang persuasif.',
  },

  // 🎨 Kreatif & Visual
  {
    id: 'ui-ux-concept',
    category: 'creative',
    categoryLabel: 'Kreatif & Studio',
    icon: Palette,
    title: 'Konsep Desain UI/UX',
    desc: 'Panduan tata letak antarmuka, alur user flow, dan komponen kunci.',
    prompt: 'Bantu rancang konsep User Experience (UX) dan User Interface (UI) untuk fitur [Nama Fitur/Aplikasi]. Berikan rekomendasi tata letak (wireframe konseptual), alur navigasi, dan hierarki visual yang intuitif.',
    tag: 'Desain'
  },
  {
    id: 'creative-story',
    category: 'creative',
    categoryLabel: 'Kreatif & Studio',
    icon: Wand2,
    title: 'Narasi & Storytelling Visual',
    desc: 'Bangun narasi emosional dan tema cerita untuk kampanye kreatif.',
    prompt: 'Rancang konsep storytelling kreatif untuk memperkenalkan [Kisah/Brand/Kampanye]. Buatkan narasi pembuka yang menggugah emosi, konflik, dan resolusi yang berkesan.',
  },

  // 🎓 Riset & Edukasi
  {
    id: 'feynman-technique',
    category: 'education',
    categoryLabel: 'Riset & Edukasi',
    icon: GraduationCap,
    title: 'Jelaskan Konsep Rumit (Feynman)',
    desc: 'Pahami topik sulit dengan analogi sederhana yang mudah dicerna.',
    prompt: 'Jelaskan konsep [Nama Konsep/Teori, misal: Algoritma Kuantum / Mekanisme Hormon / Enkripsi RSA] menggunakan Teknik Feynman — bahasa sangat sederhana, analogi kehidupan sehari-hari, seolah menjelaskan ke anak usia 12 tahun.',
    tag: 'Edukasi'
  },
  {
    id: 'doc-action-points',
    category: 'education',
    categoryLabel: 'Riset & Edukasi',
    icon: FileCheck2,
    title: 'Rangkum Dokumen Menjadi Aksi',
    desc: 'Ekstrak poin keputusan dan daftar tugas tindakan dari materi panjang.',
    prompt: 'Tolong baca dan rangkum materi berikut ke dalam: 1. Ringkasan Eksekutif (maks 3 kalimat), 2. Poin Temuan Kunci, 3. Daftar Tindakan Nyata (Action Items):\n\n[Tempel isi materi di sini]',
  },
  {
    id: 'sprint-planner',
    category: 'education',
    categoryLabel: 'Riset & Edukasi',
    icon: Clock,
    title: 'Manajemen Waktu & Sprint Planner',
    desc: 'Jadwal kerja produktif harian dengan time-blocking terukur.',
    prompt: 'Bantu susun jadwal kerja terstruktur dan rencana sprint produktif harian untuk mencapai [Target Sasaran]. Alokasikan blok waktu fokus, waktu istirahat (metode Pomodoro), dan checkpoint evaluasi.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Semua Fitur', icon: Layers },
  { id: 'coding', label: 'Koding & Teknis', icon: Code2 },
  { id: 'business', label: 'Ide & Bisnis', icon: Briefcase },
  { id: 'writing', label: 'Konten & Penulisan', icon: FileText },
  { id: 'creative', label: 'Kreatif & Studio', icon: Palette },
  { id: 'education', label: 'Riset & Edukasi', icon: GraduationCap },
];

export default function MoreFeaturesModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedId, setAppliedId] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
      setSelectedCategory('all');
      setAppliedId(null);
    }
  }, [isOpen]);

  // Keyboard shortcut Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTemplates = FEATURE_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleApplyTemplate = (tpl) => {
    setAppliedId(tpl.id);
    setTimeout(() => {
      onClose();
      navigate('/chat/new', { 
        state: { 
          prefill: tpl.prompt, 
          mode: tpl.title,
          timestamp: Date.now() 
        } 
      });
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div 
        className="relative z-10 w-full max-w-4xl max-h-[88vh] bg-white dark:bg-[#161219] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-[#2a222c] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-features-title"
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-[#2a222c] flex items-center justify-between bg-slate-50/70 dark:bg-[#19151d]/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-[#d49b2c] flex items-center justify-center shadow-2xs border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="more-features-title" className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                Pusat Fitur &amp; Pustaka Template AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih mode kerja atau template siap pakai untuk mempercepat hasil prompt Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#251f2b] transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-100 dark:border-[#2a222c] space-y-3 bg-white dark:bg-[#161219]">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari template (misal: CRUD, SWOT, Artikel SEO, Riset)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 dark:bg-[#1d1722] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-transparent focus:border-amber-500/50 focus:bg-white dark:focus:bg-[#19151d] focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100/90 dark:bg-[#1f1922] text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#28212c]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Template Grid List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar bg-slate-50/50 dark:bg-[#120f14]/50">
          {filteredTemplates.length === 0 ? (
            <div className="py-14 text-center">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Tidak ada template yang cocok
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Coba gunakan kata kunci pencarian yang lain atau ubah kategori.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredTemplates.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = appliedId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    className={`p-4 rounded-sm border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-white dark:bg-[#19151d] border-slate-200/80 dark:border-[#2a222c] hover:border-amber-500/40 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      {/* Top Bar Card */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-[#d49b2c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            {tpl.categoryLabel}
                          </span>
                        </div>
                        {tpl.tag && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            {tpl.tag}
                          </span>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-[#d49b2c] transition-colors mb-1">
                        {tpl.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                        {tpl.desc}
                      </p>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#241d27] flex items-center justify-between text-xs font-medium text-amber-700 dark:text-[#d49b2c]">
                      <span>Gunakan template ini</span>
                      <div className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info Bar */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-[#2a222c] bg-white dark:bg-[#161219] flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>Menampilkan {filteredTemplates.length} dari {FEATURE_TEMPLATES.length} template siap pakai</span>
          <span className="hidden sm:inline">Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#201a24] text-[10px] font-mono border border-slate-200 dark:border-white/10">Esc</kbd> untuk menutup</span>
        </div>
      </div>
    </div>
  );
}

