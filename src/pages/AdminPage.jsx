import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

function formatNumber(value) {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(Number(value));
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-on-surface/8 bg-white p-5 shadow-sm shadow-on-surface/5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-on-surface/10">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${accent} opacity-10 blur-xl transition-opacity group-hover:opacity-20`}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-on-surface-variant/70">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-on-surface">
            {value}
          </p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent} bg-opacity-10`}
        >
          <span className={`material-symbols-outlined text-[19px] ${accent.replace('bg-', 'text-')}`}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}

function ModelRow({ model, maxCount }) {
  const pct = maxCount > 0 ? Math.max(3, (model.request_count / maxCount) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-28 shrink-0 items-center gap-2 min-w-0">
        <span className="truncate text-sm font-medium text-on-surface" title={model.name}>
          {model.name}
        </span>
      </div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-container-low">
        <div
          className="h-full rounded-full bg-gradient-pro transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-24 shrink-0 text-right text-xs font-medium text-on-surface-variant tabular-nums">
        {formatNumber(model.request_count)} request
      </span>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [models, setModels] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usagePage, setUsagePage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, modelsRes] = await Promise.all([
          adminService.stats(),
          adminService.models(),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setModels(modelsRes.data.models);
      } catch (err) {
        if (!cancelled) {
          setError('Gagal memuat data admin. Periksa koneksi Anda.');
          console.error('Admin load failed:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (loading) return;
    (async () => {
      try {
        const res = await adminService.usage(usagePage);
        if (!cancelled) setUsage(res.data);
      } catch (err) {
        if (!cancelled) console.error('Usage load failed:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [usagePage, loading]);

  const maxModelCount = Math.max(1, ...models.map((m) => Number(m.request_count || 0)));

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-surface-container-low" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-surface-container-low"
              />
            ))}
          </div>
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-surface-container-low" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
            cloud_off
          </span>
          <p className="mt-2 text-sm text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">
        {/* Header */}
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-pro text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Admin Panel</h1>
            <p className="text-sm text-on-surface-variant/80">
              Monitoring pemakaian, model favorit, dan kredit platform.
            </p>
          </div>
        </header>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatCard
            icon="group"
            label="Total User"
            value={formatNumber(stats?.users)}
            accent="bg-primary"
          />
          <StatCard
            icon="bolt"
            label="Request Hari Ini"
            value={formatNumber(stats?.usage_today)}
            accent="bg-amber-500"
          />
          <StatCard
            icon="payments"
            label="Kredit Terpakai"
            value={formatNumber(stats?.credits_used_total)}
            accent="bg-emerald-500"
          />
          <StatCard
            icon="timer"
            label="Latency Rata-rata"
            value={`${formatNumber(Math.round(stats?.latency_avg_ms ?? 0))}ms`}
            accent="bg-blue-500"
          />
        </div>

        {/* Secondary stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatCard
            icon="forum"
            label="Percakapan"
            value={formatNumber(stats?.conversations)}
            accent="bg-purple-500"
          />
          <StatCard
            icon="sms"
            label="Total Pesan"
            value={formatNumber(stats?.messages)}
            accent="bg-pink-500"
          />
          <StatCard
            icon="token"
            label="Total Token"
            value={formatNumber(stats?.tokens_total)}
            accent="bg-indigo-500"
          />
          <StatCard
            icon="vpn_key"
            label="API Key Aktif"
            value={formatNumber(stats?.api_keys_active)}
            accent="bg-teal-500"
          />
        </div>

        {/* Model favorit */}
        <section className="mt-8 rounded-2xl border border-on-surface/8 bg-white p-6 shadow-sm shadow-on-surface/5">
          <div className="mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">trending_up</span>
            <h2 className="text-base font-semibold text-on-surface">Model Favorit</h2>
          </div>
          {models.length === 0 ? (
            <p className="text-sm text-on-surface-variant/70">Belum ada data pemakaian model.</p>
          ) : (
            <div className="space-y-3.5">
              {models.map((model) => (
                <ModelRow key={model.id} model={model} maxCount={maxModelCount} />
              ))}
            </div>
          )}
        </section>

        {/* Tabel pemakaian */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-on-surface/8 bg-white shadow-sm shadow-on-surface/5">
          <div className="border-b border-on-surface/8 p-6 pb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">analytics</span>
              <h2 className="text-base font-semibold text-on-surface">Log Pemakaian</h2>
            </div>
          </div>

          {usage && usage.data && usage.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-on-surface/8 bg-surface-container-low/40 text-[11px] uppercase tracking-wide text-on-surface-variant/70">
                      <th className="px-6 py-2.5 font-medium">User</th>
                      <th className="px-6 py-2.5 font-medium">Model</th>
                      <th className="px-6 py-2.5 text-right font-medium">Token</th>
                      <th className="px-6 py-2.5 text-right font-medium">Kredit</th>
                      <th className="px-6 py-2.5 text-right font-medium">Latency</th>
                      <th className="px-6 py-2.5 text-right font-medium">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-on-surface/5">
                    {usage.data.map((log) => (
                      <tr key={log.id} className="transition-colors hover:bg-surface-container-low/30">
                        <td className="whitespace-nowrap px-6 py-3 text-on-surface-variant">
                          {log.user?.name ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 font-medium text-on-surface">
                          {log.model?.name ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-right tabular-nums text-on-surface-variant">
                          {formatNumber((log.prompt_tokens ?? 0) + (log.completion_tokens ?? 0))}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-right tabular-nums">
                          <span className="inline-flex items-center rounded-full bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary">
                            {formatNumber(log.credits_deducted)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-right tabular-nums text-on-surface-variant">
                          {formatNumber(log.latency_ms)}ms
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-right text-xs text-on-surface-variant/70">
                          {log.created_at
                            ? new Date(log.created_at).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usage.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-on-surface/8 px-6 py-3">
                  <p className="text-xs text-on-surface-variant/70">
                    Halaman {usage.current_page} dari {usage.last_page}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUsagePage((p) => Math.max(1, p - 1))}
                      disabled={usage.current_page <= 1}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsagePage((p) => Math.min(usage.last_page, p + 1))}
                      disabled={usage.current_page >= usage.last_page}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Berikutnya →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-10 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                inbox
              </span>
              <p className="mt-2 text-sm text-on-surface-variant/70">
                Belum ada log pemakaian.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
