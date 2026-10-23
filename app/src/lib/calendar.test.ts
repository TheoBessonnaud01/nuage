import { describe, expect, it } from 'vitest';
import type { Attack, DayEntry } from '../db/types';
import { dayStatus, filledDaysOf, type CalendarData } from './calendar';

const entry = (date: string, extra: Partial<DayEntry> = {}): DayEntry => ({
  date, createdAt: '', updatedAt: '', filledLate: false, ...extra,
});
const attack: Attack = {
  id: 'a', startAt: '2026-10-10T08:00:00+02:00', endAt: '2026-10-11T20:00:00+02:00',
  recoveredAt: '2026-10-13T09:00:00+02:00', hadAura: 'non', investigation: {}, status: 'terminée',
};
const data: CalendarData = {
  entries: new Map([['2026-10-05', entry('2026-10-05')], ['2026-10-06', entry('2026-10-06', { warningSigns: ['baillements'] })]]),
  attacks: [attack],
  attackLogs: [
    { id: '1', attackId: 'a', date: '2026-10-10', time: '', intensity: 5, locations: [], painType: [], symptoms: [], worsenedBy: [], relievedBy: [], functional: 'ralentie' },
    { id: '2', attackId: 'a', date: '2026-10-10', time: '', intensity: 8, locations: [], painType: [], symptoms: [], worsenedBy: [], relievedBy: [], functional: 'au lit' },
  ],
  postdromeDays: new Set(),
};
const today = '2026-10-20';

describe('statut des jours du calendrier', () => {
  it('distingue rempli, signaux, vide et futur', () => {
    expect(dayStatus('2026-10-05', today, data).kind).toBe('rempli');
    expect(dayStatus('2026-10-06', today, data).kind).toBe('signaux');
    expect(dayStatus('2026-10-07', today, data).kind).toBe('vide');
    expect(dayStatus('2026-10-21', today, data).kind).toBe('futur');
  });

  it('colore la crise avec l’intensité max du jour', () => {
    expect(dayStatus('2026-10-10', today, data)).toEqual({ kind: 'crise', intensity: 8 });
    expect(dayStatus('2026-10-11', today, data)).toEqual({ kind: 'crise', intensity: null });
  });

  it('marque la post-crise jusqu’au retour à 100 %', () => {
    expect(dayStatus('2026-10-12', today, data).kind).toBe('post-crise');
    expect(dayStatus('2026-10-13', today, data).kind).toBe('post-crise');
    expect(dayStatus('2026-10-14', today, data).kind).toBe('vide');
  });

  it('une crise en cours s’étend jusqu’à aujourd’hui', () => {
    const live: Attack = { ...attack, id: 'b', startAt: '2026-10-19T10:00:00+02:00', endAt: undefined, recoveredAt: undefined, status: 'en cours' };
    expect(dayStatus('2026-10-20', today, { ...data, attacks: [live] }).kind).toBe('crise');
  });

  it('compte les jours de crise remplis pour les objectifs', () => {
    const s = filledDaysOf([entry('2026-10-05')], data.attackLogs, ['2026-10-12']);
    expect([...s].sort()).toEqual(['2026-10-05', '2026-10-10', '2026-10-12']);
  });
});
