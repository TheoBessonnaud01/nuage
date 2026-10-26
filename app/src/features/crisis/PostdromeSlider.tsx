import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { copy } from '../../content/copy';
import { addPostdromeLog } from '../../db/attacks';

const t = copy.crisis;

/** « Revenue à moi-même » 0–100 %, enregistrement rapide (accueil et tableau de bord). */
export function PostdromeSlider({ attackId, initial = 50, showTitle = true }: { attackId: string; initial?: number; showTitle?: boolean }) {
  const [pct, setPct] = useState(initial);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  return (
    <div>
      {showTitle && <h2 className="font-display text-[19px] leading-tight font-semibold">{t.postQuestion}</h2>}
      <p className="text-lg font-bold mt-2" aria-live="polite">{t.postPercent.replace('{n}', String(pct))}</p>
      <input
        type="range" min={0} max={100} step={10} value={pct}
        onChange={(e) => { setPct(Number(e.target.value)); setSaved(false); }}
        aria-label={t.postPercent.replace('{n}', String(pct))}
        className="w-full accent-[rgb(var(--c-accent))] my-3"
      />
      <Button
        variant="secondary"
        disabled={saved}
        onClick={async () => {
          await addPostdromeLog(attackId, { symptoms: [], percentBack: pct });
          setSaved(true);
          if (pct >= 100) navigate(`/crise/recap/${attackId}`);
        }}
      >
        {saved ? '✓' : t.save}
      </Button>
    </div>
  );
}
