import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { copy } from '../../content/copy';
import { updateSettings } from '../../db/db';
import { useGoals } from '../../lib/useGoals';
import { useSettings } from '../../lib/useSettings';
import { pickLine } from '../../mascot/lines';
import { Mascot } from '../../mascot/Mascot';
import { GrowthStage } from '../../ui/Garden';

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
    <main className="mx-auto max-w-md px-4 pt-6 space-y-5 text-center">
      <section className="relative rounded-[36px] grad-sun shadow-float overflow-hidden px-5 pt-6 pb-4 text-c-on-grad">
        <p className="text-[13px] font-bold uppercase tracking-wider text-c-on-grad-muted">{t.current}</p>
        <h1 className="font-display text-[32px] leading-tight font-semibold mt-1">{t.celebrateTitle.replace('{palier}', tier.label)}</h1>
        <div className="flex items-end justify-center -mb-2 mt-2">
          <GrowthStage stage={tier.id} size={130} badge={false} />
          <Mascot mood="fete" size={170} />
        </div>
      </section>
      <p className="text-[17px] font-medium">{t.celebrateBodies[tier.id]}</p>
      <p className="glass shadow-soft rounded-[22px] px-4 py-3 text-[15px] font-semibold">{line}</p>
      <Button onClick={done}>{t.celebrateCta}</Button>
    </main>
  );
}
