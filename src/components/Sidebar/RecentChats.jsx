const recentChats = [
  { title: 'Give me unique name logo for...', edited: 'Edited 2m ago' },
  { title: 'Create a logo for a tech startup', edited: 'Edited 5m ago' },
  { title: 'Design a logo for a sustainable...', edited: 'Edited Oct 3, 1:44 PM' },
]

export default function RecentChats() {
  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold text-on-surface-variant/80 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">history</span>
          <span>Recent Chats</span>
        </div>
        <button className="text-on-surface-variant/60 hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[15px]">more_vert</span>
        </button>
      </div>
      <div className="space-y-0.5">
        {/* Active Chat Item */}
        <div className="p-2 rounded-xl bg-surface-container-low/70 border border-primary/10 cursor-pointer flex items-center gap-2 group transition-all">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
          <div className="overflow-hidden pr-2 flex-1">
            <p className="font-medium text-on-surface text-xs truncate font-semibold">New Chat</p>
            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">Active • 1m ago</p>
          </div>
          <span className="material-symbols-outlined text-primary text-[15px] shrink-0">check</span>
        </div>

        {recentChats.map((chat) => (
          <div
            key={chat.title}
            className="p-2 rounded-xl hover:bg-surface-container-low cursor-pointer flex items-center gap-2 group transition-all"
          >
            <div className="overflow-hidden pr-2 flex-1">
              <p className="font-medium text-on-surface text-xs truncate group-hover:text-primary transition-colors">
                {chat.title}
              </p>
              <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{chat.edited}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}