import { describe, expect, it } from 'vitest';
import { pickInfoCard } from './infoSuggest';

describe('fiche au bon moment', () => {
  it('propose la fiche liée au geste', () => {
    expect(pickInfoCard('premier-signal', [], undefined, '2026-10-26')).toBe('signaux');
    expect(pickInfoCard('premiere-fin', [], undefined, '2026-10-26')).toBe('post-crise');
  });
  it('jamais deux fois la même', () => {
    expect(pickInfoCard('premier-signal', ['signaux'], '2026-10-01', '2026-10-26')).toBeNull();
  });
  it('au maximum une par jour', () => {
    expect(pickInfoCard('premiere-aura', ['signaux'], '2026-10-26', '2026-10-26')).toBeNull();
    expect(pickInfoCard('premiere-aura', ['signaux'], '2026-10-25', '2026-10-26')).toBe('aura');
  });
});
