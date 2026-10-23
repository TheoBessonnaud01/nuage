import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { Chip, EmojiScale, HoursPicker, ProgressBar } from '../../components/inputs';
import { copy, withName } from '../../content/copy';
import { checkinScreens, type Part, type Screen } from '../../content/questions';
import { db } from '../../db/db';
import { saveDay } from '../../db/days';
import type { DayEntry, Weather } from '../../db/types';
import { addDays, formatDayLong, isLateNight, localDay } from '../../lib/dates';
import { visibleList } from '../../lib/lists';
import { useGoals } from '../../lib/useGoals';
import { useSettings } from '../../lib/useSettings';
import { fetchWeather } from '../../lib/weather';
import { pickLine } from '../../mascot/lines';
import { Pepite } from '../../mascot/Pepite';

const t = copy.checkin;
const DEFAULT_SLEEP = 7;

/** Choix de la date : paramètre d'URL, ou « C'est pour hier soir ? » entre minuit et 4h. */
export function CheckinPage() {
  const { date: param } = useParams();
  const today = localDay();
  const [chosen, setChosen] = useState<string | null>(() => param ?? (isLateNight() ? null : today));

  if (param && (param > today || !/^\d{4}-\d{2}-\d{2}$/.test(param))) return <Navigate to="/" replace />;

  if (!chosen) {
    return (
      <main className="mx-auto max-w-md px-4 py-6 space-y-5">
        <Pepite mood="dort" text={t.lateNightTitle} size="md" />
        <Card><p>{t.lateNightBody}</p></Card>
        <Button onClick={() => setChosen(addDays(today, -1))}>{t.lateNightYes}</Button>
        <Button variant="ghost" onClick={() => setChosen(today)}>{t.lateNightNo}</Button>
      </main>
    );
  }
  return <CheckinFlow key={chosen} date={chosen} />;
}

