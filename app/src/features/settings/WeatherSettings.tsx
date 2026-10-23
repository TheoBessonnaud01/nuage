import { useState } from 'react';
import { Card } from '../../components/ui';
import { copy } from '../../content/copy';
import { updateSettings } from '../../db/db';
import type { Settings } from '../../db/types';
import { currentPosition, searchCity, type Place } from '../../lib/weather';

const t = copy.settings;

export function WeatherSettings({ settings }: { settings: Settings }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = (p: Place) => {
    updateSettings({ location: p, weatherEnabled: true });
    setResults(null);
    setQuery('');
    setError(null);
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-extrabold">{t.weather}</h2>
        <button
          type="button"
          role="switch"
          aria-checked={settings.weatherEnabled}
          disabled={!settings.location}
          onClick={() => updateSettings({ weatherEnabled: !settings.weatherEnabled })}
          className={`min-h-touch px-4 rounded-xl border font-bold disabled:opacity-40 ${settings.weatherEnabled ? 'bg-sauge-fort text-surface border-sauge-fort' : 'border-line'}`}
        >
          {settings.weatherEnabled ? t.weatherOn : t.weatherOff}
        </button>
      </div>
      <p className="text-muted text-[15px] mt-2">{t.weatherHelp}</p>
      <p className="font-bold mt-3">{settings.location ? t.weatherPlace.replace('{lieu}', settings.location.label) : t.weatherNoPlace}</p>

      <button
        type="button"
        onClick={async () => {
          const p = await currentPosition();
          if (p) choose(p); else setError(t.weatherPositionError);
        }}
        className="mt-3 min-h-touch w-full rounded-xl border border-line font-bold"
      >
        {t.weatherUsePosition}
      </button>

      <form
        className="mt-3 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!query.trim()) return;
          const r = await searchCity(query.trim());
          setResults(r);
          setError(r.length ? null : t.weatherNoResult);
        }}
      >
        <label className="sr-only" htmlFor="city">{t.weatherCity}</label>
        <input
          id="city" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.weatherCity}
          className="flex-1 min-h-touch rounded-xl border border-line bg-surface px-3"
        />
        <button type="submit" className="min-h-touch px-4 rounded-xl bg-sauge-fort text-surface font-bold">{t.weatherSearch}</button>
      </form>
      {error && <p className="text-muted mt-2" role="status">{error}</p>}
      {results && results.length > 0 && (
        <ul className="mt-2 space-y-1">
          {results.map((r) => (
            <li key={`${r.lat},${r.lon}`}>
              <button type="button" onClick={() => choose(r)} className="w-full text-left min-h-touch px-3 rounded-xl hover:bg-sauge/20 border border-line">{r.label}</button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
