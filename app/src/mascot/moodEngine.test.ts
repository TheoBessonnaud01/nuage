import { describe, expect, it } from 'vitest';
import { getMood, homeLineContext, type MoodContext } from './moodEngine';

// 14h à Paris en hiver (UTC+1)
const afternoon = new Date('2026-01-15T13:00:00Z');
const base: MoodContext = { now: afternoon };

describe('getMood', () => {
  it('joyeux par défaut', () => {
    expect(getMood(base)).toBe('joyeux');
  });

  it('respecte la priorité crise > post-crise > enquête > célébration > nuit', () => {
    const all: MoodContext = {
      now: new Date('2026-01-15T23:30:00Z'), // 0h30 à Paris
      attackStatus: 'en cours', investigating: true, pendingCelebration: 'palier',
      previousOpenedAt: '2026-01-01T10:00:00Z', checkinDoneAt: '2026-01-15T23:20:00Z',
    };
    expect(getMood(all)).toBe('calin');
    expect(getMood({ ...all, attackStatus: 'post-crise' })).toBe('fatigue');
    expect(getMood({ ...all, attackStatus: null })).toBe('detective');
    expect(getMood({ ...all, attackStatus: null, investigating: false })).toBe('fete');
    expect(getMood({ ...all, attackStatus: null, investigating: false, pendingCelebration: null })).toBe('dort');
  });

  it('dort entre 23h et 6h (heure de Paris)', () => {
    expect(getMood({ now: new Date('2026-01-15T22:05:00Z') })).toBe('dort'); // 23h05
    expect(getMood({ now: new Date('2026-01-15T04:55:00Z') })).toBe('dort'); // 5h55
    expect(getMood({ now: new Date('2026-01-15T05:05:00Z') })).toBe('joyeux'); // 6h05
  });

  it('retrouvailles après 5 jours sans ouverture, pas avant', () => {
    expect(getMood({ ...base, previousOpenedAt: '2026-01-10T12:00:00Z' })).toBe('retrouvailles');
    expect(getMood({ ...base, previousOpenedAt: '2026-01-11T14:00:00Z' })).toBe('joyeux');
  });

  it('fier pendant 1 h après le check-in, puis joyeux', () => {
    expect(getMood({ ...base, checkinDoneAt: '2026-01-15T12:30:00Z' })).toBe('fier');
    expect(getMood({ ...base, checkinDoneAt: '2026-01-15T11:30:00Z' })).toBe('joyeux');
  });

  it('les retrouvailles passent avant la fierté', () => {
    expect(getMood({ ...base, previousOpenedAt: '2026-01-01T10:00:00Z', checkinDoneAt: '2026-01-15T12:50:00Z' })).toBe('retrouvailles');
  });

  it('ne renvoie jamais un état triste, quelle que soit l’absence', () => {
    for (const days of [0, 1, 4, 5, 30, 365]) {
      const prev = new Date(afternoon.getTime() - days * 86400000).toISOString();
      expect(['joyeux', 'retrouvailles']).toContain(getMood({ ...base, previousOpenedAt: prev }));
    }
  });
});

describe('homeLineContext', () => {
  it('salue selon l’heure', () => {
    expect(homeLineContext({ now: new Date('2026-01-15T08:00:00Z') })).toBe('accueilMatin');
    expect(homeLineContext(base)).toBe('accueilApresMidi');
    expect(homeLineContext({ now: new Date('2026-01-15T19:00:00Z') })).toBe('accueilSoir');
  });

  it('distingue le matin d’une crise commencée la veille', () => {
    const morning = new Date('2026-01-15T08:00:00Z');
    expect(homeLineContext({ now: morning, attackStatus: 'en cours', attackStartedAt: '2026-01-14T15:00:00Z' })).toBe('matinCrise');
    expect(homeLineContext({ now: morning, attackStatus: 'en cours', attackStartedAt: '2026-01-15T07:00:00Z' })).toBe('criseEnCours');
  });

  it('choisit récap ou palier pour la fête', () => {
    expect(homeLineContext({ ...base, pendingCelebration: 'recap' })).toBe('recap');
    expect(homeLineContext({ ...base, pendingCelebration: 'palier' })).toBe('palier');
  });
});
