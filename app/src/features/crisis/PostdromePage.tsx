import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChipList } from '../../components/crisisInputs';
import { Wizard, type WizardStep } from '../../components/Wizard';
import { copy } from '../../content/copy';
import { postdromeSymptoms } from '../../content/factors';
import { addPostdromeLog } from '../../db/attacks';
import { useActiveAttack } from '../../lib/useAttack';

const t = copy.crisis;

/** Suivi quotidien de la phase post-crise. */
export function PostdromePage() {
  const data = useActiveAttack();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [pct, setPct] = useState(50);
  const [note, setNote] = useState('');

  if (data === undefined) return null;
  if (!data || data.attack.status !== 'post-crise') return <Navigate to="/crise" replace />;

  const steps: WizardStep[] = [
    { key: 'ressenti', title: t.postSymptomsTitle, help: t.postSymptomsHelp, render: () => <ChipList items={postdromeSymptoms} selected={symptoms} onChange={setSymptoms} /> },
    {
      key: 'pourcent', title: t.postPercentTitle,
      render: () => (
        <div>
          <p className="text-3xl font-extrabold text-center" aria-live="polite">{pct} %</p>
          <input type="range" min={0} max={100} step={10} value={pct} onChange={(e) => setPct(Number(e.target.value))}
            aria-label={t.postPercent.replace('{n}', String(pct))} className="w-full accent-[rgb(var(--sauge-fort))] mt-4" />
        </div>
      ),
    },
    {
      key: 'note', title: t.noteTitle,
      render: () => <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePlaceholder} rows={3}
        className="w-full rounded-2xl border-2 border-line bg-surface p-4 text-[17px] outline-none focus:border-sauge-fort" />,
    },
  ];

  const finish = async () => {
    await addPostdromeLog(data.attack.id, { symptoms, percentBack: pct, note: note.trim() || undefined });
    navigate(pct >= 100 ? `/crise/recap/${data.attack.id}` : '/crise', { replace: true });
  };

  return <Wizard label={t.postHubTitle} steps={steps} onFinish={finish} finishLabel={t.save} />;
}
