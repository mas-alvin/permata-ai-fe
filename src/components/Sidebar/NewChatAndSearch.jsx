export default function NewChatAndSearch() {
  return (
    <div className="p-4 pb-2 space-y-3">
      <button className="w-full group relative overflow-hidden bg-gradient-to-r from-primary via-primary-container to-primary text-on-primary py-2.5 px-4 rounded-xl font-label-md flex items-center justify-between shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:opacity-95 active:scale-[0.99] transition-all">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">
            add
          </span>
          New Chat
        </div>
        <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded text-white/90 border border-white/10">
          ⌘N
        </span>
      </button>
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60 group-focus-within:text-primary transition-colors">
          search
        </span>
        <input
          className="w-full bg-surface-container-low/80 hover:bg-surface-container-low border border-transparent focus:border-primary/20 focus:bg-white rounded-xl pl-9 pr-8 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/10 placeholder:text-on-surface-variant/60 transition-all"
          placeholder="Search chats & docs..."
          type="text"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-on-surface-variant/60 bg-white/80 px-1.5 py-0.5 rounded border border-on-surface/10 shadow-xs">
          ⌘F
        </span>
      </div>
    </div>
  )
}
