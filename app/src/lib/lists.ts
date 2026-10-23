import { sensoryExposure, warningSigns, type ListItem } from '../content/factors';
import type { Settings } from '../db/types';

/** Liste visible = défauts non masqués + éléments ajoutés par Noémie. */
export function visibleList(kind: 'sensory' | 'warningSigns' | 'customFactors', settings: Settings | null): ListItem[] {
  const hidden = new Set(settings?.hiddenDefaults ?? []);
  const custom = settings?.customLists;
  const toItems = (labels: string[] = []) => labels.map((l) => ({ id: l, label: l }));
  switch (kind) {
    case 'sensory': return sensoryExposure.filter((i) => !hidden.has(i.id));
    case 'warningSigns': return [...warningSigns.filter((i) => !hidden.has(i.id)), ...toItems(custom?.warningSigns)];
    case 'customFactors': return toItems(custom?.factors);
  }
}
