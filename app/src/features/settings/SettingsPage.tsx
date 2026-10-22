import { useEffect, useState } from 'react';
import { copy } from '../../content/copy';
import { Card, PageHeader } from '../../components/ui';
import { updateSettings } from '../../db/db';
import type { Settings } from '../../db/types';
import { useSettings } from '../../lib/useSettings';

export function SettingsPage() {
  const settings = useSettings();
  const [persisted, setPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(false));
  }, []);

  if (!settings) return null;
  const themes = Object.entries(copy.settings.themeOptions) as [Settings['theme'], string][];

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={copy.settings.title} />

      <Card>
        <h2 className="font-extrabold mb-3">{copy.settings.theme}</h2>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={copy.settings.theme}>
          {themes.map(([value, label]) => (
            <button
              key={value}
              role="radio"
              aria-checked={settings.theme === value}
              onClick={() => updateSettings({ theme: value })}
              className={`min-h-touch rounded-xl border font-bold ${settings.theme === value ? 'bg-sauge-fort text-surface border-sauge-fort' : 'border-line'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-extrabold">{copy.settings.storage}</h2>
        <p className="text-muted mt-1">{persisted ? copy.settings.storageOn : copy.settings.storageOff}</p>
      </Card>

      <Card>
        <p className="text-muted text-[15px]">{copy.settings.disclaimer}</p>
        <p className="text-muted text-sm mt-3">{copy.settings.version} {__APP_VERSION__}</p>
      </Card>
    </main>
  );
}
