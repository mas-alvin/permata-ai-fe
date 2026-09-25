import SidebarHeader from './SidebarHeader'
import NewChatAndSearch from './NewChatAndSearch'
import PinnedModels from './PinnedModels'
import PinnedChats from './PinnedChats'
import SavedTopics from './SavedTopics'
import RecentChats from './RecentChats'
import WorkspaceFooter from './WorkspaceFooter'
import RequireAuth from './RequireAuth'
import GuestNotice from './GuestNotice'

export default function Sidebar({ isOpen, onToggle, onClose }) {
  return (
    <>
      {/* Backdrop overlay - hanya muncul di mobile saat sidebar terbuka */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      {/* Wrapper: drawer fixed+overlay di mobile, collapsible di desktop */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-30 h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-72 translate-x-0'
            : 'w-72 -translate-x-full md:w-0 md:translate-x-0 md:border-r-0'
        }`}
      >
        {/* Lebar tetap 72 di dalam agar konten tidak "gepeng" saat animasi collapse */}
        <div className="w-72 h-full bg-dark-sidebar backdrop-blur-3xl border-r border-on-surface/10 flex flex-col shrink-0 justify-between shadow-sm">
          {/* Top & Scrollable Nav Area */}
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <SidebarHeader onToggle={onToggle} />
            <NewChatAndSearch />

            {/* Scrollable Items Area */}
            {/* Section di bawah memakai endpoint login. Untuk tamu, sembunyikan
                dan ganti dengan catatan mode tamu (guest.md §4.3 poin 5) supaya
                tidak ada request 401 ke /models, /topics, /conversations. */}
            <div className="flex-1 overflow-y-auto px-3.5 py-2 custom-scrollbar space-y-5">
              <RequireAuth fallback={<GuestNotice />}>
                <PinnedModels />
                <PinnedChats />
                <SavedTopics />
                <RecentChats />
              </RequireAuth>
            </div>
          </div>

          {/* Bottom Docked Workspace Profile & Credits */}
          <WorkspaceFooter />
        </div>
      </aside>
    </>
  );
}
