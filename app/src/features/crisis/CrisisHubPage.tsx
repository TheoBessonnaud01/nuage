import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, PageHeader } from '../../components/ui';
import { crisisSymptoms, labelOf } from '../../content/factors';
import { copy } from '../../content/copy';
import { recover, resumePain } from '../../db/attacks';
import { attackDayNumber, formatDuration } from '../../lib/attacks';
import { localDay } from '../../lib/dates';
import { useActiveAttack } from '../../lib/useAttack';
import { Pepite } from '../../mascot/Pepite';
import { MedFollowUp } from './MedFollowUp';
import { PostdromeSlider } from './PostdromeSlider';
import { UrgentLink } from './UrgentLink';
import { Icon } from '../../ui/Icon';

const t = copy.crisis;
const time = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const sinceFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });

/** Tableau de bord de la crise active. */
export function CrisisHubPage() {
  const data = useActiveAttack();
  const navigate = useNavigate();
  const [confirmBack, setConfirmBack] = useState(false);

  if (data === undefined) return null;
  if (!data) return <Navigate to="/crise/debut" replace />;
  const { attack, logs, meds } = data;
  const today = localDay();

  if (attack.status === 'post-crise') {
    return (
      <main className="mx-auto max-w-md px-4 py-4 space-y-4">
        <PageHeader title={t.postHubTitle} backTo="/" backLabel={t.homeLink} right={<UrgentLink />} />
        <Pepite mood="fatigue" lineContext="postCrise" size="sm" />
        <MedFollowUp />
        <Card tone="grad-sky"><PostdromeSlider attackId={attack.id} /></Card>
        <Link to="/crise/post" className="block"><Button tabIndex={-1}><Icon name="edit" size={20} />{t.postLog}</Button></Link>
        <Link to="/crise/traitement" className="block"><Button variant="secondary" tabIndex={-1}><Icon name="pill" size={20} />{t.tookMed}</Button></Link>
        <Button variant="ghost" onClick={async () => { await recover(attack.id, new Date().toISOString()); navigate(`/crise/recap/${attack.id}`, { replace: true }); }}>
          <Icon name="sun" size={20} />{t.recovered}
        </Button>
        {confirmBack ? (
          <Button variant="ghost" onClick={() => resumePain(attack.id)}>{t.painBack} ?</Button>
        ) : (
          <button type="button" onClick={() => setConfirmBack(true)} className="w-full text-sm text-c-muted underline min-h-touch">{t.painBack}</button>
        )}
      </main>
    );
  }

  const lastRated = [...logs].filter((l) => l.intensity !== undefined).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).pop();
  const lastMed = [...meds].sort((a, b) => a.takenAt.localeCompare(b.takenAt)).pop();
  const history = [
    ...logs.map((l) => ({
      key: l.id, sort: `${l.date}T${l.time}`, at: l.time, day: l.date,
      text: l.intensity !== undefined ? t.historyLog.replace('{n}', String(l.intensity)) : t.historyLogNo,
      detail: l.symptoms.map((id) => labelOf(crisisSymptoms, id).toLowerCase()).join(', '),
    })),
    ...meds.map((m) => ({
      key: m.id, sort: m.takenAt, at: time(m.takenAt), day: localDay(new Date(m.takenAt)),
      text: t.historyMed.replace('{nom}', m.name), detail: '',
    })),
  ].sort((a, b) => b.sort.localeCompare(a.sort));

  return (
    <main className="mx-auto max-w-md px-4 py-4 space-y-4">
      <PageHeader title={t.hubTitle.replace('{n}', String(attackDayNumber(attack)))} backTo="/" backLabel={t.homeLink} right={<UrgentLink />} />
      <Pepite mood="calin" lineContext="criseEnCours" size="sm" animated={false} tappable={false} />

      <Card tone="bg-c-surface-2" className="!shadow-none">
        <ul className="space-y-2 text-[15.5px]">
          <li>{t.statusStarted.replace('{quand}', sinceFmt.format(new Date(attack.startAt))).replace('{duree}', formatDuration((Date.now() - new Date(attack.startAt).getTime()) / 3600000))}</li>
          <li>{lastRated ? t.statusPainNow.replace('{n}', String(lastRated.intensity)).replace('{heure}', lastRated.time) : t.statusPainNone}</li>
          <li>{lastMed ? t.statusMed.replace('{nom}', lastMed.name).replace('{heure}', time(lastMed.takenAt)) : t.statusMedNone}</li>
        </ul>
      </Card>

      <MedFollowUp />

      <Link to="/crise/suivi" className="block"><Button tabIndex={-1}><Icon name="edit" size={20} />{t.logNow}</Button></Link>
      <Link to="/crise/traitement" className="block"><Button variant="secondary" tabIndex={-1}><Icon name="pill" size={20} />{t.tookMed}</Button></Link>
      {attack.investigation.doneAt
        ? <p className="flex items-center justify-center gap-2 text-c-muted font-bold"><Icon name="check" size={18} />{t.investigateDone}</p>
        : <Link to="/crise/enquete" className="block"><Button variant="secondary" tabIndex={-1}><Icon name="search" size={20} />{t.investigate}</Button></Link>}
      <Link to="/crise/fin" className="block"><Button variant="ghost" tabIndex={-1}><Icon name="sun" size={20} />{t.painGone}</Button></Link>

      {history.length > 0 && (
        <Card>
          <h2 className="font-display text-[19px] leading-tight font-semibold mb-2">{t.historyTitle}</h2>
          <ol className="relative space-y-3 pl-6">
            <span className="absolute left-[7px] top-2 bottom-2 w-0.5 rounded-full bg-c-ink/10" aria-hidden />
            {history.map((e) => (
              <li key={e.key} className="relative">
                <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full grad-lilac ring-4 ring-c-surface" aria-hidden />
                <span className="text-c-muted text-[14px]">{e.day === today ? e.at : `${dayFmt.format(new Date(e.sort))} ${e.at}`}</span> · <span className="font-bold">{e.text}</span>
                {e.detail && <span className="block text-[14px] text-c-muted">{e.detail}</span>}
              </li>
            ))}
          </ol>
        </Card>
      )}
    </main>
  );
}
