import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { NuageDB, getSettings } from '../db/db';
import { BackupError, createBackup, parseBackup, restoreBackup } from './backup';

const day = (date: string, updatedAt: string, stress: 1 | 5) => ({ date, createdAt: updatedAt, updatedAt, filledLate: false, stress });

describe('sauvegarde et restauration', () => {
  it('fait un aller-retour complet (remplacement)', async () => {
    const a = new NuageDB('bk-a');
    await getSettings(a);
    await a.days.bulkPut([day('2026-10-01', '2026-10-01T20:00:00Z', 5), day('2026-10-02', '2026-10-02T20:00:00Z', 1)]);
    await a.attacks.put({ id: 'x', startAt: '2026-10-03T10:00:00Z', hadAura: 'non', investigation: {}, status: 'terminée' });
    const text = JSON.stringify(await createBackup(a));

    const b = new NuageDB('bk-b');
    const before = await getSettings(b);
    await b.days.put(day('2026-09-01', '2026-09-01T20:00:00Z', 1));
    await restoreBackup(parseBackup(text), 'remplacement', b);
    expect((await b.days.toArray()).map((d) => d.date)).toEqual(['2026-10-01', '2026-10-02']);
    expect(await b.attacks.count()).toBe(1);
    expect((await getSettings(b)).installId).toBe(before.installId); // identité conservée
  });

  it('fusionne en gardant la version la plus récente d’un même jour', async () => {
    const src = new NuageDB('bk-src');
    await getSettings(src);
    await src.days.bulkPut([day('2026-10-01', '2026-10-05T10:00:00Z', 5), day('2026-10-02', '2026-10-01T10:00:00Z', 5)]);
    const backup = parseBackup(JSON.stringify(await createBackup(src)));

    const dst = new NuageDB('bk-dst');
    await getSettings(dst);
    await dst.days.bulkPut([day('2026-10-01', '2026-10-02T10:00:00Z', 1), day('2026-10-02', '2026-10-03T10:00:00Z', 1), day('2026-10-03', '2026-10-03T10:00:00Z', 1)]);
    await restoreBackup(backup, 'fusion', dst);
    const days = await dst.days.toArray();
    expect(days).toHaveLength(3);
    expect(days.find((d) => d.date === '2026-10-01')?.stress).toBe(5); // la sauvegarde est plus récente
    expect(days.find((d) => d.date === '2026-10-02')?.stress).toBe(1); // le téléphone est plus récent
  });

  it('refuse un fichier qui n’est pas une sauvegarde Nuage', () => {
    expect(() => parseBackup('pas du json')).toThrow(BackupError);
    expect(() => parseBackup('{"app":"autre"}')).toThrow(BackupError);
    expect(() => parseBackup('{"app":"nuage","version":99,"data":{}}')).toThrow(BackupError);
    expect(() => parseBackup('{"app":"nuage","version":1,"data":{"days":[{"date":"hier"}]}}')).toThrow(BackupError);
  });
});
