import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { localDay } from '../lib/dates';
import { session } from '../lib/session';
import type { MoodContext } from './moodEngine';

/** Rassemble depuis la base ce qu'il faut pour choisir l'humeur de Pépite. */
export function useMoodContext(): MoodContext | null {
  return useLiveQuery(async () => {
    await db.settings.get('main'); // relance le calcul quand lastOpenedAt est mis à jour au démarrage
    const now = new Date();
    const active = await db.attacks.where('status').anyOf('en cours', 'post-crise').first();
    const today = await db.days.get(localDay(now));
    const unseenRecap = await db.recaps.filter((r) => !r.seen).count();
    return {
      now,
      attackStatus: (active?.status as MoodContext['attackStatus']) ?? null,
      attackStartedAt: active?.startAt ?? null,
      pendingCelebration: unseenRecap > 0 ? 'recap' : null, // paliers branchés à l'étape 2
      previousOpenedAt: session.previousOpenedAt,
      checkinDoneAt: today?.updatedAt ?? null,
    } satisfies MoodContext;
  }, []) ?? null;
}
