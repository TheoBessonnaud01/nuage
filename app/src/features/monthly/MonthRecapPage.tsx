import { useEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button, Card, PageHeader } from '../../components/ui';
import { shareOrDownload } from '../../lib/share';
import { useSettings } from '../../lib/useSettings';
import { copy } from '../../content/copy';
import { medicationCategories } from '../../content/factors';
import { formatDuration } from '../../lib/attacks';
import type { DayStatus } from '../../lib/calendar';
import { formatMonth, weekdayMon0 } from '../../lib/dates';
import { compare, type CoreStats } from '../../lib/recap';
import { markRecapSeen, useRecaps } from '../../lib/useInsights';
import { Pepite } from '../../mascot/Pepite';
import { tiers } from '../../lib/goals';
import { GrowthStage } from '../../ui/Garden';
import { statusClass } from '../calendar/CalendarPage';

const t = copy.recap;
const tierStage = (label: string) => tiers.find((x) => x.label === label)?.id;
const num = (x: number | null) => (x === null ? '—' : String(x).replace('.', ','));

function Cmp({ now, base, label }: { now: number | null; base: number | null | undefined; label: string }) {
  const c = base === undefined ? null : compare(now, base);
  return <span className="block text-xs text-c-muted">{c ? `${t.cmp[c]} ${label}` : ''}</span>;
}

export function MonthRecapPage() {
  const { month = '' } = useParams();
  const recaps = useRecaps();
  const settings = useSettings();
  const recap = recaps?.find((r) => r.month === month);
  useEffect(() => { if (recap && !recap.seen) markRecapSeen(month); }, [recap, month]);
  const opening = useMemo(() => {
    if (!recap) return '';
    const list = t.openings[recap.data.tone];
    return list[Math.floor(Math.random() * list.length)];
  }, [recap]);

  if (!recaps) return null;
  if (!recap) return <Navigate to="/mois" replace />;
  const d = recap.data;

  const stats: { label: string; key: keyof CoreStats; fmt: (v: number | null) => string }[] = [
    { label: t.attacks, key: 'attacks', fmt: num },
    { label: t.migraineDays, key: 'migraineDays', fmt: num },
    { label: t.intensity, key: 'avgIntensity', fmt: (v) => (v === null ? '—' : `${num(v)}/10`) },
    { label: t.pain, key: 'avgPainHours', fmt: formatDuration },
    { label: t.post, key: 'avgPostHours', fmt: formatDuration },
  ];
  const lists: [string, string[]][] = [[t.topFactors, d.topFactors], [t.topSigns, d.topSigns], [t.topPost, d.topPostdrome]];
  const offset = weekdayMon0(d.calendar[0].date);

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title.replace('{mois}', formatMonth(month))} backTo="/mois" />
      <Pepite mood={d.tone === 'charge' ? 'calin' : 'curieux'} text={opening} size="sm" importantBubble tappable={false} />

      <div className="grid grid-cols-2 gap-3">
        <Card className="!p-4">
          <p className="text-sm font-bold text-c-muted">{t.filled}</p>
          <p className="font-display text-[26px] leading-none font-semibold mt-1">{d.core.filledDays}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm font-bold text-c-muted">{t.tier}</p>
          <p className="font-display text-[22px] font-semibold flex items-center gap-2">{d.tier ? <>{tierStage(d.tier.label) && <GrowthStage stage={tierStage(d.tier.label)!} size={32} />}{d.tier.label}</> : '—'}</p>
        </Card>
        {stats.map((s) => (
          <Card key={s.key} className="!p-4">
            <p className="text-sm font-bold text-c-muted leading-tight">{s.label}</p>
            <p className="font-display text-[26px] leading-none font-semibold mt-1">{s.fmt(d.core[s.key])}</p>
            <Cmp now={d.core[s.key]} base={d.prev ? d.prev[s.key] : undefined} label={t.vsPrev} />
            <Cmp now={d.core[s.key]} base={d.avg3 ? d.avg3[s.key] : undefined} label={t.vs3} />
          </Card>
        ))}
      </div>

      <Card className="space-y-3">
        {lists.map(([title, items]) => (
          <div key={title}>
            <h2 className="font-display text-[19px] leading-tight font-semibold">{title}</h2>
            <p className="text-[15px]">{items.length ? items.join(' · ') : <span className="text-c-muted">{t.noneNoted}</span>}</p>
          </div>
        ))}
        <div>
          <h2 className="font-display text-[19px] leading-tight font-semibold">{t.meds}</h2>
          <p className="text-[15px]">
            {d.medDaysByCategory.length
              ? d.medDaysByCategory.map((m) => `${medicationCategories.find((c) => c.value === m.category)?.label ?? m.category} : ${m.days} j`).join(' · ')
              : <span className="text-c-muted">{t.noneNoted}</span>}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold mb-3">{t.calendar}</h2>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {copy.calendar.weekdays.map((w, i) => <div key={i} className="font-bold text-c-muted" aria-hidden>{w}</div>)}
          {Array.from({ length: offset }, (_, i) => <div key={`o${i}`} />)}
          {d.calendar.map((c) => (
            <div key={c.date} className={`aspect-square rounded-2xl border-2 grid place-items-center font-bold ${statusClass({ kind: c.kind, intensity: c.intensity } as DayStatus)}`}>
              {Number(c.date.slice(8))}
            </div>
          ))}
        </div>
      </Card>

      <Card tone="grad-peach">
        <h2 className="font-display text-[19px] leading-tight font-semibold">{t.victoryTitle}</h2>
        <p className="mt-1">{t.victory[d.victory.key].replace('{n}', String(d.victory.n))}</p>
      </Card>

      <Button variant="secondary" onClick={async () => {
        const { recapPdf } = await import('../../lib/pdf');
        await shareOrDownload([{ name: `nuage-recap-${month}.pdf`, blob: recapPdf(d, settings?.firstName ?? '') }], t.title.replace('{mois}', formatMonth(month)));
      }}>{copy.data.recapPdf}</Button>
      <p className="text-sm text-c-muted text-center">{t.disclaimer}</p>
    </main>
  );
}
