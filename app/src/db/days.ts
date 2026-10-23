import { db } from './db';
import type { DayEntry } from './types';
import { localDay } from '../lib/dates';

/** Crée ou complète le check-in d'un jour (enregistré à chaque réponse : rien n'est perdu). */
export async function saveDay(date: string, patch: Partial<DayEntry>): Promise<void> {
  const now = new Date().toISOString();
  await db.transaction('rw', db.days, async () => {
    const existing = await db.days.get(date);
    if (existing) {
      await db.days.put({ ...existing, ...patch, updatedAt: now });
    } else {
      await db.days.put({ date, createdAt: now, updatedAt: now, filledLate: date < localDay(), ...patch });
    }
  });
}
