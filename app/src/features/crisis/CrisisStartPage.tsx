import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChipList, HeadMap, IntensityPicker, WhenPicker } from '../../components/crisisInputs';
import { Chip } from '../../components/inputs';
import { Wizard, type WizardStep } from '../../components/Wizard';
import { copy } from '../../content/copy';
import { auraTypes, crisisSymptoms, painTypes } from '../../content/factors';
import { startAttack } from '../../db/attacks';
import type { Attack } from '../../db/types';
import { useActiveAttack } from '../../lib/useAttack';
import { Pepite } from '../../mascot/Pepite';
import { UrgentLink } from './UrgentLink';

const t = copy.crisis;

/** Déclenchement d'une crise : 6 écrans maximum, tout est facultatif. */
export function CrisisStartPage() {
  const active = useActiveAttack();
  const navigate = useNavigate();
  const [startAt, setStartAt] = useState(() => new Date().toISOString());
  const [aura, setAura] = useState<Attack['hadAura'] | undefined>();
  const [auraKinds, setAuraKinds] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<number | undefined>();
  const [locations, setLocations] = useState<string[]>([]);
  const [painType, setPainType] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  if (active === undefined) return null;
  if (active) return <Navigate to="/crise" replace />;

  const steps: WizardStep[] = [
    { key: 'quand', title: t.startWhen, render: () => <WhenPicker value={startAt} onChange={setStartAt} /> },
    {
      key: 'aura', title: t.auraTitle, help: t.auraHelp,
      render: (next) => (
        <div className="space-y-4">
          <div className="grid gap-2">
            {(Object.entries(t.auraOptions) as [Attack['hadAura'], string][]).map(([v, label]) => (
              <Chip key={v} selected={aura === v} onClick={() => { setAura(v); if (v !== 'oui') setTimeout(next, 250); }}>{label}</Chip>
            ))}
          </div>
          {aura === 'oui' && (
            <div>
              <h2 className="font-bold text-muted mb-2">{t.auraTypesTitle}</h2>
              <ChipList items={auraTypes} selected={auraKinds} onChange={setAuraKinds} />
            </div>
          )}
        </div>
      ),
    },
    { key: 'intensite', title: t.intensityTitle, help: t.intensityHelp, render: (next) => <IntensityPicker value={intensity} onChange={(v) => { setIntensity(v); setTimeout(next, 250); }} /> },
    { key: 'ou', title: t.locationTitle, render: () => <HeadMap selected={locations} onChange={setLocations} /> },
    { key: 'type', title: t.painTypeTitle, render: () => <ChipList items={painTypes} selected={painType} onChange={setPainType} /> },
    { key: 'symptomes', title: t.symptomsTitle, render: () => <ChipList items={crisisSymptoms} selected={symptoms} onChange={setSymptoms} /> },
  ];

  const finish = async () => {
    await startAttack({
      startAt,
      hadAura: aura ?? 'je ne sais pas',
      auraTypes: aura === 'oui' ? auraKinds : undefined,
      firstLog: { intensity, locations, painType, symptoms, worsenedBy: [], relievedBy: [] },
    });
    navigate('/crise', { replace: true, state: { justStarted: true } });
  };

  return (
    <Wizard
      label={t.startTitle}
      steps={steps}
      onFinish={finish}
      finishLabel={t.save}
      top={(
        <div className="mt-2">
          <UrgentLink />
          <Pepite mood="calin" lineContext="debutCrise" size="sm" animated={false} tappable={false} />
        </div>
      )}
    />
  );
}
