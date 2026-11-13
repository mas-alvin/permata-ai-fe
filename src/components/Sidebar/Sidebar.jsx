import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import permataIcon from '../../assets/permata-icon.png';
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
  MoreHorizontal 
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
        <div className="w-[275px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col justify-between p-3.5 shrink-0 overflow-hidden h-full">
          {/* Inner container */}
          <div className="w-full flex flex-col justify-between h-full overflow-hidden">
            
            {/* Top & Scrollable Content Section */}
            <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pr-0.5 flex-1 min-h-0">
              
              {/* Header Sidebar: Logo Permata AI + Search & Collapse button */}
              <div className="flex items-center justify-between px-1 pt-0.5 shrink-0">
                <div 
                  onClick={() => { navigate('/chat/new'); if (window.innerWidth < 1024) onClose(); }} 
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <img 
                    src={permataIcon} 
                    alt="Permata AI" 
                    className="w-7 h-7 object-contain transition-transform group-hover:scale-105" 
                  />
                  <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">Permata AI</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      document.getElementById('sidebarSearchInput')?.focus();
                    }} 
                    className="p-1.5 rounded-full text-slate-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
                    title="Cari Chat (⌘F)"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={onToggle} 
                    className="w-8 h-8 rounded-full bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200/80 hover:text-amber-700 dark:hover:text-amber-400 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all active:scale-95" 
                    title="Tutup Sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pill Tombol Utama: Percakapan Baru */}
              <div className="pt-0.5 shrink-0">
                <button 
                  onClick={() => { navigate('/chat/new'); if (window.innerWidth < 1024) onClose(); }} 
                  className="w-full py-2.5 px-3.5 rounded-full bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 hover:border-amber-500/40 font-medium text-xs flex items-center gap-3 transition-all active:scale-[0.98]"
                >
                  <PenTool className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Percakapan baru</span>
                </button>
              </div>

              {/* Search Chats Input */}
              <div className="relative mt-0.5 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  id="sidebarSearchInput"
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari obrolan..." 
                  className="w-full pl-8 pr-12 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500/60 transition-all"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/70 dark:border-slate-700">⌘ F</span>
              </div>

              {/* Menu Navigasi Vertikal Gemini */}
              <div className="flex flex-col gap-0.5 shrink-0">
                {quickNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button 
                      key={item.label}
                      onClick={() => handleQuickNav(item.prompt)} 
                      className="w-full py-2 px-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 font-medium text-xs flex items-center gap-3 transition-colors text-left group"
                    >
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-700 dark:group-hover:text-amber-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <button 
                  onClick={() => alert('Menu lainnya segera hadir')} 
                  className="w-full py-2 px-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 font-medium text-xs flex items-center gap-3 transition-colors text-left group"
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-500 group-hover:text-amber-700 dark:group-hover:text-amber-400" />
                  <span>Selengkapnya</span>
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-200/70 dark:bg-slate-800 my-0.5 shrink-0" />

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
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <WorkspaceFooter />
            </div>

          </div>
        </div>
      </aside>
    </>
  );
}
