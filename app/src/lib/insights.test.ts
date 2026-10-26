import { describe, expect, it } from 'vitest';
import type { Attack, AttackDayLog, DayEntry, Medication } from '../db/types';
import { addDays } from './dates';
import {
  factorsBeforeAttacks, factorValue, keyFigures, medicationDaysThisMonth, symptomStats, treatmentStats,
  unlockProgress, warningSignsBefore, weatherStats, type InsightsData,
} from './insights';

const today = '2026-10-31';
const R = { start: '2026-10-01', end: '2026-10-31' };
const day = (date: string, extra: Partial<DayEntry> = {}): DayEntry => ({ date, createdAt: '', updatedAt: '', filledLate: false, ...extra });
const attack = (id: string, start: string, painH: number, postH: number, aura: Attack['hadAura'] = 'non'): Attack => {
  const s = new Date(`${start}T10:00:00+01:00`);
  return {
    id, startAt: s.toISOString(), endAt: new Date(s.getTime() + painH * 36e5).toISOString(),
    recoveredAt: new Date(s.getTime() + (painH + postH) * 36e5).toISOString(), hadAura: aura, investigation: {}, status: 'terminée',
  };
};
const log = (attackId: string, date: string, intensity: number, symptoms: string[] = []): AttackDayLog => ({
  id: `${attackId}-${date}-${intensity}`, attackId, date, time: '10:00', intensity, locations: [], painType: [], symptoms, worsenedBy: [], relievedBy: [],
});

/**
 * Octobre : 3 crises (le 10, le 20, le 28). Le stress élevé est présent la veille de chaque crise,
 * et seulement 2 autres jours sur 22. L'alcool est réparti au hasard.
 */
function fixture(): InsightsData {
  const entries: DayEntry[] = [];
  const before = new Set(['2026-10-08', '2026-10-09', '2026-10-18', '2026-10-19', '2026-10-26', '2026-10-27']);
  for (let d = '2026-10-01'; d <= '2026-10-31'; d = addDays(d, 1)) {
    if (['2026-10-10', '2026-10-20', '2026-10-28'].includes(d)) continue; // jours de crise sans check-in
    entries.push(day(d, {
      stress: ['2026-10-09', '2026-10-19', '2026-10-27', '2026-10-03', '2026-10-14'].includes(d) ? 5 : 2,
      alcohol: ['2026-10-05', '2026-10-09', '2026-10-15', '2026-10-24'].includes(d),
      warningSigns: d === '2026-10-19' || d === '2026-10-27' ? ['baillements'] : before.has(d) && d === '2026-10-09' ? ['nuque'] : [],
      sleepHours: 7,
    }));
  }
  return {
    entries,
    attacks: [attack('a', '2026-10-10', 10, 20, 'oui'), attack('b', '2026-10-20', 20, 10), attack('c', '2026-10-28', 6, 6)],
    logs: [log('a', '2026-10-10', 6, ['nausees']), log('a', '2026-10-10', 8, ['nausees', 'lumiere']), log('b', '2026-10-20', 5, ['lumiere']), log('c', '2026-10-28', 4)],
    meds: [],
    postLogs: [],
    customFactors: [],
  };
}

