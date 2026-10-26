import { describe, expect, it } from 'vitest';
import type { Attack } from '../db/types';
import { doctorPdf, pdfText, recapPdf } from './pdf';
import { buildRecap } from './recap';
import type { InsightsData } from './insights';

const attack: Attack = { id: 'a', startAt: '2026-10-10T08:00:00Z', endAt: '2026-10-10T20:00:00Z', recoveredAt: '2026-10-11T12:00:00Z', hadAura: 'oui', auraTypes: ['visuelle'], investigation: {}, status: 'terminée' };
const data: InsightsData = {
  entries: [{ date: '2026-10-09', createdAt: '', updatedAt: '', filledLate: false, stress: 5, warningSigns: ['baillements'] }],
  attacks: [attack],
  logs: [{ id: 'l', attackId: 'a', date: '2026-10-10', time: '10:00', intensity: 7, locations: [], painType: [], symptoms: ['nausees'], worsenedBy: [], relievedBy: [] }],
  meds: [{ id: 'm', attackId: 'a', takenAt: '2026-10-10T09:00:00Z', name: 'Sumatriptan', category: 'triptan', efficacyAfter2h: 'bien' }],
  postLogs: [], customFactors: [],
};

async function text(blob: Blob) {
  return new TextDecoder('latin1').decode(await blob.arrayBuffer());
}

describe('PDF', () => {
  it('nettoie les caractères que les polices PDF ne savent pas afficher', () => {
    expect(pdfText('L’œil… ↑ 🐯 « ok »')).toBe("L'oeil... + « ok »");
  });

  it('génère le PDF médecin avec la mention et les crises', async () => {
    const t = await text(doctorPdf(data, 'Noémie', { start: '2026-10-01', end: '2026-10-31' }));
    expect(t.startsWith('%PDF')).toBe(true);
    expect(t).toContain('Journal tenu par la patiente');
    expect(t).toContain('Sumatriptan');
  });

  it('génère le récap mensuel sur une seule page', async () => {
    const cal = { entries: new Map(data.entries.map((e) => [e.date, e])), attacks: data.attacks, attackLogs: data.logs, postdromeDays: new Set<string>() };
    const blob = recapPdf(buildRecap(data, cal, '2026-10', '2026-11-02'), 'Noémie');
    const t = await text(blob);
    expect(t).toContain('/Count 1');
  });
});
