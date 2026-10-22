import { copy } from '../content/copy';
import { Card, PageHeader } from './ui';

export function ComingSoon({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <PageHeader title={title} />
      <Card>
        <p className="text-xl font-extrabold">{copy.common.soon}</p>
        <p className="text-muted mt-2">{copy.common.soonBody}</p>
      </Card>
    </main>
  );
}
