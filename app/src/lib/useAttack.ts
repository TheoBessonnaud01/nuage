import { useLiveQuery } from 'dexie-react-hooks';
import { getActiveAttack } from '../db/attacks';
import { db } from '../db/db';
import type { Attack, AttackDayLog, Medication, PostdromeLog } from '../db/types';

export interface AttackData {
  attack: Attack;
  logs: AttackDayLog[];
  meds: Medication[];
  postLogs: PostdromeLog[];
}

async function loadFor(attack: Attack | undefined): Promise<AttackData | null> {
  if (!attack) return null;
  const [logs, meds, postLogs] = await Promise.all([
    db.attackLogs.where('attackId').equals(attack.id).toArray(),
    db.medications.where('attackId').equals(attack.id).toArray(),
    db.postdromeLogs.where('attackId').equals(attack.id).toArray(),
  ]);
  return { attack, logs, meds, postLogs };
}

/** Crise active (en cours ou post-crise). `undefined` = chargement, `null` = aucune. */
export function useActiveAttack(): AttackData | null | undefined {
  return useLiveQuery(async () => loadFor(await getActiveAttack()), []);
}

export function useAttack(id: string | undefined): AttackData | null | undefined {
  return useLiveQuery(async () => loadFor(id ? await db.attacks.get(id) : undefined), [id]);
}

/** Prises de traitement en attente du « ça va mieux ? » (toutes crises confondues). */
export function usePendingMeds(): Medication[] {
  return useLiveQuery(() => db.medications.filter((m) => !m.efficacyAfter2h).toArray(), [], []) ?? [];
}

/** Crises passées avec leurs notes (pour comparer). */
export function usePastAttacks(): { attack: Attack; logs: AttackDayLog[] }[] | undefined {
  return useLiveQuery(async () => {
    const [attacks, logs] = await Promise.all([db.attacks.where('status').equals('terminée').toArray(), db.attackLogs.toArray()]);
    return attacks.map((a) => ({ attack: a, logs: logs.filter((l) => l.attackId === a.id) }));
  }, []);
}
