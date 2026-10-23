import { db, getSettings, updateSettings } from './db';
import type { Attack, AttackDayLog, InvestigationAnswers, Medication, MedicationDef, PostdromeLog } from './types';
import { localDay } from '../lib/dates';

const id = () => crypto.randomUUID();
const hhmm = (d: Date) => d.toTimeString().slice(0, 5);

/** La crise en cours ou en post-crise (au plus une à la fois). */
export async function getActiveAttack(): Promise<Attack | undefined> {
  return db.attacks.where('status').anyOf('en cours', 'post-crise').first();
}

export async function startAttack(data: {
  startAt: string;
  hadAura: Attack['hadAura'];
  auraTypes?: string[];
  firstLog?: Omit<AttackDayLog, 'id' | 'attackId' | 'date' | 'time'>;
}): Promise<string> {
  const attackId = id();
  await db.transaction('rw', db.attacks, db.attackLogs, async () => {
    await db.attacks.put({
      id: attackId, startAt: data.startAt, hadAura: data.hadAura, auraTypes: data.auraTypes,
      investigation: {}, status: 'en cours',
    });
    if (data.firstLog) {
      const at = new Date(data.startAt);
      await db.attackLogs.put({ ...data.firstLog, id: id(), attackId, date: localDay(at), time: hhmm(at) });
    }
  });
  return attackId;
}

export async function updateAttack(attackId: string, patch: Partial<Attack>) {
  await db.attacks.update(attackId, patch);
}

export async function addAttackLog(attackId: string, log: Omit<AttackDayLog, 'id' | 'attackId' | 'date' | 'time'>, at = new Date()) {
  await db.attackLogs.put({ ...log, id: id(), attackId, date: localDay(at), time: hhmm(at) });
}

export async function addMedication(m: Omit<Medication, 'id'>) {
  await db.medications.put({ ...m, id: id() });
}

export async function setEfficacy(medId: string, efficacyAfter2h: Medication['efficacyAfter2h']) {
  await db.medications.update(medId, { efficacyAfter2h });
}

/** Ajoute un traitement à la liste perso de Noémie (s'il n'y est pas déjà). */
export async function addToCatalog(def: MedicationDef) {
  const s = await getSettings();
  const list = s.medicationCatalog ?? [];
  if (list.some((d) => d.name.toLowerCase() === def.name.toLowerCase())) return;
  await updateSettings({ medicationCatalog: [...list, def] });
}

export async function saveInvestigation(attackId: string, patch: Partial<InvestigationAnswers>) {
  const a = await db.attacks.get(attackId);
  if (!a) return;
  await db.attacks.update(attackId, { investigation: { ...a.investigation, ...patch } });
}

/** « La douleur est partie » → phase post-crise. */
export async function endPain(attackId: string, endAt: string) {
  await db.attacks.update(attackId, { endAt, status: 'post-crise' });
}

/** Retour possible en arrière (fin de douleur notée par erreur). */
export async function resumePain(attackId: string) {
  const a = await db.attacks.get(attackId);
  if (!a) return;
  await db.attacks.put({ ...a, endAt: undefined, status: 'en cours' });
}

export async function addPostdromeLog(attackId: string, log: Omit<PostdromeLog, 'id' | 'attackId' | 'date'>, at = new Date()) {
  await db.postdromeLogs.put({ ...log, id: id(), attackId, date: localDay(at) });
  if (log.percentBack >= 100) await recover(attackId, at.toISOString());
}

/** « Je suis revenue à 100 % » → crise terminée. */
export async function recover(attackId: string, recoveredAt: string) {
  await db.attacks.update(attackId, { recoveredAt, status: 'terminée' });
}
