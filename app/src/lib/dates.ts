import { config } from '../config';

/** Jour local (Europe/Paris) au format YYYY-MM-DD, quel que soit le fuseau du téléphone. */
export function localDay(d: Date = new Date(), timeZone: string = config.timeZone): string {
  // en-CA donne directement YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Heure locale (0–23) à Paris. */
export function localHour(d: Date = new Date(), timeZone: string = config.timeZone): number {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(d));
}

/** Entre minuit et 4h, une saisie concerne souvent la veille (« C'est pour hier soir ? »). */
export function isLateNight(d: Date = new Date()): boolean {
  return localHour(d) < 4;
}

// --- Calculs sur des jours « YYYY-MM-DD » (en UTC à midi : pas de piège d'heure d'été) ---

const toUTC = (day: string) => new Date(`${day}T12:00:00Z`);
const fromUTC = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(day: string, n: number): string {
  const d = toUTC(day);
  d.setUTCDate(d.getUTCDate() + n);
  return fromUTC(d);
}

/** Nombre de jours entre deux dates (b - a). */
export function diffDays(a: string, b: string): number {
  return Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / 86400000);
}

/** 0 = lundi … 6 = dimanche */
export function weekdayMon0(day: string): number {
  return (toUTC(day).getUTCDay() + 6) % 7;
}

/** Lundi de la semaine du jour donné. */
export function weekStart(day: string): string {
  return addDays(day, -weekdayMon0(day));
}

export function monthOf(day: string): string {
  return day.slice(0, 7);
}

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1, 12));
  return d.toISOString().slice(0, 7);
}

/** Tous les jours d'un mois « YYYY-MM ». */
export function daysOfMonth(month: string): string[] {
  const first = `${month}-01`;
  const out: string[] = [];
  for (let d = first; monthOf(d) === month; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Jours entre a et b inclus. */
export function dayRange(a: string, b: string): string[] {
  const out: string[] = [];
  for (let d = a; d <= b; d = addDays(d, 1)) out.push(d);
  return out;
}

const longFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const monthFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const weekdayFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', timeZone: 'UTC' });

/** « mardi 14 octobre » */
export function formatDayLong(day: string): string {
  return longFmt.format(toUTC(day));
}
/** « octobre 2026 » */
export function formatMonth(month: string): string {
  return monthFmt.format(toUTC(`${month}-01`));
}
/** « mardi » */
export function formatWeekday(day: string): string {
  return weekdayFmt.format(toUTC(day));
}
