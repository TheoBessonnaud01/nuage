// Analyses « Ce que tes données racontent ». Fonctions pures, testées (insights.test.ts).
// Règle : on observe des coïncidences, on ne prouve jamais de cause.
import { factors as defaultFactors, warningSigns as defaultSigns, crisisSymptoms, postdromeSymptoms, labelOf } from '../content/factors';
import type { Attack, AttackDayLog, DayEntry, Medication, PostdromeLog } from '../db/types';
import { attackSpan, filledDaysOf } from './calendar';
import { addDays, dayRange, diffDays, localDay } from './dates';
import { hoursBetween } from './attacks';

export interface InsightsData {
  entries: DayEntry[];
  attacks: Attack[];
  logs: AttackDayLog[];
  meds: Medication[];
  postLogs: PostdromeLog[];
  customFactors: string[];
}

export interface Range { start: string; end: string } // jours inclus

export const UNLOCK = { days: 21, attacks: 2 };
export const MIN_OCCURRENCES = 3;
/** Repères « jours de traitement » à l'approche des seuils médicaux (15 et 10 jours/mois). */
export const MED_ALERT = { simple: 12, specific: 8 };

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round1 = (x: number | null) => (x === null ? null : Math.round(x * 10) / 10);
const startDay = (a: Attack) => localDay(new Date(a.startAt));
const inRange = (d: string, r: Range) => d >= r.start && d <= r.end;

// ---------- Déblocage ----------

export function unlockProgress(data: InsightsData) {
  const days = filledDaysOf(data.entries, data.logs, data.postLogs.map((p) => p.date)).size;
  const attacks = data.attacks.length;
  return {
    days, attacks,
    missingDays: Math.max(0, UNLOCK.days - days),
    missingAttacks: Math.max(0, UNLOCK.attacks - attacks),
    unlocked: days >= UNLOCK.days && attacks >= UNLOCK.attacks,
  };
}

// ---------- Chiffres clés ----------

export interface KeyFigures {
  attacks: number;
  migraineDays: number;
  migraineDaysPerMonth: number;
  avgPainHours: number | null;
  avgPostHours: number | null;
  avgIntensity: number | null;   // moyenne des intensités max de chaque crise
  maxIntensity: number | null;
  auraPercent: number | null;
  filledDays: number;
}

export function attackMax(a: Attack, logs: AttackDayLog[]): number | null {
  const v = logs.filter((l) => l.attackId === a.id && l.intensity !== undefined).map((l) => l.intensity as number);
  return v.length ? Math.max(...v) : null;
}

/** Jours de migraine (phase douloureuse) dans la période. */
export function migraineDaysIn(attacks: Attack[], r: Range, today: string): Set<string> {
  const out = new Set<string>();
  for (const a of attacks) {
    const { start, painEnd } = attackSpan(a, today);
    for (const d of dayRange(start > r.start ? start : r.start, painEnd < r.end ? painEnd : r.end)) out.add(d);
  }
  return out;
}

export function keyFigures(data: InsightsData, r: Range, today = localDay()): KeyFigures {
  const attacks = data.attacks.filter((a) => inRange(startDay(a), r));
  const migraineDays = migraineDaysIn(data.attacks, r, today).size;
  const months = Math.max(1, (diffDays(r.start, r.end) + 1) / 30.4);
  const maxes = attacks.map((a) => attackMax(a, data.logs)).filter((x): x is number => x !== null);
  const pain = attacks.map((a) => hoursBetween(a.startAt, a.endAt)).filter((x): x is number => x !== null);
  const post = attacks.map((a) => hoursBetween(a.endAt, a.recoveredAt)).filter((x): x is number => x !== null);
  const filled = [...filledDaysOf(data.entries, data.logs, data.postLogs.map((p) => p.date))].filter((d) => inRange(d, r));
  return {
    attacks: attacks.length,
    migraineDays,
    migraineDaysPerMonth: round1(migraineDays / months) ?? 0,
    avgPainHours: round1(mean(pain)),
    avgPostHours: round1(mean(post)),
    avgIntensity: round1(mean(maxes)),
    maxIntensity: maxes.length ? Math.max(...maxes) : null,
    auraPercent: attacks.length ? Math.round((attacks.filter((a) => a.hadAura === 'oui').length / attacks.length) * 100) : null,
    filledDays: filled.length,
  };
}

// ---------- Facteurs avant les crises ----------

