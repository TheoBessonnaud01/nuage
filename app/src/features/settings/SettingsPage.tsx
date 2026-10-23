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

      <Card>
        <p className="text-muted text-[15px]">{copy.settings.disclaimer}</p>
        <p className="text-muted text-sm mt-3">{copy.settings.version} {__APP_VERSION__}</p>
      </Card>

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
