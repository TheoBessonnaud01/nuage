import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { infoCards } from '../../content/infoCards';
import { Pepite } from '../../mascot/Pepite';
import { Icon } from '../../ui/Icon';
import { styleOf } from './cardStyle';

const t = copy.info;

export function InfoLibraryPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} noBack />
      <Pepite mood="curieux" text={t.intro} size="sm" tappable={false} />
      <Link to="/urgence" className="press flex items-center gap-3 rounded-[22px] bg-c-surface shadow-soft ring-2 ring-c-ink/15 px-4 py-3 font-bold">
        <span className="grid place-items-center w-11 h-11 rounded-2xl bg-c-ink/5"><Icon name="alert" /></span>
        <span className="flex-1">{t.urgentTitle}</span><Icon name="chevron-right" className="text-c-muted" />
      </Link>
      <ul className="space-y-2">
        {infoCards.map((c) => (
          <li key={c.id}>
            <Link to={`/comprendre/${c.id}`} className="press flex items-center gap-4 rounded-[22px] bg-c-surface shadow-soft p-3">
              <span className={`grid place-items-center w-12 h-12 rounded-2xl text-c-on-grad ${styleOf(c.id).tone}`}><Icon name={styleOf(c.id).icon} /></span>
              <span className="font-display text-[17.5px] leading-tight font-semibold flex-1">{c.titre}</span>
              <Icon name="chevron-right" className="text-c-muted" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-c-muted text-center">{t.disclaimer}</p>
    </main>
  );
}
