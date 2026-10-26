import { Link } from 'react-router-dom';
import { copy } from '../../content/copy';

/** Onglet « Évolution » : bascule entre les analyses et les récaps mensuels. */
export function EvolutionTabs({ active }: { active: 'analyses' | 'mois' }) {
  const item = (key: 'analyses' | 'mois', to: string, label: string) => (
    <Link to={to} aria-current={active === key ? 'page' : undefined}
      className={`press flex-1 grid place-items-center min-h-[44px] rounded-full text-[14.5px] font-bold ${active === key ? 'bg-c-primary text-c-on-primary shadow-soft' : 'text-c-muted'}`}>
      {label}
    </Link>
  );
  return (
    <nav aria-label={copy.nav.evolution} className="flex gap-1 rounded-full bg-c-surface shadow-soft p-1 -mt-1">
      {item('analyses', '/analyses', copy.evolution.insights)}
      {item('mois', '/mois', copy.evolution.months)}
    </nav>
  );
}
