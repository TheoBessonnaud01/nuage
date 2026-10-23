import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import { computeGoals } from './goals';

// Lundis de référence
const W = (n: number) => addDays('2026-09-07', n * 7);
/** k jours remplis dans la semaine n (lundi, mardi…) */
const days = (n: number, k: number) => Array.from({ length: k }, (_, i) => addDays(W(n), i));

describe('objectifs progressifs', () => {
  it('commence en Graine', () => {
    const g = computeGoals([], '2026-09-09');
    expect(g.tier.id).toBe('graine');
    expect(g.thisWeekTarget).toBe(2);
    expect(g.lastWeekMissed).toBe(false);
  });

  it('passe Pousse après 2 semaines validées, pas forcément consécutives', () => {
    const filled = [...days(0, 2), ...days(1, 0), ...days(2, 2)];
    const g = computeGoals(filled, addDays(W(3), 1));
    expect(g.tier.id).toBe('pousse');
    expect(g.thisWeekTarget).toBe(3);
  });

  it('va jusqu’à Floraison (2×2, 3×3, 4×4)', () => {
    const filled = [
      ...days(0, 2), ...days(1, 2),
      ...days(2, 3), ...days(3, 3), ...days(4, 3),
      ...days(5, 4), ...days(6, 4), ...days(7, 4), ...days(8, 4),
    ];
    const g = computeGoals(filled, addDays(W(9), 0));
    expect(g.tier.id).toBe('floraison');
    expect(g.thisWeekTarget).toBeNull();
    expect(g.lastWeekMissed).toBe(false);
  });

  it('valide la semaine en cours dès que l’objectif est atteint', () => {
    const g = computeGoals([...days(0, 2), ...days(1, 2)], addDays(W(1), 3));
    expect(g.thisWeekValidated).toBe(true);
    expect(g.thisWeekCount).toBe(2);
    expect(g.tier.id).toBe('pousse');
    // l'objectif affiché reste celui qu'elle vient d'atteindre cette semaine
    expect(g.thisWeekTarget).toBe(2);
  });

  it('une semaine ratée ne fait rien perdre', () => {
    const g = computeGoals([...days(0, 2), ...days(1, 2), ...days(2, 3)], addDays(W(4), 2));
    expect(g.tier.id).toBe('pousse');
    expect(g.validatedInTier).toBe(1);
    expect(g.lastWeekMissed).toBe(true);
  });

  it('ne redescend jamais sous le palier déjà atteint', () => {
    const g = computeGoals([], '2026-11-02', 2);
    expect(g.tier.id).toBe('arbre');
  });

  it('compte les jours rattrapés comme les autres', () => {
    // la semaine 0 est complétée a posteriori : le résultat est le même
    const g = computeGoals([...days(1, 2), '2026-09-08', '2026-09-07'], addDays(W(2), 0));
    expect(g.tier.id).toBe('pousse');
  });

  it('ignore les jours futurs', () => {
    expect(computeGoals(['2026-12-01', '2026-12-02'], '2026-09-09').thisWeekCount).toBe(0);
  });
});
