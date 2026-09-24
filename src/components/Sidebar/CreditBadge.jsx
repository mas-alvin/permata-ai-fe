import { useAppSelector } from '../../store/hooks';

/**
 * Credit indicator shown in the sidebar workspace footer.
 *
 * Reads `user.credits` from the auth slice and renders a compact
 * progress badge. When credits are low/zero it switches to a warning
 * style to nudge the user toward topping up.
 */
export default function CreditBadge() {
  const user = useAppSelector((state) => state.auth.user);
  const credits = user?.credits ?? 0;
  const maxCredits = 100; // matches users.credits default in the backend
  const pct = Math.max(0, Math.min(100, Math.round((credits / maxCredits) * 100)));

  const isCritical = credits === 0;
  const isLow = credits > 0 && credits <= 20;

  return (
    <div
      className={`px-3 py-2 rounded-md border flex items-center justify-between text-xs transition-colors ${
        isCritical
          ? 'bg-red-50 border-red-200'
          : isLow
          ? 'bg-amber-50 border-amber-200'
          : 'bg-surface-container-low/70 border-on-surface/5'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
            isCritical
              ? 'bg-red-100 text-red-700 border-red-300'
              : isLow
              ? 'bg-amber-100 text-amber-700 border-amber-300'
              : 'bg-secondary-fixed/50 text-primary border-secondary-fixed'
          }`}
        >
          {credits}
        </div>
        <div className="flex flex-col">
          <span
            className={`font-medium text-[11px] leading-none ${
              isCritical ? 'text-red-700' : isLow ? 'text-amber-700' : 'text-on-surface'
            }`}
          >
            {isCritical ? 'Kredit habis' : `${credits} credits left`}
          </span>
          <span className="text-[9px] text-on-surface-variant/60 mt-0.5">
            {isCritical ? 'Isi ulang untuk melanjutkan' : `Renews in 14 days`}
          </span>
        </div>
      </div>
      <a
        className={`text-[10px] font-semibold hover:underline ${
          isCritical || isLow ? 'text-primary' : 'text-primary'
        }`}
        href="#"
        onClick={(e) => e.preventDefault()}
      >
        Top up
      </a>
    </div>
  );
}
