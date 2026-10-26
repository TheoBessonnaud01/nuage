import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui';
import { copy } from '../../content/copy';
import { findCard } from '../../content/infoCards';
import { claimInfoCard, type InfoTrigger } from '../../lib/infoSuggest';

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
    <Card tone="bg-ciel/40" className="!p-4">
      <p className="text-sm font-bold text-muted">📖 {t.suggestion}</p>
      <p className="font-extrabold mt-1">{card.emoji} {card.titre}</p>
      <div className="flex gap-3 mt-3">
        <Link to={`/comprendre/${card.id}`} className="flex-1 min-h-touch grid place-items-center rounded-xl bg-sauge-fort text-surface font-bold">{t.read}</Link>
        <button type="button" onClick={() => setClosed(true)} className="flex-1 min-h-touch rounded-xl border border-line font-bold">{t.dismiss}</button>
      </div>
    </Card>
  );
}
