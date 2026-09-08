import SidebarHeader from './SidebarHeader'
import NewChatAndSearch from './NewChatAndSearch'
import PinnedModels from './PinnedModels'
import SavedTopics from './SavedTopics'
import RecentChats from './RecentChats'
import WorkspaceFooter from './WorkspaceFooter'

export default function Sidebar() {
  return (
    <aside className="w-72 h-full bg-white/80 backdrop-blur-3xl border-r border-on-surface/10 flex flex-col shrink-0 justify-between shadow-sm z-20">
      {/* Top & Scrollable Nav Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-h-0">
        <SidebarHeader />
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
    </aside>
  )
}
