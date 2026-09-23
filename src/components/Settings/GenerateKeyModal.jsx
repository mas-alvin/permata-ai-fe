import { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { addKey, setRevealedKey, setKeysError } from '../../store/slices/apiKeySlice';
import { apiKeyService } from '../../services/apiKeyService';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SCOPE_OPTIONS = [
  { value: 'chat:write', label: 'chat:write', desc: 'Kirim pesan ke model' },
  { value: 'chat:read', label: 'chat:read', desc: 'Lihat daftar model' },
];

/**
 * Form to create a new API key. On success the plaintext is pushed to
 * `revealedKey` so RevealKeyOnceModal can show it exactly once.
 */
export default function GenerateKeyModal({ onClose }) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState(['chat:write', 'chat:read']);
  const [expiry, setExpiry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleScope = (scope) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama key wajib diisi.');
      return;
    }
    if (scopes.length === 0) {
      setError('Pilih minimal satu scope.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const payload = { name: name.trim(), scopes };
      if (expiry) payload.expires_at = new Date(expiry).toISOString();

      const res = await apiKeyService.create(payload);
      // Store metadata in the list, keep plaintext only in revealedKey
      dispatch(addKey(res.data.api_key_meta));
      dispatch(setRevealedKey(res.data.api_key));
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal membuat API key.';
      setError(msg);
      dispatch(setKeysError(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-on-surface/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-on-surface/10">
          <div>
            <h3 className="text-base font-bold text-on-surface">Generate API Key</h3>
            <p className="text-xs text-on-surface-variant/80 mt-0.5">
              Key baru untuk integrasi eksternal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Tutup"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              Nama Key
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Skrip Internal Absensi"
              autoFocus
              className="w-full px-3.5 py-2.5 bg-white border border-on-surface/15 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
            <p className="text-[10px] text-on-surface-variant/60 mt-1">
              Label bebas untuk memudahkan Anda mengenali key ini nanti.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2">
              Scopes
            </label>
            <div className="space-y-2">
              {SCOPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-on-surface/10 hover:bg-surface-container-low/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={scopes.includes(opt.value)}
                    onChange={() => toggleScope(opt.value)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-on-surface/30 accent-[#570013]"
                  />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-on-surface font-mono">
                      {opt.label}
                    </span>
                    <span className="text-xs text-on-surface-variant/70 ml-2">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              Masa Berlaku <span className="font-normal text-on-surface-variant/60">(opsional)</span>
            </label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3.5 py-2.5 bg-white border border-on-surface/15 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
            <p className="text-[10px] text-on-surface-variant/60 mt-1">
              Disarankan untuk kebutuhan sementara (mis. testing).
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container-low transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-pro rounded-xl hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Memproses...' : 'Generate Key'}
          </button>
        </div>
      </div>
    </div>
  );
}
