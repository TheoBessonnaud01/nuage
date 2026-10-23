import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { WhenPicker } from '../../components/crisisInputs';
import { ActionBar, Button, Card, PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { endPain } from '../../db/attacks';
import { useActiveAttack } from '../../lib/useAttack';
import { Pepite } from '../../mascot/Pepite';

const t = copy.crisis;

/** « La douleur est partie » → phase post-crise. */
export function EndPainPage() {
  const data = useActiveAttack();
  const [endAt, setEndAt] = useState(() => new Date().toISOString());
  const [done, setDone] = useState(false);

  if (data === undefined) return null;
  if (done) {
    return (
      <main className="mx-auto max-w-md px-4 py-6 space-y-5">
        <Pepite mood="fatigue" lineContext="finDouleur" size="md" importantBubble />
        <Card tone="bg-ciel/50">
          <h1 className="text-2xl font-extrabold">{t.endDoneTitle}</h1>
          <p className="mt-2">{t.endDoneBody}</p>
        </Card>
        <Link to="/crise" className="block"><Button tabIndex={-1}>{t.postLog}</Button></Link>
        <Link to="/" className="block"><Button variant="ghost" tabIndex={-1}>{copy.checkin.backHome}</Button></Link>
      </main>
    );
  }
  if (!data || data.attack.status !== 'en cours') return <Navigate to="/crise" replace />;
  const min = data.attack.startAt;

  return (
    <main className="mx-auto max-w-md px-4 pt-4 !pb-0 screen-h flex flex-col">
      <PageHeader title={t.endTitle} backTo="/crise" />
      <div className="pb-6"><WhenPicker value={endAt} onChange={(v) => setEndAt(v < min ? min : v)} /></div>
      <ActionBar>
        <Button onClick={async () => { await endPain(data.attack.id, endAt); setDone(true); }}>{t.endConfirm}</Button>
      </ActionBar>
    </main>
  );
}
