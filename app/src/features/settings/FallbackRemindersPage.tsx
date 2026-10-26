import { useState } from 'react';
import { Button, Card, PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';

const t = copy.fallback;

/** Aide : créer un rappel natif quand les notifications ne sont pas disponibles. */
export function FallbackRemindersPage() {
  const url = `${location.origin}${location.pathname}#/checkin`;
  const [copied, setCopied] = useState(false);
  const fill = (s: string) => s.replace('{url}', url);
  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} backTo="/reglages" />
      <p>{t.intro}</p>
      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold mb-2">{t.iosTitle}</h2>
        <ol className="list-decimal pl-5 space-y-2">{t.ios.map((s) => <li key={s} className="break-words">{fill(s)}</li>)}</ol>
      </Card>
      <Card>
        <h2 className="font-display text-[19px] leading-tight font-semibold mb-2">{t.androidTitle}</h2>
        <ol className="list-decimal pl-5 space-y-2">{t.android.map((s) => <li key={s} className="break-words">{fill(s)}</li>)}</ol>
      </Card>
      <Button variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { /* rien */ } }}>
        {copied ? t.copied : t.copy}
      </Button>
    </main>
  );
}