function CheckinFlow({ date }: { date: string }) {
  const navigate = useNavigate();
  const settings = useSettings();
  const today = localDay();
  const isLate = date < today;

  const [entry, setEntry] = useState<Partial<DayEntry> | null>(null);
  const [existed, setExisted] = useState(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const weather = useRef<Weather | null>(null);
  const advanceTimer = useRef<number>();

  // Chargement unique : un jour déjà rempli s'ouvre en édition.
  useEffect(() => {
    db.days.get(date).then((e) => { setExisted(!!e); setEntry(e ?? {}); });
  }, [date]);

  // Météo (si activée) : récupérée en arrière-plan, enregistrée avec la première réponse.
  useEffect(() => {
    if (!settings?.weatherEnabled || !settings.location || entry === null || entry.weather) return;
    const ctrl = new AbortController();
    fetchWeather(settings.location.lat, settings.location.lon, date, ctrl.signal).then((w) => {
      weather.current = w;
      if (w && existed) saveDay(date, { weather: w });
    });
    return () => ctrl.abort();
  }, [settings?.weatherEnabled, settings?.location, date, entry === null]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const screens = useMemo(
    () => checkinScreens.filter((s) => s.onlyIf !== 'hasCustomFactors' || (settings?.customLists.factors.length ?? 0) > 0),
    [settings?.customLists.factors.length],
  );

  if (!entry || !settings) return null;
  const screen = screens[index];
  const dayLabel = formatDayLong(date);

  const save = async (patch: Partial<DayEntry>) => {
    const withWeather = weather.current && !entry.weather ? { ...patch, weather: weather.current } : patch;
    setEntry((e) => ({ ...e, ...withWeather }));
    await saveDay(date, withWeather);
  };

  const next = () => {
    window.clearTimeout(advanceTimer.current);
    if (index < screens.length - 1) setIndex(index + 1);
    else finish();
  };
  const finish = async () => {
    await save({}); // même si tout a été passé, la journée compte
    setDone(true);
  };
  const back = () => (index > 0 ? setIndex(index - 1) : navigate(-1));

  if (done) return <DoneScreen date={date} isLate={isLate} entry={entry} firstName={settings.firstName} />;

  // Bulle de Pépite : intro au 1er écran, puis encouragement toutes les 4 questions.
  const intro = isLate && !existed ? withName(t.lateIntro.replace('{jour}', dayLabel), settings.firstName)
    : existed ? t.editIntro : undefined;
  const bubbleText = index === 0 ? intro : undefined;
  const bubbleContext = index > 0 && index % 4 === 0 ? 'checkinEnCours' as const : undefined;

  const autoAdvance = screen.parts.length === 1 && (screen.parts[0].kind === 'scale' || screen.parts[0].kind === 'choice');
  const title = existed ? t.titleEdit : isLate ? t.titleLate : t.titleToday;

  return (
    <main className="mx-auto max-w-md px-4 py-4 min-h-screen flex flex-col">
      <header className="flex items-center gap-2">
        <button type="button" onClick={back} aria-label={copy.common.back} className="min-h-touch min-w-touch grid place-items-center rounded-full text-2xl">‹</button>
        <div className="flex-1">
          <p className="text-sm font-bold text-muted">{title.replace('{jour}', dayLabel)}</p>
          <ProgressBar value={(index + 1) / screens.length} label={t.progress.replace('{n}', String(index + 1)).replace('{total}', String(screens.length))} />
        </div>
      </header>

      <div className="mt-3 min-h-[80px]">
        <Pepite key={index} mood="pense" size="sm" text={bubbleText} lineContext={bubbleText ? undefined : bubbleContext} tappable={false} />
      </div>

      <section className="mt-2 flex-1 space-y-5" aria-live="polite">
        <h1 className="text-2xl font-extrabold">{screen.title}</h1>
        <InfoBox screen={screen} />
        {screen.parts.map((part) => (
          <PartInput
            key={part.field}
            part={part}
            entry={entry}
            settings={settings}
            onChange={async (patch) => {
              await save(patch);
              if (autoAdvance) advanceTimer.current = window.setTimeout(next, 280);
            }}
          />
        ))}
      </section>

      <div className="pt-6 grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={next}>{copy.common.skip}</Button>
        <Button onClick={async () => {
          // « Suivant » valide la durée affichée par défaut ; « Passer » ne garde rien.
          if (screen.parts.some((p) => p.kind === 'hours') && entry.sleepHours === undefined) await save({ sleepHours: DEFAULT_SLEEP });
          next();
        }}>{index === screens.length - 1 ? t.finish : copy.common.next}</Button>
      </div>
    </main>
  );
}

function InfoBox({ screen }: { screen: Screen }) {
  const [open, setOpen] = useState(false);
  if (!screen.info) return null;
  return open ? (
    <Card tone="bg-ciel/40" className="text-[16px]">
      <p>{screen.info.body}</p>
      <button type="button" onClick={() => setOpen(false)} className="mt-2 font-bold underline min-h-touch">{t.infoClose}</button>
    </Card>
  ) : (
    <button type="button" onClick={() => setOpen(true)} className="font-bold underline text-sauge-fort min-h-touch">ⓘ {screen.info.button}</button>
  );
}

function PartInput({
  part, entry, settings, onChange,
}: {
  part: Part;
  entry: Partial<DayEntry>;
  settings: NonNullable<ReturnType<typeof useSettings>>;
  onChange: (patch: Partial<DayEntry>) => void;
}) {
  const [tip, setTip] = useState<string | null>(null);
  const label = 'label' in part && part.label ? <h2 className="font-bold text-muted mb-2">{part.label}</h2> : null;

  switch (part.kind) {
    case 'hours':
      return (
        <div>{label}
          <HoursPicker
            value={entry.sleepHours}
            defaultValue={DEFAULT_SLEEP}
            onChange={(v) => onChange({ sleepHours: v })}
            format={(h) => t.hours.replace('{h}', String(h).replace('.', ','))}
            lessLabel={t.less}
            moreLabel={t.more}
          />
        </div>
      );
    case 'scale':
      return (
        <div>{label}
          <EmojiScale label={part.label} value={entry[part.field]} options={part.options} onChange={(v) => onChange({ [part.field]: v })} />
        </div>
      );
    case 'choice':
      return (
        <div>{label}
          <div className="grid gap-2">
            {part.options.map((o) => (
              <Chip key={String(o.value)} emoji={o.emoji} selected={entry[part.field] === o.value} onClick={() => onChange({ [part.field]: o.value })}>
                {o.label}
              </Chip>
            ))}
          </div>
        </div>
      );
    case 'multi': {
      const items = visibleList(part.list, settings);
      const isRecord = part.field === 'customFactors';
      const selected = new Set(
        isRecord
          ? Object.entries(entry.customFactors ?? {}).filter(([, v]) => v).map(([k]) => k)
          : (entry[part.field] as string[] | undefined) ?? [],
      );
      const toggle = (id: string) => {
        const nextSel = new Set(selected);
        if (nextSel.has(id)) nextSel.delete(id); else nextSel.add(id);
        if (isRecord) onChange({ customFactors: Object.fromEntries(items.map((i) => [i.id, nextSel.has(i.id)])) });
        else onChange({ [part.field]: [...nextSel] });
        const item = items.find((i) => i.id === id);
        setTip(nextSel.has(id) && item?.tip ? item.tip : null);
      };
      return (
        <div>{label}
          <div className="flex flex-wrap gap-2">
            {items.map((i) => (
              <Chip key={i.id} emoji={i.emoji} selected={selected.has(i.id)} onClick={() => toggle(i.id)}>{i.label}</Chip>
            ))}
          </div>
          {tip && <p className="mt-3 text-[15px] text-muted" aria-live="polite">💡 {tip}</p>}
        </div>
      );
    }
    case 'text':
      return (
        <textarea
          defaultValue={entry.note ?? ''}
          onChange={(e) => onChange({ note: e.target.value.trim() ? e.target.value : undefined })}
          placeholder={part.placeholder}
          rows={5}
          className="w-full rounded-2xl border-2 border-line bg-surface p-4 text-[17px] focus:border-sauge-fort outline-none"
        />
      );
  }
}

function DoneScreen({ date, isLate, entry, firstName }: { date: string; isLate: boolean; entry: Partial<DayEntry>; firstName: string }) {
  const info = useGoals();
  const line = useMemo(() => pickLine(isLate ? 'rattrapage' : 'checkinFini', firstName), [isLate, firstName]);
  const g = info?.goals;

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-5">
      <Pepite mood={isLate ? 'joyeux' : 'fier'} text={line} size="md" importantBubble />
      <Card>
        <h1 className="text-2xl font-extrabold">{t.doneTitle}</h1>
        <p className="text-muted mt-1">{isLate ? t.doneLateBody : t.doneBody}</p>
        {g && g.thisWeekTarget !== null && date >= addDays(localDay(), -6) && (
          <p className="mt-3 font-bold">
            {t.weekProgress.replace('{n}', String(g.thisWeekCount)).replace('{target}', String(g.thisWeekTarget)).replace('{emoji}', g.tier.emoji)}
          </p>
        )}
      </Card>

      {info?.pendingCelebration && (
        <Link to="/palier" className="block"><Card tone="bg-peche/50"><p className="font-extrabold">{copy.goals.banner}</p></Card></Link>
      )}

      {entry.headacheToday === 'migraine' && (
        <Card tone="bg-lavande/40">
          <h2 className="text-xl font-extrabold">{t.migraineTitle}</h2>
          <p className="mt-1">{t.migraineBody}</p>
          <Link to="/crise" className="block mt-3"><Button tabIndex={-1}>{t.migraineYes}</Button></Link>
        </Card>
      )}

      <Link to="/" className="block"><Button tabIndex={-1}>{t.backHome}</Button></Link>
      <Link to="/calendrier" className="block"><Button variant="ghost" tabIndex={-1}>{t.seeCalendar}</Button></Link>
    </main>
  );
}
