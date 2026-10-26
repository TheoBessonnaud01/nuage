// Sauvegarde complète (JSON) et restauration. Tout reste local : le fichier est remis à Noémie,
// qui choisit où le ranger (Drive, mail, WhatsApp…).
import { db, getSettings, type NuageDB, type SettingsRow } from '../db/db';
import type { Attack, AttackDayLog, DayEntry, Medication, MonthlyRecap, PostdromeLog } from '../db/types';

export const BACKUP_VERSION = 1;

export interface Backup {
  app: 'nuage';
  version: number;
  exportedAt: string;
  data: {
    days: DayEntry[];
    attacks: Attack[];
    attackLogs: AttackDayLog[];
    medications: Medication[];
    postdromeLogs: PostdromeLog[];
    recaps: MonthlyRecap[];
    settings: SettingsRow | null;
  };
}

export async function createBackup(database: NuageDB = db): Promise<Backup> {
  const [days, attacks, attackLogs, medications, postdromeLogs, recaps, settings] = await Promise.all([
    database.days.toArray(), database.attacks.toArray(), database.attackLogs.toArray(), database.medications.toArray(),
    database.postdromeLogs.toArray(), database.recaps.toArray(), database.settings.get('main'),
  ]);
  return { app: 'nuage', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: { days, attacks, attackLogs, medications, postdromeLogs, recaps, settings: settings ?? null } };
}

export class BackupError extends Error {}

/** Vérifie qu'un fichier est bien une sauvegarde Nuage lisible. */
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new BackupError('illisible'); }
  const b = raw as Partial<Backup>;
  if (!b || b.app !== 'nuage' || typeof b.version !== 'number' || !b.data) throw new BackupError('pas-nuage');
  if (b.version > BACKUP_VERSION) throw new BackupError('trop-recente');
  const d = b.data as Partial<Backup['data']>;
  const arr = <T>(x: unknown, ok: (v: T) => boolean): T[] => {
    if (x === undefined) return [];
    if (!Array.isArray(x) || !x.every((v) => v && typeof v === 'object' && ok(v as T))) throw new BackupError('abimee');
    return x as T[];
  };
  return {
    app: 'nuage', version: b.version, exportedAt: String(b.exportedAt ?? ''),
    data: {
      days: arr<DayEntry>(d.days, (v) => /^\d{4}-\d{2}-\d{2}$/.test(v.date)),
      attacks: arr<Attack>(d.attacks, (v) => typeof v.id === 'string' && typeof v.startAt === 'string'),
      attackLogs: arr<AttackDayLog>(d.attackLogs, (v) => typeof v.id === 'string' && typeof v.attackId === 'string'),
      medications: arr<Medication>(d.medications, (v) => typeof v.id === 'string' && typeof v.takenAt === 'string'),
      postdromeLogs: arr<PostdromeLog>(d.postdromeLogs, (v) => typeof v.id === 'string' && typeof v.attackId === 'string'),
      recaps: arr<MonthlyRecap>(d.recaps, (v) => typeof v.month === 'string'),
      settings: d.settings && typeof d.settings === 'object' ? (d.settings as SettingsRow) : null,
    },
  };
}

export function summarize(b: Backup) {
  return { days: b.data.days.length, attacks: b.data.attacks.length, medications: b.data.medications.length, exportedAt: b.exportedAt };
}

const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])];

/**
 * Restaure une sauvegarde.
 * - « fusion » : ajoute ce qui manque ; pour un même jour, garde la version la plus récente.
 * - « remplacement » : remplace tout le journal par la sauvegarde.
 * Dans les deux cas, l'identité de l'installation (notifications) est conservée.
 */
export async function restoreBackup(b: Backup, mode: 'fusion' | 'remplacement', database: NuageDB = db) {
  const current = await getSettings(database);
  const keep = { key: 'main' as const, installId: current.installId, pushSubscribed: current.pushSubscribed, onboardingDone: true };
  await database.transaction('rw', [database.days, database.attacks, database.attackLogs, database.medications, database.postdromeLogs, database.recaps, database.settings], async () => {
    if (mode === 'remplacement') {
      await Promise.all([database.days.clear(), database.attacks.clear(), database.attackLogs.clear(), database.medications.clear(), database.postdromeLogs.clear(), database.recaps.clear()]);
      await database.days.bulkPut(b.data.days);
      await database.attacks.bulkPut(b.data.attacks);
      await database.attackLogs.bulkPut(b.data.attackLogs);
      await database.medications.bulkPut(b.data.medications);
      await database.postdromeLogs.bulkPut(b.data.postdromeLogs);
      await database.recaps.bulkPut(b.data.recaps);
      await database.settings.put({ ...current, ...(b.data.settings ?? {}), ...keep });
      return;
    }
    const addMissing = async <T>(table: { bulkGet: (k: string[]) => Promise<(T | undefined)[]>; bulkPut: (v: T[]) => Promise<unknown> }, items: T[], key: (t: T) => string) => {
      const existing = await table.bulkGet(items.map(key));
      await table.bulkPut(items.filter((_, i) => !existing[i]));
    };
    const existingDays = await database.days.bulkGet(b.data.days.map((d) => d.date));
    await database.days.bulkPut(b.data.days.filter((d, i) => !existingDays[i] || (existingDays[i]!.updatedAt ?? '') < (d.updatedAt ?? '')));
    await addMissing(database.attacks, b.data.attacks, (x) => x.id);
    await addMissing(database.attackLogs, b.data.attackLogs, (x) => x.id);
    await addMissing(database.medications, b.data.medications, (x) => x.id);
    await addMissing(database.postdromeLogs, b.data.postdromeLogs, (x) => x.id);
    await addMissing(database.recaps, b.data.recaps, (x) => x.month);
    const s = b.data.settings;
    if (s) {
      const catalog = [...(current.medicationCatalog ?? [])];
      for (const m of s.medicationCatalog ?? []) if (!catalog.some((c) => c.name.toLowerCase() === m.name.toLowerCase())) catalog.push(m);
      await database.settings.put({
        ...current,
        customLists: {
          factors: union(current.customLists.factors, s.customLists?.factors),
          symptoms: union(current.customLists.symptoms, s.customLists?.symptoms),
          warningSigns: union(current.customLists.warningSigns, s.customLists?.warningSigns),
          postdromeSymptoms: union(current.customLists.postdromeSymptoms, s.customLists?.postdromeSymptoms),
          medications: union(current.customLists.medications, s.customLists?.medications),
        },
        hiddenDefaults: union(current.hiddenDefaults, s.hiddenDefaults),
        medicationCatalog: catalog,
        maxTier: Math.max(current.maxTier ?? 0, s.maxTier ?? 0),
        ...keep,
      });
    }
  });
}

/** Efface tout le journal (double confirmation côté interface). */
export async function wipeAll(database: NuageDB = db) {
  await database.delete();
}
