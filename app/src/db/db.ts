import Dexie, { type Table } from 'dexie';
import type {
  Attack, AttackDayLog, DayEntry, Medication, MonthlyRecap, PostdromeLog, Settings,
} from './types';
import { config } from '../config';

// Une seule ligne de réglages, clé fixe.
export type SettingsRow = Settings & { key: 'main' };

export class NuageDB extends Dexie {
  days!: Table<DayEntry, string>;
  attacks!: Table<Attack, string>;
  attackLogs!: Table<AttackDayLog, string>;
  medications!: Table<Medication, string>;
  postdromeLogs!: Table<PostdromeLog, string>;
  recaps!: Table<MonthlyRecap, string>;
  settings!: Table<SettingsRow, string>;

  constructor(name = 'nuage') {
    super(name);
    // Version 1. Toute évolution du schéma = nouvelle version + .upgrade() si besoin.
    this.version(1).stores({
      days: 'date, updatedAt',
      attacks: 'id, startAt, status',
      attackLogs: 'id, attackId, date',
      medications: 'id, attackId, takenAt, category',
      postdromeLogs: 'id, attackId, date',
      recaps: 'month, seen',
      settings: 'key',
    });
  }
}

export const db = new NuageDB();

export function defaultSettings(): SettingsRow {
  return {
    key: 'main',
    firstName: config.firstName,
    reminderTime: config.defaultReminderTime,
    silentDays: [],
    theme: 'auto',
    mascotMode: 'normal',
    weatherEnabled: false,
    customLists: { factors: [], symptoms: [], warningSigns: [], postdromeSymptoms: [], medications: [] },
    hiddenDefaults: [],
    pushSubscribed: false,
    installId: crypto.randomUUID(),
    onboardingDone: false,
  };
}

export async function getSettings(database: NuageDB = db): Promise<SettingsRow> {
  const existing = await database.settings.get('main');
  if (existing) return existing;
  const fresh = defaultSettings();
  await database.settings.put(fresh);
  return fresh;
}

export async function updateSettings(patch: Partial<Settings>, database: NuageDB = db) {
  await getSettings(database);
  await database.settings.update('main', patch);
}

/** Demande au navigateur de ne pas effacer nos données. Renvoie l'état final. */
export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
}
