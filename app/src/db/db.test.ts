import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { NuageDB, getSettings, updateSettings } from './db';

describe('base Dexie', () => {
  it('crée des réglages par défaut puis les met à jour', async () => {
    const d = new NuageDB('test-settings');
    const s = await getSettings(d);
    expect(s.reminderTime).toBe('20:30');
    expect(s.customLists.medications).toEqual([]);
    await updateSettings({ reminderTime: '21:00' }, d);
    expect((await getSettings(d)).reminderTime).toBe('21:00');
    expect((await getSettings(d)).installId).toBe(s.installId);
  });

  it('stocke un jour par date', async () => {
    const d = new NuageDB('test-days');
    const now = new Date().toISOString();
    await d.days.put({ date: '2026-10-22', createdAt: now, updatedAt: now, filledLate: false, stress: 2 });
    await d.days.put({ date: '2026-10-22', createdAt: now, updatedAt: now, filledLate: false, stress: 4 });
    expect(await d.days.count()).toBe(1);
    expect((await d.days.get('2026-10-22'))?.stress).toBe(4);
  });
});
