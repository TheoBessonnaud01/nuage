import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { copy } from '../../content/copy';
import { Card, PageHeader } from '../../components/ui';
import { updateSettings } from '../../db/db';
import type { Settings } from '../../db/types';
import { useSettings } from '../../lib/useSettings';
import { WeatherSettings } from './WeatherSettings';
import { Icon } from '../../ui/Icon';
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
            className="field mt-2 w-full"
          />
        </label>
      </Card>

      <nav className="grid gap-2" aria-label={copy.settings.title}>
        {([
          ['/reglages/listes', copy.settings.sections.lists, 'menu', 'grad-peach'],
          ['/reglages/traitements', copy.settings.sections.meds, 'pill', 'grad-lilac'],
          ['/reglages/donnees', copy.settings.sections.data, 'download', 'grad-mint'],
          ['/reglages/apropos', copy.settings.sections.about, 'info', 'grad-sky'],
        ] as const).map(([to, label, icon, tone]) => (
          <Link key={to} to={to} className="press flex items-center gap-4 rounded-[22px] bg-c-surface shadow-soft p-3 font-bold">
            <span className={`grid place-items-center w-11 h-11 rounded-2xl text-c-on-grad ${tone}`}><Icon name={icon} /></span>
            <span className="flex-1">{label}</span><Icon name="chevron-right" className="text-c-muted" />
          </Link>
        ))}
      </nav>

      <NotificationSettings settings={settings} />

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold mb-3">{copy.settings.theme}</h2>
        <Choice label={copy.settings.theme} options={themes} value={settings.theme} onChange={(v) => updateSettings({ theme: v })} />
      </Card>

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold mb-3">{copy.settings.mascot}</h2>
        <Choice
          label={copy.settings.mascot}
          options={mascotModes}
          value={settings.mascotMode}
          onChange={(v) => updateSettings({ mascotMode: v })}
        />
        <p className="text-c-muted text-[15px] mt-3">{copy.settings.mascotHelp}</p>
      </Card>

      <WeatherSettings settings={settings} />

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold">{copy.settings.storage}</h2>
        <p className="text-c-muted mt-1">{persisted ? copy.settings.storageOn : copy.settings.storageOff}</p>
      </Card>

      <p className="text-c-muted text-sm text-center">{copy.settings.version} {__APP_VERSION__}</p>

      <Link
        to="/bienvenue"
        className="block text-center font-bold underline text-c-accent min-h-touch py-3"
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
    <div className="grid grid-cols-3 gap-1 rounded-full bg-c-surface-2 p-1" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button
          key={v}
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`press min-h-[44px] rounded-full font-bold text-[14.5px] ${value === v ? 'bg-c-primary text-c-on-primary shadow-soft' : 'text-c-muted'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
