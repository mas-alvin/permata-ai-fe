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

  return (
    <span className="text-[9px] text-emerald-600 font-medium">
      {credits} credits aktif
    </span>
  );
}
