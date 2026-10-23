import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { CalendarData } from './calendar';

/** Toutes les données utiles au calendrier, en direct. */
export function useCalendarData(): CalendarData | null {
  return useLiveQuery(async () => {
    const [entries, attacks, attackLogs, post] = await Promise.all([
      db.days.toArray(), db.attacks.toArray(), db.attackLogs.toArray(), db.postdromeLogs.toArray(),
    ]);
    return {
      entries: new Map(entries.map((e) => [e.date, e])),
      attacks,
      attackLogs,
      postdromeDays: new Set(post.map((p) => p.date)),
    };
  }, []) ?? null;
}
