import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { copy } from '../../content/copy';
import { updateSettings } from '../../db/db';
import { useGoals } from '../../lib/useGoals';
import { useSettings } from '../../lib/useSettings';
import { pickLine } from '../../mascot/lines';
import { Pepite } from '../../mascot/Pepite';

const t = copy.goals;

/** Écran de fête quand un nouveau palier est atteint. */
export function CelebrationPage() {
  const info = useGoals();
  const settings = useSettings();
  const navigate = useNavigate();
  const firstName = settings?.firstName;
  const line = useMemo(() => (firstName ? pickLine('palier', firstName) : ''), [firstName]);

  if (!info || !settings) return null;
  if (!info.pendingCelebration) return <Navigate to="/objectifs" replace />;
  const tier = info.goals.tier;

  const done = async () => {
    await updateSettings({ celebratedTier: info.goals.tierIndex });
    navigate('/', { replace: true });
  };

  return (
    <main className="mx-auto max-w-md px-4 py-8 space-y-6 text-center">
      <div className="flex justify-center"><Pepite mood="fete" size="lg" /></div>
      <Card tone="bg-peche/40">
        <p className="text-6xl" aria-hidden>{tier.emoji}</p>
        <h1 className="text-3xl font-extrabold mt-2">{t.celebrateTitle.replace('{palier}', tier.label)}</h1>
        <p className="mt-3 text-[17px]">{t.celebrateBodies[tier.id]}</p>
        <p className="mt-3 text-muted italic">« {line} »</p>
      </Card>
      <Button onClick={done}>{t.celebrateCta}</Button>
    </main>
  );
}
