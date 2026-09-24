import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setDocuments } from '../../store/slices/ragSlice';
import { ragService } from '../../services/ragService';
import { BookOpenIcon, CheckIcon } from '@heroicons/react/24/outline';

/**
 * Pemilih sumber dokumen RAG untuk percakapan aktif (Fase 7).
 *
 * Toggle RAG on/off + checklist dokumen (hanya yang berstatus ready).
 * Pilihan dipersisten ke backend via PUT /conversations/{id}/rag-sources.
 */
export default function RagSourcePicker({ conversationId, ragEnabled, ragDocumentIds, onPersist }) {
  const dispatch = useAppDispatch();
  const documents = useAppSelector((state) => state.rag.documents);
  const [open, setOpen] = useState(false);
  const [localEnabled, setLocalEnabled] = useState(ragEnabled);
  const [selected, setSelected] = useState(() => new Set(ragDocumentIds?.map(String) || []));
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);
  const [popoverPos, setPopoverPos] = useState(null);

  // Refresh daftar dokumen setiap kali picker dibuka.
  useEffect(() => {
    if (!open) return;
    ragService
      .listDocuments()
      .then((res) => dispatch(setDocuments(res.data.data || [])))
      .catch(() => {});
  }, [open, dispatch]);

  // Sinkronkan state internal saat prop dari percakapan berubah.
  useEffect(() => {
    setLocalEnabled(ragEnabled);
    setSelected(new Set(ragDocumentIds?.map(String) || []));
  }, [ragEnabled, ragDocumentIds]);

  // Tutup popover saat klik di luar.
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      // Karena popover dirender via portal (terpisah dari tombol trigger),
      // cek kedua ref: popover dan tombolnya sendiri.
      const clickedInsidePopover = popoverRef.current?.contains(e.target);
      const clickedButton = buttonRef.current?.contains(e.target);
      if (!clickedInsidePopover && !clickedButton) {
        persistAndClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, localEnabled, selected]);

  const persistAndClose = () => {
    const ids = Array.from(selected);
    onPersist?.({ ragEnabled: localEnabled, ragDocumentIds: ids });
    setOpen(false);
  };

  // Hitung posisi popover relatif terhadap viewport. Karena popover dirender
  // via portal ke document.body, ia lepas dari container overflow-hidden di
  // ancestor, jadi koordinat harus absolute terhadap viewport.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    const computePosition = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverHeight = popoverRef.current?.offsetHeight || 320;
      const POPOVER_WIDTH = 288; // w-72
      const GAP = 8;

      let top = rect.top - popoverHeight - GAP;

      // Jika tidak muat di atas tombol, buka ke bawah.
      if (top < GAP) {
        top = rect.bottom + GAP;
      }

      // Sejajarkan kanan popover dengan kanan tombol, lalu clamp agar tidak
      // keluar dari viewport (mis. layar sempit / mobile).
      let left = rect.right - POPOVER_WIDTH;
      if (left < GAP) left = GAP;
      if (left + POPOVER_WIDTH > window.innerWidth - GAP) {
        left = window.innerWidth - POPOVER_WIDTH - GAP;
      }

      setPopoverPos({ top, left, width: POPOVER_WIDTH });
    };

    computePosition();

    // Hitung ulang saat scroll/resize karena posisi tombol berubah.
    window.addEventListener('resize', computePosition);
    window.addEventListener('scroll', computePosition, true);
    return () => {
      window.removeEventListener('resize', computePosition);
      window.removeEventListener('scroll', computePosition, true);
    };
  }, [open]);

  const toggleDocument = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const readyDocs = documents.filter((d) => d.status === 'ready');
  const activeCount = localEnabled ? selected.size : 0;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
          localEnabled && activeCount > 0
            ? 'bg-primary/10 text-primary border-primary/30'
            : 'text-on-surface-variant border-on-surface/10 hover:bg-surface-container-high'
        }`}
        title="Sumber knowledge base"
      >
        <BookOpenIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Knowledge</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {open &&
        popoverPos &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px`, width: `${popoverPos.width}px` }}
            className="fixed z-[9999] bg-white rounded-2xl border border-on-surface/10 shadow-xl shadow-on-surface/10 overflow-hidden"
          >
            {/* Header toggle */}
            <div className="p-3 border-b border-on-surface/8">
              <button
                type="button"
                onClick={() => setLocalEnabled((prev) => !prev)}
                className="flex items-center justify-between w-full"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-on-surface">RAG aktif</p>
                  <p className="text-[10px] text-on-surface-variant/70">Jawab dari dokumen internal</p>
                </div>
                <span
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    localEnabled ? 'bg-primary' : 'bg-on-surface/15'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      localEnabled ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </span>
              </button>
            </div>

            {/* Document list */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {readyDocs.length === 0 ? (
                <div className="p-6 text-center">
                  <BookOpenIcon className="w-7 h-7 mx-auto text-on-surface-variant/30 mb-2" />
                  <p className="text-xs text-on-surface-variant/70">
                    Belum ada dokumen siap. Unggah dokumen di Settings → Knowledge Base.
                  </p>
                </div>
              ) : (
                <ul className="py-1">
                  {readyDocs.map((doc) => {
                    const isChecked = selected.has(String(doc.id));
                    return (
                      <li key={doc.id}>
                        <button
                          type="button"
                          onClick={() => toggleDocument(String(doc.id))}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-surface-container-low transition-colors"
                        >
                          <span
                            className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors ${
                              isChecked ? 'bg-primary border-primary' : 'border-on-surface/25'
                            }`}
                          >
                            {isChecked && <CheckIcon className="w-3 h-3 text-white" />}
                          </span>
                          <span className="text-xs text-on-surface truncate flex-1">{doc.title}</span>
                          {doc.chunk_count > 0 && (
                            <span className="text-[10px] text-on-surface-variant/50 shrink-0">{doc.chunk_count}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="p-2.5 border-t border-on-surface/8">
              <button
                type="button"
                onClick={persistAndClose}
                className="w-full py-1.5 rounded-lg bg-gradient-pro text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Simpan
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
