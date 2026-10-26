import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ChipList, IntensityPicker } from '../../components/crisisInputs';
import { Chip } from '../../components/inputs';
import { Button } from '../../components/ui';
import { Wizard, type WizardStep } from '../../components/Wizard';
import { copy } from '../../content/copy';
import { functionalLevels, relievedBy, worsenedBy } from '../../content/factors';
import { addAttackLog } from '../../db/attacks';
import type { AttackDayLog } from '../../db/types';
import { useActiveAttack } from '../../lib/useAttack';
import { visibleList } from '../../lib/lists';
import { useSettings } from '../../lib/useSettings';

const t = copy.crisis;

/** Suivi pendant la crise (plusieurs fois par jour si besoin). */
export function CrisisLogPage() {
  const data = useActiveAttack();
  const settings = useSettings();
  const navigate = useNavigate();
  const [intensity, setIntensity] = useState<number | undefined>();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [worse, setWorse] = useState<string[]>([]);
  const [better, setBetter] = useState<string[]>([]);
  const [functional, setFunctional] = useState<AttackDayLog['functional']>();
  const [note, setNote] = useState('');

  if (data === undefined) return null;
  if (!data || data.attack.status !== 'en cours') return <Navigate to="/crise" replace />;

  const steps: WizardStep[] = [
    { key: 'intensite', title: t.intensityTitle, help: t.intensityHelp, render: (next) => <IntensityPicker value={intensity} onChange={(v) => { setIntensity(v); setTimeout(next, 250); }} /> },
    { key: 'symptomes', title: t.symptomsTitle, render: () => <ChipList items={visibleList('crisisSymptoms', settings)} selected={symptoms} onChange={setSymptoms} /> },
    { key: 'pire', title: t.worsenedTitle, render: () => <ChipList items={worsenedBy} selected={worse} onChange={setWorse} /> },
    { key: 'mieux', title: t.relievedTitle, render: () => <ChipList items={relievedBy} selected={better} onChange={setBetter} /> },
    {
      key: 'activite', title: t.functionalTitle,
      render: (next) => (
        <div className="grid gap-2">
          {functionalLevels.map((f) => (
            <Chip key={f.value} emoji={f.emoji} selected={functional === f.value} onClick={() => { setFunctional(f.value); setTimeout(next, 250); }}>{f.label}</Chip>
          ))}
        </div>
      ),
    },
    {
      key: 'note', title: t.noteTitle,
      render: () => (
        <div className="space-y-4">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePlaceholder} rows={3}
            className="w-full rounded-2xl border-2 border-line bg-surface p-4 text-[16px] outline-none focus:border-sauge-fort" />
          <Link to="/crise/traitement" className="block"><Button variant="secondary" tabIndex={-1}>{t.tookMed}</Button></Link>
        </div>
      ),
    },
  ];

  const finish = async () => {
    await addAttackLog(data.attack.id, { intensity, locations: [], painType: [], symptoms, worsenedBy: worse, relievedBy: better, functional, note: note.trim() || undefined });
    navigate('/crise/bilan', { replace: true });
  };

  return <Wizard label={t.logNow} steps={steps} onFinish={finish} finishLabel={t.save} />;
}
