import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { copy } from '../../content/copy';
import { updateSettings } from '../../db/db';
import type { Settings } from '../../db/types';
import { disablePush, enablePush, pushState, sendTestPush, updatePush, type PushState } from '../../lib/push';

const t = copy.settings;

export function NotificationSettings({ settings }: { settings: Settings }) {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  useEffect(() => { pushState().then(setState); }, [settings.pushSubscribed]);
  if (!state) return null;

  const on = state === 'on';
  const setTime = (reminderTime: string) => {
    if (!/^\d{2}:\d{2}$/.test(reminderTime)) return;
    updateSettings({ reminderTime });
    updatePush({ reminderTime });
  };
  const toggleDay = (d: number) => {
    const silentDays = settings.silentDays.includes(d) ? settings.silentDays.filter((x) => x !== d) : [...settings.silentDays, d].sort();
    updateSettings({ silentDays });
    updatePush({ silentDays });
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-extrabold">{t.notifTitle}</h2>
        <span className={`text-sm font-bold ${on ? 'text-sauge-fort' : 'text-muted'}`}>{on ? t.notifOn : t.notifOff}</span>
      </div>
      <p className="text-muted text-[15px]">{t.notifHelp}</p>
      {t.notifStates[state] && <p className="font-bold">{t.notifStates[state]}</p>}

      {(state === 'off' || state === 'on') && (
        on ? (
          <Button variant="ghost" disabled={busy} onClick={async () => { setBusy(true); await disablePush(); setBusy(false); setState(await pushState()); }}>
            {t.notifDisable}
          </Button>
        ) : (
          <Button disabled={busy} onClick={async () => { setBusy(true); setState(await enablePush()); setBusy(false); }}>
            {t.notifEnable}
          </Button>
        )
      )}

      <label className="block">
        <span className="font-bold">{t.notifTime}</span>
        <input
          type="time" value={settings.reminderTime} onChange={(e) => setTime(e.target.value)}
          className="mt-1 w-full min-h-touch rounded-xl border-2 border-line bg-surface px-3 text-[16px]"
        />
      </label>

      <div>
        <p className="font-bold mb-2">{t.notifSilent}</p>
        <div className="grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <button
              key={d} type="button" aria-pressed={settings.silentDays.includes(d)} aria-label={t.weekdaysLong[d]}
              onClick={() => toggleDay(d)}
              className={`min-h-touch rounded-xl border-2 font-bold ${settings.silentDays.includes(d) ? 'border-sauge-fort bg-sauge/30' : 'border-line'}`}
            >
              {t.weekdaysShort[d]}
            </button>
          ))}
        </div>
      </div>

      {on && (
        <>
          <Button variant="secondary" disabled={busy} onClick={async () => { setBusy(true); setTestMsg((await sendTestPush()) ? t.notifTestOk : t.notifTestKo); setBusy(false); }}>
            {t.notifTest}
          </Button>
          {testMsg && <p role="status" className="text-[15px]">{testMsg}</p>}
        </>
      )}

      <Link to="/rappels" className="block font-bold underline text-sauge-fort min-h-touch pt-2">{t.notifFallback}</Link>
    </Card>
  );
}
