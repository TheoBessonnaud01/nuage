import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ActionBar, Button } from '../../components/ui';
import { copy } from '../../content/copy';
import { useActiveAttack } from '../../lib/useAttack';
import { Pepite } from '../../mascot/Pepite';
import { CrisisDigest } from './CrisisDigest';
import { InfoSuggestion } from '../info/InfoSuggestion';

const t = copy.crisis;

/** « Mot de la fin » après le déclenchement ou une évaluation. */
export function CrisisDigestPage() {
  const data = useActiveAttack();
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { start?: boolean } };
  if (data === undefined) return null;
  if (!data || data.attack.status !== 'en cours') return <Navigate to="/crise" replace />;

  return (
    <main className="mx-auto max-w-md px-4 pt-4 !pb-0 screen-h flex flex-col">
      <div className="space-y-4 pb-6">
        <Pepite mood="calin" lineContext={state?.start ? 'debutCrise' : 'criseEnCours'} size="sm" animated={false} tappable={false} />
        <h1 className="text-xl font-extrabold">{state?.start ? t.digestStartTitle : t.digestTitle}</h1>
        <CrisisDigest data={data} />
        <InfoSuggestion trigger="premiere-aura" when={!!state?.start && data.attack.hadAura === 'oui'} />
      </div>
      <ActionBar>
        <Button onClick={() => navigate('/crise', { replace: true })}>{t.digestOk}</Button>
      </ActionBar>
    </main>
  );
}
