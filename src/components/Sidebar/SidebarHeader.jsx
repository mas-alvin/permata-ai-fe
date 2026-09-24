import logoLight from '/permata.svg';
import logoDark from '/logodark.png';

export default function SidebarHeader({ onToggle }) {
  return (
    <div className="p-4 pb-3 flex items-center justify-between border-b border-on-surface/5">
      <div className="flex items-center gap-2.5 cursor-pointer">
        {/* Logo spesifik per tema: terang → permata.svg, gelap → logodark.png */}
        <img src={logoLight} alt="Permata AI" className="w-8 h-8 dark:hidden" />
        <img src={logoDark} alt="Permata AI" className="w-8 h-8 hidden dark:block" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-headline-md text-[15px] font-bold tracking-tight text-on-surface leading-none">
              Permata AI
            </span>
            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-secondary font-mono">
              v2.5
            </span>
          </div>
          <span className="text-[11px] text-on-surface-variant/70 mt-0.5">
            Workspace &amp; Studio
          </span>
        </div>
      </div>
    </div>
  )
}
