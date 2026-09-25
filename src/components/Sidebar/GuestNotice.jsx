/**
 * Pesan singkat untuk tamu di area sidebar (guest.md §4.3 poin 5).
 *
 * Tamu tidak punya histori chat/model yang disimpan — data mereka ephemeral
 * (Redis TTL). Daripada menampilkan section kosong atau request yang gagal,
 * beri tahu alasannya dan sediakan CTA mendaftar.
 */
export default function GuestNotice() {
  return (
    <div className="rounded-md border border-dashed border-on-surface/15 bg-surface-container-low/50 p-3.5 space-y-2">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
        <p className="text-[11px] font-semibold leading-tight">Mode Tamu</p>
      </div>
      <p className="text-[11px] text-on-surface-variant/70 leading-relaxed">
        Riwayat percakapan, model pilihan, dan topik tidak disimpan di mode
        tamu. Chat akan hilang saat sesi berakhir.
      </p>
    </div>
  );
}
