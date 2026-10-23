import type { Attack, AttackDayLog, DayEntry } from '../db/types';
import { localDay } from './dates';

export type DayStatus =
  | { kind: 'futur' }
  | { kind: 'vide' }
  | { kind: 'rempli' }
  | { kind: 'signaux' }
  | { kind: 'post-crise' }
  | { kind: 'crise'; intensity: number | null };

export interface CalendarData {
  entries: Map<string, DayEntry>;
  attacks: Attack[];
  attackLogs: AttackDayLog[];
  postdromeDays: Set<string>;
}

/** Bornes (jours locaux) des phases d'une crise. */
export function attackSpan(a: Attack, today: string) {
  const start = localDay(new Date(a.startAt));
  const painEnd = a.endAt ? localDay(new Date(a.endAt)) : today;
  const recovered = a.recoveredAt
    ? localDay(new Date(a.recoveredAt))
    : a.status === 'post-crise' ? today : painEnd;
  return { start, painEnd, recovered };
}

export function dayStatus(day: string, today: string, data: CalendarData): DayStatus {
  if (day > today) return { kind: 'futur' };

  for (const a of data.attacks) {
    const { start, painEnd } = attackSpan(a, today);
    if (day >= start && day <= painEnd) {
      const levels = data.attackLogs.filter((l) => l.attackId === a.id && l.date === day).map((l) => l.intensity);
      return { kind: 'crise', intensity: levels.length ? Math.max(...levels) : null };
    }
  }
  for (const a of data.attacks) {
    const { painEnd, recovered } = attackSpan(a, today);
    if (a.endAt && day > painEnd && day <= recovered) return { kind: 'post-crise' };
  }
  if (data.postdromeDays.has(day)) return { kind: 'post-crise' };

  const entry = data.entries.get(day);
  if (entry?.warningSigns?.length) return { kind: 'signaux' };
  if (entry) return { kind: 'rempli' };
  if (data.attackLogs.some((l) => l.date === day)) return { kind: 'rempli' };
  return { kind: 'vide' };
}

/** Jours qui comptent pour les objectifs : check-ins (rattrapés compris) + jours de crise remplis. */
export function filledDaysOf(entries: DayEntry[], attackLogs: AttackDayLog[], postdromeDates: string[]): Set<string> {
  return new Set([...entries.map((e) => e.date), ...attackLogs.map((l) => l.date), ...postdromeDates]);
}

export function intensityLevel(i: number | null): 'inconnue' | 'legere' | 'moyenne' | 'forte' {
  if (i === null) return 'inconnue';
  if (i < 4) return 'legere';
  if (i < 7) return 'moyenne';
  return 'forte';
}
