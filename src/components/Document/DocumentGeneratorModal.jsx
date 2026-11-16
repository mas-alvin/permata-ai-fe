import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FileText, 
  FileDown, 
  Sparkles, 
  FileType, 
  Briefcase, 
  FileCheck2, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

const DOCUMENT_TYPES = [
  {
    id: 'laporan-bisnis',
    label: 'Laporan Resmi / Bisnis',
    icon: Briefcase,
    desc: 'Latar belakang eksekutif, analisis komparatif data, dan rekomendasi strategis.',
    defaultTitle: 'Laporan Analisis Kinerja & Strategi Bisnis',
    placeholder: 'Contoh: Analisis kinerja operasional Q3, evaluasi efisiensi biaya tim tech, dan rencana mitigasi risiko menghadapi target tahun depan.',
  },
  {
    id: 'proposal-proyek',
    label: 'Proposal Proyek & Kerjasama',
    icon: FileSpreadsheet,
    desc: 'Tujuan proyek, ruang lingkup kerja (scope of work), linimasa milestone, dan estimasi anggaran.',
    defaultTitle: 'Proposal Pengembangan Solusi Berbasis AI',
    placeholder: 'Contoh: Usulan pengembangan sistem otomasi verifikasi data klien dengan timeline implementasi 3 bulan dan rincian alokasi sumber daya.',
  },
  {
    id: 'sop-panduan',
    label: 'SOP & Panduan Teknis',
    icon: FileCheck2,
    desc: 'Langkah demi langkah prosedur operasional standar, PIC penanggung jawab, dan metrik keberhasilan.',
    defaultTitle: 'Standar Operasional Prosedur (SOP) Penanganan Insiden',
    placeholder: 'Contoh: Prosedur respon insiden keamanan siber level 1 hingga level 3, eskalasi tiket, dan pelaporan post-mortem.',
  },
  {
    id: 'surat-perjanjian',
    label: 'Surat Resmi / Perjanjian',
    icon: ShieldCheck,
    desc: 'Format korespondensi formal, pasal-pasal hak & kewajiban, serta ketentuan penutup.',
    defaultTitle: 'Perjanjian Kerahasiaan Informasi (Non-Disclosure Agreement)',
    placeholder: 'Contoh: Draf perjanjian NDA antara PT Permata Prima dengan pihak vendor konsultan terkait perlindungan data privasi sistem.',
  },
  {
    id: 'makalah-artikel',
    label: 'Makalah / Laporan Akademik',
    icon: BookOpen,
    desc: 'Abstrak, tinjauan pustaka, metodologi analisis, pembahasan mendalam, dan daftar referensi.',
    defaultTitle: 'Kajian Penerapan Large Language Model pada Sektor Finansial',
    placeholder: 'Contoh: Analisis komparatif akurasi model AI open-source vs proprietary dalam ekstraksi laporan keuangan perbankan.',
  },
  {
    id: 'resume-profil',
    label: 'Resume & Profil Profesional',
    icon: Award,
    desc: 'Ringkasan eksekutif karir, keahlian utama, rekam jejak pencapaian, dan portofolio proyek.',
    defaultTitle: 'Executive Curriculum Vitae & Professional Summary',
    placeholder: 'Contoh: Profil Senior Full-stack Developer dengan 6 tahun pengalaman di ekosistem React, Node.js, dan arsitektur AI agentik.',
  },
];

