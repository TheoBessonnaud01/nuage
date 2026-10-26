import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, PageHeader } from '../../components/ui';
import { Chip } from '../../components/inputs';
import { copy } from '../../content/copy';
import { cssColor } from '../../lib/cssColor';
import { addMonths, formatMonth, localDay, monthOf } from '../../lib/dates';
import { coreStats } from '../../lib/recap';
import { useInsightsData, useRecaps } from '../../lib/useInsights';
import { Pepite } from '../../mascot/Pepite';

const t = copy.months;
type Metric = 'migraineDays' | 'avgIntensity' | 'filledDays';
const shortMonth = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' });

export function MonthsPage() {
  const loaded = useInsightsData();
  const recaps = useRecaps();
  const [metric, setMetric] = useState<Metric>('migraineDays');
  const today = localDay();

  const series = useMemo(() => {
    if (!loaded) return [];
    const months = Array.from({ length: 12 }, (_, i) => addMonths(monthOf(today), i - 11));
    const rows = months.map((m) => ({ month: m, label: shortMonth.format(new Date(`${m}-15T12:00:00Z`)), ...coreStats(loaded.data, m, today) }));
    const first = rows.findIndex((r) => r.filledDays > 0 || r.attacks > 0);
    return first === -1 ? [] : rows.slice(first);
  }, [loaded, today]);

  if (!loaded || !recaps) return null;
  const color = cssColor('sauge-fort');

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} />
      <Pepite mood="curieux" lineContext={recaps.length ? 'recap' : undefined} text={recaps.length ? undefined : t.empty} size="sm" />
      <p className="text-muted">{t.intro}</p>

      <Card>
        <h2 className="font-extrabold mb-3">{t.chartTitle}</h2>
        <div className="flex gap-2 mb-3 flex-wrap" role="radiogroup" aria-label={t.chartTitle}>
          {(Object.keys(t.metrics) as Metric[]).map((m) => (
            <Chip key={m} selected={metric === m} onClick={() => setMetric(m)} className="!py-1 !min-h-[40px] text-sm">{t.metrics[m]}</Chip>
          ))}
        </div>
        {series.length < 1 ? <p className="text-muted">{t.chartEmpty}</p> : (
          <div className="h-52 -ml-4" role="img" aria-label={`${t.metrics[metric]} : ${series.map((s) => `${s.label} ${s[metric] ?? '—'}`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={cssColor('line')} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: cssColor('muted'), fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={metric === 'avgIntensity'} domain={metric === 'avgIntensity' ? [0, 10] : [0, 'auto']} tick={{ fill: cssColor('muted'), fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  formatter={(v: number) => [String(v).replace('.', ','), t.metrics[metric]]}
                  labelFormatter={(_, p) => (p?.[0] ? formatMonth(p[0].payload.month) : '')}
                  contentStyle={{ background: cssColor('surface'), border: `1px solid ${cssColor('line')}`, borderRadius: 12, color: cssColor('ink') }}
                />
                <Line type="monotone" dataKey={metric} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} connectNulls isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <section>
        <h2 className="font-extrabold mb-2">{t.listTitle}</h2>
        {recaps.length === 0 ? <Card><p className="text-muted">{t.empty}</p></Card> : (
          <ul className="space-y-2">
            {recaps.map((r) => (
              <li key={r.month}>
                <Link to={`/mois/${r.month}`} className="flex items-center justify-between rounded-2xl bg-surface border border-line px-4 min-h-touch py-3">
                  <span className="font-bold capitalize">{formatMonth(r.month)}</span>
                  <span className="text-sm text-muted">
                    {!r.seen && <span className="mr-2 rounded-full bg-peche/70 px-2 py-0.5 font-bold text-ink">{t.new}</span>}
                    {r.data.core.attacks} 🌧️ · {r.data.core.filledDays} 📝 ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/analyses" className="block text-center font-bold underline text-sauge-fort min-h-touch py-3">{t.toInsights}</Link>
    </main>
  );
}
