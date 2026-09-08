import logo from './../../assets/permata.png';

export default function SidebarHeader() {
  return (
    <div className="p-4 pb-3 flex items-center justify-between border-b border-on-surface/5">
      <div className="flex items-center gap-2.5 cursor-pointer">
        <img src={logo} alt="Permata AI" className="w-8 h-8" />
        {/* <div className="w-8 h-8 rounded-xl bg-gradient-pro flex items-center justify-center text-white shadow-md shadow-primary/20">
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            diamond
          </span>
        </div> */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-headline-md text-[15px] font-bold tracking-tight text-on-surface leading-none">
              Permata AI
            </span>
            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
              v2.5
            </span>
          </div>
          <span className="text-[11px] text-on-surface-variant/70 mt-0.5">
            Workspace &amp; Studio
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="w-8 h-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          title="Collapse sidebar"
        >
          <span className="material-symbols-outlined text-[18px]">view_sidebar</span>
        </button>
      </div>
    </div>
  )
}