export default function DocumentGeneratorModal({ isOpen, onClose, onGenerate }) {
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0]);
  const [title, setTitle] = useState(DOCUMENT_TYPES[0].defaultTitle);
  const [details, setDetails] = useState('');
  const [targetFormat, setTargetFormat] = useState('pdf'); // 'pdf' | 'word'
  const modalRef = useRef(null);
  const inputTitleRef = useRef(null);

  // Ganti title otomatis saat ganti tipe dokumen bila belum diubah user
  const handleSelectType = (type) => {
    setSelectedType(type);
    if (!title || DOCUMENT_TYPES.some((t) => t.defaultTitle === title)) {
      setTitle(type.defaultTitle);
    }
  };

  // Keyboard shortcut Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => inputTitleRef.current?.focus(), 100);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTitle = title.trim() || selectedType.defaultTitle;
    const finalDetails = details.trim();

    const structuredPrompt = `Tolong buatkan dokumen formal yang lengkap, mendalam, dan terstruktur rapi dengan spesifikasi berikut:

- **Jenis Dokumen**: ${selectedType.label}
- **Judul Dokumen**: ${finalTitle}
- **Format Fisik Akhir**: ${targetFormat.toUpperCase()} (akan dibungkus menjadi file ${targetFormat === 'pdf' ? '.pdf' : '.docx'} resmi)
${finalDetails ? `- **Arahan & Detail Khusus**:\n${finalDetails}` : ''}

**Instruksi Format Konten:**
1. Gunakan hierarki Markdown yang rapi (Heading 1 (#) untuk Judul Utama, Heading 2 (##) untuk Bab/Bagian, Heading 3 (###) untuk Sub-bagian).
2. Awali dengan Ringkasan Eksekutif (Executive Summary).
3. Gunakan tabel Markdown jika menyajikan matriks perbandingan, jadwal, atau anggaran biaya.
4. Gunakan poin-poin terstruktur untuk langkah aksi atau rekomendasi.
5. Akhiri dengan Kesimpulan dan Penutup Resmi.
Tuliskan isi dokumen secara lengkap tanpa placeholder singkat.`;

    onGenerate({
      prompt: structuredPrompt,
      title: finalTitle,
      mode: `Dokumen: ${selectedType.label}`,
      targetFormat,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Generator Dokumen Cerdas"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-[#161219] rounded-2xl border border-slate-200/90 dark:border-[#2a222c] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-all transform scale-100 animate-in zoom-in-95 duration-200"
      >
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-[#2a222c] flex items-center justify-between bg-gradient-to-r from-amber-500/5 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Generator Dokumen AI</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                  PDF &amp; Word
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI merangkai konten mendalam, Laravel membungkusnya menjadi dokumen fisik siap unduh.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#201a24] transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* 1. Pilih Jenis Dokumen */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
              Pilih Jenis Dokumen
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DOCUMENT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType.id === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleSelectType(type)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-xs'
                        : 'bg-slate-50/50 dark:bg-[#1a151d] border-slate-200/80 dark:border-[#2a222c] hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <span
                      className={`font-semibold text-xs leading-snug line-clamp-1 ${
                        isSelected
                          ? 'text-amber-900 dark:text-amber-200'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {type.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                      {type.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Judul Dokumen */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              Judul Dokumen
            </label>
            <input
              ref={inputTitleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul dokumen resmi..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1a151d] border border-slate-200 dark:border-[#2a222c] text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              required
            />
          </div>

          {/* 3. Detail & Konteks Dokumen */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              Arahan / Isi yang Diinginkan
            </label>
            <textarea
              rows="3"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={selectedType.placeholder}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1a151d] border border-slate-200 dark:border-[#2a222c] text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none leading-relaxed"
            />
          </div>

          {/* 4. Format Dokumen Fisik */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              Format Dokumen Target
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  targetFormat === 'pdf'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-[#1a151d] border-slate-200/80 dark:border-[#2a222c]'
                }`}
              >
                <input
                  type="radio"
                  name="targetFormat"
                  value="pdf"
                  checked={targetFormat === 'pdf'}
                  onChange={() => setTargetFormat('pdf')}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Dokumen PDF (.pdf)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Format cetak baku, rapi &amp; siap dipresentasikan
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  targetFormat === 'word'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-[#1a151d] border-slate-200/80 dark:border-[#2a222c]'
                }`}
              >
                <input
                  type="radio"
                  name="targetFormat"
                  value="word"
                  checked={targetFormat === 'word'}
                  onChange={() => setTargetFormat('word')}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                  DOCX
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Microsoft Word (.docx)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Dapat diedit kembali di MS Word / Google Docs
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#201a24] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-xs shadow-md hover:from-amber-700 hover:to-amber-800 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Rangkai Dokumen dengan AI</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

