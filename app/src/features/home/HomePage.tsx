import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { copy, withName } from '../../content/copy';
import { infoCards } from '../../content/infoCards';
import { Card } from '../../components/ui';
import { db } from '../../db/db';
import { attackDayNumber } from '../../lib/attacks';
import { dayStatus, type DayStatus } from '../../lib/calendar';
import { addDays, diffDays, formatDayLong, localDay, localHour, weekStart } from '../../lib/dates';
import { unlockProgress } from '../../lib/insights';
import { useActiveAttack } from '../../lib/useAttack';
import { useCalendarData } from '../../lib/useCalendarData';
import { useGoals } from '../../lib/useGoals';
import { useInsightsData, useRecaps } from '../../lib/useInsights';
import { useSettings } from '../../lib/useSettings';
import { formatMonth } from '../../lib/dates';
import { Mascot } from '../../mascot/Mascot';
import { getMood, homeLineContext } from '../../mascot/moodEngine';
import { pickLine } from '../../mascot/lines';
import { useMoodContext } from '../../mascot/useMoodContext';
import { GrowthStage } from '../../ui/Garden';
import { Icon } from '../../ui/Icon';
import { Ring } from '../../ui/kit';
import { MedFollowUp } from '../crisis/MedFollowUp';
import { PostdromeSlider } from '../crisis/PostdromeSlider';

const t = copy.home;

function greeting(hour: number) {
  if (hour < 12) return t.greetingMorning;
  if (hour < 18) return t.greetingAfternoon;
  return t.greetingEvening;
}

/** Pastille d'un jour de la semaine (jardin). */
function DayDot({ s, today }: { s: DayStatus; today: boolean }) {
  const base = 'mx-auto grid place-items-center w-9 h-9 rounded-full';
  if (s.kind === 'crise') return <span className={`${base} grad-lilac text-c-on-grad`}><Icon name="rain" size={16} /></span>;
  if (s.kind === 'post-crise') return <span className={`${base} grad-sky text-c-on-grad`}><Icon name="heart" size={15} /></span>;
  if (s.kind === 'rempli' || s.kind === 'signaux') return <span className={`${base} grad-mint text-c-on-grad`}><Icon name="leaf" size={16} /></span>;
  if (today) return <span className={`${base} ring-2 ring-c-accent bg-c-surface`} />;
  if (s.kind === 'futur') return <span className={`${base} bg-c-ink/5`} />;
  return <span className={`${base} border-2 border-dashed border-c-ink/15`} />;
}

