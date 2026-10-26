import 'fake-indexeddb/auto';
import { liveQuery } from 'dexie';
import { describe, expect, it } from 'vitest';
import { loadInsightsData } from './useInsights';
import { loadGoals } from './useGoals';

/** Premier lancement : la base est vide, aucun réglage n'existe encore. Les lectures en direct ne doivent rien écrire. */
describe('lectures en direct sur une base vierge', () => {
  it.each([['analyses', loadInsightsData], ['objectifs', loadGoals]])('%s : pas d’écriture dans une liveQuery', async (_, load) => {
    const result = await new Promise<unknown>((resolve, reject) => {
      const sub = liveQuery(load as () => Promise<unknown>).subscribe({
        next: (v) => { sub.unsubscribe(); resolve(v); },
        error: (e) => { sub.unsubscribe(); reject(e); },
      });
    });
    expect(result).toBeTruthy();
  });
});
