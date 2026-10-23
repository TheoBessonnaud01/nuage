import { describe, expect, it } from 'vitest';
import { computeWeather } from './weather';

const hours = (day: string) => Array.from({ length: 24 }, (_, i) => `${day}T${String(i).padStart(2, '0')}:00`);

describe('météo', () => {
  it('calcule moyenne de pression, variation vs veille, humidité et T max', () => {
    const json = {
      hourly: {
        time: [...hours('2026-10-19'), ...hours('2026-10-20')],
        pressure_msl: [...Array(24).fill(1015), ...Array(24).fill(1008.5)],
        relative_humidity_2m: [...Array(24).fill(50), ...Array(12).fill(80), ...Array(12).fill(70)],
      },
      daily: { time: ['2026-10-19', '2026-10-20'], temperature_2m_max: [17.2, 14.06] },
    };
    expect(computeWeather(json, '2026-10-20')).toEqual({ tempMax: 14.1, pressureMean: 1008.5, pressureDelta: -6.5, humidity: 75 });
  });

  it('renvoie null si les données manquent', () => {
    expect(computeWeather({}, '2026-10-20')).toBeNull();
  });
});
