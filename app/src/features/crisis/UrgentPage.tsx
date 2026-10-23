import { PageHeader } from '../../components/ui';
import { copy } from '../../content/copy';
import { urgentCard as c } from '../../content/infoCards';

const t = copy.urgent;

/** Fiche « Quand consulter en urgence » : sobre, lisible, sans mascotte. */
export function UrgentPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-5 text-[16px]">
      <PageHeader title={c.titre} backTo="/crise" />
      {c.corps.map((p) => <p key={p}>{p}</p>)}

      <section className="rounded-card border-2 border-ink/40 p-5 space-y-3">
        <h2 className="text-lg font-extrabold">{t.call15Title}</h2>
        <ul className="list-disc pl-5 space-y-2">{c.call15.map((x) => <li key={x}>{x}</li>)}</ul>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <a href="tel:15" className="min-h-touch rounded-2xl bg-ink text-bg font-extrabold grid place-items-center">{t.call15}</a>
          <a href="tel:112" className="min-h-touch rounded-2xl border-2 border-ink font-extrabold grid place-items-center">{t.call112}</a>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-extrabold">{t.soonTitle}</h2>
        <ul className="list-disc pl-5 space-y-2">{c.soon.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-extrabold">{t.soonDaysTitle}</h2>
        <ul className="list-disc pl-5 space-y-2">{c.soonDays.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      <p className="text-sm text-muted">
        {t.source} : <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{c.sourceLabel}</a>
        <br />{t.verified.replace('{date}', c.verifiedAt)}
      </p>
    </main>
  );
}
