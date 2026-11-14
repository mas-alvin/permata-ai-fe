import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import permataIcon from '../../assets/permata-icon.png';
import permataIconDark from '../../assets/permata-icon-dark.png';
import { 
  Sparkles, 
  Search, 
  PanelLeftClose, 
  PanelLeft,
  PenTool, 
  LayoutGrid, 
  Palette, 
  Code2, 
  FileCheck2, 
  Clock, 
  MoreHorizontal,
  MessageSquare
} from 'lucide-react';
import SavedTopics from './SavedTopics';
import RecentChats from './RecentChats';
import PinnedChats from './PinnedChats';
import WorkspaceFooter from './WorkspaceFooter';
import RequireAuth from './RequireAuth';
import GuestNotice from './GuestNotice';
import SearchModal from '../Search/SearchModal';

export default function Sidebar({ isOpen, onToggle, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const isNewChat = location.pathname === '/chat/new' || location.pathname === '/chat' || location.pathname === '/';

  const quickNavItems = [
    { label: 'Eksplorasi Ide', icon: LayoutGrid, prompt: 'Bantu rancang ide eksplorasi inovatif untuk proyek digital' },
    { label: 'Studio Kreatif', icon: Palette, prompt: 'Buat konsep ilustrasi visual kreatif dan modern' },
    { label: 'Asisten Koding', icon: Code2, prompt: 'Bantu review kode dan berikan solusi optimasi' },
    { label: 'Rangkuman Dokumen', icon: FileCheck2, prompt: 'Rangkum dokumen panjang ini menjadi 5 poin aksi utama' },
    { label: 'Aktivitas Terjadwal', icon: Clock, prompt: 'Buat jadwal sprint harian dan manajemen waktu produktif' },
  ];

  const handleQuickNav = (prompt) => {
    navigate('/chat/new', { state: { prefill: prompt } });
    if (window.innerWidth < 640) onClose();
  };

  // Shortcut global: Cmd+K / Ctrl+K atau Cmd+F / Ctrl+F untuk membuka modal pencarian
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'f')) {
        const isEditing = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isEditing || e.key === 'k') {
          e.preventDefault();
          setIsSearchModalOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <>
      {/* Backdrop overlay di mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Modal Pencarian di Tengah Layar */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed sm:static inset-y-0 left-0 z-40 sm:z-20 flex h-full transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] p-2 sm:p-0 shrink-0 select-none ${
          isOpen
            ? 'w-[275px] translate-x-0'
            : 'w-[275px] -translate-x-full sm:translate-x-0 sm:w-[68px]'
        }`}
      >
        <div
          className="bg-white/95 dark:bg-[#141116]/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-[#2a222c] shadow-soft flex flex-col justify-between shrink-0 h-full w-full relative overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
        >
          {/* ==============================================================
             EXPANDED SIDEBAR VIEW (Ketika sidebar terbuka penuh)
             ============================================================== */}
          <div 
            className={`absolute inset-0 p-3.5 flex flex-col justify-between w-[275px] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
              isOpen 
                ? 'opacity-100 translate-x-0 pointer-events-auto delay-75' 
                : 'opacity-0 -translate-x-4 pointer-events-none duration-150'
            }`}
          >
            {/* Top & Scrollable Content Section */}
            <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pr-0.5 flex-1 min-h-0">
              
              {/* Header Sidebar: Logo Permata AI + Search & Collapse button */}
              <div className="flex items-center justify-between px-1 pt-0.5 shrink-0">
                <div 
                  onClick={() => { navigate('/chat/new'); if (window.innerWidth < 640) onClose(); }} 
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center p-1 shadow-2xs group-hover:scale-105 transition-transform">
                    <img 
                      src={permataIcon} 
                      alt="Permata AI" 
                      className="w-full h-full object-contain dark:hidden" 
                    />
                    <img 
                      src={permataIconDark} 
                      alt="Permata AI" 
                      className="w-full h-full object-contain hidden dark:block" 
                    />
                  </div>
                  <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">Permata AI</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Tombol Pencarian: membuka Search Modal di tengah layar */}
                  <button 
                    type="button"
                    onClick={() => setIsSearchModalOpen(true)} 
                    className="p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-[#1f1922] transition-colors cursor-pointer" 
                    title="Cari Obrolan (⌘K)"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={onToggle} 
                    className="w-8 h-8 rounded-full bg-slate-100/90 dark:bg-[#1f1922] hover:bg-slate-200/80 dark:hover:bg-[#29222e] hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer" 
                    title="Tutup Sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Menu Percakapan Baru */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button 
                  type="button"
                  onClick={() => { navigate('/chat/new'); if (window.innerWidth < 640) onClose(); }} 
                  className={`w-full py-2 px-2.5 rounded-sm font-medium text-xs flex items-center gap-2.5 transition-colors text-left group cursor-pointer ${
                    isNewChat
                      ? 'bg-slate-500/10 dark:bg-slate-500/15 text-slate-900 dark:text-slate-100 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-500/10 dark:hover:bg-slate-500/10 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <PenTool className={`w-4 h-4 shrink-0 transition-colors ${
                    isNewChat
                      ? 'text-amber-700 dark:text-[#d49b2c]'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-amber-700 dark:group-hover:text-[#c58a27]'
                  }`} />
                  <span>Percakapan baru</span>
                </button>
              </div>

              {/* Menu Navigasi Vertikal */}
              <div className="flex flex-col gap-0.5 shrink-0">
                {quickNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button 
                      key={item.label}
                      type="button"
                      onClick={() => handleQuickNav(item.prompt)} 
                      className="w-full py-2 px-2.5 rounded-sm hover:bg-slate-500/10 dark:hover:bg-slate-500/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-xs flex items-center gap-2.5 transition-colors text-left group cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-amber-700 dark:group-hover:text-[#c58a27] shrink-0 transition-colors" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <button 
                  type="button"
                  onClick={() => alert('Menu lainnya segera hadir')} 
                  className="w-full py-2 px-2.5 rounded-sm hover:bg-slate-500/10 dark:hover:bg-slate-500/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-xs flex items-center gap-2.5 transition-colors text-left group cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-amber-700 dark:group-hover:text-[#c58a27] shrink-0 transition-colors" />
                  <span>Selengkapnya</span>
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-200/70 dark:bg-[#2a222c] my-0.5 shrink-0" />

              {/* Scrollable Chat Lists */}
              <div className="flex-1 space-y-3">
                <RequireAuth fallback={<GuestNotice />}>
                  <PinnedChats searchQuery="" />
                  <SavedTopics searchQuery="" />
                  <RecentChats searchQuery="" />
                </RequireAuth>
              </div>

            </div>

            {/* Bottom Section (User Profile Card) */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#2a222c] shrink-0">
              <WorkspaceFooter collapsed={false} />
            </div>

          </div>

          {/* ==============================================================
             COLLAPSED ICON RAIL VIEW (Tersisa ikon di sebelah kiri ala Gemini / GPT)
             ============================================================== */}
          <div 
            className={`absolute inset-0 py-3 px-2 flex flex-col justify-between items-center w-[68px] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
              !isOpen 
                ? 'opacity-100 scale-100 pointer-events-auto delay-75' 
                : 'opacity-0 scale-95 pointer-events-none duration-150'
            }`}
          >
            {/* Top Icons Area */}
            <div className="flex flex-col items-center gap-2 w-full shrink-0">
              
              {/* 1. Toggle / Expand Button (Logo Permata yang saat di-hover bertransformasi jadi icon expand) */}
              <div className="relative group/expand flex justify-center w-full">
                <button
                  type="button"
                  onClick={onToggle}
                  className="w-10 h-10 rounded-sm flex items-center justify-center transition-all cursor-pointer relative overflow-hidden group shadow-2xs hover:bg-slate-500/10 dark:hover:bg-slate-500/10"
                  aria-label="Buka menu sidebar"
                >
                  {/* Tampilan awal: Logo Permata AI */}
                  <div className="w-9 h-9 flex items-center justify-center transition-all duration-200 group-hover:scale-0 group-hover:opacity-0 p-0.5">
                    <img src={permataIcon} alt="Permata AI" className="w-full h-full object-contain dark:hidden" />
                    <img src={permataIconDark} alt="Permata AI" className="w-full h-full object-contain hidden dark:block" />
                  </div>

                  {/* Tampilan saat di-hover: Icon expand (PanelLeft) */}
                  <div className="absolute inset-0 flex items-center justify-center scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 text-amber-700 dark:text-[#d49b2c]">
                    <PanelLeft className="w-5 h-5" />
                  </div>
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/90 dark:bg-[#1c1720] text-white text-[11px] font-medium rounded-sm shadow-xl pointer-events-none whitespace-nowrap opacity-0 group-hover/expand:opacity-100 transition-opacity z-50">
                  Buka sidebar
                </div>
              </div>

              {/* 2. New Chat Button */}
              <div className="relative group/tip flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => { navigate('/chat/new'); if (window.innerWidth < 640) onClose(); }}
                  className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all cursor-pointer group ${
                    isNewChat
                      ? 'bg-slate-500/10 dark:bg-slate-500/15 text-amber-700 dark:text-[#d49b2c]'
                      : 'hover:bg-slate-500/10 dark:hover:bg-slate-500/10 text-amber-700 dark:text-amber-400'
                  }`}
                  aria-label="Percakapan baru"
                >
                  <PenTool className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/90 dark:bg-[#1c1720] text-white text-[11px] font-medium rounded-sm shadow-xl pointer-events-none whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
                  Percakapan baru
                </div>
              </div>

              {/* 3. Search Button (Membuka Search Modal di tengah layar) */}
              <div className="relative group/tip flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="w-10 h-10 rounded-sm hover:bg-slate-500/10 dark:hover:bg-slate-500/10 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer group"
                  aria-label="Cari obrolan"
                >
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/90 dark:bg-[#1c1720] text-white text-[11px] font-medium rounded-sm shadow-xl pointer-events-none whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
                  Cari obrolan (⌘K)
                </div>
              </div>

              {/* Divider */}
              <div className="w-8 h-px bg-slate-200/80 dark:bg-[#2a222c] my-0.5" />
            </div>

            {/* Middle Quick Navigation Icons */}
            <div className="flex flex-col items-center gap-1.5 overflow-y-auto no-scrollbar flex-1 w-full py-1">
              {quickNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="relative group/tip flex justify-center w-full">
                    <button
                      type="button"
                      onClick={() => handleQuickNav(item.prompt)}
                      className="w-10 h-10 rounded-sm hover:bg-slate-500/10 dark:hover:bg-slate-500/10 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer group"
                      aria-label={item.label}
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/90 dark:bg-[#1c1720] text-white text-[11px] font-medium rounded-sm shadow-xl pointer-events-none whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
                      {item.label}
                    </div>
                  </div>
                );
              })}

              {/* Recent Chats Button to Expand and View History */}
              <div className="relative group/tip flex justify-center w-full mt-1">
                <button
                  type="button"
                  onClick={onToggle}
                  className="w-10 h-10 rounded-sm hover:bg-slate-500/10 dark:hover:bg-slate-500/10 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer group"
                  aria-label="Riwayat Chat"
                >
                  <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/90 dark:bg-[#1c1720] text-white text-[11px] font-medium rounded-sm shadow-xl pointer-events-none whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
                  Riwayat Chat
                </div>
              </div>
            </div>

            {/* Bottom Section (User Profile Avatar / Menu) */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#2a222c] w-full flex justify-center shrink-0">
              <WorkspaceFooter collapsed={true} />
            </div>

          </div>
        </div>
      </aside>
    </>
  );
}
