import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, PageHeader, Segmented } from '../../components/ui';
import { copy } from '../../content/copy';
import { cssColor } from '../../lib/cssColor';
import { addMonths, formatMonth, localDay, monthOf } from '../../lib/dates';
import { coreStats } from '../../lib/recap';
import { useInsightsData, useRecaps } from '../../lib/useInsights';
import { Pepite } from '../../mascot/Pepite';
import { Icon } from '../../ui/Icon';
import { EvolutionTabs } from '../insights/EvolutionTabs';

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
  const color = cssColor('c-accent');

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} noBack />
      <EvolutionTabs active="mois" />
      <Pepite mood="curieux" lineContext={recaps.length ? 'recap' : undefined} text={recaps.length ? undefined : t.empty} size="sm" />
      <p className="text-c-muted">{t.intro}</p>

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold mb-3">{t.chartTitle}</h2>
        <div className="mb-3"><Segmented label={t.chartTitle} value={metric} onChange={setMetric} options={(Object.keys(t.metrics) as Metric[]).map((m) => ({ value: m, label: t.metricsShort[m] }))} /></div>
        {series.length < 1 ? <p className="text-c-muted">{t.chartEmpty}</p> : (
          <div className="h-52 -ml-4" role="img" aria-label={`${t.metrics[metric]} : ${series.map((s) => `${s.label} ${s[metric] ?? '—'}`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={cssColor('c-line')} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: cssColor('c-muted'), fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={metric === 'avgIntensity'} domain={metric === 'avgIntensity' ? [0, 10] : [0, 'auto']} tick={{ fill: cssColor('c-muted'), fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  formatter={(v: number) => [String(v).replace('.', ','), t.metrics[metric]]}
                  labelFormatter={(_, p) => (p?.[0] ? formatMonth(p[0].payload.month) : '')}
                  contentStyle={{ background: cssColor('c-surface'), border: `1px solid ${cssColor('c-line')}`, borderRadius: 12, color: cssColor('c-ink') }}
                />
                <Line type="monotone" dataKey={metric} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} connectNulls isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <section>
        <h2 className="font-display text-[19px] leading-tight font-semibold mb-2">{t.listTitle}</h2>
        {recaps.length === 0 ? <Card><p className="text-c-muted">{t.empty}</p></Card> : (
          <ul className="space-y-2">
            {recaps.map((r) => (
              <li key={r.month}>
                <Link to={`/mois/${r.month}`} className="field flex items-center justify-between py-3">
                  <span className="font-bold capitalize">{formatMonth(r.month)}</span>
                  <span className="text-sm text-c-muted inline-flex items-center">
                    {!r.seen && <span className="mr-2 rounded-full grad-peach px-2 py-0.5 font-bold text-c-ink">{t.new}</span>}
                    <span className="inline-flex items-center gap-1"><Icon name="rain" size={15} />{r.data.core.attacks}</span> <span className="inline-flex items-center gap-1 ml-2"><Icon name="leaf" size={15} />{r.data.core.filledDays}</span> <Icon name="chevron-right" size={16} className="inline ml-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/analyses" className="block text-center font-bold underline text-c-accent min-h-touch py-3">{t.toInsights}</Link>
    </main>
  );
}
