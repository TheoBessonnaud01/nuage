import { Link, Navigate, useParams } from 'react-router-dom';
import { Card, PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { findCard } from '../../content/infoCards';

const t = copy.info;

export function InfoCardPage() {
  const { id = '' } = useParams();
  const card = findCard(id);
  if (!card) return <Navigate to="/comprendre" replace />;
  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={`${card.emoji} ${card.titre}`} backTo="/comprendre" />
      <Card className="space-y-3 text-[16px] leading-relaxed">
        {card.corps.map((p) => <p key={p}>{p}</p>)}
        {card.medical && <p className="text-sm text-muted">{t.medicalTerm.replace('{terme}', card.medical)}</p>}
      </Card>
      {card.id === 'consultation' && (
        <Card tone="bg-sauge/25">
          <p className="text-[15px]">{t.exportSoon}</p>
          <Link to="/analyses" className="inline-block mt-2 font-bold underline">{t.toExport}</Link>
        </Card>
      )}
      <p className="text-sm text-muted">
        {t.source} : <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{card.sourceLabel}</a>
        <br />{t.verified.replace('{date}', card.verifiedAt)}
      </p>
      <p className="text-sm text-muted">{t.disclaimer}</p>
    </main>
  );
}
