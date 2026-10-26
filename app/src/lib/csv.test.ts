import { describe, expect, it } from 'vitest';
import { attacksCsv, daysCsv, medicationsCsv, toCsv } from './csv';

describe('exports CSV', () => {
  it('produit un CSV « français » (point-virgule, virgule décimale, BOM)', () => {
    const csv = toCsv(['a', 'b'], [[1.5, 'x;y'], [true, 'il a dit "ok"']]);
    expect(csv.startsWith('﻿a;b\r\n')).toBe(true);
    expect(csv).toContain('1,5;"x;y"');
    expect(csv).toContain('oui;"il a dit ""ok"""');
  });

  it('exporte jours, crises et traitements avec des libellés lisibles', () => {
    const days = daysCsv([{ date: '2026-10-02', createdAt: '', updatedAt: '', filledLate: true, sleepHours: 6.5, warningSigns: ['baillements'], note: 'ligne 1\nligne 2' }]);
    expect(days.split('\r\n')[1]).toMatch(/^2026-10-02;oui;6,5;/);
    expect(days).toContain('Bâillements répétés');
    expect(days).toContain('"ligne 1\nligne 2"');
    const attacks = [{ id: 'a', startAt: '2026-10-03T08:00:00Z', endAt: '2026-10-03T14:00:00Z', hadAura: 'oui' as const, auraTypes: ['visuelle'], investigation: {}, status: 'terminée' as const }];
    const a = attacksCsv(attacks, [{ id: 'l', attackId: 'a', date: '2026-10-03', time: '10:00', intensity: 7, locations: [], painType: [], symptoms: ['nausees'], worsenedBy: [], relievedBy: [] }]);
    expect(a).toContain(';6;;7;oui;Troubles visuels;Nausées;terminée;');
    const m = medicationsCsv([{ id: 'm', attackId: 'a', takenAt: '2026-10-03T09:00:00Z', name: 'Sumatriptan', category: 'triptan', efficacyAfter2h: 'bien' }], attacks);
    expect(m).toContain(';Sumatriptan;triptan;bien;');
  });
});
