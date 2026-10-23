import { addDays, weekStart } from './dates';

export interface Tier {
  id: 'graine' | 'pousse' | 'arbre' | 'floraison';
  label: string;
  emoji: string;
  perWeek: number | null;     // null = rythme libre
  weeksNeeded: number | null; // semaines validées pour passer au palier suivant
}

export const tiers: Tier[] = [
  { id: 'graine', label: 'Graine', emoji: '🌱', perWeek: 2, weeksNeeded: 2 },
  { id: 'pousse', label: 'Pousse', emoji: '🌿', perWeek: 3, weeksNeeded: 3 },
  { id: 'arbre', label: 'Arbre', emoji: '🌳', perWeek: 4, weeksNeeded: 4 },
  { id: 'floraison', label: 'Floraison', emoji: '🌸', perWeek: null, weeksNeeded: null },
];

export interface GoalsState {
  tierIndex: number;
  tier: Tier;
  validatedInTier: number;        // semaines déjà validées dans le palier en cours
  thisWeekCount: number;
  thisWeekTarget: number | null;
  thisWeekValidated: boolean;
  lastWeekMissed: boolean;        // semaine précédente non validée (message doux, jamais de perte)
}

/**
 * Calcule le palier à partir des jours remplis (rattrapés et jours de crise compris).
 * On parcourt les semaines (lundi → dimanche) dans l'ordre ; une semaine est validée
 * dès que son nombre de jours atteint l'objectif du palier en cours.
 * `storedTier` = meilleur palier déjà atteint : on ne redescend JAMAIS.
 */
export function computeGoals(filledDays: Iterable<string>, today: string, storedTier = 0): GoalsState {
  const perWeek = new Map<string, number>();
  let first: string | null = null;
  for (const d of filledDays) {
    if (d > today) continue;
    const w = weekStart(d);
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1);
    if (!first || d < first) first = d;
  }

  const currentWeek = weekStart(today);
  let t = 0;
  let v = 0;
  let thisWeekValidated = false;
  let lastWeekMissed = false;
  let thisWeekTarget: number | null = tiers[0].perWeek;

  if (first) {
    for (let w = weekStart(first); w <= currentWeek; w = addDays(w, 7)) {
      const tier = tiers[t];
      const count = perWeek.get(w) ?? 0;
      const isCurrent = w === currentWeek;
      if (isCurrent) thisWeekTarget = tier.perWeek;
      if (tier.perWeek === null) continue;
      const ok = count >= tier.perWeek;
      if (isCurrent) thisWeekValidated = ok;
      if (w === addDays(currentWeek, -7)) lastWeekMissed = !ok;
      if (ok) {
        v++;
        if (v === tier.weeksNeeded) { t++; v = 0; }
      }
    }
  }

  const tierIndex = Math.max(t, storedTier);
  if (tierIndex > t) v = 0;
  const tier = tiers[tierIndex];
  return {
    tierIndex,
    tier,
    validatedInTier: v,
    thisWeekCount: perWeek.get(currentWeek) ?? 0,
    thisWeekTarget: thisWeekValidated ? thisWeekTarget : tier.perWeek,
    thisWeekValidated,
    lastWeekMissed: lastWeekMissed && tier.perWeek !== null,
  };
}
