import { PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { tiers } from '../../lib/goals';
import { useGoals } from '../../lib/useGoals';
import { Mascot } from '../../mascot/Mascot';
import { GrowthStage } from '../../ui/Garden';
import { Icon } from '../../ui/Icon';
import { Ring } from '../../ui/kit';

const t = copy.goals;

/** « Ton jardin » : les paliers d'objectifs, de la graine à la floraison. */
export function GoalsPage() {
  const info = useGoals();
  if (!info) return null;
  const g = info.goals;
  const bloom = g.tier.perWeek === null;
  const remaining = g.thisWeekTarget !== null ? Math.max(0, g.thisWeekTarget - g.thisWeekCount) : 0;

  return (
    <main className="mx-auto max-w-md px-4 pt-5 space-y-5">
      <PageHeader title={t.title} />
      <p className="text-c-muted -mt-2">{t.intro}</p>

      <section className="relative rounded-[32px] grad-mint shadow-float text-center text-c-on-grad overflow-hidden px-5 pt-5 pb-6">
        <div className="mx-auto w-fit"><GrowthStage stage={g.tier.id} size={180} badge={false} title={g.tier.label} /></div>
        <p className="text-[13px] font-bold text-c-on-grad-muted">{t.current}</p>
        <h2 className="font-display text-[30px] leading-tight font-semibold">{g.tier.label}</h2>
        {bloom ? (
          <p className="mt-2 font-medium">{t.bloomDone}</p>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-c-on-grad-muted">
              {t.perWeek.replace('{n}', String(g.tier.perWeek))} · {t.progress.replace('{v}', String(g.validatedInTier)).replace('{needed}', String(g.tier.weeksNeeded))}
            </p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <Ring value={g.thisWeekCount / (g.thisWeekTarget ?? 1)} size={68}>
                <span className="text-[15px] font-bold">{g.thisWeekCount}/{g.thisWeekTarget}</span>
              </Ring>
              <p className="text-[15px] font-semibold text-left">{g.thisWeekValidated ? t.weekDone : t.weekTodo.replace('{n}', String(remaining))}</p>
            </div>
          </>
        )}
      </section>

      {g.lastWeekMissed && !g.thisWeekValidated && (
        <div className="flex items-end gap-2">
          <Mascot mood="joyeux" size={64} animated={false} />
          <p className="glass shadow-soft rounded-[22px] rounded-bl-md px-4 py-3 mb-4 text-[15px] font-semibold">{t.missedWeek}</p>
        </div>
      )}

      <ol className="relative space-y-3" aria-label={t.title}>
        <span className="absolute left-[33px] top-10 bottom-10 w-1 rounded-full bg-c-ink/10" aria-hidden />
        {tiers.map((tier, i) => {
          const done = i < g.tierIndex;
          const now = i === g.tierIndex;
          return (
            <li key={tier.id} className="relative flex items-center gap-4">
              <span className={`rounded-full ${now ? 'ring-4 ring-c-accent/40' : ''} ${!done && !now ? 'opacity-60 grayscale-[40%]' : ''}`}>
                <GrowthStage stage={tier.id} size={68} />
              </span>
              <div className="flex-1">
                <p className="font-display text-[19px] font-semibold">{tier.label}</p>
                <p className="text-[13.5px] font-medium text-c-muted">
                  {tier.perWeek === null ? t.freeRhythm : `${t.perWeek.replace('{n}', String(tier.perWeek))} · ${t.weeksNeeded.replace('{n}', String(tier.weeksNeeded))}`}
                </p>
              </div>
              {done && <span role="img" className="grid place-items-center w-9 h-9 rounded-full grad-mint text-c-on-grad" aria-label={t.reached}><Icon name="check" size={18} strokeWidth={2.4} /></span>}
              {now && <span className="text-[12px] font-bold rounded-full bg-c-accent-soft px-3 py-1">{t.now}</span>}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
