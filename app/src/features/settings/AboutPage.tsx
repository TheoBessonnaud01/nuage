import { Card, PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';

const t = copy.about;

export function AboutPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} backTo="/reglages" />
      <Card className="space-y-3 text-[15px]">
        <p className="font-bold">{t.version.replace('{v}', __APP_VERSION__)}</p>
        <p>{t.body}</p>
        <p className="text-c-muted">{copy.settings.disclaimer}</p>
        <p className="text-c-muted">{t.privacy}</p>
      </Card>
      <Card className="space-y-2 text-[15px]">
        <h2 className="font-display text-[19px] leading-tight font-semibold">{t.sourcesTitle}</h2>
        <ul className="list-disc pl-5">{t.sources.map((s) => <li key={s}>{s}</li>)}</ul>
        <p className="text-c-muted">{t.weatherCredit}</p>
      </Card>
    </main>
  );
}
