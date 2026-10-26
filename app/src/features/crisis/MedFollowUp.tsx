import { Card } from '../../components/ui';
import { Chip } from '../../components/inputs';
import { copy } from '../../content/copy';
import { efficacyLevels } from '../../content/factors';
import { setEfficacy } from '../../db/attacks';
import { medsAwaitingFollowUp } from '../../lib/attacks';
import { usePendingMeds } from '../../lib/useAttack';

const t = copy.crisis;
const time = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

/** « Ça va mieux ? » 2 h après une prise. */
export function MedFollowUp() {
  const due = medsAwaitingFollowUp(usePendingMeds());
  if (!due.length) return null;
  return (
    <>
      {due.map((m) => (
        <Card key={m.id} tone="grad-sky">
          <h2 className="font-display text-[19px] leading-tight font-semibold">{t.followUpTitle.replace('{nom}', m.name)}</h2>
          <p className="text-sm text-c-muted">{t.followUpWhen.replace('{heure}', time(m.takenAt))}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {efficacyLevels.map((e) => (
              <Chip key={e.value} emoji={e.emoji} selected={false} onClick={() => setEfficacy(m.id, e.value)}>{e.label}</Chip>
            ))}
          </div>
        </Card>
      ))}
    </>
  );
}