export function HomePage() {
  const ctx = useMoodContext();
  const settings = useSettings();
  const goalsInfo = useGoals();
  const cal = useCalendarData();
  const insights = useInsightsData();
  const unseenRecap = useRecaps()?.find((r) => !r.seen);
  const active = useActiveAttack();
  const firstDay = useLiveQuery(async () => (await db.days.orderBy('date').first())?.date, []);
  const todayEntry = useLiveQuery(async () => (await db.days.get(localDay())) ?? null, []);
  const today = localDay();

  const mode = settings?.mascotMode ?? 'normal';
  const name = settings?.firstName ?? '';
  const mood = ctx ? getMood(ctx) : 'joyeux';
  const lineCtx = ctx ? homeLineContext(ctx) : null;
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => { if (lineCtx && name) setLine(pickLine(lineCtx, name)); }, [lineCtx, name]);

  const inCrisis = active?.attack.status === 'en cours';
  const inPost = active?.attack.status === 'post-crise';
  const g = goalsInfo?.goals;
  const needBackup = (() => {
    const monthAgo = Date.now() - 30 * 86400000;
    if (settings?.lastBackupAt) return new Date(settings.lastBackupAt).getTime() < monthAgo;
    return !!firstDay && new Date(`${firstDay}T12:00:00Z`).getTime() < monthAgo;
  })();
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart(today), i)), [today]);
  const recent = useMemo(() => Array.from({ length: 21 }, (_, i) => addDays(today, i - 20)), [today]);
  const lock = insights ? unlockProgress(insights.data) : null;
  const card = infoCards[Math.abs(diffDays('2026-01-01', today)) % infoCards.length];

  const mascot = (m: typeof mood, size: number, tap = true) => (mode === 'masqué' ? null : (
    <Mascot mood={m} size={mode === 'discret' ? Math.round(size * .7) : size} animated={!inCrisis}
      onTap={tap && !inCrisis && name ? () => setLine(pickLine('tap', name)) : undefined} />
  ));

  return (
    <main className="mx-auto max-w-md px-4 pt-5 space-y-4">
      <header className="flex items-center gap-3">
        {mode !== 'masqué' && (
          <span className="grid place-items-center w-12 h-12 rounded-full bg-c-surface shadow-soft overflow-hidden shrink-0">
            <Mascot mood={inCrisis ? 'calin' : 'joyeux'} portrait size={44} animated={false} />
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-c-muted first-letter:uppercase">{formatDayLong(today)}</p>
          <h1 className="font-display text-[26px] leading-tight font-semibold truncate">{withName(greeting(localHour()), name)}</h1>
        </div>
        <Link to="/reglages" aria-label={copy.settings.title} className="press grid place-items-center w-11 h-11 rounded-full glass shadow-soft text-c-ink">
          <Icon name="settings" />
        </Link>
      </header>

      {line && mode !== 'masqué' && (
        <p className="bubble-in glass shadow-soft rounded-[22px] rounded-tl-md px-4 py-3 text-[15px] font-semibold" aria-live="polite">{line}</p>
      )}

      {/* ---------- Carte principale, selon la situation ---------- */}
      {inCrisis && active && (
        <Link to="/crise" className="press block">
          <Card tone="grad-night" className="!p-0 min-h-[190px] overflow-hidden">
            <div className="relative z-10 p-5 w-[64%] space-y-2 text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold"><Icon name="moon" size={14} />{t.crisisChip}</span>
              <h2 className="font-display text-[25px] leading-[1.1] font-semibold">{t.crisisCardTitle.replace('{n}', String(attackDayNumber(active.attack)))}</h2>
              <p className="text-[14px] font-medium opacity-90">{t.crisisCardBody}</p>
            </div>
            <div className="absolute -right-2 -bottom-3">{mascot('calin', 150, false)}</div>
          </Card>
        </Link>
      )}

      {inPost && active && (
        <Card tone="grad-sky" className="space-y-1">
          <Link to="/crise" className="block font-display text-[22px] leading-tight font-semibold">{t.postCardTitle}</Link>
          <PostdromeSlider attackId={active.attack.id} showTitle={false} />
        </Card>
      )}

      {!active && (
        todayEntry ? (
          <Card tone="grad-mint" className="!p-0 min-h-[170px] overflow-hidden">
            <div className="relative z-10 p-5 w-[62%] space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-c-surface/60 px-3 py-1 text-[12px] font-bold"><Icon name="check" size={14} strokeWidth={2.4} />{t.doneChip}</span>
              <h2 className="font-display text-[24px] leading-[1.1] font-semibold">{t.dailyCardDone}</h2>
              <Link to="/checkin" className="inline-flex items-center gap-1 min-h-[44px] font-bold underline underline-offset-4">{t.edit}</Link>
            </div>
            <div className="absolute -right-2 -bottom-3">{mascot(mood, 140)}</div>
          </Card>
        ) : (
          <Card tone="grad-hero" className="!p-0 min-h-[210px] overflow-hidden shadow-float">
            <div className="relative z-10 p-5 w-[62%] space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-c-surface/60 px-3 py-1 text-[12px] font-bold"><Icon name="clock" size={14} />{t.oneMinute}</span>
              <h2 className="font-display text-[26px] leading-[1.08] font-semibold">{localHour() >= 17 ? t.heroEvening : t.heroDay}</h2>
              <Link to="/checkin" className="press inline-flex items-center gap-2 min-h-[48px] rounded-full bg-c-primary text-c-on-primary px-5 font-bold shadow-float">
                {t.start}<Icon name="arrow-right" size={19} />
              </Link>
            </div>
            <div className="absolute -right-3 -bottom-4">{mascot(mood, 168)}</div>
          </Card>
        )
      )}

      <MedFollowUp />

      {!inCrisis && goalsInfo?.pendingCelebration && g && (
        <Link to="/palier" className="press block">
          <Card tone="grad-sun" className="!p-4 flex items-center gap-3">
            <GrowthStage stage={g.tier.id} size={52} />
            <p className="flex-1 font-bold">{copy.goals.banner}</p>
            <Icon name="chevron-right" />
          </Card>
        </Link>
      )}

      {!inCrisis && unseenRecap && (
        <Link to={`/mois/${unseenRecap.month}`} className="press block">
          <Card tone="grad-peach" className="!p-4 flex items-center gap-3">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-c-surface/70"><Icon name="sparkle" /></span>
            <p className="flex-1 font-bold">{copy.months.banner.replace('{mois}', formatMonth(unseenRecap.month).split(' ')[0])}</p>
            <Icon name="chevron-right" />
          </Card>
        </Link>
      )}

      {/* ---------- Jardin de la semaine ---------- */}
      {g && cal && (
        <Link to="/objectifs" className="press block">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <GrowthStage stage={g.tier.id} size={56} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-c-muted">{t.garden.replace('{palier}', g.tier.label)}</p>
                <p className="font-display text-[19px] leading-tight font-semibold">
                  {g.thisWeekTarget === null ? t.freeRhythm : t.weekProgress.replace('{n}', String(g.thisWeekCount)).replace('{target}', String(g.thisWeekTarget))}
                </p>
              </div>
              {g.thisWeekTarget !== null && (
                <Ring value={g.thisWeekCount / g.thisWeekTarget}><span className="text-[13px] font-bold">{g.thisWeekCount}/{g.thisWeekTarget}</span></Ring>
              )}
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center">
              {week.map((d) => (
                <div key={d} className="space-y-1.5">
                  <p className="text-[12px] font-bold text-c-muted">{copy.calendar.weekdays[(new Date(`${d}T12:00:00Z`).getUTCDay() + 6) % 7]}</p>
                  <DayDot s={dayStatus(d, today, cal)} today={d === today} />
                </div>
              ))}
            </div>
          </Card>
        </Link>
      )}

      {!active && (
        <Link to="/crise/debut" className="press block">
          <Card tone="grad-lilac" className="!p-4 flex items-center gap-4">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-c-surface/70"><Icon name="rain" size={24} /></span>
            <span className="flex-1">
              <span className="block font-display text-[19px] font-semibold">{t.migraineTitle}</span>
              <span className="block text-[13.5px] font-medium text-c-on-grad-muted">{t.migraineHint}</span>
            </span>
            <Icon name="chevron-right" />
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/calendrier" className="press block">
          <Card tone="grad-peach" className="!p-4 space-y-3 h-full">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-c-surface/70"><Icon name="calendar" /></span>
            <p className="font-display text-[18px] leading-tight font-semibold">{t.calendarCard}</p>
            {cal && (
              <div className="grid grid-cols-7 gap-1" aria-hidden>
                {recent.map((d) => {
                  const k = dayStatus(d, today, cal).kind;
                  return <span key={d} className={`aspect-square rounded-full ${k === 'crise' ? 'bg-[#8C78F6]' : k === 'post-crise' ? 'bg-[#7FB8F0]' : k === 'rempli' || k === 'signaux' ? 'bg-c-surface' : 'bg-c-surface/35'}`} />;
                })}
              </div>
            )}
          </Card>
        </Link>
        <Link to="/analyses" className="press block">
          <Card tone="grad-mint" className="!p-4 space-y-3 h-full">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-c-surface/70"><Icon name="chart" /></span>
            <p className="font-display text-[18px] leading-tight font-semibold">{t.insightsCard}</p>
            <p className="text-[13px] font-semibold text-c-on-grad-muted">
              {lock && !lock.unlocked
                ? (lock.missingDays && lock.missingAttacks ? t.insightsLockedBoth : lock.missingDays ? t.insightsLockedDays : t.insightsLockedAttacks)
                  .replace('{j}', String(lock.missingDays)).replace('{c}', String(lock.missingAttacks))
                : t.insightsOpen}
            </p>
          </Card>
        </Link>
      </div>

      <Link to={`/comprendre/${card.id}`} className="press block">
        <Card className="!p-4 flex items-center gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-2xl grad-sky text-c-on-grad"><Icon name="book" /></span>
          <span className="flex-1">
            <span className="block text-[12.5px] font-bold text-c-muted">{t.learnChip}</span>
            <span className="block font-display text-[18px] leading-tight font-semibold">{card.titre}</span>
          </span>
          <Icon name="chevron-right" className="text-c-muted" />
        </Card>
      </Link>

      {needBackup && (
        <Link to="/reglages/donnees" className="press flex items-center gap-3 rounded-[22px] border-2 border-dashed border-c-ink/15 px-4 py-3 text-[14.5px] font-semibold text-c-muted">
          <Icon name="lock" />{settings?.lastBackupAt ? copy.data.backupBanner : copy.data.backupBannerNever}
        </Link>
      )}
    </main>
  );
}
