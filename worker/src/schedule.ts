// Décide quelles notifications envoyer à un instant donné (fonction pure, testée).
import type { PushSubscriptionJSON } from './webpush';

export type Kind = 'soir' | 'matin-suivi' | 'relance-traitement' | 'recap' | 'sauvegarde';

/** Ce que le Worker garde pour une installation. AUCUNE donnée de santé. */
export interface SubRecord {
  installId: string;
  subscription: PushSubscriptionJSON;
  reminderTime: string;          // « HH:MM »
  tz: string;                    // ex. Europe/Paris
  silentDays: number[];          // 0 = dimanche … 6 = samedi
  mode: 'normal' | 'suivi';      // suivi = crise ou post-crise en cours (adapte le message du matin)
  relances: { at: string; kind: 'relance-traitement' }[];
  sent: Partial<Record<Kind, string>>; // dernier jour local d'envoi, pour ne jamais envoyer deux fois
  updatedAt: string;
}

const WINDOW_MIN = 15; // le cron tourne toutes les 15 minutes

export function localParts(now: Date, tz: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23',
    }).formatToParts(now).map((p) => [p.type, p.value]),
  );
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    weekday: weekdays.indexOf(parts.weekday),
    dayOfMonth: Number(parts.day),
  };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const inWindow = (target: string, minutes: number) => minutes >= toMinutes(target) && minutes < toMinutes(target) + WINDOW_MIN;

export interface Decision {
  send: Kind[];
  record: SubRecord; // enregistrement mis à jour (sent, relances restantes)
  changed: boolean;
}

export function decide(r: SubRecord, now: Date): Decision {
  const { date, minutes, weekday, dayOfMonth } = localParts(now, r.tz);
  const send: Kind[] = [];
  const sent = { ...r.sent };
  const mark = (k: Kind) => { send.push(k); sent[k] = date; };

  if (inWindow(r.reminderTime, minutes) && !r.silentDays.includes(weekday) && sent.soir !== date) mark('soir');
  if (r.mode === 'suivi' && inWindow('09:00', minutes) && sent['matin-suivi'] !== date) mark('matin-suivi');
  if (dayOfMonth === 1 && inWindow('10:00', minutes) && sent.recap !== date) mark('recap');
  if (dayOfMonth === 15 && inWindow('10:00', minutes) && sent.sauvegarde !== date) mark('sauvegarde');

  const due = r.relances.filter((x) => new Date(x.at).getTime() <= now.getTime());
  const relances = r.relances.filter((x) => new Date(x.at).getTime() > now.getTime());
  if (due.length) send.push('relance-traitement');

  const changed = send.length > 0;
  return { send, record: changed ? { ...r, sent, relances } : r, changed };
}
