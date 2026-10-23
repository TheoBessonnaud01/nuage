import { describe, expect, it } from 'vitest';
import { lines, pickLine, type LineContext } from './lines';

describe('répliques de Pépite', () => {
  it('au moins 8 répliques par contexte, ≤ 140 caractères', () => {
    for (const [ctx, list] of Object.entries(lines)) {
      expect(list.length, ctx).toBeGreaterThanOrEqual(8);
      for (const l of list) expect(l.replace('{prenom}', 'Noémie').length, l).toBeLessThanOrEqual(140);
    }
  });

  it('ne répète jamais la réplique précédente', () => {
    const always0 = () => 0;
    const a = pickLine('tap', 'Noémie', always0);
    const b = pickLine('tap', 'Noémie', always0);
    expect(a).not.toBe(b);
  });

  it('insère le prénom', () => {
    const idx = lines.nuit.findIndex((l) => l.includes('{prenom}'));
    const out = pickLine('nuit', 'Noémie', () => idx / lines.nuit.length);
    expect(out).toContain('Noémie');
    expect(out).not.toContain('{prenom}');
  });

  it('pas d’humour ni d’émoji rigolo pendant une crise', () => {
    const crisis: LineContext[] = ['debutCrise', 'criseEnCours', 'matinCrise'];
    for (const c of crisis) for (const l of lines[c]) expect(l).not.toMatch(/😎|🤓|🐯|🎉|😂|blague/);
  });
});
