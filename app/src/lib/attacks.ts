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
