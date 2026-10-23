import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { db, updateSettings } from '../db/db';
import { filledDaysOf } from './calendar';
import { localDay } from './dates';
import { computeGoals, type GoalsState } from './goals';

export interface GoalsInfo {
  goals: GoalsState;
  /** Un palier atteint n'a pas encore été fêté. */
  pendingCelebration: boolean;
}

/** Calcul des objectifs à partir de la base (utilisable dans une liveQuery). */
export async function loadGoals(): Promise<GoalsInfo & { storedMax: number }> {
  const [entries, logs, post, settings] = await Promise.all([
    db.days.toArray(), db.attackLogs.toArray(), db.postdromeLogs.toArray(), db.settings.get('main'),
  ]);
  const storedMax = settings?.maxTier ?? 0;
  const goals = computeGoals(filledDaysOf(entries, logs, post.map((p) => p.date)), localDay(), storedMax);
  return { goals, storedMax, pendingCelebration: goals.tierIndex > (settings?.celebratedTier ?? 0) };
}

export function useGoals(): GoalsInfo | null {
  const info = useLiveQuery(loadGoals, []);
  // Mémorise le meilleur palier : on ne redescend jamais, même si les données changent.
  useEffect(() => {
    if (info && info.goals.tierIndex > info.storedMax) updateSettings({ maxTier: info.goals.tierIndex });
  }, [info]);
  return info ?? null;
}
