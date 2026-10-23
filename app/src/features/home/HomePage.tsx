import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { copy, withName } from '../../content/copy';
import { Button, Card } from '../../components/ui';
import { db } from '../../db/db';
import { localDay, localHour } from '../../lib/dates';
import { useSettings } from '../../lib/useSettings';
import { getMood, homeLineContext } from '../../mascot/moodEngine';
import { Pepite } from '../../mascot/Pepite';
import { useMoodContext } from '../../mascot/useMoodContext';

const navItems = [
  { to: '/calendrier', label: copy.home.nav.calendar, icon: '🗓️' },
  { to: '/mois', label: copy.home.nav.months, icon: '📈' },
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

      <Link to="/checkin" className="block">
        <Card tone="bg-sauge/30">
          <h2 className="text-xl font-extrabold">{copy.home.dailyCardTitle}</h2>
          <p className="text-muted mt-1">{todayDone ? copy.home.dailyCardDone : copy.home.dailyCardTodo}</p>
        </Card>
      </Link>

      <Link to="/crise" className="block">
        <Button variant="secondary" tabIndex={-1}>{copy.home.migraineButton}</Button>
      </Link>

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
