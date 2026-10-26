import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui';
import { copy } from '../../content/copy';
import { findCard } from '../../content/infoCards';
import { claimInfoCard, type InfoTrigger } from '../../lib/infoSuggest';
import { Icon } from '../../ui/Icon';
import { styleOf } from './cardStyle';

const t = copy.info;

/** Propose une fiche après un geste (max une par jour, jamais deux fois). Toujours fermable. */
export function InfoSuggestion({ trigger, when = true }: { trigger: InfoTrigger; when?: boolean }) {
  const [id, setId] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!when) return;
    let alive = true;
    claimInfoCard(trigger).then((x) => { if (alive) setId(x); });
    return () => { alive = false; };
  }, [trigger, when]);

  const card = id ? findCard(id) : null;
  if (!card || closed) return null;
  return (
    <Card tone="grad-sky" className="!p-4">
      <p className="text-sm font-bold text-c-muted">📖 {t.suggestion}</p>
      <p className="font-display text-[19px] font-semibold mt-1 flex items-center gap-2"><Icon name={styleOf(card.id).icon} />{card.titre}</p>
      <div className="flex gap-3 mt-3">
        <Link to={`/comprendre/${card.id}`} className="press flex-1 min-h-[48px] grid place-items-center rounded-full bg-c-primary text-c-on-primary font-bold">{t.read}</Link>
        <button type="button" onClick={() => setClosed(true)} className="press flex-1 min-h-[48px] rounded-full bg-c-surface/70 font-bold">{t.dismiss}</button>
      </div>
    </Card>
  );
}
