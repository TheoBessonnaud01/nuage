import { useState } from 'react';
import { Card, PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { updateSettings } from '../../db/db';
import type { Settings } from '../../db/types';
import { customKey, managedList, type ListKind } from '../../lib/lists';
import { useSettings } from '../../lib/useSettings';

const t = copy.lists;
const kinds: ListKind[] = ['customFactors', 'warningSigns', 'crisisSymptoms', 'postdromeSymptoms'];

function ListEditor({ kind, settings }: { kind: ListKind; settings: Settings }) {
  const [text, setText] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const items = managedList(kind, settings);
  const prefs = settings.listPrefs?.[kind] ?? {};
  const savePrefs = (p: { order?: string[]; renamed?: Record<string, string> }) =>
    updateSettings({ listPrefs: { ...(settings.listPrefs ?? {}), [kind]: { ...prefs, ...p } } });
  const hideKey = (id: string) => `${kind}:${id}`;

  const add = () => {
    const label = text.trim();
    if (!label || items.some((i) => i.label.toLowerCase() === label.toLowerCase())) return;
    const key = customKey[kind];
    updateSettings({ customLists: { ...settings.customLists, [key]: [...settings.customLists[key], label] } });
    setText('');
  };
  const toggleHide = (id: string, hidden: boolean) => updateSettings({
    hiddenDefaults: hidden ? settings.hiddenDefaults.filter((h) => h !== hideKey(id) && h !== id) : [...settings.hiddenDefaults, hideKey(id)],
  });
  const remove = (id: string) => {
    const key = customKey[kind];
    updateSettings({ customLists: { ...settings.customLists, [key]: settings.customLists[key].filter((l) => l !== id) } });
  };
  const move = (index: number, dir: -1 | 1) => {
    const ids = items.map((i) => i.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    savePrefs({ order: ids });
  };
  const rename = (id: string) => {
    const label = draft.trim();
    if (label) savePrefs({ renamed: { ...(prefs.renamed ?? {}), [id]: label } });
    setEditing(null);
  };

  const small = 'min-h-touch min-w-touch rounded-lg border border-line text-sm font-bold px-2';
  return (
    <Card className="space-y-3">
      <h2 className="font-extrabold">{t.kinds[kind]}</h2>
      {kind === 'customFactors' && <p className="text-sm text-muted">{t.customFactorsHelp}</p>}
      <ul className="space-y-2">
        {items.map((i, idx) => (
          <li key={i.id} className={`rounded-xl border border-line p-2 ${i.hidden ? 'opacity-60' : ''}`}>
            {editing === i.id ? (
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); rename(i.id); }}>
                <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 min-h-touch rounded-lg border border-line bg-surface px-2 text-[16px]" aria-label={t.rename} />
                <button type="submit" className={small}>{t.save}</button>
              </form>
            ) : (
              <div className="flex items-center gap-1">
                <span className="flex-1 font-bold text-[15px]">{i.emoji} {i.label}{i.hidden && <span className="text-muted font-normal"> · {t.hidden}</span>}</span>
                <button type="button" aria-label={`${t.up} ${i.label}`} onClick={() => move(idx, -1)} className={small}>↑</button>
                <button type="button" aria-label={`${t.down} ${i.label}`} onClick={() => move(idx, 1)} className={small}>↓</button>
                <button type="button" aria-label={`${t.rename} ${i.label}`} onClick={() => { setEditing(i.id); setDraft(i.label); }} className={small}>✏️</button>
                {i.custom
                  ? <button type="button" aria-label={`${t.remove} ${i.label}`} onClick={() => remove(i.id)} className={small}>🗑️</button>
                  : <button type="button" aria-label={`${i.hidden ? t.show : t.hide} ${i.label}`} onClick={() => toggleHide(i.id, i.hidden)} className={small}>{i.hidden ? '👁️' : '🙈'}</button>}
              </div>
            )}
          </li>
        ))}
      </ul>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t.addPlaceholder} aria-label={t.addPlaceholder} className="flex-1 min-h-touch rounded-xl border border-line bg-surface px-3 text-[16px]" />
        <button type="submit" className="min-h-touch px-4 rounded-xl bg-sauge-fort text-surface font-bold">{t.add}</button>
      </form>
    </Card>
  );
}

export function ListsPage() {
  const settings = useSettings();
  if (!settings) return null;
  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} backTo="/reglages" />
      <p className="text-muted">{t.intro}</p>
      {kinds.map((k) => <ListEditor key={k} kind={k} settings={settings} />)}
    </main>
  );
}