describe('analyses', () => {
  it('reste verrouillé sous 21 jours remplis et 2 crises', () => {
    const p = unlockProgress({ ...fixture(), entries: fixture().entries.slice(0, 10), attacks: fixture().attacks.slice(0, 1) });
    expect(p.unlocked).toBe(false);
    expect(p.missingAttacks).toBe(1);
    expect(p.missingDays).toBeGreaterThan(0);
    expect(unlockProgress(fixture()).unlocked).toBe(true);
  });

  it('calcule les chiffres clés', () => {
    const k = keyFigures(fixture(), R, today);
    expect(k.attacks).toBe(3);
    expect(k.migraineDays).toBe(3 + 1); // b dure 20 h : déborde sur le 21
    expect(k.avgPainHours).toBe(12);
    expect(k.avgPostHours).toBe(12);
    expect(k.avgIntensity).toBe(5.7); // (8 + 5 + 4) / 3
    expect(k.maxIntensity).toBe(8);
    expect(k.auraPercent).toBe(33);
  });

  it('repère ce qui revient avant les crises, et pas le reste', () => {
    const stats = factorsBeforeAttacks(fixture(), R, today);
    const stress = stats.find((s) => s.id === 'stress')!;
    expect(stress.before).toBe(3);
    expect(stress.beforeKnown).toBe(6);
    expect(stress.level).toBe('plus');
    expect(stats[0].id).toBe('stress');
    const alcool = stats.find((s) => s.id === 'alcool')!;
    expect(alcool.level).not.toBe('plus');
  });

  it('ignore un facteur vu moins de 3 fois', () => {
    const data = fixture();
    data.entries.find((e) => e.date === '2026-10-09')!.routineChange = true;
    expect(factorsBeforeAttacks(data, R, today).find((s) => s.id === 'voyage')).toBeUndefined();
  });

  it('distingue « inconnu » de « non »', () => {
    expect(factorValue('stress', day('2026-10-01'))).toBeNull();
    expect(factorValue('lumiere', day('2026-10-01', { screens: 'normal' }))).toBe(false);
    expect(factorValue('detente', day('2026-10-02', { stress: 1 }), day('2026-10-01', { stress: 5 }))).toBe(true);
    expect(factorValue('Règles', day('2026-10-01', { customFactors: { Règles: true } }))).toBe(true);
  });

  it('trouve les petits signaux et leur délai moyen', () => {
    const w = warningSignsBefore(fixture(), R);
    expect(w.signs[0]).toMatchObject({ id: 'baillements', attacks: 2, percent: 67 });
    expect(w.attacksWithSigns).toBe(3);
    expect(w.avgDelayDays).toBe(1);
  });

  it('compte les symptômes une fois par crise', () => {
    const s = symptomStats(fixture(), R);
    expect(s.crisis.find((x) => x.id === 'nausees')).toMatchObject({ attacks: 1, percent: 33 });
    expect(s.crisis[0]).toMatchObject({ id: 'lumiere', attacks: 2 });
  });

  it('compte les jours de traitement et l’efficacité', () => {
    const m = (takenAt: string, category: Medication['category'], efficacyAfter2h?: Medication['efficacyAfter2h']): Medication =>
      ({ id: takenAt, takenAt, name: 'x', category, efficacyAfter2h });
    const data = { ...fixture(), meds: [m('2026-10-10T10:00:00Z', 'triptan', 'bien'), m('2026-10-10T18:00:00Z', 'triptan', 'totalement'), m('2026-10-20T10:00:00Z', 'antalgique simple', 'un peu')] };
    const t = treatmentStats(data, R);
    expect(t.totalDays).toBe(2);
    expect(t.byCategory[0]).toMatchObject({ category: 'triptan', days: 1, avgEfficacy: 2.5 });
  });

  it('signale doucement l’approche des repères de jours de traitement', () => {
    const meds = Array.from({ length: 8 }, (_, i) => ({ id: String(i), takenAt: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00Z`, name: 't', category: 'triptan' as const }));
    expect(medicationDaysThisMonth(meds.slice(0, 7), today).alert).toBe(false);
    expect(medicationDaysThisMonth(meds, today)).toMatchObject({ specific: 8, alert: true });
    expect(medicationDaysThisMonth(meds, '2026-11-05').alert).toBe(false); // nouveau mois
  });

  it('compare la pression les jours de crise (si assez de données)', () => {
    const data = fixture();
    expect(weatherStats(data, R)).toBeNull();
    const w = (date: string, p: number, d: number) => day(date, { weather: { tempMax: 15, pressureMean: p, pressureDelta: d, humidity: 70 } });
    data.entries.push(w('2026-10-10', 1002, -8), w('2026-10-20', 1004, -6));
    data.entries.find((e) => e.date === '2026-10-05')!.weather = { tempMax: 15, pressureMean: 1020, pressureDelta: 1, humidity: 60 };
    data.entries.find((e) => e.date === '2026-10-06')!.weather = { tempMax: 15, pressureMean: 1018, pressureDelta: -1, humidity: 60 };
    expect(weatherStats(data, R)).toMatchObject({ pressureCrisis: 1003, pressureOther: 1019, deltaCrisis: 7, deltaOther: 1 });
  });
});