/** Présence d'un facteur un jour donné : true / false / null (inconnu = question non répondue). */
export function factorValue(id: string, e: DayEntry, prev?: DayEntry): boolean | null {
  const sensory = (k: string) => (e.sensoryExposure ? e.sensoryExposure.includes(k) : e.screens !== undefined ? false : null);
  switch (id) {
    case 'sommeil-manque': return e.sleepHours === undefined ? null : e.sleepHours < 6 || e.sleepHours >= 10;
    case 'sommeil-qualite': return e.sleepQuality === undefined ? null : e.sleepQuality <= 2;
    case 'stress': return e.stress === undefined ? null : e.stress >= 4;
    case 'detente': return e.stress === undefined || prev?.stress === undefined ? null : e.stress <= 2 && prev.stress >= 4;
    case 'repas': return e.mealsSkippedOrLate ?? null;
    case 'peu-bu': return e.hydration === undefined ? null : e.hydration === 'peu';
    case 'alcool': return e.alcohol ?? null;
    case 'cafeine-plus': return e.caffeine === undefined ? null : e.caffeine === 'plus';
    case 'cafeine-moins': return e.caffeine === undefined ? null : e.caffeine === 'moins';
    case 'ecrans': return e.screens === undefined ? null : e.screens === 'beaucoup';
    case 'lumiere': case 'bruit': case 'odeurs': return sensory(id);
    case 'effort': return e.physicalEffort === undefined ? null : e.physicalEffort === 'intense';
    case 'voyage': return e.routineChange ?? null;
    case 'meteo': return e.weather ? Math.abs(e.weather.pressureDelta) >= 5 : null;
    case 'chaleur': return e.weather ? e.weather.tempMax >= 28 : null;
    default: // facteur perso
      return e.customFactors ? e.customFactors[id] ?? false : null;
  }
}

/** Les 48 h avant chaque crise = la veille et l'avant-veille de son début. */
export function daysBeforeAttacks(attacks: Attack[]): Set<string> {
  const out = new Set<string>();
  for (const a of attacks) { const d0 = startDay(a); out.add(addDays(d0, -1)); out.add(addDays(d0, -2)); }
  return out;
}

export interface FactorStat {
  id: string;
  label: string;
  before: number; beforeKnown: number;
  other: number; otherKnown: number;
  pBefore: number; pOther: number;
  ratio: number | null;   // null = jamais les autres jours (on ne peut pas diviser)
  level: 'plus' | 'pareil' | 'moins';
}

export function factorsBeforeAttacks(data: InsightsData, r: Range, today = localDay()): FactorStat[] {
  const attacks = data.attacks.filter((a) => inRange(startDay(a), r));
  const before = daysBeforeAttacks(attacks);
  const crisisDays = migraineDaysIn(data.attacks, { start: r.start, end: r.end }, today);
  const byDate = new Map(data.entries.map((e) => [e.date, e]));
  const ids = [...defaultFactors.map((f) => f.id), ...data.customFactors];
  const out: FactorStat[] = [];

  for (const id of ids) {
    let b = 0, bk = 0, o = 0, ok = 0;
    for (const e of data.entries) {
      if (!inRange(e.date, { start: addDays(r.start, -2), end: r.end })) continue;
      const v = factorValue(id, e, byDate.get(addDays(e.date, -1)));
      if (v === null) continue;
      if (before.has(e.date)) { bk++; if (v) b++; } else if (!crisisDays.has(e.date) && inRange(e.date, r)) { ok++; if (v) o++; }
    }
    if (b + o < MIN_OCCURRENCES || bk === 0 || ok === 0) continue;
    const pBefore = b / bk;
    const pOther = o / ok;
    const ratio = pOther === 0 ? null : pBefore / pOther;
    const level = ratio === null ? (pBefore > 0 ? 'plus' : 'pareil') : ratio >= 1.5 ? 'plus' : ratio <= 0.67 ? 'moins' : 'pareil';
    out.push({
      id, label: labelOf(defaultFactors, id), before: b, beforeKnown: bk, other: o, otherKnown: ok,
      pBefore, pOther, ratio: ratio === null ? null : Math.round(ratio * 10) / 10, level,
    });
  }
  const score = (f: FactorStat) => (f.ratio === null ? (f.pBefore > 0 ? 1000 + f.pBefore : 0) : f.ratio);
  return out.sort((x, y) => score(y) - score(x) || y.before - x.before);
}

// ---------- Petits signaux d'avant ----------

export interface SignStat { id: string; label: string; attacks: number; percent: number }

export function warningSignsBefore(data: InsightsData, r: Range) {
  const attacks = data.attacks.filter((a) => inRange(startDay(a), r));
  const byDate = new Map(data.entries.map((e) => [e.date, e]));
  const counts = new Map<string, number>();
  const delays: number[] = [];
  for (const a of attacks) {
    const d0 = startDay(a);
    const window = [addDays(d0, -2), addDays(d0, -1), d0];
    const seen = new Set<string>();
    let earliest: string | null = null;
    for (const d of window) {
      const signs = byDate.get(d)?.warningSigns ?? [];
      if (signs.length && !earliest) earliest = d;
      signs.forEach((s) => seen.add(s));
    }
    seen.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1));
    if (earliest) delays.push(diffDays(earliest, d0));
  }
  const signs: SignStat[] = [...counts.entries()]
    .map(([id, n]) => ({ id, label: labelOf(defaultSigns, id), attacks: n, percent: Math.round((n / attacks.length) * 100) }))
    .sort((x, y) => y.attacks - x.attacks);
  return { signs, avgDelayDays: round1(mean(delays)), attacksWithSigns: delays.length, attacks: attacks.length };
}

