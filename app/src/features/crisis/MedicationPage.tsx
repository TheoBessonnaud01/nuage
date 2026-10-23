import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WhenPicker } from '../../components/crisisInputs';
import { Chip } from '../../components/inputs';
import { ActionBar, Button, Card, PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { medicationCategories } from '../../content/factors';
import { addMedication, addToCatalog } from '../../db/attacks';
import type { Medication, MedicationDef } from '../../db/types';
import { scheduleLocalFollowUp } from '../../lib/localReminder';
import { useActiveAttack } from '../../lib/useAttack';
import { useSettings } from '../../lib/useSettings';
import { UrgentLink } from './UrgentLink';

const t = copy.crisis;

/** Ajout d'une prise de traitement (liste perso + ajout rapide). */
export function MedicationPage() {
  const settings = useSettings();
  const active = useActiveAttack();
  const navigate = useNavigate();
  const [chosen, setChosen] = useState<MedicationDef | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Medication['category']>('autre');
  const [takenAt, setTakenAt] = useState(() => new Date().toISOString());
  const [saved, setSaved] = useState<string | null>(null);

  if (!settings || active === undefined) return null;
  const catalog = settings.medicationCatalog ?? [];
  const showForm = adding || catalog.length === 0;

  const save = async () => {
    let def = chosen;
    if (showForm && name.trim()) {
      def = { name: name.trim(), category };
      await addToCatalog(def);
    }
    if (!def) return;
    await addMedication({ attackId: active?.attack.id, takenAt, name: def.name, category: def.category });
    // Relance 2 h après la prise (si l'app reste ouverte ; le reste passe par l'app ou le Worker)
    const remaining = 2 * 3600000 - (Date.now() - new Date(takenAt).getTime());
    if (remaining > 0) scheduleLocalFollowUp(remaining);
    setSaved(remaining > 10 * 60000 ? t.medSaved : t.medSavedPast);
    setTimeout(() => navigate(-1), 1400);
  };

  if (saved) {
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <Card tone="bg-sauge/30"><p className="text-xl font-extrabold">{saved}</p></Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-4 !pb-0 screen-h flex flex-col">
      <PageHeader title={t.medTitle} backTo="/crise" />
      <UrgentLink />
      <div className="space-y-5 pb-6">
        {catalog.length > 0 && (
          <div className="grid gap-2">
            {catalog.map((d) => (
              <Chip key={d.name} selected={!adding && chosen?.name === d.name} onClick={() => { setChosen(d); setAdding(false); }}>
                {d.name} <span className="text-muted font-normal text-sm">· {d.category}</span>
              </Chip>
            ))}
            {!adding && <button type="button" onClick={() => { setAdding(true); setChosen(null); }} className="text-left font-bold underline text-sauge-fort min-h-touch">{t.medAdd}</button>}
          </div>
        )}

        {showForm && (
          <Card className="space-y-3">
            {catalog.length === 0 && <p className="text-muted">{t.medEmpty}</p>}
            <label className="block">
              <span className="font-bold">{t.medName}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full min-h-touch rounded-xl border-2 border-line bg-surface px-3 text-[16px]" />
            </label>
            <div>
              <p className="font-bold mb-2">{t.medCategory}</p>
              <div className="grid gap-2">
                {medicationCategories.map((c) => (
                  <Chip key={c.value} selected={category === c.value} onClick={() => setCategory(c.value)}>
                    {c.label} {c.help && <span className="text-muted font-normal text-sm">({c.help})</span>}
                  </Chip>
                ))}
              </div>
            </div>
          </Card>
        )}

        <div>
          <h2 className="font-bold text-muted mb-2">{t.medWhen}</h2>
          <WhenPicker value={takenAt} onChange={setTakenAt} />
        </div>
        <p className="text-sm text-muted">{t.medDisclaimer}</p>
      </div>
      <ActionBar>
        <Button onClick={save} disabled={showForm ? !name.trim() : !chosen}>{t.medSave}</Button>
      </ActionBar>
    </main>
  );
}
