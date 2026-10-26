import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { infoCards } from '../../content/infoCards';
import { Pepite } from '../../mascot/Pepite';

const t = copy.info;

export function InfoLibraryPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} />
      <Pepite mood="curieux" text={t.intro} size="sm" tappable={false} />
      <Link to="/urgence" className="flex items-center min-h-touch rounded-2xl border-2 border-ink/40 px-4 py-3 font-extrabold">
        {t.urgentTitle}
      </Link>
      <ul className="space-y-2">
        {infoCards.map((c) => (
          <li key={c.id}>
            <Link to={`/comprendre/${c.id}`} className="flex items-center gap-3 rounded-2xl bg-surface border border-line px-4 min-h-touch py-3">
              <span className="text-2xl" aria-hidden>{c.emoji}</span>
              <span className="font-bold flex-1">{c.titre}</span>
              <span className="text-muted" aria-hidden>›</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted text-center">{t.disclaimer}</p>
    </main>
  );
}
