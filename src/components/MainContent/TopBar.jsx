export default function TopBar() {
  return (
    <div className="h-16 w-full flex justify-between items-center px-6 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-background via-background/90 to-transparent">
      <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-on-surface/10 text-sm font-medium hover:bg-white transition-colors shadow-sm">
        <span className="material-symbols-outlined text-[18px] text-primary">diamond</span>
        Permata Flash 2.5
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          keyboard_arrow_down
        </span>
      </button>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px]">link</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-on-surface/10 text-sm font-medium shadow-sm hover:bg-surface-container-low transition-colors">
          Share
          <span className="material-symbols-outlined text-[18px]">ios_share</span>
        </button>
        <button className="w-9 h-9 rounded-full border border-on-surface/10 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      </div>
    </div>
  )
}
