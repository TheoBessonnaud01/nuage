// Proposer UNE fiche pertinente après certains gestes. Maximum une par jour, jamais deux fois la même.
import { getSettings, updateSettings } from '../db/db';
import { localDay } from './dates';

export type InfoTrigger =
  | 'premier-signal'      // premier petit signal coché → fiche « signaux »
  | 'premiere-aura'       // première aura notée → fiche « aura »
  | 'premiere-fin'        // première fin de douleur → fiche « post-crise »
  | 'premiere-crise-finie'// premier récap de crise → fiche « phases »
  | 'reperes-traitement'; // repère médicaments approché → fiche « médicaments »

export const cardForTrigger: Record<InfoTrigger, string> = {
  'premier-signal': 'signaux',
  'premiere-aura': 'aura',
  'premiere-fin': 'post-crise',
  'premiere-crise-finie': 'phases',
  'reperes-traitement': 'medicaments',
};

/** Fonction pure : quelle fiche proposer (ou aucune). */
export function pickInfoCard(trigger: InfoTrigger, shown: string[], lastInfoOn: string | undefined, today: string): string | null {
  const id = cardForTrigger[trigger];
  if (shown.includes(id)) return null;
  if (lastInfoOn === today) return null;
  return id;
}

/** Décide et mémorise. Renvoie l'id de la fiche à proposer, ou null. */
export async function claimInfoCard(trigger: InfoTrigger): Promise<string | null> {
  const s = await getSettings();
  const today = localDay();
  const id = pickInfoCard(trigger, s.infoShown ?? [], s.lastInfoOn, today);
  if (id) await updateSettings({ infoShown: [...(s.infoShown ?? []), id], lastInfoOn: today });
  return id;
}
