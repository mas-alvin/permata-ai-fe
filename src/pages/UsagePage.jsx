import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { usageService } from '../services/usageService';
import {
  ChartBarIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  CpuChipIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// Label bulan pendek untuk legenda heatmap.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

// Ambil kunci tanggal (YYYY-MM-DD) dalam zona waktu lokal user.
function dayKey(date) {
  return date.toISOString().split('T')[0];
}

// Format angka ribuan: 123456 → "123.456"
function formatNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0';
  return value.toLocaleString('id-ID');
}

export default function UsagePage() {
  const user = useAppSelector((state) => state.auth.user);
  const [usage, setUsage] = useState([]);
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('daily'); // daily | weekly | cumulative

  const loadUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usageService.list(1);
      setUsage(res.data.usage?.data || []);
      setTotalCreditsUsed(res.data.total_credits_used || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data penggunaan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  // Agregasi token per hari dari UsageLog (prompt + completion).
  const dailyTotals = usage.reduce((acc, log) => {
    const key = dayKey(new Date(log.created_at));
    acc[key] = (acc[key] || 0) + (log.prompt_tokens || 0) + (log.completion_tokens || 0);
    return acc;
  }, {});

  const totalTokens = usage.reduce(
    (sum, log) => sum + (log.prompt_tokens || 0) + (log.completion_tokens || 0),
    0
  );
  const peakTokens = Object.values(dailyTotals).reduce((max, v) => Math.max(max, v), 0);
  const totalChats = new Set(usage.map((log) => log.conversation_id)).size;
  const modelsUsed = new Set(usage.map((log) => log.model?.slug).filter(Boolean));

  // Hitung streak (jumlah hari berturut-turut sampai aktivitas terakhir).
  const activeDays = Object.keys(dailyTotals).sort().reverse();
  const streak = (() => {
    if (!activeDays.length) return 0;
    let count = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (activeDays.includes(dayKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  // Membangun grid heatmap 7 baris × 52 kolom (mirip kontribusi GitHub).
  const heatmap = (() => {
    const grid = Array.from({ length: 7 }, () => Array.from({ length: 52 }, () => ({ day: null, tokens: 0 })));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cari hari Minggu paling baru sebelum/sama dengan hari ini.
    const start = new Date(today);
    start.setDate(today.getDate() - 51 * 7 - today.getDay());

    for (let col = 0; col < 52; col += 1) {
      for (let row = 0; row < 7; row += 1) {
        const d = new Date(start);
        d.setDate(start.getDate() + col * 7 + row);
        if (d > today) continue;
        const key = dayKey(d);
        grid[row][col] = { day: key, tokens: dailyTotals[key] || 0, date: new Date(d) };
      }
    }
    return grid;
  })();

  const maxDayTokens = Math.max(1, ...heatmap.flat().map((c) => c.tokens));

  // Intensitas warna sel heatmap (5 tingkat).
  const cellClass = (tokens) => {
    if (!tokens) return 'bg-surface-container-low';
    const ratio = tokens / maxDayTokens;
    if (ratio > 0.75) return 'bg-secondary';
    if (ratio > 0.5) return 'bg-secondary/75';
    if (ratio > 0.25) return 'bg-secondary/50';
    return 'bg-secondary/25';
  };

  const stats = [
    { value: formatNumber(totalTokens), label: 'Total token', icon: BoltIcon },
    { value: formatNumber(peakTokens), label: 'Token tertinggi/hari', icon: ChartBarIcon },
    { value: `${streak} hari`, label: 'Streak saat ini', icon: ClockIcon },
    { value: `${totalChats}`, label: 'Percakapan', icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar bg-surface-container-low/30">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 space-y-8">
        {/* Page Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Penggunaan & Aktivitas</h1>
            <p className="text-sm text-on-surface-variant/80 mt-1">
              Pantau konsumsi token LLM, kredit, dan aktivitas harian Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={loadUsage}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-on-surface/15 text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Muat ulang
          </button>
        </header>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-sm text-on-surface-variant animate-pulse">Memuat aktivitas...</span>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 rounded-md border border-on-surface/10 bg-surface-container divide-x divide-on-surface/8 overflow-hidden">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="p-5 flex flex-col gap-2">
                    <Icon className="w-4 h-4 text-on-surface-variant/60" />
                    <div className="text-lg font-bold text-on-surface leading-none">{stat.value}</div>
                    <div className="text-[11px] text-on-surface-variant/70">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Credit summary */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-md border border-on-surface/10 bg-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <BoltIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Kredit terpakai (sepanjang waktu)</p>
                  <p className="text-sm font-bold text-on-surface">{formatNumber(totalCreditsUsed)} kredit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant">Sisa kredit</p>
                <p className="text-sm font-bold text-primary">{user?.credits ?? 0}</p>
              </div>
            </div>

            {/* Token Activity Heatmap */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-on-surface">Aktivitas token</h2>
                <div className="flex items-center gap-1 p-1 rounded-sm bg-surface-container-low/70 border border-on-surface/8">
                  {['daily', 'weekly', 'cumulative'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRange(value)}
                      className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                        range === value
                          ? 'bg-surface text-on-surface shadow-sm'
                          : 'text-on-surface-variant/70 hover:text-on-surface'
                      }`}
                    >
                      {value === 'daily' ? 'Harian' : value === 'weekly' ? 'Mingguan' : 'Kumulatif'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-on-surface/10 bg-surface-container p-5">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[700px] flex flex-col gap-1">
                    {heatmap.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex gap-1">
                        {row.map((cell, colIndex) => {
                          if (!cell.day) {
                            return <div key={`${rowIndex}-${colIndex}`} className="w-3 h-3 rounded-sm" />;
                          }
                          const label = `${cell.date.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })} — ${formatNumber(cell.tokens)} token`;
                          return (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              title={label}
                              className={`w-3 h-3 rounded-sm ${cellClass(cell.tokens)} transition-colors`}
                            />
                          );
                        })}
                      </div>
                    ))}
                    <div className="flex justify-between text-[10px] text-on-surface-variant/50 mt-2 px-1">
                      {MONTHS.map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-1.5 mt-3">
                  <span className="text-[10px] text-on-surface-variant/60">Sedikit</span>
                  <div className="w-3 h-3 rounded-sm bg-surface-container-low" />
                  <div className="w-3 h-3 rounded-sm bg-secondary/25" />
                  <div className="w-3 h-3 rounded-sm bg-secondary/50" />
                  <div className="w-3 h-3 rounded-sm bg-secondary/75" />
                  <div className="w-3 h-3 rounded-sm bg-secondary" />
                  <span className="text-[10px] text-on-surface-variant/60">Banyak</span>
                </div>
              </div>
            </section>

            {/* Bottom Grid: Insights & Model breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activity Insights */}
              <section className="rounded-md border border-on-surface/10 bg-surface-container p-6 space-y-4">
                <h2 className="text-base font-semibold text-on-surface">Ringkasan aktivitas</h2>
                <div className="space-y-3.5">
                  {[
                    { label: 'Model yang dipakai', value: `${modelsUsed.size} model` },
                    { label: 'Total percakapan', value: `${totalChats}` },
                    { label: 'Total permintaan', value: `${usage.length}` },
                    { label: 'Rata-rata token/permintaan', value: formatNumber(usage.length ? Math.round(totalTokens / usage.length) : 0) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center text-sm border-b border-on-surface/5 pb-3 last:border-0 last:pb-0">
                      <span className="text-on-surface-variant/80">{row.label}</span>
                      <span className="font-semibold text-on-surface">{row.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Model Usage */}
              <section className="rounded-md border border-on-surface/10 bg-surface-container p-6 space-y-4">
                <h2 className="text-base font-semibold text-on-surface">Model paling sering</h2>
                {modelsUsed.size === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                    <CpuChipIcon className="w-5 h-5 text-on-surface-variant/40" />
                    <span className="text-sm text-on-surface-variant/60">
                      Belum ada aktivitas model yang tercatat.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {[...modelsUsed].map((slug) => {
                      const logs = usage.filter((log) => log.model?.slug === slug);
                      const tokens = logs.reduce(
                        (sum, log) => sum + (log.prompt_tokens || 0) + (log.completion_tokens || 0),
                        0
                      );
                      const pct = totalTokens ? Math.round((tokens / totalTokens) * 100) : 0;
                      const name = logs[0]?.model?.name || slug;
                      return (
                        <div key={slug} className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-on-surface truncate">{name}</span>
                            <span className="text-xs text-on-surface-variant/70 shrink-0 ml-2">{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-pro" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
