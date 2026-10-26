// Jeu de données de démonstration (développement uniquement, via ?demo=1).
// 4 mois de check-ins, 9 crises, des traitements : de quoi voir les analyses et les récaps.
import { db, getSettings, updateSettings } from '../db/db';
import type { Attack, AttackDayLog, DayEntry, Medication, PostdromeLog } from '../db/types';
import { addDays, localDay } from './dates';

function rng(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
}

export async function seedDemo() {
  const r = rng(42);
  const today = localDay();
  const start = addDays(today, -125);
  const crisisStarts = [12, 25, 33, 47, 60, 71, 86, 99, 113].map((n) => addDays(start, n));
  const before = new Set(crisisStarts.flatMap((d) => [addDays(d, -1), addDays(d, -2)]));
  const entries: DayEntry[] = [];
  for (let d = start; d < today; d = addDays(d, 1)) {
    if (r() < 0.25) continue; // jours non remplis
    const pre = before.has(d);
    entries.push({
      date: d, createdAt: `${d}T20:30:00Z`, updatedAt: `${d}T20:31:00Z`, filledLate: r() < 0.15,
      sleepHours: pre && r() < 0.6 ? 5 + Math.round(r() * 2) / 2 : 7 + Math.round(r() * 3) / 2,
      sleepQuality: (pre && r() < 0.6 ? 2 : 3 + Math.floor(r() * 3)) as DayEntry['sleepQuality'],
      stress: (pre && r() < 0.7 ? 4 + Math.floor(r() * 2) : 1 + Math.floor(r() * 3)) as DayEntry['stress'],
      energy: (2 + Math.floor(r() * 4)) as DayEntry['energy'],
      mood: (2 + Math.floor(r() * 4)) as DayEntry['mood'],
      mealsSkippedOrLate: pre ? r() < 0.5 : r() < 0.1,
      hydration: r() < 0.2 ? 'peu' : r() < 0.6 ? 'moyen' : 'bien',
      caffeine: r() < 0.15 ? 'plus' : 'habituelle',
      alcohol: r() < 0.12,
      screens: pre && r() < 0.5 ? 'beaucoup' : 'normal',
      sensoryExposure: r() < 0.15 ? ['lumiere'] : [],
      physicalEffort: r() < 0.1 ? 'intense' : 'modéré',
      routineChange: r() < 0.06,
      warningSigns: pre && r() < 0.6 ? (r() < 0.5 ? ['baillements', 'nuque'] : ['fringales']) : r() < 0.04 ? ['fatigue'] : [],
      weather: { tempMax: 12 + Math.round(r() * 120) / 10, pressureMean: pre ? 1004 + Math.round(r() * 60) / 10 : 1012 + Math.round(r() * 100) / 10, pressureDelta: pre ? -3 - Math.round(r() * 50) / 10 : Math.round((r() - 0.5) * 40) / 10, humidity: 50 + Math.floor(r() * 40) },
      headacheToday: 'non',
    });
  }
  const attacks: Attack[] = [];
  const logs: AttackDayLog[] = [];
  const meds: Medication[] = [];
  const post: PostdromeLog[] = [];
  crisisStarts.forEach((d, i) => {
    const id = `demo-${i}`;
    const s = new Date(`${d}T${String(8 + Math.floor(r() * 10)).padStart(2, '0')}:00:00`);
    const painH = 6 + Math.floor(r() * 30);
    const postH = 12 + Math.floor(r() * 30);
    const end = new Date(s.getTime() + painH * 36e5);
    attacks.push({ id, startAt: s.toISOString(), endAt: end.toISOString(), recoveredAt: new Date(end.getTime() + postH * 36e5).toISOString(), hadAura: r() < 0.3 ? 'oui' : 'non', auraTypes: ['visuelle'], investigation: { doneAt: s.toISOString() }, status: 'terminée' });
    logs.push({ id: `${id}-l1`, attackId: id, date: localDay(s), time: '10:00', intensity: 5 + Math.floor(r() * 5), locations: ['tempe-gauche'], painType: ['pulsatile'], symptoms: r() < 0.7 ? ['nausees', 'lumiere'] : ['lumiere', 'bruit'], worsenedBy: ['lumiere', 'mouvement'], relievedBy: r() < 0.6 ? ['obscurite', 'sommeil'] : ['froid'], functional: 'au lit' });
    meds.push({ id: `${id}-m1`, attackId: id, takenAt: new Date(s.getTime() + 36e5).toISOString(), name: r() < 0.5 ? 'Ibuprofène 400' : 'Sumatriptan', category: r() < 0.5 ? 'anti-inflammatoire' : 'triptan', efficacyAfter2h: (['un peu', 'bien', 'totalement'] as const)[Math.floor(r() * 3)] });
    post.push({ id: `${id}-p1`, attackId: id, date: localDay(end), symptoms: ['epuisement', 'brouillard'], percentBack: 60 });
  });
  await db.transaction('rw', [db.days, db.attacks, db.attackLogs, db.medications, db.postdromeLogs, db.recaps], async () => {
    await Promise.all([db.days.clear(), db.attacks.clear(), db.attackLogs.clear(), db.medications.clear(), db.postdromeLogs.clear(), db.recaps.clear()]);
    await db.days.bulkPut(entries);
    await db.attacks.bulkPut(attacks);
    await db.attackLogs.bulkPut(logs);
    await db.medications.bulkPut(meds);
    await db.postdromeLogs.bulkPut(post);
  });
  await getSettings();
  await updateSettings({ onboardingDone: true, medicationCatalog: [{ name: 'Ibuprofène 400', category: 'anti-inflammatoire' }, { name: 'Sumatriptan', category: 'triptan' }] });
}
