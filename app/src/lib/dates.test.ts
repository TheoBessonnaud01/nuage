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
