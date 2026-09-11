import { useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';

export default function WorkspaceFooter() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="p-3 border-t border-on-surface/10 bg-surface-container-lowest/90 backdrop-blur-md space-y-2">
      {/* Credits Progress Badge */}
      <div className="px-3 py-2 rounded-xl bg-surface-container-low/70 border border-on-surface/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-[10px] font-bold text-primary border border-secondary-fixed">
            80
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-[11px] text-on-surface leading-none">80 credits left</span>
            <span className="text-[9px] text-on-surface-variant/60 mt-0.5">Renews in 14 days</span>
          </div>
        </div>
        <a className="text-[10px] font-semibold text-primary hover:underline" href="#">
          Top up
        </a>
      </div>

      {/* User Account row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5 cursor-pointer min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            PA
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-on-surface truncate leading-tight">Creative Studio</p>
            <p className="text-[10px] text-on-surface-variant/60 truncate">studio@permata.ai</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 text-on-surface-variant">
          <button
            className="w-7 h-7 rounded-lg hover:bg-surface-container-low flex items-center justify-center hover:text-on-surface transition-colors"
            title="Settings"
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
          </button>
          <button
            className="w-7 h-7 rounded-lg hover:bg-surface-container-low flex items-center justify-center hover:text-on-surface transition-colors"
            title="Help"
          >
            <span className="material-symbols-outlined text-[16px]">help</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg hover:bg-surface-container-low flex items-center justify-center hover:text-on-surface transition-colors text-red-500 hover:text-red-600"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
