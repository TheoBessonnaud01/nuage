import type { Attack, AttackDayLog, Medication } from '../db/types';
import { diffDays, localDay } from './dates';

const HOUR = 3600000;

export interface AttackSummary {
  painHours: number | null;       // début → fin de la douleur
  postdromeHours: number | null;  // fin de la douleur → retour à 100 %
  totalHours: number | null;
  maxIntensity: number | null;
  meds: Medication[];
}

export function hoursBetween(a?: string, b?: string): number | null {
  if (!a || !b) return null;
  const h = (new Date(b).getTime() - new Date(a).getTime()) / HOUR;
  return h >= 0 ? Math.round(h * 10) / 10 : null;
}

export function summarizeAttack(a: Attack, logs: AttackDayLog[], meds: Medication[]): AttackSummary {
  const levels = logs.filter((l) => l.attackId === a.id && l.intensity !== undefined).map((l) => l.intensity as number);
  return {
    painHours: hoursBetween(a.startAt, a.endAt),
    postdromeHours: hoursBetween(a.endAt, a.recoveredAt),
    totalHours: hoursBetween(a.startAt, a.recoveredAt),
    maxIntensity: levels.length ? Math.max(...levels) : null,
    meds: meds.filter((m) => m.attackId === a.id).sort((x, y) => x.takenAt.localeCompare(y.takenAt)),
  };
}

/** « 5 h », « 1 j 3 h », « 45 min » */
export function formatDuration(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  const d = Math.floor(hours / 24);
  const h = Math.round(hours - d * 24);
  if (d === 0) return `${h} h`;
  return h ? `${d} j ${h} h` : `${d} j`;
}

/** Jour N de la crise (1 = le jour du début). */
export function attackDayNumber(a: Attack, now = new Date()): number {
  return diffDays(localDay(new Date(a.startAt)), localDay(now)) + 1;
}

/** Prises de plus de 2 h dont on n'a pas encore demandé l'efficacité. */
export function medsAwaitingFollowUp(meds: Medication[], now = new Date()): Medication[] {
  return meds.filter((m) => !m.efficacyAfter2h && now.getTime() - new Date(m.takenAt).getTime() >= 2 * HOUR);
}

export type Trend = 'baisse' | 'hausse' | 'stable';

export interface CrisisDigest {
  hoursSoFar: number;
  lastIntensity: number | null;
  firstIntensity: number | null;
  previousIntensity: number | null;
  trend: Trend | null;              // dernière note vs la précédente
  lastMed: Medication | null;
  avgPastPainHours: number | null;  // moyenne des crises terminées (au moins 2)
  pastRelief: string[];             // ce qui a le plus soulagé lors des crises passées (ids)
  worsenedNow: string[];            // ce qui aggrave d'après les notes de cette crise
  nausea: boolean;
}

/** Petite analyse de la crise en cours, pour le « mot de la fin » et le tableau de bord. */
export function digestCrisis(
  a: Attack, logs: AttackDayLog[], meds: Medication[],
  past: { attack: Attack; logs: AttackDayLog[] }[], now = new Date(),
): CrisisDigest {
  const mine = logs.filter((l) => l.attackId === a.id).sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
  const rated = mine.filter((l) => l.intensity !== undefined).map((l) => l.intensity as number);
  const last = rated.length ? rated[rated.length - 1] : null;
  const prev = rated.length > 1 ? rated[rated.length - 2] : null;
  const trend: Trend | null = last === null || prev === null ? null : last < prev ? 'baisse' : last > prev ? 'hausse' : 'stable';

  const finished = past.filter((p) => p.attack.id !== a.id && p.attack.endAt);
  const durations = finished.map((p) => hoursBetween(p.attack.startAt, p.attack.endAt)).filter((h): h is number => h !== null);
  const counts = new Map<string, number>();
  for (const p of finished) for (const id of new Set(p.logs.flatMap((l) => l.relievedBy))) counts.set(id, (counts.get(id) ?? 0) + 1);

  const myMeds = meds.filter((m) => m.attackId === a.id).sort((x, y) => x.takenAt.localeCompare(y.takenAt));
  return {
    hoursSoFar: Math.max(0, (now.getTime() - new Date(a.startAt).getTime()) / HOUR),
    lastIntensity: last,
    firstIntensity: rated.length ? rated[0] : null,
    previousIntensity: prev,
    trend,
    lastMed: myMeds.length ? myMeds[myMeds.length - 1] : null,
    avgPastPainHours: durations.length >= 2 ? Math.round((durations.reduce((s, h) => s + h, 0) / durations.length) * 10) / 10 : null,
    pastRelief: [...counts.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([id]) => id),
    worsenedNow: [...new Set(mine.flatMap((l) => l.worsenedBy))],
    nausea: mine.some((l) => l.symptoms.includes('nausees') || l.symptoms.includes('vomissements')),
  };
}
