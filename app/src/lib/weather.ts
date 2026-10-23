import type { Weather } from '../db/types';
import { addDays, diffDays, localDay } from './dates';

// Open-Meteo : gratuit, sans clé. Seules des coordonnées (arrondies) partent vers leur serveur,
// jamais de donnée de santé.

interface OpenMeteoResponse {
  hourly?: { time: string[]; pressure_msl: (number | null)[]; relative_humidity_2m: (number | null)[] };
  daily?: { time: string[]; temperature_2m_max: (number | null)[] };
}

const mean = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => typeof x === 'number');
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
const round1 = (x: number) => Math.round(x * 10) / 10;

/** Calcule la météo du jour `date` à partir de la réponse (qui doit couvrir la veille et le jour). */
export function computeWeather(json: OpenMeteoResponse, date: string): Weather | null {
  const h = json.hourly;
  const d = json.daily;
  if (!h || !d) return null;
  const pick = (day: string, arr: (number | null)[]) => arr.filter((_, i) => h.time[i]?.startsWith(day));
  const p = mean(pick(date, h.pressure_msl));
  const pPrev = mean(pick(addDays(date, -1), h.pressure_msl));
  const hum = mean(pick(date, h.relative_humidity_2m));
  const tIdx = d.time.indexOf(date);
  const tMax = tIdx >= 0 ? d.temperature_2m_max[tIdx] : null;
  if (p === null || hum === null || tMax == null) return null;
  return {
    tempMax: round1(tMax),
    pressureMean: round1(p),
    pressureDelta: pPrev === null ? 0 : round1(p - pPrev),
    humidity: Math.round(hum),
  };
}

/** Météo d'un jour (passé ou aujourd'hui). Renvoie null en cas d'échec, sans jamais bloquer. */
export async function fetchWeather(lat: number, lon: number, date: string, signal?: AbortSignal): Promise<Weather | null> {
  try {
    const age = diffDays(date, localDay());
    // Au-delà de ~2 mois, l'API « archive » prend le relais.
    const host = age > 60 ? 'https://archive-api.open-meteo.com/v1/archive' : 'https://api.open-meteo.com/v1/forecast';
    const params = new URLSearchParams({
      latitude: lat.toFixed(2),
      longitude: lon.toFixed(2),
      hourly: 'pressure_msl,relative_humidity_2m',
      daily: 'temperature_2m_max',
      timezone: 'Europe/Paris',
      start_date: addDays(date, -1),
      end_date: date,
    });
    const res = await fetch(`${host}?${params}`, { signal });
    if (!res.ok) return null;
    return computeWeather(await res.json(), date);
  } catch {
    return null;
  }
}

export interface Place { lat: number; lon: number; label: string }

/** Recherche d'une ville (géocodage Open-Meteo). */
export async function searchCity(name: string): Promise<Place[]> {
  try {
    const params = new URLSearchParams({ name, count: '5', language: 'fr', format: 'json' });
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: { latitude: number; longitude: number; name: string; admin1?: string; country?: string }[] };
    return (json.results ?? []).map((r) => ({
      lat: r.latitude, lon: r.longitude, label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    }));
  } catch {
    return [];
  }
}

/** Position actuelle, arrondie (~1 km) : suffisant pour la météo, plus discret. */
export function currentPosition(): Promise<Place | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: round2(p.coords.latitude), lon: round2(p.coords.longitude), label: 'Ma position' }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 3600000 },
    );
  });
}
const round2 = (x: number) => Math.round(x * 100) / 100;
