import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { localDay } from '../lib/dates';
import { session } from '../lib/session';
import { loadGoals } from '../lib/useGoals';
import type { MoodContext } from './moodEngine';

/** Rassemble depuis la base ce qu'il faut pour choisir l'humeur de Pépite. */
export function useMoodContext(): MoodContext | null {
  return useLiveQuery(async () => {
    const now = new Date();
    const active = await db.attacks.where('status').anyOf('en cours', 'post-crise').first();
    const today = await db.days.get(localDay(now));
    const unseenRecap = await db.recaps.filter((r) => !r.seen).count();
    const { pendingCelebration } = await loadGoals();
    return {
      now,
      attackStatus: (active?.status as MoodContext['attackStatus']) ?? null,
      attackStartedAt: active?.startAt ?? null,
      pendingCelebration: pendingCelebration ? 'palier' : unseenRecap > 0 ? 'recap' : null,
      previousOpenedAt: session.previousOpenedAt,
      checkinDoneAt: today?.updatedAt ?? null,
    } satisfies MoodContext;
  }, []) ?? null;
}
