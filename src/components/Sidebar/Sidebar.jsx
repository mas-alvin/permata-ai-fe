import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import permataIcon from '../../assets/permata-icon.png';
import permataIconDark from '../../assets/permata-icon-dark.png';
import { 
  Sparkles, 
  Search, 
  PanelLeftClose, 
  PenTool, 
  LayoutGrid, 
  Palette, 
  Code2, 
  FileCheck2, 
  Clock, 
  MoreHorizontal,
  X 
} from 'lucide-react';
import SavedTopics from './SavedTopics';
import RecentChats from './RecentChats';
import PinnedChats from './PinnedChats';
import WorkspaceFooter from './WorkspaceFooter';
import RequireAuth from './RequireAuth';
import GuestNotice from './GuestNotice';

export default function Sidebar({ isOpen, onToggle, onClose }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const quickNavItems = [
    { label: 'Eksplorasi Ide', icon: LayoutGrid, prompt: 'Bantu rancang ide eksplorasi inovatif untuk proyek digital' },
    { label: 'Studio Kreatif', icon: Palette, prompt: 'Buat konsep ilustrasi visual kreatif dan modern' },
    { label: 'Asisten Koding', icon: Code2, prompt: 'Bantu review kode dan berikan solusi optimasi' },
    { label: 'Rangkuman Dokumen', icon: FileCheck2, prompt: 'Rangkum dokumen panjang ini menjadi 5 poin aksi utama' },
    { label: 'Aktivitas Terjadwal', icon: Clock, prompt: 'Buat jadwal sprint harian dan manajemen waktu produktif' },
  ];

  const handleQuickNav = (prompt) => {
    navigate('/chat/new', { state: { prefill: prompt } });
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Backdrop overlay di mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex h-full transition-all duration-300 ease-in-out p-2 lg:p-0 shrink-0 ${
          isOpen
            ? 'w-[275px] translate-x-0'
            : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden p-0'
        }`}
      >
        <div className="w-[275px] bg-white/95 dark:bg-[#141116]/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-[#2a222c] shadow-soft flex flex-col justify-between p-3.5 shrink-0 overflow-hidden h-full">
          {/* Inner container */}
          <div className="w-full flex flex-col justify-between h-full overflow-hidden">
            
            {/* Top & Scrollable Content Section */}
            <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pr-0.5 flex-1 min-h-0">
              
              {/* Header Sidebar: Logo Permata AI + Search & Collapse button */}
              <div className="flex items-center justify-between px-1 pt-0.5 shrink-0">
                <div 
                  onClick={() => { navigate('/chat/new'); if (window.innerWidth < 1024) onClose(); }} 
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-white/5 border border-amber-200/60 dark:border-white/10 flex items-center justify-center p-1 shadow-2xs group-hover:scale-105 transition-transform">
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
                  <button 
                    onClick={() => {
                      document.getElementById('sidebarSearchInput')?.focus();
                    }} 
                    className="p-1.5 rounded-full text-slate-500 hover:text-amber-700 dark:hover:text-[#c58a27] hover:bg-slate-100 dark:hover:bg-[#1f1922] transition-colors" 
                    title="Cari Chat (⌘F)"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={onToggle} 
                    className="w-8 h-8 rounded-full bg-slate-100/90 dark:bg-[#1f1922] hover:bg-slate-200/80 dark:hover:bg-[#29222e] hover:text-amber-700 dark:hover:text-[#c58a27] text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all active:scale-95" 
                    title="Tutup Sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Menu Percakapan Baru & Cari Obrolan (Disamakan seperti Eksplorasi Ide / Studio Kreatif) */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button 
                  onClick={() => { navigate('/chat/new'); if (window.innerWidth < 1024) onClose(); }} 
                  className="w-full py-2 px-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-[#1f1922] text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-[#d49b2c] font-medium text-xs flex items-center gap-3 transition-colors text-left group"
                >
                  <PenTool className="w-4 h-4 text-slate-500 group-hover:text-amber-700 dark:group-hover:text-[#c58a27] shrink-0" />
                  <span>Percakapan baru</span>
                </button>

                <div className="w-full py-2 px-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-[#1f1922] text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-3 transition-colors group">
                  <Search className="w-4 h-4 text-slate-500 group-hover:text-amber-700 dark:group-hover:text-[#c58a27] shrink-0" />
                  <input 
                    id="sidebarSearchInput"
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari obrolan..." 
                    className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none"
                  />
                  {searchQuery ? (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400/80 shrink-0">⌘ F</span>
                  )}
                </div>
              </div>

              {/* Menu Navigasi Vertikal Gemini */}
              <div className="flex flex-col gap-0.5 shrink-0">
                {quickNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button 
                      key={item.label}
                      onClick={() => handleQuickNav(item.prompt)} 
                      className="w-full py-2 px-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-[#1f1922] text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-[#d49b2c] font-medium text-xs flex items-center gap-3 transition-colors text-left group"
                    >
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-700 dark:group-hover:text-[#c58a27]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <button 
                  onClick={() => alert('Menu lainnya segera hadir')} 
                  className="w-full py-2 px-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-[#1f1922] text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-[#d49b2c] font-medium text-xs flex items-center gap-3 transition-colors text-left group"
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-500 group-hover:text-amber-700 dark:group-hover:text-[#c58a27]" />
                  <span>Selengkapnya</span>
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-200/70 dark:bg-[#2a222c] my-0.5 shrink-0" />

              {/* Scrollable Chat Lists */}
              <div className="flex-1 space-y-3">
                <RequireAuth fallback={<GuestNotice />}>
                  <PinnedChats searchQuery={searchQuery} />
                  <SavedTopics searchQuery={searchQuery} />
                  <RecentChats searchQuery={searchQuery} />
                </RequireAuth>
              </div>

            </div>

            {/* Bottom Section (User Profile Card) */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#2a222c] shrink-0">
              <WorkspaceFooter />
            </div>

          </div>
        </div>
      </aside>
    </>
  );
}