// ---------- Symptômes ----------

export function symptomStats(data: InsightsData, r: Range) {
  const attacks = data.attacks.filter((a) => inRange(startDay(a), r));
  const ids = new Set(attacks.map((a) => a.id));
  const count = (pairs: [string, string][], list: typeof crisisSymptoms) => {
    const m = new Map<string, Set<string>>();
    for (const [attackId, s] of pairs) { if (!m.has(s)) m.set(s, new Set()); m.get(s)!.add(attackId); }
    return [...m.entries()]
      .map(([id, set]) => ({ id, label: labelOf(list, id), attacks: set.size, percent: attacks.length ? Math.round((set.size / attacks.length) * 100) : 0 }))
      .sort((x, y) => y.attacks - x.attacks);
  };
  const crisis = count(data.logs.filter((l) => ids.has(l.attackId)).flatMap((l) => l.symptoms.map((s) => [l.attackId, s] as [string, string])), crisisSymptoms);
  const post = count(data.postLogs.filter((p) => ids.has(p.attackId)).flatMap((p) => p.symptoms.map((s) => [p.attackId, s] as [string, string])), postdromeSymptoms);
  return { crisis, post, attacks: attacks.length };
}

// ---------- Traitements ----------

const efficacyScore = { aucune: 0, 'un peu': 1, bien: 2, totalement: 3 } as const;

export function treatmentStats(data: InsightsData, r: Range) {
  const meds = data.meds.filter((m) => inRange(localDay(new Date(m.takenAt)), r));
  const months = Math.max(1, (diffDays(r.start, r.end) + 1) / 30.4);
  const cats = new Map<string, { days: Set<string>; scores: number[] }>();
  for (const m of meds) {
    const c = cats.get(m.category) ?? { days: new Set(), scores: [] };
    c.days.add(localDay(new Date(m.takenAt)));
    if (m.efficacyAfter2h) c.scores.push(efficacyScore[m.efficacyAfter2h]);
    cats.set(m.category, c);
  }
  const allDays = new Set(meds.map((m) => localDay(new Date(m.takenAt))));
  return {
    totalDays: allDays.size,
    daysPerMonth: round1(allDays.size / months) ?? 0,
    byCategory: [...cats.entries()].map(([category, c]) => ({
      category,
      days: c.days.size,
      daysPerMonth: round1(c.days.size / months) ?? 0,
      avgEfficacy: round1(mean(c.scores)), // 0 = aucune … 3 = totalement
    })).sort((x, y) => y.days - x.days),
  };
}

/** Repère « jours de traitement » sur le mois en cours (aucune alarme : une invitation à en parler). */
export function medicationDaysThisMonth(meds: Medication[], today = localDay()) {
  const month = today.slice(0, 7);
  const days = (cats: string[]) => new Set(meds.filter((m) => cats.includes(m.category) && localDay(new Date(m.takenAt)).startsWith(month)).map((m) => localDay(new Date(m.takenAt)))).size;
  const simple = days(['antalgique simple', 'anti-inflammatoire']);
  const specific = days(['triptan', 'association']);
  return { simple, specific, alert: simple >= MED_ALERT.simple || specific >= MED_ALERT.specific };
}

// ---------- Météo ----------

export function weatherStats(data: InsightsData, r: Range) {
  const starts = new Set(data.attacks.filter((a) => inRange(startDay(a), r)).map(startDay));
  const withW = data.entries.filter((e) => e.weather && inRange(e.date, r));
  const crisis = withW.filter((e) => starts.has(e.date));
  const other = withW.filter((e) => !starts.has(e.date));
  if (crisis.length < 2 || other.length < 2) return null;
  const avg = (xs: DayEntry[], f: (e: DayEntry) => number) => round1(mean(xs.map(f)))!;
  return {
    crisisDays: crisis.length,
    pressureCrisis: avg(crisis, (e) => e.weather!.pressureMean),
    pressureOther: avg(other, (e) => e.weather!.pressureMean),
    deltaCrisis: avg(crisis, (e) => Math.abs(e.weather!.pressureDelta)),
    deltaOther: avg(other, (e) => Math.abs(e.weather!.pressureDelta)),
  };
}

/** Période glissante de N mois se terminant aujourd'hui. */
export function periodRange(months: number, today = localDay()): Range {
  return { start: addDays(today, -Math.round(months * 30.4) + 1), end: today };
}
