import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setKeys,
  setKeysLoading,
  setKeysError,
} from '../../store/slices/apiKeySlice';
import { apiKeyService } from '../../services/apiKeyService';
import ApiKeyItem from './ApiKeyItem';
import GenerateKeyModal from './GenerateKeyModal';
import RevealKeyOnceModal from './RevealKeyOnceModal';
import { KeyIcon, PlusIcon } from '@heroicons/react/24/outline';

/**
 * Container for the API Keys tab: fetches the list on mount, renders the
 * key rows and owns the generate/reveal modals.
 */
export default function ApiKeyManager() {
  const dispatch = useAppDispatch();
  const { keys, loading, error, revealedKey } = useAppSelector((state) => state.apiKey);
  const [showGenerate, setShowGenerate] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      dispatch(setKeysLoading(true));
      dispatch(setKeysError(null));
      try {
        const res = await apiKeyService.list();
        dispatch(setKeys(res.data.api_keys));
      } catch (err) {
        const msg = err.response?.data?.message || 'Gagal memuat API keys.';
        dispatch(setKeysError(msg));
      } finally {
        dispatch(setKeysLoading(false));
      }
    };
    fetchKeys();
  }, [dispatch]);

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Section header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
            <KeyIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">API Keys</h2>
            <p className="text-sm text-on-surface-variant/80 mt-0.5">
              Gunakan API key untuk menghubungkan skrip atau aplikasi eksternal
              ke Permata AI. Key hanya ditampilkan satu kali saat dibuat.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-pro text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Generate new key</span>
          <span className="sm:hidden">Generate</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-on-surface/8 animate-pulse"
            >
              <div className="w-9 h-9 rounded-xl bg-surface-container-low" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 bg-surface-container-low rounded-md" />
                <div className="h-2.5 w-1/2 bg-surface-container-low/70 rounded-md" />
              </div>
              <div className="h-5 w-16 bg-surface-container-low rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && keys.length === 0 && (
        <div className="px-6 py-12 rounded-3xl border border-dashed border-on-surface/15 bg-surface-container-lowest/60 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-low border border-on-surface/10 flex items-center justify-center mx-auto mb-4">
            <KeyIcon className="w-7 h-7 text-on-surface-variant/60" />
          </div>
          <h3 className="text-sm font-semibold text-on-surface">Belum ada API key</h3>
          <p className="text-xs text-on-surface-variant/70 mt-1 max-w-sm mx-auto">
            Buat API key pertama Anda untuk mulai mengintegrasikan Permata AI
            ke sistem lain.
          </p>
          <button
            onClick={() => setShowGenerate(true)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-pro text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md"
          >
            <PlusIcon className="w-4 h-4" />
            Generate new key
          </button>
        </div>
      )}

      {/* Key list */}
      {!loading && !error && keys.length > 0 && (
        <div className="space-y-2.5">
          {keys.map((key) => (
            <ApiKeyItem key={key.id} apiKey={key} />
          ))}
        </div>
      )}

      {/* Security note */}
      <div className="mt-6 px-4 py-3 rounded-2xl bg-surface-container-lowest/80 border border-on-surface/8">
        <p className="text-[11px] text-on-surface-variant/70 leading-relaxed">
          Demi keamanan, backend hanya menyimpan <span className="font-semibold">hash</span> dari
          API key Anda. Simpan key di tempat aman — setelah dibuat, key tidak
          dapat dilihat lagi. Rate limit per key dihitung terpisah dari kuota sesi web Anda.
        </p>
      </div>

      {/* Modals */}
      {showGenerate && <GenerateKeyModal onClose={() => setShowGenerate(false)} />}
      {revealedKey && <RevealKeyOnceModal onClose={() => {}} />}
    </div>
  );
}
