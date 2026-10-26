import { useState } from 'react';
import { Card, PageHeader } from '../../components/ui';
import { Chip } from '../../components/inputs';
import { copy } from '../../content/copy';
import { medicationCategories } from '../../content/factors';
import { addToCatalog } from '../../db/attacks';
import { updateSettings } from '../../db/db';
import type { Medication } from '../../db/types';
import { useSettings } from '../../lib/useSettings';

const t = copy.medsSettings;

export function MedicationsSettingsPage() {
  const settings = useSettings();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Medication['category']>('autre');
  if (!settings) return null;
  const list = settings.medicationCatalog ?? [];
  const label = (c: string) => medicationCategories.find((m) => m.value === c)?.label ?? c;

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} backTo="/reglages" />
      <p className="text-muted">{t.intro}</p>
      <Card>
        {list.length === 0 ? <p className="text-muted">{t.empty}</p> : (
          <ul className="space-y-2">
            {list.map((m) => (
              <li key={m.name} className="flex items-center gap-2 rounded-xl border border-line p-2">
                <span className="flex-1"><span className="font-bold">{m.name}</span> <span className="text-sm text-muted">· {label(m.category)}</span></span>
                <button type="button" aria-label={`${t.remove} : ${m.name}`} onClick={() => updateSettings({ medicationCatalog: list.filter((x) => x.name !== m.name) })} className="min-h-touch min-w-touch rounded-lg border border-line">🗑️</button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="space-y-3">
        <label className="block">
          <span className="font-bold">{t.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full min-h-touch rounded-xl border-2 border-line bg-surface px-3 text-[16px]" />
        </label>
        <div>
          <p className="font-bold mb-2">{t.category}</p>
          <div className="grid gap-2">
            {medicationCategories.map((c) => (
              <Chip key={c.value} selected={category === c.value} onClick={() => setCategory(c.value)}>
                {c.label} {c.help && <span className="text-muted font-normal text-sm">({c.help})</span>}
              </Chip>
            ))}
          </div>
        </div>
        <button type="button" disabled={!name.trim()} onClick={async () => { await addToCatalog({ name: name.trim(), category }); setName(''); }}
          className="min-h-touch w-full rounded-2xl bg-sauge-fort text-surface font-bold disabled:opacity-40">{t.add}</button>
      </Card>
    </main>
  );
}
