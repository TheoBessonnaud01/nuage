import { Card, PageHeader } from '../../components/ui';
import { ProgressBar } from '../../components/inputs';
import { copy } from '../../content/copy';
import { tiers } from '../../lib/goals';
import { useGoals } from '../../lib/useGoals';
import { Pepite } from '../../mascot/Pepite';

const t = copy.goals;

export function GoalsPage() {
  const info = useGoals();
  if (!info) return null;
  const g = info.goals;
  const bloom = g.tier.perWeek === null;
  const remaining = g.thisWeekTarget !== null ? Math.max(0, g.thisWeekTarget - g.thisWeekCount) : 0;

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} />
      <Pepite mood={bloom ? 'fier' : 'joyeux'} size="sm" text={g.lastWeekMissed && !g.thisWeekValidated ? t.missedWeek : undefined} />
      <p className="text-muted">{t.intro}</p>

      <Card tone="bg-sauge/25">
        <p className="text-sm font-bold text-muted">{t.current}</p>
        <p className="text-3xl font-extrabold mt-1">{g.tier.emoji} {g.tier.label}</p>
        {bloom ? (
          <p className="mt-3">{t.bloomDone}</p>
        ) : (
          <>
            <p className="font-bold mt-4">{t.thisWeek} : {g.thisWeekCount}/{g.thisWeekTarget}</p>
            <ProgressBar value={Math.min(1, g.thisWeekCount / (g.thisWeekTarget ?? 1))} label={t.thisWeek} />
            <p className="text-muted mt-2">{g.thisWeekValidated ? t.weekDone : t.weekTodo.replace('{n}', String(remaining))}</p>
            <p className="text-sm text-muted mt-3">
              {t.progress.replace('{v}', String(g.validatedInTier)).replace('{needed}', String(g.tier.weeksNeeded))}
            </p>
          </>
        )}
      </Card>

      <ol className="space-y-2">
        {tiers.map((tier, i) => {
          const reached = i <= g.tierIndex;
          return (
            <li key={tier.id}>
              <Card tone={i === g.tierIndex ? 'bg-surface border-sauge-fort' : reached ? 'bg-surface' : 'bg-surface border-dashed text-muted'} className="flex items-center gap-4 !p-4">
                <span className="text-3xl" aria-hidden>{tier.emoji}</span>
                <div className="flex-1">
                  <p className="font-extrabold">{tier.label} {i < g.tierIndex && <span className="text-sauge-fort font-bold">· {t.reached}</span>}</p>
                  <p className="text-sm text-muted">
                    {tier.perWeek === null ? t.freeRhythm : `${t.perWeek.replace('{n}', String(tier.perWeek))} · ${t.weeksNeeded.replace('{n}', String(tier.weeksNeeded))}`}
                  </p>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
