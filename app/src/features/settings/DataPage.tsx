import { useRef, useState } from 'react';
import { Button, Card, PageHeader } from '../../components/ui';
import { Chip } from '../../components/inputs';
import { copy } from '../../content/copy';
import { updateSettings } from '../../db/db';
import { BackupError, createBackup, parseBackup, restoreBackup, summarize, wipeAll, type Backup } from '../../lib/backup';
import { attacksCsv, daysCsv, medicationsCsv } from '../../lib/csv';
import { formatDayLong, localDay } from '../../lib/dates';
import { periodRange } from '../../lib/insights';
import { disablePush } from '../../lib/push';
import { shareOrDownload, stamp } from '../../lib/share';
import { loadInsightsData } from '../../lib/useInsights';
import { useSettings } from '../../lib/useSettings';

const t = copy.data;

export function DataPage() {
  const settings = useSettings();
  const [months, setMonths] = useState(6);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Backup | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [wipeStep, setWipeStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!settings) return null;

  const run = async (key: string, fn: () => Promise<string | void>) => {
    setBusy(key);
    try {
      const out = await fn();
      if (out) setMsg((m) => ({ ...m, [key]: out }));
    } finally { setBusy(null); }
  };
  const result = (r: string) => (r === 'partage' ? t.shared : r === 'telecharge' ? t.downloaded : '');

  const doctor = () => run('pdf', async () => {
    const [{ doctorPdf }, { data }] = await Promise.all([import('../../lib/pdf'), loadInsightsData()]);
    const blob = doctorPdf(data, settings.firstName, periodRange(months));
    return result(await shareOrDownload([{ name: `nuage-pour-mon-medecin-${stamp()}.pdf`, blob }], 'Journal de migraines'));
  });
  const csv = () => run('csv', async () => {
    const { data } = await loadInsightsData();
    const b = (s: string) => new Blob([s], { type: 'text/csv;charset=utf-8' });
    return result(await shareOrDownload([
      { name: `nuage-jours-${stamp()}.csv`, blob: b(daysCsv(data.entries)) },
      { name: `nuage-crises-${stamp()}.csv`, blob: b(attacksCsv(data.attacks, data.logs)) },
      { name: `nuage-traitements-${stamp()}.csv`, blob: b(medicationsCsv(data.meds, data.attacks)) },
    ], 'Journal Nuage (CSV)'));
  });
  const backup = () => run('backup', async () => {
    const blob = new Blob([JSON.stringify(await createBackup())], { type: 'application/json' });
    const r = await shareOrDownload([{ name: `nuage-sauvegarde-${stamp()}.json`, blob }], 'Sauvegarde Nuage');
    if (r !== 'annule') await updateSettings({ lastBackupAt: new Date().toISOString() });
    return r === 'annule' ? '' : t.backupDone;
  });
  const pick = async (file: File) => {
    try {
      setPending(parseBackup(await file.text()));
      setMsg((m) => ({ ...m, restore: '' }));
    } catch (e) {
      setMsg((m) => ({ ...m, restore: t.errors[e instanceof BackupError ? e.message : 'illisible'] }));
    }
  };
  const restore = (mode: 'fusion' | 'remplacement') => run('restore', async () => {
    if (!pending) return;
    await restoreBackup(pending, mode);
    setPending(null);
    setConfirmReplace(false);
    return t.restoreDone;
  });
  const wipe = async () => {
    await disablePush().catch(() => undefined);
    await wipeAll();
    location.hash = '#/';
    location.reload();
  };

  const p = pending ? summarize(pending) : null;
  const lastBackup = settings.lastBackupAt ? t.lastBackup.replace('{date}', formatDayLong(localDay(new Date(settings.lastBackupAt)))) : t.neverBackup;

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <PageHeader title={t.title} backTo="/reglages" />
      <p className="text-muted">{t.intro}</p>

      <Card className="space-y-3">
        <h2 className="font-extrabold">{t.doctorTitle}</h2>
        <p className="text-[15px] text-muted">{t.doctorBody}</p>
        <div className="flex gap-2" role="radiogroup" aria-label={t.period}>
          {t.periods.map((x) => <Chip key={x.months} selected={months === x.months} onClick={() => setMonths(x.months)} className="flex-1 justify-center">{x.label}</Chip>)}
        </div>
        <Button onClick={doctor} disabled={!!busy}>{busy === 'pdf' ? t.working : t.makePdf}</Button>
        {msg.pdf && <p role="status">{msg.pdf}</p>}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-extrabold">{t.csvTitle}</h2>
        <p className="text-[15px] text-muted">{t.csvBody}</p>
        <Button variant="secondary" onClick={csv} disabled={!!busy}>{busy === 'csv' ? t.working : t.makeCsv}</Button>
        {msg.csv && <p role="status">{msg.csv}</p>}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-extrabold">{t.backupTitle}</h2>
        <p className="text-[15px] text-muted">{t.backupBody}</p>
        <p className="text-sm font-bold">{lastBackup}</p>
        <Button onClick={backup} disabled={!!busy}>{busy === 'backup' ? t.working : t.makeBackup}</Button>
        {msg.backup && <p role="status">{msg.backup}</p>}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-extrabold">{t.restoreTitle}</h2>
        <p className="text-[15px] text-muted">{t.restoreBody}</p>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ''; }} />
        {!pending && <Button variant="ghost" onClick={() => fileRef.current?.click()}>{t.chooseFile}</Button>}
        {p && (
          <div className="space-y-3">
            <p className="font-bold">{t.restorePreview.replace('{date}', p.exportedAt ? formatDayLong(localDay(new Date(p.exportedAt))) : '?').replace('{jours}', String(p.days)).replace('{crises}', String(p.attacks)).replace('{traitements}', String(p.medications))}</p>
            <Button onClick={() => restore('fusion')} disabled={!!busy}>{t.merge}</Button>
            <p className="text-sm text-muted -mt-1">{t.mergeHelp}</p>
            {confirmReplace
              ? <Button variant="secondary" onClick={() => restore('remplacement')} disabled={!!busy}>{t.replaceConfirm}</Button>
              : <Button variant="ghost" onClick={() => setConfirmReplace(true)}>{t.replace}</Button>}
            <p className="text-sm text-muted -mt-1">{t.replaceHelp}</p>
            <button type="button" onClick={() => { setPending(null); setConfirmReplace(false); }} className="w-full min-h-touch underline text-muted">{t.cancel}</button>
          </div>
        )}
        {msg.restore && <p role="status">{msg.restore}</p>}
      </Card>

      <Card className="space-y-3 border-ink/30">
        <h2 className="font-extrabold">{t.wipeTitle}</h2>
        <p className="text-[15px] text-muted">{t.wipeBody}</p>
        {wipeStep === 0 && <Button variant="ghost" onClick={() => setWipeStep(1)}>{t.wipe}</Button>}
        {wipeStep === 1 && (
          <>
            <p className="font-bold">{t.wipeConfirm1}</p>
            <Button variant="ghost" onClick={wipe} className="border-ink">{t.wipeConfirm2}</Button>
            <button type="button" onClick={() => setWipeStep(0)} className="w-full min-h-touch underline text-muted">{t.cancel}</button>
          </>
        )}
      </Card>
    </main>
  );
}
