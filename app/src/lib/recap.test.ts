import { describe, expect, it } from 'vitest';
import type { Attack, DayEntry } from '../db/types';
import { addDays } from './dates';
import { buildRecap, compare, monthsToGenerate } from './recap';
import type { InsightsData } from './insights';
import type { CalendarData } from './calendar';

const day = (date: string): DayEntry => ({ date, createdAt: '', updatedAt: '', filledLate: false, stress: 2 });
const attack = (id: string, date: string, painH = 8): Attack => {
  const s = new Date(`${date}T10:00:00+02:00`);
  return { id, startAt: s.toISOString(), endAt: new Date(s.getTime() + painH * 36e5).toISOString(), recoveredAt: new Date(s.getTime() + (painH + 12) * 36e5).toISOString(), hadAura: 'non', investigation: {}, status: 'terminée' };
};
const days = (from: string, n: number) => Array.from({ length: n }, (_, i) => day(addDays(from, i)));

function data(entries: DayEntry[], attacks: Attack[]): [InsightsData, CalendarData] {
  return [
    { entries, attacks, logs: [], meds: [], postLogs: [], customFactors: [] },
    { entries: new Map(entries.map((e) => [e.date, e])), attacks, attackLogs: [], postdromeDays: new Set() },
  ];
}

describe('récap mensuel', () => {
  it('compare au mois précédent et à la moyenne des 3 derniers mois', () => {
    const [d, c] = data(
      [...days('2026-07-01', 10), ...days('2026-08-01', 10), ...days('2026-09-01', 20), ...days('2026-10-01', 16)],
      [attack('j', '2026-07-12'), attack('a1', '2026-08-05'), attack('a2', '2026-08-20'), attack('s', '2026-09-10'), attack('o1', '2026-10-04'), attack('o2', '2026-10-15'), attack('o3', '2026-10-25')],
    );
    const r = buildRecap(d, c, '2026-10', '2026-11-01');
    expect(r.core.attacks).toBe(3);
    expect(r.prev?.attacks).toBe(1);
    expect(r.avg3?.attacks).toBe(1.3);
    expect(r.tone).toBe('charge');
    expect(r.victory).toEqual({ key: 'beaucoup', n: 16 }); // jours de crise sans note : non comptés comme remplis
  });

  it('a un ton « peu de données » sans reproche, et « calme » sinon', () => {
    const [d1, c1] = data(days('2026-10-01', 3), []);
    expect(buildRecap(d1, c1, '2026-10', '2026-11-01').tone).toBe('peu');
    const [d2, c2] = data([...days('2026-09-01', 10), ...days('2026-10-01', 10)], [attack('s1', '2026-09-10'), attack('s2', '2026-09-20')]);
    const r = buildRecap(d2, c2, '2026-10', '2026-11-01');
    expect(r.tone).toBe('calme');
    expect(r.victory.key).toBe('zero');
  });

  it('dit « stable » pour les petits écarts', () => {
    expect(compare(10, 10.5)).toBe('stable');
    expect(compare(3, 1)).toBe('plus');
    expect(compare(0, 2)).toBe('moins');
    expect(compare(0, 0)).toBe('stable');
    expect(compare(null, 2)).toBeNull();
  });

  it('génère le récap du mois écoulé une seule fois, et seulement s’il y a des données', () => {
    const [d] = data(days('2026-10-05', 3), []);
    expect(monthsToGenerate(d, [], '2026-11-01')).toEqual(['2026-10']);
    expect(monthsToGenerate(d, ['2026-10'], '2026-11-03')).toEqual([]);
    expect(monthsToGenerate(d, [], '2026-10-20')).toEqual([]); // septembre vide
  });

  it('fournit le mini calendrier du mois', () => {
    const [d, c] = data(days('2026-10-01', 2), [attack('x', '2026-10-10')]);
    const r = buildRecap(d, c, '2026-10', '2026-11-01');
    expect(r.calendar).toHaveLength(31);
    expect(r.calendar[0].kind).toBe('rempli');
    expect(r.calendar[9].kind).toBe('crise');
  });
});
