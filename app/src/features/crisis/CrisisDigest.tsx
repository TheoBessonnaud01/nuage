import { Link } from 'react-router-dom';
import { Card } from '../../components/ui';
import { copy } from '../../content/copy';
import { labelOf, relievedBy } from '../../content/factors';
import { comfortTips } from '../../content/infoCards';
import { digestCrisis, formatDuration } from '../../lib/attacks';
import type { AttackData } from '../../lib/useAttack';
import { usePastAttacks } from '../../lib/useAttack';
import { Icon, type IconName } from '../../ui/Icon';

const t = copy.crisis;
const tipIcon: Record<string, IconName> = { dark: 'moon', cold: 'thermo', water: 'drop' };
const hhmm = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

/** Le point sur la crise : où elle en est, comparaison avec les précédentes, gestes qui peuvent aider. */
export function CrisisDigest({ data }: { data: AttackData }) {
  const past = usePastAttacks();
  if (!past) return null;
  const d = digestCrisis(data.attack, data.logs, data.meds, past);

  const where: string[] = [t.digestDuration.replace('{duree}', formatDuration(d.hoursSoFar))];
  if (d.lastIntensity !== null) {
    const n = String(d.lastIntensity);
    const p = String(d.previousIntensity);
    where.push(
      d.trend === 'baisse' ? t.digestTrendBaisse.replace('{prev}', p).replace('{n}', n)
        : d.trend === 'hausse' ? t.digestTrendHausse.replace('{prev}', p).replace('{n}', n)
        : d.trend === 'stable' ? t.digestTrendStable.replace('{n}', n)
        : t.digestFirst.replace('{n}', n),
    );
  }
  if (d.lastMed) {
    where.push((d.lastMed.efficacyAfter2h ? t.digestMedRated : t.digestMed).replace('{nom}', d.lastMed.name).replace('{heure}', hhmm(d.lastMed.takenAt)));
  }
  const personal: string[] = [];
  if (d.avgPastPainHours !== null) personal.push(t.digestPast.replace('{duree}', formatDuration(d.avgPastPainHours)));
  if (d.pastRelief.length) personal.push(t.digestRelief.replace('{liste}', d.pastRelief.map((id) => labelOf(relievedBy, id).toLowerCase()).join(', ')));

  // Gestes de confort : l'eau d'abord en cas de nausées
  const tips = [
    ...(d.nausea ? [comfortTips.water] : []),
    comfortTips.dark,
    comfortTips.cold,
    ...(d.nausea ? [] : [comfortTips.water]),
  ];

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold mb-2">{t.digestWhere}</h2>
        <ul className="space-y-2">{where.map((w) => <li key={w}>{w}</li>)}</ul>
        {personal.length > 0 && (
          <ul className="space-y-2 mt-3 pt-3 border-t border-c-ink/10">{personal.map((w) => <li key={w}>{w}</li>)}</ul>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold mb-2">{t.digestTipsTitle}</h2>
        <ul className="space-y-2">
          {tips.map((tip) => <li key={tip.id} className="flex gap-3 items-start"><span className="grid place-items-center w-9 h-9 rounded-2xl grad-sky text-c-on-grad shrink-0"><Icon name={tipIcon[tip.id]} size={18} /></span><span className="pt-1.5">{tip.text}</span></li>)}
        </ul>
        <p className="text-sm text-c-muted mt-3">{t.digestNoMedAdvice}</p>
        <p className="text-sm text-c-muted mt-1">
          <a href={comfortTips.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{t.digestTipsSource}</a>
        </p>
      </Card>

      <Link to="/urgence" className="block text-sm text-c-muted underline">{t.digestHigh}</Link>
    </div>
  );
}
