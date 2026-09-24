import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setDocuments,
  addDocument,
  updateDocumentStatus,
  removeDocument,
  setLoading,
  setUploading,
  setError,
} from '../../store/slices/ragSlice';
import { ragService } from '../../services/ragService';
import { useConfirmModal } from '../../hooks/useConfirmModal';
import { DocumentTextIcon, ArrowPathIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const STATUS_META = {
  pending: { label: 'Antri', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  processing: { label: 'Memproses', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  ready: { label: 'Siap', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed: { label: 'Gagal', className: 'bg-red-50 text-red-700 border-red-200' },
};

const ACCEPTED = '.txt,.md,.csv,.json,.html,.pdf';

/**
 * Panel manajemen dokumen knowledge base RAG (Fase 7).
 *
 * Upload disimpan dengan nama acak di disk private backend; ingestion
 * (extract -> chunk -> embed) berjalan async, jadi panel ini mem-polling
 * status sampai semua dokumen selesai.
 */
export default function KnowledgeBasePanel() {
  const dispatch = useAppDispatch();
  const documents = useAppSelector((state) => state.rag.documents);
  const loading = useAppSelector((state) => state.rag.loading);
  const uploading = useAppSelector((state) => state.rag.uploading);
  const error = useAppSelector((state) => state.rag.error);
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);
  const { confirm } = useConfirmModal();

  const loadDocuments = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await ragService.listDocuments();
      dispatch(setDocuments(res.data.data || []));
    } catch (err) {
      dispatch(setError('Gagal memuat dokumen knowledge base.'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Poll status dokumen yang masih diproses sampai semua selesai.
  useEffect(() => {
    const hasPending = documents.some((d) => d.status === 'pending' || d.status === 'processing');

    if (hasPending && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await ragService.listDocuments();
          const list = res.data.data || [];
          dispatch(setDocuments(list));

          const stillPending = list.some((d) => d.status === 'pending' || d.status === 'processing');
          if (!stillPending) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } catch {
          // abaikan error polling, dicoba lagi interval berikutnya
        }
      }, 2500);
    }

    if (!hasPending && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [documents, dispatch]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      dispatch(setUploading(true));
      dispatch(setError(null));
      const res = await ragService.uploadDocument(file);
      dispatch(addDocument(res.data.document));
    } catch (err) {
      dispatch(setError(err?.response?.data?.error || 'Gagal mengunggah dokumen.'));
    } finally {
      dispatch(setUploading(false));
    }
  };

  const handleDelete = async (document) => {
    const ok = await confirm({
      title: 'Hapus dokumen knowledge base?',
      message: `"${document.title}" dan seluruh embedding-nya akan dihapus permanen.`,
      confirmLabel: 'Hapus',
      danger: true,
    });

    if (!ok) return;

    try {
      await ragService.deleteDocument(document.id);
      dispatch(removeDocument(document.id));
    } catch {
      dispatch(setError('Gagal menghapus dokumen.'));
    }
  };

  const handleReingest = async (document) => {
    try {
      dispatch(updateDocumentStatus({ id: document.id, status: 'pending', error: null, chunkCount: 0 }));
      await ragService.reingestDocument(document.id);
    } catch {
      dispatch(setError('Gagal memproses ulang dokumen.'));
      dispatch(updateDocumentStatus({ id: document.id, status: 'failed' }));
    }
  };

  const readyCount = documents.filter((d) => d.status === 'ready').length;

  return (
    <div className="space-y-5">
      {/* Header + stats */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-on-surface-variant/80">
            Unggah dokumen internal. Dokumen dipecah menjadi chunk, di-embed, dan
            dijadikan sumber jawaban saat RAG diaktifkan di percakapan.
          </p>
          <p className="mt-2 text-xs text-on-surface-variant/60">
            Didukung: TXT, MD, CSV, JSON, HTML, PDF (maks 20MB)
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-md bg-surface-container-low border border-on-surface/8 text-center">
            <p className="text-lg font-bold text-on-surface leading-none">{readyCount}</p>
            <p className="text-[10px] text-on-surface-variant/70 mt-0.5">siap dipakai</p>
          </div>
        </div>
      </div>

      {/* Upload area */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`group relative cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition-all ${
          uploading
            ? 'border-primary/40 bg-primary/5 cursor-wait'
            : 'border-on-surface/15 hover:border-primary/40 hover:bg-primary/5'
        }`}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept={ACCEPTED} onChange={handleFileChange} />
        {uploading ? (
          <>
            <span className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
            <p className="text-sm font-medium text-primary">Mengunggah dokumen...</p>
          </>
        ) : (
          <>
            <CloudArrowUpIcon className="w-8 h-8 mx-auto text-on-surface-variant/60 group-hover:text-primary transition-colors mb-2" />
            <p className="text-sm font-medium text-on-surface">Klik untuk mengunggah dokumen</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">File disimpan dengan nama acak di disk private</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Document list */}
      {loading && documents.length === 0 ? (
        <div className="text-center py-8 text-sm text-on-surface-variant animate-pulse">Memuat dokumen...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-10">
          <DocumentTextIcon className="w-10 h-10 mx-auto text-on-surface-variant/30 mb-3" />
          <p className="text-sm text-on-surface-variant/70">Belum ada dokumen di knowledge base.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => {
            const meta = STATUS_META[doc.status] || STATUS_META.pending;
            return (
              <li
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-md bg-surface-container-low border border-on-surface/8"
              >
                <DocumentTextIcon className="w-5 h-5 text-on-surface-variant shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-on-surface truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.className}`}>
                      {doc.status === 'processing' && <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin mr-1" />}
                      {meta.label}
                    </span>
                    {doc.status === 'ready' && doc.chunk_count > 0 && (
                      <span className="text-[10px] text-on-surface-variant/60">{doc.chunk_count} chunk</span>
                    )}
                    {doc.status === 'failed' && doc.error && (
                      <span className="text-[10px] text-red-600/80 truncate" title={doc.error}>{doc.error}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {doc.status === 'failed' && (
                    <button
                      type="button"
                      onClick={() => handleReingest(doc)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Proses ulang"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
