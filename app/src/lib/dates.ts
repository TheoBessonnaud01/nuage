import { config } from '../config';

/** Jour local (Europe/Paris) au format YYYY-MM-DD, quel que soit le fuseau du téléphone. */
export function localDay(d: Date = new Date(), timeZone: string = config.timeZone): string {
  // en-CA donne directement YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Heure locale (0–23) à Paris. */
export function localHour(d: Date = new Date(), timeZone: string = config.timeZone): number {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(d));
}

/** Entre minuit et 4h, une saisie concerne souvent la veille (« C'est pour hier soir ? »). */
export function isLateNight(d: Date = new Date()): boolean {
  return localHour(d) < 4;
}
