import { Link, Navigate, useParams } from 'react-router-dom';
import { Card, PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { findCard } from '../../content/infoCards';
import { Icon } from '../../ui/Icon';
import { styleOf } from './cardStyle';

const t = copy.info;

export function InfoCardPage() {
  const { id = '' } = useParams();
  const card = findCard(id);
  if (!card) return <Navigate to="/comprendre" replace />;
  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={card.titre} backTo="/comprendre" />
      <div className={`-mt-1 rounded-[28px] ${styleOf(card.id).tone} p-5 flex items-center gap-4 text-c-on-grad`}>
        <span className="grid place-items-center w-14 h-14 rounded-2xl bg-c-surface/70"><Icon name={styleOf(card.id).icon} size={28} /></span>
        <p className="font-semibold text-[15px]">{t.verified.replace('{date}', card.verifiedAt)}</p>
      </div>
      <Card className="space-y-3 text-[16px] leading-relaxed">
        {card.corps.map((p) => <p key={p}>{p}</p>)}
        {card.medical && <p className="text-sm text-c-muted">{t.medicalTerm.replace('{terme}', card.medical)}</p>}
      </Card>
      {card.id === 'consultation' && (
        <Card tone="grad-mint">
          <Link to="/reglages/donnees" className="font-bold underline">{t.toExport}</Link>
        </Card>
      )}
      <p className="text-sm text-c-muted">
        {t.source} : <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{card.sourceLabel}</a>
        <br />{t.verified.replace('{date}', card.verifiedAt)}
      </p>
      <p className="text-sm text-c-muted">{t.disclaimer}</p>
    </main>
  );
}
