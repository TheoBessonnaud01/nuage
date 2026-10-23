import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { dayStatus, intensityLevel, type DayStatus } from '../../lib/calendar';
import { addMonths, daysOfMonth, formatDayLong, formatMonth, localDay, monthOf, weekdayMon0 } from '../../lib/dates';
import { useCalendarData } from '../../lib/useCalendarData';

const t = copy.calendar;

/** Classes de couleur par statut (douces ; jamais de rouge). */
export function statusClass(s: DayStatus): string {
  switch (s.kind) {
    case 'rempli': return 'bg-sauge/45 border-transparent';
    case 'signaux': return 'bg-peche/60 border-transparent';
    case 'post-crise': return 'bg-ciel/70 border-transparent';
    case 'crise': {
      const lvl = intensityLevel(s.intensity);
      return lvl === 'forte' ? 'bg-lavande border-transparent font-extrabold'
        : lvl === 'moyenne' ? 'bg-lavande/75 border-transparent'
        : 'bg-lavande/50 border-transparent';
    }
    case 'vide': return 'border-dashed border-muted/50';
    case 'futur': return 'border-transparent text-muted/50';
  }
}

const legendItems: { kind: keyof typeof t.legend; cls: string }[] = [
  { kind: 'rempli', cls: 'bg-sauge/45' },
  { kind: 'signaux', cls: 'bg-peche/60' },
  { kind: 'crise', cls: 'bg-gradient-to-r from-lavande/50 to-lavande' },
  { kind: 'post-crise', cls: 'bg-ciel/70' },
  { kind: 'vide', cls: 'border-2 border-dashed border-muted/50' },
];

export function CalendarPage() {
  const today = localDay();
  const [month, setMonth] = useState(monthOf(today));
  const data = useCalendarData();
  const navigate = useNavigate();

  const days = daysOfMonth(month);
  const offset = weekdayMon0(days[0]);
  const filled = data ? days.filter((d) => ['rempli', 'signaux', 'crise', 'post-crise'].includes(dayStatus(d, today, data).kind)).length : 0;
  const canGoNext = month < monthOf(today);

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} />

      <Card>
        <div className="flex items-center justify-between mb-3">
          <button type="button" aria-label={t.prev} onClick={() => setMonth(addMonths(month, -1))} className="min-h-touch min-w-touch rounded-full text-2xl">‹</button>
          <h2 className="text-lg font-extrabold capitalize" aria-live="polite">{formatMonth(month)}</h2>
          <button type="button" aria-label={t.next} disabled={!canGoNext} onClick={() => setMonth(addMonths(month, 1))} className="min-h-touch min-w-touch rounded-full text-2xl disabled:opacity-20">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center" role="grid" aria-label={formatMonth(month)}>
          {t.weekdays.map((w, i) => <div key={i} className="text-xs font-bold text-muted pb-1" aria-hidden>{w}</div>)}
          {Array.from({ length: offset }, (_, i) => <div key={`o${i}`} />)}
          {days.map((d) => {
            const s = data ? dayStatus(d, today, data) : { kind: 'vide' as const };
            const isToday = d === today;
            return (
              <button
                key={d}
                type="button"
                disabled={s.kind === 'futur'}
                onClick={() => navigate(`/jour/${d}`)}
                aria-label={`${formatDayLong(d)} : ${s.kind === 'futur' ? '' : t.legend[s.kind]}`}
                className={`aspect-square rounded-xl border-2 text-[15px] font-bold grid place-items-center ${statusClass(s)} ${isToday ? 'ring-2 ring-sauge-fort ring-offset-2 ring-offset-surface' : ''}`}
              >
                {Number(d.slice(8))}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted mt-3">{t.filledCount.replace('{n}', String(filled))}</p>
      </Card>

      <Card>
        <ul className="space-y-2">
          {legendItems.map((l) => (
            <li key={l.kind} className="flex items-center gap-3 text-[15px]">
              <span className={`w-6 h-6 rounded-md shrink-0 ${l.cls}`} aria-hidden />
              {t.legend[l.kind]}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted mt-3">{t.tapHint}</p>
      </Card>
    </main>
  );
}
