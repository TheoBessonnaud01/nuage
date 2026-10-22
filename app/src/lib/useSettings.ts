import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

/** Réglages en direct (lecture seule ; la ligne est créée au démarrage dans main.tsx). */
export function useSettings() {
  return useLiveQuery(() => db.settings.get('main'), []) ?? null;
}

export function useCrisisActive(): boolean {
  return (
    useLiveQuery(async () => (await db.attacks.where('status').equals('en cours').count()) > 0, [], false) ?? false
  );
}
