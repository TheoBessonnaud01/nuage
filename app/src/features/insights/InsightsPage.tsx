import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Loading, PageHeader, Segmented } from '../../components/ui';
import { ProgressBar } from '../../components/inputs';
import { copy } from '../../content/copy';
import { medicationCategories } from '../../content/factors';
import { formatDuration } from '../../lib/attacks';
import {
  factorsBeforeAttacks, keyFigures, medicationDaysThisMonth, periodRange, symptomStats, treatmentStats,
  UNLOCK, unlockProgress, warningSignsBefore, weatherStats,
} from '../../lib/insights';
import { useInsightsData } from '../../lib/useInsights';
import { Pepite } from '../../mascot/Pepite';
import { EvolutionTabs } from './EvolutionTabs';
import { InfoSuggestion } from '../info/InfoSuggestion';

const t = copy.insights;
const pct = (x: number) => Math.round(x * 100);
const num = (x: number | null) => (x === null ? '—' : String(x).replace('.', ','));
const catLabel = (c: string) => medicationCategories.find((m) => m.value === c)?.label ?? c;

export function InsightsPage() {
  const loaded = useInsightsData();
  const [months, setMonths] = useState(3);
  const range = useMemo(() => periodRange(months), [months]);
  if (!loaded) return <main className="mx-auto max-w-md px-4 py-6"><Loading text={t.loading} /></main>;
  const { data } = loaded;
  const progress = unlockProgress(data);

  if (!progress.unlocked) {
    const parts = [
      progress.missingDays ? t.remainingDays.replace('{n}', String(progress.missingDays)) : '',
      progress.missingAttacks ? t.remainingAttacks.replace('{n}', String(progress.missingAttacks)) : '',
    ].filter(Boolean).join(t.and);
    return (
      <main className="mx-auto max-w-md px-4 py-6 space-y-4">
        <PageHeader title={t.title} noBack />
        <EvolutionTabs active="analyses" />
        <Pepite mood="curieux" lineContext="analysesVerrouillees" size="md" importantBubble />
        <Card className="space-y-4">
          <h2 className="font-display text-[21px] leading-tight font-semibold">{t.lockedTitle}</h2>
          <p>{t.lockedBody.replace('{jours}', String(UNLOCK.days)).replace('{crises}', String(UNLOCK.attacks))}</p>
          <div className="space-y-1">
            <p className="font-bold">{t.lockedDays.replace('{n}', String(Math.min(progress.days, UNLOCK.days))).replace('{total}', String(UNLOCK.days))}</p>
            <ProgressBar value={Math.min(1, progress.days / UNLOCK.days)} label={t.lockedDays} />
          </div>
          <div className="space-y-1">
            <p className="font-bold">{t.lockedAttacks.replace('{n}', String(Math.min(progress.attacks, UNLOCK.attacks))).replace('{total}', String(UNLOCK.attacks))}</p>
            <ProgressBar value={Math.min(1, progress.attacks / UNLOCK.attacks)} label={t.lockedAttacks} />
          </div>
          <p className="text-c-muted">{t.lockedRemaining.replace('{reste}', parts)}</p>
        </Card>
      </main>
    );
  }

  const k = keyFigures(data, range);
  const fs = factorsBeforeAttacks(data, range);
  const ws = warningSignsBefore(data, range);
  const ss = symptomStats(data, range);
  const ts = treatmentStats(data, range);
  const medAlert = medicationDaysThisMonth(data.meds);
  const weather = weatherStats(data, range);

  const figures: [string, string][] = [
    [t.kAttacks, String(k.attacks)],
    [t.kMigraineDays, num(k.migraineDaysPerMonth)],
    [t.kPain, formatDuration(k.avgPainHours)],
    [t.kPost, formatDuration(k.avgPostHours)],
    [t.kIntensity, k.avgIntensity === null ? '—' : `${num(k.avgIntensity)} (${k.maxIntensity})`],
    [t.kAura, k.auraPercent === null ? '—' : `${k.auraPercent} %`],
  ];

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} noBack />
      <EvolutionTabs active="analyses" />
      <Pepite mood="curieux" lineContext="analysesDebloquees" size="sm" importantBubble />

      <Segmented label="Période" value={months} onChange={setMonths} options={t.periods.map((p) => ({ value: p.months, label: p.label }))} />

      {medAlert.alert && (
        <Card tone="grad-sky">
          <h2 className="font-display text-[19px] leading-tight font-semibold">{t.medAlertTitle}</h2>
          <p className="mt-1">{t.medAlertBody}</p>
          <Link to="/comprendre/medicaments" className="inline-block mt-2 font-bold underline">{t.medAlertLink}</Link>
        </Card>
      )}
      <InfoSuggestion trigger="reperes-traitement" when={medAlert.alert} />

      <section aria-labelledby="k">
        <h2 id="k" className="font-extrabold mb-2">{t.keyTitle}</h2>
        <div className="grid grid-cols-2 gap-3">
          {figures.map(([label, value]) => (
            <Card key={label} className="!p-4">
              <p className="text-sm font-bold text-c-muted leading-tight">{label}</p>
              <p className="font-display text-[28px] leading-none font-semibold mt-2">{value}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold">{t.factorsTitle}</h2>
        <p className="text-sm text-c-muted mt-1">{t.factorsIntro}</p>
        {fs.length === 0 ? <p className="mt-3 text-c-muted">{t.factorsEmpty}</p> : (
          <ul className="mt-3 space-y-3">
            {fs.slice(0, 8).map((f) => (
              <li key={f.id} className={f.level === 'plus' ? '' : 'text-c-muted'}>
                <p className="font-bold">{f.label}</p>
                <p className="text-[15px]">{t.factorLevel[f.level]}</p>
                <p className="text-sm text-c-muted">{t.factorLine.replace('{avant}', String(f.before)).replace('{total}', String(f.beforeKnown)).replace('{pAvant}', String(pct(f.pBefore))).replace('{pAutres}', String(pct(f.pOther)))}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-c-muted mt-4 italic">{t.factorsDisclaimer}</p>
      </Card>

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold">{t.signsTitle}</h2>
        {ws.signs.length === 0 ? <p className="mt-2 text-c-muted">{t.signsEmpty}</p> : (
          <>
            <ul className="mt-2 space-y-1">
              {ws.signs.slice(0, 5).map((s) => <li key={s.id}><span className="font-bold">{s.label}</span> · <span className="text-c-muted">{t.signLine.replace('{n}', String(s.attacks)).replace('{total}', String(ws.attacks)).replace('{p}', String(s.percent))}</span></li>)}
            </ul>
            {ws.avgDelayDays !== null && <p className="mt-3">{ws.avgDelayDays < 0.5 ? t.signsDelaySameDay : t.signsDelay.replace('{n}', num(ws.avgDelayDays))}</p>}
          </>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold">{t.symptomsTitle}</h2>
        {[[t.symptomsCrisis, ss.crisis], [t.symptomsPost, ss.post]].map(([label, list]) => (
          <div key={label as string} className="mt-3">
            <p className="font-bold text-c-muted">{label as string}</p>
            {(list as typeof ss.crisis).length === 0 ? <p className="text-c-muted text-[15px]">{t.symptomsEmpty}</p> : (
              <ul className="text-[15px]">{(list as typeof ss.crisis).slice(0, 5).map((s) => <li key={s.id}>{s.label} · {s.percent} %</li>)}</ul>
            )}
          </div>
        ))}
        <p className="text-sm text-c-muted mt-3">{t.kPain} : {formatDuration(k.avgPainHours)} · {t.kPost.toLowerCase()} : {formatDuration(k.avgPostHours)}</p>
      </Card>

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold">{t.medsTitle}</h2>
        {ts.byCategory.length === 0 ? <p className="mt-2 text-c-muted">{t.medsEmpty}</p> : (
          <>
            <p className="mt-2 font-bold">{t.medsDays.replace('{n}', num(ts.daysPerMonth))}</p>
            <ul className="mt-2 space-y-2 text-[15px]">
              {ts.byCategory.map((c) => (
                <li key={c.category}>
                  {t.medsCat.replace('{cat}', catLabel(c.category)).replace('{n}', num(c.daysPerMonth))}
                  {c.avgEfficacy !== null && <span className="block text-c-muted text-sm">{t.medsEfficacy.replace('{e}', t.medsEfficacyLabels[Math.round(c.avgEfficacy)])}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold">{t.weatherTitle}</h2>
        <p className="mt-2 text-[15px]">
          {weather ? t.weatherLine.replace('{pc}', num(weather.pressureCrisis)).replace('{po}', num(weather.pressureOther)).replace('{dc}', num(weather.deltaCrisis)).replace('{do}', num(weather.deltaOther)) : t.weatherEmpty}
        </p>
      </Card>

      <Link to="/mois" className="block text-center font-bold underline text-c-accent min-h-touch py-3">{t.toMonths}</Link>
    </main>
  );
}
