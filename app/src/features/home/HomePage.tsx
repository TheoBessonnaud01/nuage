import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { copy, withName } from '../../content/copy';
import { Button, Card } from '../../components/ui';
import { db } from '../../db/db';
import { localDay, localHour } from '../../lib/dates';
import { useSettings } from '../../lib/useSettings';
import { useGoals } from '../../lib/useGoals';
import { useActiveAttack } from '../../lib/useAttack';
import { attackDayNumber } from '../../lib/attacks';
import { MedFollowUp } from '../crisis/MedFollowUp';
import { useRecaps } from '../../lib/useInsights';
import { formatMonth } from '../../lib/dates';
import { PostdromeSlider } from '../crisis/PostdromeSlider';
import { getMood, homeLineContext } from '../../mascot/moodEngine';
import { Pepite } from '../../mascot/Pepite';
import { useMoodContext } from '../../mascot/useMoodContext';

const navItems = [
  { to: '/calendrier', label: copy.home.nav.calendar, icon: '🗓️' },
  { to: '/mois', label: copy.home.nav.months, icon: '📈' },
  { to: '/analyses', label: copy.home.nav.insights, icon: '🔎' },
  { to: '/comprendre', label: copy.home.nav.info, icon: '📖' },
  { to: '/reglages', label: copy.home.nav.settings, icon: '⚙️' },
];

function greeting(hour: number) {
  if (hour < 12) return copy.home.greetingMorning;
  if (hour < 18) return copy.home.greetingAfternoon;
  return copy.home.greetingEvening;
}

export function HomePage() {
  const ctx = useMoodContext();
  const settings = useSettings();
  const mascotHidden = settings?.mascotMode === 'masqué';
  const goalsInfo = useGoals();
  const unseenRecap = useRecaps()?.find((r) => !r.seen);
  const active = useActiveAttack();
  const inCrisis = active?.attack.status === 'en cours';
  const inPost = active?.attack.status === 'post-crise';
  const g = goalsInfo?.goals;
  const todayDone = useLiveQuery(async () => !!(await db.days.get(localDay())), [], false);

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-5">
      {mascotHidden
        ? <h1 className="text-3xl font-extrabold">{withName(greeting(localHour()), settings?.firstName ?? '')}</h1>
        : <h1 className="sr-only">{copy.home.title}</h1>}
      {ctx && !mascotHidden && (
        <Pepite
          mood={getMood(ctx)}
          lineContext={homeLineContext(ctx)}
          size="md"
          importantBubble
          animated={ctx.attackStatus !== 'en cours'}
          tappable={ctx.attackStatus !== 'en cours'}
        />
      )}

      {inCrisis && active && (
        <>
          <Link to="/crise" className="block">
            <Card tone="bg-lavande/40">
              <h2 className="text-xl font-extrabold">{copy.home.crisisCardTitle.replace('{n}', String(attackDayNumber(active.attack)))}</h2>
              <p className="text-muted mt-1">{copy.home.crisisCardBody}</p>
            </Card>
          </Link>
          <MedFollowUp />
          <Link to="/crise/fin" className="block"><Button variant="secondary" tabIndex={-1}>{copy.crisis.painGone}</Button></Link>
          <Link to="/crise/traitement" className="block"><Button variant="ghost" tabIndex={-1}>{copy.crisis.tookMed}</Button></Link>
        </>
      )}

      {inPost && active && (
        <>
          <Card tone="bg-ciel/50">
            <h2 className="text-xl font-extrabold mb-1">
              <Link to="/crise">{copy.home.postCardTitle}</Link>
            </h2>
            <PostdromeSlider attackId={active.attack.id} showTitle={false} />
          </Card>
          <MedFollowUp />
        </>
      )}

      {!inCrisis && (
        <Link to="/checkin" className="block">
          <Card tone="bg-sauge/30">
            <h2 className="text-xl font-extrabold">{copy.home.dailyCardTitle}</h2>
            <p className="text-muted mt-1">{todayDone ? copy.home.dailyCardDone : copy.home.dailyCardTodo}</p>
          </Card>
        </Link>
      )}

      {goalsInfo?.pendingCelebration && (
        <Link to="/palier" className="block">
          <Card tone="bg-peche/50"><p className="font-extrabold">{copy.goals.banner}</p></Card>
        </Link>
      )}

      {unseenRecap && (
        <Link to={`/mois/${unseenRecap.month}`} className="block">
          <Card tone="bg-peche/40"><p className="font-extrabold">{copy.months.banner.replace('{mois}', formatMonth(unseenRecap.month).split(' ')[0])}</p></Card>
        </Link>
      )}

      {!active && (
        <Link to="/crise/debut" className="block">
          <Button variant="secondary" tabIndex={-1}>{copy.home.migraineButton}</Button>
        </Link>
      )}

      {g && (
        <Link to="/objectifs" className="flex items-center justify-between rounded-2xl bg-surface border border-line px-4 min-h-touch py-3">
          <span className="font-bold">
            {g.thisWeekTarget === null
              ? `${g.tier.emoji} ${g.tier.label}`
              : copy.checkin.weekProgress
                .replace('{n}', String(g.thisWeekCount))
                .replace('{target}', String(g.thisWeekTarget))
                .replace('{emoji}', g.tier.emoji)}
          </span>
          <span className="text-muted text-sm">{copy.goals.title} ›</span>
        </Link>
      )}

      <nav className="grid grid-cols-2 gap-3 pt-2" aria-label="Menu">
        {navItems.map((n) => (
          <Link key={n.to} to={n.to} className="min-h-touch rounded-2xl bg-surface border border-line p-4 font-bold flex items-center gap-2">
            <span aria-hidden>{n.icon}</span> {n.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
