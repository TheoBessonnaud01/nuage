import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSettings } from '../db/db';
import type { CalendarData } from './calendar';
import { addMonths, localDay, monthOf } from './dates';
import type { InsightsData } from './insights';
import { buildRecap, coreStats, monthsToGenerate, toStored, type RecapData } from './recap';
import { loadGoals } from './useGoals';

export async function loadInsightsData(): Promise<{ data: InsightsData; cal: CalendarData }> {
  const [entries, attacks, logs, meds, postLogs, settings] = await Promise.all([
    db.days.toArray(), db.attacks.toArray(), db.attackLogs.toArray(), db.medications.toArray(), db.postdromeLogs.toArray(), getSettings(),
  ]);
  return {
    data: { entries, attacks, logs, meds, postLogs, customFactors: settings.customLists.factors },
    cal: { entries: new Map(entries.map((e) => [e.date, e])), attacks, attackLogs: logs, postdromeDays: new Set(postLogs.map((p) => p.date)) },
  };
}

export function useInsightsData() {
  return useLiveQuery(loadInsightsData, []) ?? null;
}

/**
 * Génère le récap du mois écoulé s'il manque (le 1er du mois ou à la première ouverture qui suit).
 * `backfill` (démo) : génère aussi les mois précédents, déjà marqués comme vus.
 */
export async function ensureRecaps(backfill = 0) {
  const today = localDay();
  const { data, cal } = await loadInsightsData();
  const existing = (await db.recaps.toArray()).map((r) => r.month);
  const { goals } = await loadGoals();
  const tier = { label: goals.tier.label, emoji: goals.tier.emoji };
  for (const month of monthsToGenerate(data, existing, today)) {
    await db.recaps.put(toStored(buildRecap(data, cal, month, today, tier)));
  }
  for (let n = 2; n <= backfill + 1; n++) {
    const month = addMonths(monthOf(today), -n);
    if (existing.includes(month) || coreStats(data, month, today).filledDays === 0) continue;
    await db.recaps.put({ ...toStored(buildRecap(data, cal, month, today, null)), seen: true });
  }
}

export function useRecaps(): { month: string; seen: boolean; data: RecapData }[] | undefined {
  return useLiveQuery(async () => (await db.recaps.toArray())
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((r) => ({ month: r.month, seen: r.seen, data: r.data as unknown as RecapData })), []);
}

export async function markRecapSeen(month: string) {
  await db.recaps.update(month, { seen: true });
}
