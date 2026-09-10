import SidebarHeader from './SidebarHeader'
import NewChatAndSearch from './NewChatAndSearch'
import PinnedModels from './PinnedModels'
import SavedTopics from './SavedTopics'
import RecentChats from './RecentChats'
import WorkspaceFooter from './WorkspaceFooter'

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
        <div className="w-72 h-full bg-white/80 backdrop-blur-3xl border-r border-on-surface/10 flex flex-col shrink-0 justify-between shadow-sm">
          {/* Top & Scrollable Nav Area */}
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <SidebarHeader onToggle={onToggle} />
            <NewChatAndSearch />

            {/* Scrollable Items Area */}
            <div className="flex-1 overflow-y-auto px-3.5 py-2 custom-scrollbar space-y-5">
              <PinnedModels />
              <SavedTopics />
              <RecentChats />
            </div>
          </div>

          {/* Bottom Docked Workspace Profile & Credits */}
          <WorkspaceFooter />
        </div>
      </aside>
    </>
  )
}
