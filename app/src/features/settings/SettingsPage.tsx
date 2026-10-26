import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { copy } from '../../content/copy';
import { Card, PageHeader } from '../../components/ui';
import { updateSettings } from '../../db/db';
import type { Settings } from '../../db/types';
import { useSettings } from '../../lib/useSettings';
import { WeatherSettings } from './WeatherSettings';
import { NotificationSettings } from './NotificationSettings';

export function SettingsPage() {
  const settings = useSettings();
  const [persisted, setPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(false));
  }, []);

  if (!settings) return null;
  const themes = Object.entries(copy.settings.themeOptions) as [Settings['theme'], string][];
  const mascotModes = Object.entries(copy.settings.mascotOptions) as [Settings['mascotMode'], string][];

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={copy.settings.title} />

      <Card>
        <label className="block">
          <span className="font-extrabold">{copy.settings.firstName}</span>
          <input
            defaultValue={settings.firstName}
            onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== settings.firstName) updateSettings({ firstName: v }); }}
            className="mt-2 w-full min-h-touch rounded-xl border-2 border-line bg-surface px-3 text-[16px]"
          />
        </label>
      </Card>

      <nav className="grid gap-2" aria-label={copy.settings.title}>
        {([['/reglages/listes', copy.settings.sections.lists], ['/reglages/traitements', copy.settings.sections.meds], ['/reglages/donnees', copy.settings.sections.data], ['/reglages/apropos', copy.settings.sections.about]] as const).map(([to, label]) => (
          <Link key={to} to={to} className="flex items-center justify-between rounded-2xl bg-surface border border-line px-4 min-h-touch py-3 font-bold">
            <span>{label}</span><span className="text-muted" aria-hidden>›</span>
          </Link>
        ))}
      </nav>

      <NotificationSettings settings={settings} />

      <Card>
        <h2 className="font-extrabold mb-3">{copy.settings.theme}</h2>
        <Choice label={copy.settings.theme} options={themes} value={settings.theme} onChange={(v) => updateSettings({ theme: v })} />
      </Card>

      <Card>
        <h2 className="font-extrabold mb-3">{copy.settings.mascot}</h2>
        <Choice
          label={copy.settings.mascot}
          options={mascotModes}
          value={settings.mascotMode}
          onChange={(v) => updateSettings({ mascotMode: v })}
        />
        <p className="text-muted text-[15px] mt-3">{copy.settings.mascotHelp}</p>
      </Card>

      <WeatherSettings settings={settings} />

      <Card>
        <h2 className="font-extrabold">{copy.settings.storage}</h2>
        <p className="text-muted mt-1">{persisted ? copy.settings.storageOn : copy.settings.storageOff}</p>
      </Card>

      <p className="text-muted text-sm text-center">{copy.settings.version} {__APP_VERSION__}</p>

      <Link
        to="/bienvenue"
        className="block text-center font-bold underline text-sauge-fort min-h-touch py-3"
      >
        {copy.settings.replayOnboarding}
      </Link>
    </main>
  );
}

function Choice<T extends string>({
  label, options, value, onChange,
}: { label: string; options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button
          key={v}
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`min-h-touch rounded-xl border font-bold ${value === v ? 'bg-sauge-fort text-surface border-sauge-fort' : 'border-line'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
