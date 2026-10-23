import { Link, Navigate, useParams } from 'react-router-dom';
import { Button, Card, PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { auraTypes, efficacyLevels, labelOf } from '../../content/factors';
import { formatDuration, summarizeAttack } from '../../lib/attacks';
import { useAttack } from '../../lib/useAttack';
import { Pepite } from '../../mascot/Pepite';

const t = copy.crisis;
const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const time = (iso: string) => new Date(iso).toLocaleString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });

/** Récap d'une crise : durée de chaque phase, intensité max, traitements et efficacité. */
export function RecapPage() {
  const { id } = useParams();
  const data = useAttack(id);
  if (data === undefined) return null;
  if (!data) return <Navigate to="/calendrier" replace />;
  const { attack, logs, meds } = data;
  const s = summarizeAttack(attack, logs, meds);
  const finished = attack.status === 'terminée';

  const stats: [string, string][] = [
    [t.recapPain, formatDuration(s.painHours)],
    [t.recapPost, formatDuration(s.postdromeHours)],
    [t.recapTotal, formatDuration(s.totalHours)],
    [t.recapMax, s.maxIntensity === null ? '—' : `${s.maxIntensity}/10`],
  ];
  const aura = attack.hadAura === 'oui'
    ? `oui${attack.auraTypes?.length ? ` (${attack.auraTypes.map((a) => labelOf(auraTypes, a).toLowerCase()).join(', ')})` : ''}`
    : attack.hadAura;

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.recapTitle} />
      {finished && <Pepite mood="fier" text={t.recapBody} size="sm" importantBubble />}
      <p className="text-muted">
        {t.recapDates.replace('{debut}', dateFmt.format(new Date(attack.startAt))).replace('{fin}', attack.recoveredAt ? dateFmt.format(new Date(attack.recoveredAt)) : '…')}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(([k, v]) => (
          <Card key={k} className="!p-4">
            <p className="text-sm font-bold text-muted">{k}</p>
            <p className="text-2xl font-extrabold mt-1">{v}</p>
          </Card>
        ))}
      </div>

      <Card className="!p-4">
        <p className="text-sm font-bold text-muted">{t.recapAura}</p>
        <p className="text-[17px] mt-1">{aura}</p>
      </Card>

      <Card>
        <h2 className="font-extrabold mb-2">{t.recapMeds}</h2>
        {s.meds.length === 0 ? <p className="text-muted">{t.recapNoMeds}</p> : (
          <ul className="space-y-2">
            {s.meds.map((m) => {
              const e = efficacyLevels.find((x) => x.value === m.efficacyAfter2h);
              return (
                <li key={m.id}>
                  <span className="font-bold">{m.name}</span> · {time(m.takenAt)}
                  <br /><span className="text-muted text-[15px]">{e ? t.recapEfficacy.replace('{e}', `${e.emoji} ${e.label.toLowerCase()}`) : t.recapEfficacyUnknown}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Link to="/" className="block"><Button tabIndex={-1}>{copy.checkin.backHome}</Button></Link>
    </main>
  );
}
