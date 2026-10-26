// Récap mensuel (« Mes mois »). Calcul pur et testé ; le stockage est fait dans useRecaps.
import type { MonthlyRecap } from '../db/types';
import { dayStatus, type CalendarData } from './calendar';
import { addMonths, daysOfMonth, localDay, monthOf } from './dates';
import { factorsBeforeAttacks, keyFigures, symptomStats, treatmentStats, warningSignsBefore, type InsightsData, type Range } from './insights';

export interface CoreStats {
  filledDays: number;
  attacks: number;
  migraineDays: number;
  avgIntensity: number | null;
  avgPainHours: number | null;
  avgPostHours: number | null;
}

export type Compare = 'plus' | 'moins' | 'stable';

export interface RecapData {
  month: string;
  tone: 'peu' | 'calme' | 'charge';
  core: CoreStats;
  prev: CoreStats | null;
  avg3: CoreStats | null;
  topFactors: string[];        // libellés
  topSigns: string[];
  topPostdrome: string[];
  medDaysByCategory: { category: string; days: number }[];
  calendar: { date: string; kind: string; intensity: number | null }[];
  victory: { key: 'zero' | 'beaucoup' | 'regulier' | 'unpeu'; n: number };
  tier: { label: string; emoji: string } | null;
}

export const monthRange = (month: string): Range => {
  const days = daysOfMonth(month);
  return { start: days[0], end: days[days.length - 1] };
};

export function coreStats(data: InsightsData, month: string, today: string): CoreStats {
  const k = keyFigures(data, monthRange(month), today);
  return {
    filledDays: k.filledDays, attacks: k.attacks, migraineDays: k.migraineDays,
    avgIntensity: k.avgIntensity, avgPainHours: k.avgPainHours, avgPostHours: k.avgPostHours,
  };
}

function averageCore(list: CoreStats[]): CoreStats | null {
  if (!list.length) return null;
  const avg = (f: (c: CoreStats) => number | null) => {
    const v = list.map(f).filter((x): x is number => x !== null);
    return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
  };
  return {
    filledDays: avg((c) => c.filledDays) ?? 0, attacks: avg((c) => c.attacks) ?? 0, migraineDays: avg((c) => c.migraineDays) ?? 0,
    avgIntensity: avg((c) => c.avgIntensity), avgPainHours: avg((c) => c.avgPainHours), avgPostHours: avg((c) => c.avgPostHours),
  };
}

/** Comparaison neutre : « plus », « moins » ou « stable » (écart de moins de 10 % = stable). */
export function compare(now: number | null, ref: number | null): Compare | null {
  if (now === null || ref === null) return null;
  if (ref === 0) return now === 0 ? 'stable' : 'plus';
  const r = (now - ref) / ref;
  return Math.abs(r) < 0.1 ? 'stable' : r > 0 ? 'plus' : 'moins';
}

export function buildRecap(
  data: InsightsData, cal: CalendarData, month: string, today: string,
  tier: { label: string; emoji: string } | null = null,
): RecapData {
  const r = monthRange(month);
  const core = coreStats(data, month, today);
  const hasData = (m: string) => coreStats(data, m, today).filledDays > 0 || data.attacks.some((a) => monthOf(localDay(new Date(a.startAt))) === m);
  const prevMonth = addMonths(month, -1);
  const prev = hasData(prevMonth) ? coreStats(data, prevMonth, today) : null;
  const last3 = [1, 2, 3].map((n) => addMonths(month, -n)).filter(hasData).map((m) => coreStats(data, m, today));

  const tone: RecapData['tone'] = core.filledDays < 5 && core.attacks === 0 ? 'peu'
    : prev && (core.attacks > prev.attacks || core.migraineDays >= prev.migraineDays + 2) ? 'charge'
    : !prev && core.attacks >= 3 ? 'charge'
    : 'calme';

  const factors = factorsBeforeAttacks(data, r, today).filter((f) => f.level === 'plus' && f.before > 0).slice(0, 3).map((f) => f.label);
  const signs = warningSignsBefore(data, r).signs.slice(0, 3).map((s) => s.label);
  const post = symptomStats(data, r).post.slice(0, 3).map((s) => s.label);
  const meds = treatmentStats(data, r).byCategory.map((c) => ({ category: c.category, days: c.days }));

  const victory: RecapData['victory'] =
    core.filledDays >= 15 ? { key: 'beaucoup', n: core.filledDays }
    : core.attacks === 0 && core.filledDays > 0 ? { key: 'zero', n: core.filledDays }
    : core.filledDays >= 8 ? { key: 'regulier', n: core.filledDays }
    : { key: 'unpeu', n: core.filledDays };

  return {
    month, tone, core, prev, avg3: averageCore(last3),
    topFactors: factors, topSigns: signs, topPostdrome: post, medDaysByCategory: meds,
    calendar: daysOfMonth(month).map((date) => {
      const s = dayStatus(date, today, cal);
      return { date, kind: s.kind, intensity: s.kind === 'crise' ? s.intensity : null };
    }),
    victory, tier,
  };
}

/** Mois écoulés à récapituler : le mois dernier, s'il contient des données et n'a pas encore de récap. */
export function monthsToGenerate(data: InsightsData, existing: string[], today: string): string[] {
  const last = addMonths(monthOf(today), -1);
  if (existing.includes(last)) return [];
  const filled = coreStats(data, last, today).filledDays;
  const attacks = data.attacks.some((a) => monthOf(localDay(new Date(a.startAt))) === last);
  return filled > 0 || attacks ? [last] : [];
}

export const toStored = (r: RecapData): MonthlyRecap => ({ month: r.month, generatedAt: new Date().toISOString(), data: r as unknown as Record<string, unknown>, seen: false });
