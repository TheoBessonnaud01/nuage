import { describe, expect, it } from 'vitest';
import type { Attack, AttackDayLog, Medication } from '../db/types';
import { attackDayNumber, formatDuration, medsAwaitingFollowUp, summarizeAttack } from './attacks';

const attack: Attack = {
  id: 'a', startAt: '2026-10-08T09:00:00+02:00', endAt: '2026-10-09T21:30:00+02:00',
  recoveredAt: '2026-10-11T09:30:00+02:00', hadAura: 'oui', investigation: {}, status: 'terminée',
};
const log = (attackId: string, intensity: number): AttackDayLog => ({
  id: Math.random().toString(), attackId, date: '2026-10-08', time: '10:00', intensity,
  locations: [], painType: [], symptoms: [], worsenedBy: [], relievedBy: [], functional: 'ralentie',
});
const med = (takenAt: string, extra: Partial<Medication> = {}): Medication => ({
  id: takenAt, attackId: 'a', takenAt, name: 'X', category: 'triptan', ...extra,
});

describe('résumé de crise', () => {
  it('calcule la durée de chaque phase et l’intensité max', () => {
    const s = summarizeAttack(attack, [log('a', 4), log('a', 7), log('b', 10)], [med('2026-10-08T10:00:00+02:00'), med('2026-10-08T09:30:00+02:00')]);
    expect(s.painHours).toBe(36.5);
    expect(s.postdromeHours).toBe(36);
    expect(s.totalHours).toBe(72.5);
    expect(s.maxIntensity).toBe(7);
    expect(s.meds.map((m) => m.takenAt)).toEqual(['2026-10-08T09:30:00+02:00', '2026-10-08T10:00:00+02:00']);
  });

  it('laisse vides les phases non terminées', () => {
    const s = summarizeAttack({ ...attack, endAt: undefined, recoveredAt: undefined, status: 'en cours' }, [], []);
    expect(s.painHours).toBeNull();
    expect(s.postdromeHours).toBeNull();
    expect(s.maxIntensity).toBeNull();
  });

  it('formate les durées simplement', () => {
    expect(formatDuration(0.5)).toBe('30 min');
    expect(formatDuration(5)).toBe('5 h');
    expect(formatDuration(36.5)).toBe('1 j 13 h');
    expect(formatDuration(48)).toBe('2 j');
    expect(formatDuration(null)).toBe('—');
  });

  it('compte les jours de crise (heure de Paris)', () => {
    expect(attackDayNumber(attack, new Date('2026-10-08T21:00:00Z'))).toBe(1);
    expect(attackDayNumber(attack, new Date('2026-10-08T22:30:00Z'))).toBe(2); // 0h30 le 9 à Paris
  });

  it('relance « ça va mieux ? » 2 h après une prise, une seule fois', () => {
    const now = new Date('2026-10-08T12:00:00+02:00');
    const meds = [
      med('2026-10-08T09:00:00+02:00'),
      med('2026-10-08T11:00:00+02:00'),
      med('2026-10-08T08:00:00+02:00', { efficacyAfter2h: 'bien' }),
    ];
    expect(medsAwaitingFollowUp(meds, now).map((m) => m.takenAt)).toEqual(['2026-10-08T09:00:00+02:00']);
  });
});

import { digestCrisis } from './attacks';

describe('mot de la fin : analyse de la crise', () => {
  const live: Attack = { id: 'live', startAt: '2026-10-23T10:00:00+02:00', hadAura: 'non', investigation: {}, status: 'en cours' };
  const l = (time: string, intensity: number | undefined, extra: Partial<AttackDayLog> = {}): AttackDayLog => ({
    id: time, attackId: 'live', date: '2026-10-23', time, intensity, locations: [], painType: [], symptoms: [], worsenedBy: [], relievedBy: [], ...extra,
  });
  const pastAttack = (id: string, start: string, end: string): Attack => ({ id, startAt: start, endAt: end, hadAura: 'non', investigation: {}, status: 'terminée' });

  it('donne la tendance, la durée et le dernier traitement', () => {
    const d = digestCrisis(live, [l('10:00', 8), l('11:00', undefined), l('12:00', 5, { worsenedBy: ['lumiere'], symptoms: ['nausees'] })],
      [med('2026-10-23T10:30:00+02:00', { attackId: 'live', name: 'Ibu' })], [], new Date('2026-10-23T13:00:00+02:00'));
    expect(d.hoursSoFar).toBe(3);
    expect(d.trend).toBe('baisse');
    expect([d.firstIntensity, d.previousIntensity, d.lastIntensity]).toEqual([8, 8, 5]);
    expect(d.lastMed?.name).toBe('Ibu');
    expect(d.worsenedNow).toEqual(['lumiere']);
    expect(d.nausea).toBe(true);
  });

  it('compare aux crises passées seulement s’il y en a au moins 2', () => {
    const p1 = pastAttack('p1', '2026-09-01T08:00:00Z', '2026-09-01T14:00:00Z');
    const p2 = pastAttack('p2', '2026-09-10T08:00:00Z', '2026-09-11T02:00:00Z');
    const pastLogs = (id: string, relief: string[]) => [{ ...l('09:00', 6), attackId: id, relievedBy: relief }];
    const one = digestCrisis(live, [], [], [{ attack: p1, logs: pastLogs('p1', ['obscurite']) }]);
    expect(one.avgPastPainHours).toBeNull();
    const two = digestCrisis(live, [], [], [
      { attack: p1, logs: pastLogs('p1', ['obscurite', 'sommeil']) },
      { attack: p2, logs: pastLogs('p2', ['obscurite']) },
    ]);
    expect(two.avgPastPainHours).toBe(12);
    expect(two.pastRelief[0]).toBe('obscurite');
    expect(two.trend).toBeNull();
  });
});
