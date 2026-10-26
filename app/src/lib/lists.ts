import { crisisSymptoms, postdromeSymptoms, sensoryExposure, warningSigns, type ListItem } from '../content/factors';
import type { CustomLists, Settings } from '../db/types';

/** Listes que Noémie peut personnaliser (ajouter, renommer, masquer, réordonner). */
export type ListKind = 'warningSigns' | 'crisisSymptoms' | 'postdromeSymptoms' | 'customFactors';

export const listDefaults: Record<ListKind, ListItem[]> = {
  warningSigns, crisisSymptoms, postdromeSymptoms, customFactors: [],
};
export const customKey: Record<ListKind, keyof CustomLists> = {
  warningSigns: 'warningSigns', crisisSymptoms: 'symptoms', postdromeSymptoms: 'postdromeSymptoms', customFactors: 'factors',
};

export interface ManagedItem extends ListItem { custom: boolean; hidden: boolean }

/** Tous les éléments d'une liste (masqués compris), dans l'ordre choisi, avec les nouveaux noms. */
export function managedList(kind: ListKind, settings: Settings | null): ManagedItem[] {
  const hidden = new Set(settings?.hiddenDefaults ?? []);
  const prefs = settings?.listPrefs?.[kind];
  const renamed = prefs?.renamed ?? {};
  const items: ManagedItem[] = [
    ...listDefaults[kind].map((i) => ({ ...i, custom: false, hidden: hidden.has(`${kind}:${i.id}`) || hidden.has(i.id) })),
    ...(settings?.customLists[customKey[kind]] ?? []).map((l) => ({ id: l, label: l, custom: true, hidden: hidden.has(`${kind}:${l}`) })),
  ].map((i) => ({ ...i, label: renamed[i.id] ?? i.label }));
  const order = prefs?.order ?? [];
  const rank = (id: string) => { const r = order.indexOf(id); return r === -1 ? order.length + items.findIndex((x) => x.id === id) : r; };
  return items.sort((a, b) => rank(a.id) - rank(b.id));
}

/** Liste affichée dans les questions = éléments non masqués. */
export function visibleList(kind: ListKind | 'sensory', settings: Settings | null): ListItem[] {
  if (kind === 'sensory') {
    const hidden = new Set(settings?.hiddenDefaults ?? []);
    return sensoryExposure.filter((i) => !hidden.has(i.id));
  }
  return managedList(kind, settings).filter((i) => !i.hidden);
}
