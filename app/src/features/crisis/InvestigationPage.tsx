import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ActionBar, Button, Card } from '../../components/ui';
import { ProgressBar } from '../../components/inputs';
import { copy } from '../../content/copy';
import { checkinScreens, type Part, type Screen } from '../../content/questions';
import { saveInvestigation } from '../../db/attacks';
import { db } from '../../db/db';
import { saveDay } from '../../db/days';
import type { DayEntry } from '../../db/types';
import { addDays, formatDayLong, localDay } from '../../lib/dates';
import { useActiveAttack } from '../../lib/useAttack';
import { useSettings } from '../../lib/useSettings';
import { Pepite } from '../../mascot/Pepite';
import { rows } from '../calendar/DayPage';
import { PartInput } from '../checkin/CheckinPage';

const t = copy.crisis;
/** Écrans du check-in repris dans l'enquête (sommeil, repas, stress, alcool, caféine, effort, écrans, rythme, signaux). */
const INVESTIGATED = ['sommeil', 'stress', 'repas', 'cafeine', 'alcool', 'ecrans', 'effort', 'signaux'];

const answered = (p: Part, e: Partial<DayEntry>) => {
  const v = e[p.field as keyof DayEntry];
  return Array.isArray(v) ? v.length > 0 : v !== undefined;
};

interface Step { day: string; dayLabel: string; screen: Screen }

/** « Petite enquête (sans pression) » : on ne demande que ce qui manque sur la veille et l'avant-veille. */
export function InvestigationPage() {
  const data = useActiveAttack();
  const settings = useSettings();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Record<string, Partial<DayEntry>> | null>(null);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [index, setIndex] = useState(-1); // -1 = intro
  const [suspect, setSuspect] = useState('');
  const [finished, setFinished] = useState(false);

  const d0 = data?.attack ? localDay(new Date(data.attack.startAt)) : null;
  const days = useMemo(() => (d0 ? [addDays(d0, -2), addDays(d0, -1), d0] : []), [d0]);

  // Lecture unique des check-ins, puis liste figée des questions manquantes.
  useEffect(() => {
    if (!d0 || entries) return;
    Promise.all(days.map((d) => db.days.get(d))).then((list) => {
      const map: Record<string, Partial<DayEntry>> = {};
      days.forEach((d, i) => { map[d] = list[i] ?? {}; });
      setEntries(map);
      const out: Step[] = [];
      for (const [day, label] of [[days[1], t.invDayBefore], [days[0], t.invTwoDaysBefore]] as const) {
        for (const s of checkinScreens.filter((x) => INVESTIGATED.includes(x.id))) {
          const missing = s.parts.filter((p) => !answered(p, map[day]));
          if (missing.length) out.push({ day, dayLabel: label.replace('{jour}', formatDayLong(day)), screen: { ...s, parts: missing } });
        }
      }
      setSteps(out);
    });
  }, [d0, days, entries]);

  if (data === undefined || !settings) return null;
  if (!data) return <Navigate to="/crise" replace />;
  if (!entries || !steps) return null;
  const attackId = data.attack.id;

  const finish = async () => {
    await saveInvestigation(attackId, { days: [days[0], days[1]], suspect: suspect.trim() || undefined, doneAt: new Date().toISOString() });
    setFinished(true);
  };

  if (finished) {
    return (
      <main className="mx-auto max-w-md px-4 py-6 space-y-5">
        <Pepite mood="detective" text={t.invDone} size="md" importantBubble />
        <Card><p>{t.invDoneBody}</p></Card>
        <Button onClick={() => navigate('/crise', { replace: true })}>{copy.common.back}</Button>
      </main>
    );
  }

  const total = steps.length + 1; // + « autre chose de suspect ? »
  const isSuspect = index === steps.length;
  const step = index >= 0 && !isSuspect ? steps[index] : null;
  const next = () => (isSuspect ? finish() : setIndex(index + 1));

  return (
    <main className="mx-auto max-w-md px-4 pt-4 !pb-0 screen-h flex flex-col">
      <header className="flex items-center gap-2">
        <button type="button" onClick={() => (index >= 0 ? setIndex(index - 1) : navigate(-1))} aria-label={copy.common.back} className="min-h-touch min-w-touch grid place-items-center rounded-full text-2xl">‹</button>
        <div className="flex-1">
          <p className="text-sm font-bold text-muted">{t.invTitle}</p>
          {index >= 0 && <ProgressBar value={(index + 1) / total} label={`${index + 1} / ${total}`} />}
        </div>
      </header>

      <section className="mt-3 pb-6 space-y-4" aria-live="polite">
        {index === -1 && (
          <>
            <Pepite mood="detective" lineContext="enquete" size="sm" importantBubble />
            <p>{t.invIntro}</p>
            {[[days[0], t.invTwoDaysBefore], [days[1], t.invDayBefore], [days[2], t.invCrisisDay]].map(([d, label]) => {
              const r = entries[d].date ? rows(entries[d] as DayEntry) : [];
              return (
                <Card key={d} className="!p-4">
                  <h2 className="font-extrabold">{label.replace('{jour}', formatDayLong(d))}</h2>
                  {r.length ? (
                    <p className="text-[15px] text-muted mt-1">{t.invAlready} : {r.map(([k, v]) => `${k.toLowerCase()} ${v}`).join(' · ')}</p>
                  ) : <p className="text-[15px] text-muted mt-1">{t.invNothing}</p>}
                </Card>
              );
            })}
          </>
        )}
        {step && (
          <>
            <Pepite mood="detective" size="sm" tappable={false} />
            <p className="font-bold text-sauge-fort">{step.dayLabel}</p>
            <h1 className="text-2xl font-extrabold">{step.screen.title.replace('aujourd’hui', 'ce jour-là').replace('Ta nuit dernière', 'La nuit d’avant')}</h1>
            {step.screen.parts.map((p) => (
              <PartInput key={p.field} part={p} entry={entries[step.day]} settings={settings} onChange={async (patch) => {
                setEntries((e) => ({ ...e!, [step.day]: { ...e![step.day], ...patch } }));
                await saveDay(step.day, patch);
              }} />
            ))}
          </>
        )}
        {isSuspect && (
          <>
            <h1 className="text-2xl font-extrabold">{t.invSuspectTitle}</h1>
            <textarea value={suspect} onChange={(e) => setSuspect(e.target.value)} placeholder={t.invSuspectPlaceholder} rows={4}
              className="w-full rounded-2xl border-2 border-line bg-surface p-4 text-[16px] outline-none focus:border-sauge-fort" />
          </>
        )}
      </section>

      <ActionBar className="space-y-2">
        {index === -1 ? (
          <>
            <Button onClick={() => setIndex(0)}>{t.invStart}</Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>{t.invLater}</Button>
          </>
        ) : isSuspect ? (
          <Button onClick={finish}>{t.save}</Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={() => setIndex(steps.length)}>{t.invStop}</Button>
            <Button onClick={next}>{copy.common.next}</Button>
          </div>
        )}
      </ActionBar>
    </main>
  );
}
