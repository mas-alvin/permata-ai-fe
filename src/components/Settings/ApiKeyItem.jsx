import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { updateKey, removeKey } from '../../store/slices/apiKeySlice';
import { apiKeyService } from '../../services/apiKeyService';
import { useConfirmModal } from '../../hooks/useConfirmModal';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * One API key row: shows key_prefix (never the full key), name, scopes,
 * status and a 3-dot menu for rename / toggle active / revoke.
 */
export default function ApiKeyItem({ apiKey }) {
  const dispatch = useAppDispatch();
  const { confirm } = useConfirmModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(apiKey.name);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const isRevoked = !!apiKey.revoked_at;
  const isExpired = !isRevoked && apiKey.expires_at && new Date(apiKey.expires_at) < new Date();
  const isActive = apiKey.is_active && !isRevoked && !isExpired;

  const statusMeta = isRevoked
    ? { label: 'Revoked', className: 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20' }
    : isExpired
    ? { label: 'Expired', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
    : isActive
    ? { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' }
    : { label: 'Inactive', className: 'bg-surface-container-low text-on-surface-variant border-on-surface/10' };

  const handleSaveName = async () => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === apiKey.name) {
      setDraftName(apiKey.name);
      setRenaming(false);
      return;
    }
    try {
      const res = await apiKeyService.update(apiKey.id, { name: trimmed });
      dispatch(updateKey(res.data));
    } catch (err) {
      setDraftName(apiKey.name);
      console.error('Rename failed:', err);
    }
    setRenaming(false);
  };

  const handleToggleActive = async () => {
    setMenuOpen(false);
    try {
      const res = await apiKeyService.update(apiKey.id, { is_active: !apiKey.is_active });
      dispatch(updateKey(res.data));
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleRevoke = async () => {
    setMenuOpen(false);
    const ok = await confirm({
      title: 'Cabut API key?',
      message: `API key "${apiKey.name}" akan dicabut permanen. Aplikasi yang memakai key ini langsung kehilangan akses.`,
      confirmLabel: 'Cabut permanen',
      cancelLabel: 'Batal',
      danger: true,
    });
    if (!ok) return;
    try {
      await apiKeyService.delete(apiKey.id);
      dispatch(removeKey(apiKey.id));
    } catch (err) {
      console.error('Revoke failed:', err);
    }
  };

  const lastUsed = formatDate(apiKey.last_used_at);
  const expiresAt = formatDate(apiKey.expires_at);

  return (
    <div className="group relative flex items-center gap-3 px-3.5 py-3 rounded-md border border-on-surface/8 hover:border-on-surface/15 hover:bg-surface-container-low/40 transition-all">
      {/* Key icon + prefix */}
      <div className="w-9 h-9 rounded-xl bg-surface-container-low border border-on-surface/10 flex items-center justify-center shrink-0">
        <KeyIcon className="w-4 h-4 text-on-surface-variant" />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        {renaming ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') {
                  setDraftName(apiKey.name);
                  setRenaming(false);
                }
              }}
              onBlur={handleSaveName}
              className="flex-1 px-2 py-1 text-sm font-medium text-on-surface bg-surface-container-low border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        ) : (
          <p className="text-sm font-semibold text-on-surface truncate">{apiKey.name}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <code className="text-[11px] font-mono text-on-surface-variant/80 bg-surface-container-low px-1.5 py-0.5 rounded-md border border-on-surface/5">
            {apiKey.key_prefix}••••
          </code>
          {(apiKey.scopes || []).length > 0 && (
            <span className="text-[10px] text-on-surface-variant/60 truncate">
              {apiKey.scopes.join(', ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-on-surface-variant/60">
          {lastUsed ? (
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              Dipakai {lastUsed}
            </span>
          ) : (
            <span>Belum pernah dipakai</span>
          )}
          {expiresAt && !isRevoked && (
            <span className={isExpired ? 'text-amber-600 font-medium' : ''}>
              Berlaku sampai {expiresAt}
            </span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border shrink-0 ${statusMeta.className}`}
      >
        {isActive ? (
          <CheckCircleIcon className="w-3 h-3" />
        ) : (
          <XCircleIcon className="w-3 h-3" />
        )}
        {statusMeta.label}
      </span>

      {/* 3-dot menu */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low transition-all"
          aria-label="More actions"
        >
          <span className="material-symbols-outlined text-[16px]">more_horiz</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-surface-container-highest rounded-md border border-on-surface/8 shadow-lg shadow-on-surface/5 py-1">
            <button
              onClick={() => {
                setMenuOpen(false);
                setRenaming(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
              <span>Rename</span>
            </button>
            <button
              onClick={handleToggleActive}
              disabled={isRevoked}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                {isActive ? 'pause' : 'play_arrow'}
              </span>
              <span>{isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
            </button>
            <div className="my-1 border-t border-on-surface/5"></div>
            <button
              onClick={handleRevoke}
              disabled={isRevoked}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">block</span>
              <span>{isRevoked ? 'Telah dicabut' : 'Cabut permanen'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
