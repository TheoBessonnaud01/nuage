import { describe, expect, it } from 'vitest';
import { buildMessage } from '../src/messages';
import { decide, type SubRecord } from '../src/schedule';

const base: SubRecord = {
  installId: 'x', subscription: { endpoint: 'https://e', keys: { p256dh: '', auth: '' } },
  reminderTime: '20:30', tz: 'Europe/Paris', silentDays: [], mode: 'normal', relances: [], sent: {}, updatedAt: '',
};
// jeudi 22 octobre 2026, Paris = UTC+2
const at = (localIso: string) => new Date(`${localIso}+02:00`);

describe('planification des notifications', () => {
  it('envoie le rappel du soir dans la fenêtre de 15 min, une seule fois', () => {
    expect(decide(base, at('2026-10-22T20:29:00')).send).toEqual([]);
    const d = decide(base, at('2026-10-22T20:30:10'));
    expect(d.send).toEqual(['soir']);
    expect(decide(d.record, at('2026-10-22T20:44:00')).send).toEqual([]);
    expect(decide(base, at('2026-10-22T20:45:00')).send).toEqual([]);
  });

  it('gère une heure de rappel qui ne tombe pas pile sur le quart d’heure', () => {
    const r = { ...base, reminderTime: '20:40' };
    expect(decide(r, at('2026-10-22T20:30:00')).send).toEqual([]);
    expect(decide(r, at('2026-10-22T20:45:00')).send).toEqual(['soir']);
  });

  it('respecte les jours silencieux (jeudi = 4)', () => {
    expect(decide({ ...base, silentDays: [4] }, at('2026-10-22T20:30:00')).send).toEqual([]);
  });

  it('ajoute le message du matin pendant une crise', () => {
    expect(decide(base, at('2026-10-22T09:00:00')).send).toEqual([]);
    expect(decide({ ...base, mode: 'suivi' }, at('2026-10-22T09:05:00')).send).toEqual(['matin-suivi']);
  });

  it('envoie les relances arrivées à échéance et garde les autres', () => {
    const r = { ...base, relances: [{ at: '2026-10-22T12:00:00Z', kind: 'relance-traitement' as const }, { at: '2026-10-22T18:00:00Z', kind: 'relance-traitement' as const }] };
    const d = decide(r, new Date('2026-10-22T12:05:00Z'));
    expect(d.send).toEqual(['relance-traitement']);
    expect(d.record.relances).toHaveLength(1);
  });

  it('récap le 1er à 10h, sauvegarde le 15 à 10h', () => {
    // 1er novembre = heure d'hiver : 10h à Paris = 09h UTC
    expect(decide(base, new Date('2026-11-01T08:00:00Z')).send).toEqual([]);
    expect(decide(base, new Date('2026-11-01T09:00:00Z')).send).toEqual(['recap']);
    expect(decide(base, new Date('2026-11-15T09:10:00Z')).send).toEqual(['sauvegarde']);
  });

  it('écrit les messages comme Pépite, avec le prénom', () => {
    const m = buildMessage('soir', 'Noémie', () => 0.35);
    expect(m.title).toBe('🐯 Pépite');
    expect(m.body).toContain('Noémie');
    expect(m.url).toBe('#/checkin');
  });
});
