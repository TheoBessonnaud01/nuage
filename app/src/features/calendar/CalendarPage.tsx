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
    case 'rempli': return 'grad-mint text-c-on-grad';
    case 'signaux': return 'grad-peach text-c-on-grad';
    case 'post-crise': return 'grad-sky text-c-on-grad';
    case 'crise': {
      const lvl = intensityLevel(s.intensity);
      return lvl === 'forte' ? 'day-crise-forte' : lvl === 'moyenne' ? 'day-crise-moyenne' : 'grad-lilac text-c-on-grad';
    }
    case 'vide': return 'border-2 border-dashed border-c-ink/15 text-c-ink';
    case 'futur': return 'text-c-muted/60';
  }
}

const legendItems: { kind: keyof typeof t.legend; cls: string }[] = [
  { kind: 'rempli', cls: 'grad-mint' },
  { kind: 'signaux', cls: 'grad-peach' },
  { kind: 'crise', cls: 'day-crise-legend' },
  { kind: 'post-crise', cls: 'grad-sky' },
  { kind: 'vide', cls: 'border-2 border-dashed border-c-ink/20' },
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
      <PageHeader title={t.title} noBack />

      <Card>
        <div className="flex items-center justify-between mb-3">
          <button type="button" aria-label={t.prev} onClick={() => setMonth(addMonths(month, -1))} className="min-h-touch min-w-touch rounded-full text-2xl">‹</button>
          <h2 className="font-display text-[19px] leading-tight font-semibold capitalize" aria-live="polite">{formatMonth(month)}</h2>
          <button type="button" aria-label={t.next} disabled={!canGoNext} onClick={() => setMonth(addMonths(month, 1))} className="min-h-touch min-w-touch rounded-full text-2xl disabled:opacity-20">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center" role="group" aria-label={formatMonth(month)}>
          {t.weekdays.map((w, i) => <div key={i} className="text-xs font-bold text-c-muted pb-1" aria-hidden>{w}</div>)}
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
                className={`press aspect-square rounded-2xl text-[15px] font-bold grid place-items-center ${statusClass(s)} ${isToday ? 'ring-2 ring-c-accent ring-offset-2 ring-offset-c-surface' : ''}`}
              >
                {Number(d.slice(8))}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-c-muted mt-3">{t.filledCount.replace('{n}', String(filled))}</p>
      </Card>

      <Card>
        <ul className="space-y-2">
          {legendItems.map((l) => (
            <li key={l.kind} className="flex items-center gap-3 text-[15px]">
              <span className={`w-6 h-6 rounded-2xl shrink-0 ${l.cls}`} aria-hidden />
              {t.legend[l.kind]}
            </li>
          ))}
        </ul>
        <p className="text-sm text-c-muted mt-3">{t.tapHint}</p>
      </Card>
    </main>
  );
}
