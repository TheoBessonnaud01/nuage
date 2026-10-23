import { Link, Navigate, useParams } from 'react-router-dom';
import { Button, Card, PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { labelOf, sensoryExposure, warningSigns } from '../../content/factors';
import { checkinScreens } from '../../content/questions';
import type { DayEntry } from '../../db/types';
import { dayStatus } from '../../lib/calendar';
import { formatDayLong, localDay } from '../../lib/dates';
import { useCalendarData } from '../../lib/useCalendarData';

const t = copy.day;

/** Libellé d'une réponse à choix, à partir des définitions des questions. */
function choiceLabel(field: keyof DayEntry, value: unknown): string {
  for (const s of checkinScreens) for (const p of s.parts) {
    if (p.field === field && (p.kind === 'choice' || p.kind === 'scale')) {
      const o = (p.options as { value: unknown; label: string; emoji?: string }[]).find((x) => x.value === value);
      if (o) return [o.emoji, o.label].filter(Boolean).join(' ');
    }
  }
  return String(value);
}

function rows(e: DayEntry): [string, string][] {
  const out: [string, string][] = [];
  const s = t.sections;
  const add = (label: string, v: string | undefined | false) => { if (v) out.push([label, v]); };
  add(s.sleep, [e.sleepHours !== undefined && `${String(e.sleepHours).replace('.', ',')} h`, e.sleepQuality && choiceLabel('sleepQuality', e.sleepQuality)].filter(Boolean).join(' · '));
  add(s.stress, e.stress !== undefined && choiceLabel('stress', e.stress));
  add(s.energy, e.energy !== undefined && choiceLabel('energy', e.energy));
  add(s.mood, e.mood !== undefined && choiceLabel('mood', e.mood));
  add(s.meals, e.mealsSkippedOrLate !== undefined && (e.mealsSkippedOrLate ? t.yes : t.no));
  add(s.hydration, e.hydration && choiceLabel('hydration', e.hydration));
  add(s.caffeine, e.caffeine && choiceLabel('caffeine', e.caffeine));
  add(s.alcohol, e.alcohol !== undefined && (e.alcohol ? t.yes : t.no));
  add(s.screens, e.screens && choiceLabel('screens', e.screens));
  add(s.sensory, e.sensoryExposure?.length ? e.sensoryExposure.map((id) => labelOf(sensoryExposure, id)).join(', ') : undefined);
  add(s.effort, e.physicalEffort && choiceLabel('physicalEffort', e.physicalEffort));
  add(s.routine, e.routineChange !== undefined && (e.routineChange ? t.yes : t.no));
  add(s.signs, e.warningSigns?.length ? e.warningSigns.map((id) => labelOf(warningSigns, id)).join(', ') : undefined);
  const custom = Object.entries(e.customFactors ?? {}).filter(([, v]) => v).map(([k]) => k);
  add(s.custom, custom.length ? custom.join(', ') : undefined);
  add(s.headache, e.headacheToday && choiceLabel('headacheToday', e.headacheToday));
  add(s.note, e.note);
  if (e.weather) {
    const d = e.weather.pressureDelta;
    add(s.weather, t.weather.replace('{t}', String(e.weather.tempMax).replace('.', ','))
      .replace('{p}', String(Math.round(e.weather.pressureMean)))
      .replace('{d}', `${d > 0 ? '+' : ''}${String(d).replace('.', ',')}`)
      .replace('{h}', String(e.weather.humidity)));
  }
  return out;
}

export function DayPage() {
  const { date = '' } = useParams();
  const today = localDay();
  const data = useCalendarData();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today) return <Navigate to="/calendrier" replace />;
  if (!data) return null;

  const entry = data.entries.get(date);
  const status = dayStatus(date, today, data);

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={formatDayLong(date)} backTo="/calendrier" />

      {(status.kind === 'crise' || status.kind === 'post-crise') && (
        <Card tone={status.kind === 'crise' ? 'bg-lavande/50' : 'bg-ciel/60'}>
          <p className="font-extrabold">{status.kind === 'crise' ? t.crisis : t.postCrisis}</p>
        </Card>
      )}

      {entry ? (
        <Card>
          {entry.filledLate && <p className="text-sm text-muted mb-3">{t.filledLate}</p>}
          <dl className="space-y-3">
            {rows(entry).map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm font-bold text-muted">{k}</dt>
                <dd className="text-[17px]">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ) : (
        <Card><p>{t.empty}</p></Card>
      )}

      <Link to={`/checkin/${date}`} className="block">
        <Button tabIndex={-1}>{entry ? t.edit : t.fill}</Button>
      </Link>
    </main>
  );
}
