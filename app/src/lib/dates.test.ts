import { describe, expect, it } from 'vitest';
import { isLateNight, localDay, localHour } from './dates';

describe('dates Europe/Paris', () => {
  it('rattache 23h30 UTC en été au lendemain à Paris', () => {
    expect(localDay(new Date('2026-07-14T23:30:00Z'))).toBe('2026-07-15');
  });
  it('donne l’heure locale', () => {
    expect(localHour(new Date('2026-01-10T19:30:00Z'))).toBe(20);
  });
  it('détecte la fin de nuit', () => {
    expect(isLateNight(new Date('2026-01-10T00:30:00Z'))).toBe(true);
    expect(isLateNight(new Date('2026-01-10T12:00:00Z'))).toBe(false);
  });
});

import { addDays, addMonths, daysOfMonth, diffDays, formatDayLong, weekStart } from './dates';

describe('calculs sur les jours', () => {
  it('ajoute des jours en traversant les mois et l’heure d’été', () => {
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(diffDays('2026-03-28', '2026-04-02')).toBe(5);
  });
  it('trouve le lundi de la semaine', () => {
    expect(weekStart('2026-10-22')).toBe('2026-10-19'); // jeudi → lundi
    expect(weekStart('2026-10-25')).toBe('2026-10-19'); // dimanche → lundi
    expect(weekStart('2026-10-19')).toBe('2026-10-19');
  });
  it('liste les jours du mois', () => {
    expect(daysOfMonth('2026-02')).toHaveLength(28);
    expect(addMonths('2026-12', 1)).toBe('2027-01');
  });
  it('formate en français', () => {
    expect(formatDayLong('2026-10-20')).toBe('mardi 20 octobre');
  });
});
