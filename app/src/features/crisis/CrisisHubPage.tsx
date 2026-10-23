import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { copy } from '../../content/copy';
import { recover, resumePain } from '../../db/attacks';
import { attackDayNumber } from '../../lib/attacks';
import { localDay } from '../../lib/dates';
import { useActiveAttack } from '../../lib/useAttack';
import { Pepite } from '../../mascot/Pepite';
import { MedFollowUp } from './MedFollowUp';
import { PostdromeSlider } from './PostdromeSlider';
import { UrgentLink } from './UrgentLink';

const t = copy.crisis;
const time = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const sinceFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' });

/** Tableau de bord de la crise active. */
export function CrisisHubPage() {
  const data = useActiveAttack();
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { justStarted?: boolean } };
  const [confirmBack, setConfirmBack] = useState(false);

  if (data === undefined) return null;
  if (!data) return <Navigate to="/crise/debut" replace />;
  const { attack, logs, meds } = data;
  const today = localDay();

  if (attack.status === 'post-crise') {
    return (
      <main className="mx-auto max-w-md px-4 py-4 space-y-4">
        <UrgentLink />
        <Pepite mood="fatigue" lineContext="postCrise" size="sm" />
        <h1 className="text-2xl font-extrabold">{t.postHubTitle}</h1>
        <MedFollowUp />
        <Card><PostdromeSlider attackId={attack.id} /></Card>
        <Link to="/crise/post" className="block"><Button variant="secondary" tabIndex={-1}>{t.postLog}</Button></Link>
        <Link to="/crise/traitement" className="block"><Button variant="ghost" tabIndex={-1}>{t.tookMed}</Button></Link>
        <Button variant="ghost" onClick={async () => { await recover(attack.id, new Date().toISOString()); navigate(`/crise/recap/${attack.id}`, { replace: true }); }}>
          {t.recovered}
        </Button>
        {confirmBack ? (
          <Button variant="ghost" onClick={() => resumePain(attack.id)}>{t.painBack} ?</Button>
        ) : (
          <button type="button" onClick={() => setConfirmBack(true)} className="w-full text-sm text-muted underline min-h-touch">{t.painBack}</button>
        )}
      </main>
    );
  }

  const todays = [
    ...logs.filter((l) => l.date === today).map((l) => ({ key: l.id, at: l.time, text: l.intensity !== undefined ? t.logLine.replace('{n}', String(l.intensity)) : t.logLineNoIntensity })),
    ...meds.filter((m) => localDay(new Date(m.takenAt)) === today).map((m) => ({ key: m.id, at: time(m.takenAt), text: t.medLine.replace('{nom}', m.name) })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <main className="mx-auto max-w-md px-4 py-4 space-y-4">
      <UrgentLink />
      <Pepite mood="calin" lineContext={state?.justStarted ? 'debutCrise' : 'criseEnCours'} size="sm" animated={false} tappable={false} />
      <div>
        <h1 className="text-2xl font-extrabold">{t.hubTitle.replace('{n}', String(attackDayNumber(attack)))}</h1>
        <p className="text-muted">{t.hubSince.replace('{quand}', sinceFmt.format(new Date(attack.startAt)))}</p>
      </div>

      <MedFollowUp />

      <Link to="/crise/suivi" className="block"><Button tabIndex={-1}>{t.logNow}</Button></Link>
      <Link to="/crise/traitement" className="block"><Button variant="secondary" tabIndex={-1}>{t.tookMed}</Button></Link>
      {attack.investigation.doneAt
        ? <p className="text-center text-muted font-bold">{t.investigateDone}</p>
        : <Link to="/crise/enquete" className="block"><Button variant="ghost" tabIndex={-1}>{t.investigate}</Button></Link>}
      <Link to="/crise/fin" className="block"><Button variant="ghost" tabIndex={-1}>{t.painGone}</Button></Link>

      {todays.length > 0 && (
        <Card>
          <h2 className="font-extrabold mb-2">{t.todayTitle}</h2>
          <ul className="space-y-1 text-[16px]">
            {todays.map((e) => <li key={e.key}>{e.text.replace('{heure}', e.at)}</li>)}
          </ul>
        </Card>
      )}
    </main>
  );
}
