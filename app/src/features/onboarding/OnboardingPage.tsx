import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../../config';
import { copy, withName } from '../../content/copy';
import { ActionBar, Button } from '../../components/ui';
import { updateSettings } from '../../db/db';
import { canPromptInstall, detectPlatform, isStandalone, onInstallAvailable, promptInstall } from '../../lib/install';
import { Mascot } from '../../mascot/Mascot';
import type { Mood } from '../../mascot/moods';
import { SpeechBubble } from '../../mascot/SpeechBubble';
import { Icon, type IconName } from '../../ui/Icon';
import { useSettings } from '../../lib/useSettings';
import { enablePush, pushState, type PushState } from '../../lib/push';

const t = copy.onboarding;
const moodsByStep: Mood[] = ['coucou', 'pense', 'joyeux', 'fier'];

function InstallStep() {
  const platform = detectPlatform();
  const [canInstall, setCanInstall] = useState(canPromptInstall());
  useEffect(() => onInstallAvailable(() => setCanInstall(true)), []);

  if (isStandalone()) return <p>{t.s4Installed}</p>;
  if (platform === 'ios') {
    return (
      <ol className="list-decimal pl-5 space-y-2">
        {t.s4Ios.map((s) => <li key={s}>{s}</li>)}
      </ol>
    );
  }
  if (platform === 'android') {
    return canInstall
      ? <Button onClick={() => promptInstall().then((ok) => ok && setCanInstall(false))}>{t.s4AndroidButton}</Button>
      : <p>{t.s4AndroidManual}</p>;
  }
  return <p>{t.s4Other}</p>;
}

/** Activation des rappels : uniquement sur un geste, et sur iPhone seulement depuis l'écran d'accueil. */
function RemindersStep({ time }: { time: string }) {
  const [state, setState] = useState<PushState | null>(null);
  useEffect(() => { pushState().then(setState); }, []);
  if (!state || state === 'non-configure' || state === 'non-supporte' || state === 'refuse') return null;
  if (state === 'ios-installer') return <p className="text-c-muted text-[15px]">{t.s4RemindersIosLater}</p>;
  if (state === 'on') return <p className="font-bold">{t.s4RemindersOn}</p>;
  return (
    <div className="space-y-2">
      <p className="text-[15px]">{t.s4Reminders.replace('{heure}', time.replace(':', 'h'))}</p>
      <Button variant="secondary" onClick={async () => setState(await enablePush())}>{copy.settings.notifEnable}</Button>
    </div>
  );
}

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const settings = useSettings();
  const name = settings?.firstName ?? config.firstName;

  const finish = async () => {
    await updateSettings({ onboardingDone: true });
    navigate('/', { replace: true });
  };

  const bubble = [
    withName(t.s1Title, name),
    t.s2Title,
    t.s3Title,
    t.s4Title,
  ][step];

  const tones = ['grad-hero', 'grad-lilac', 'grad-mint', 'grad-peach'];
  return (
    <main className="mx-auto max-w-md px-4 pt-5 !pb-0 screen-h flex flex-col">
      <h1 className="sr-only">{config.appName}</h1>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5" role="img" aria-label={t.step.replace('{n}', String(step + 1))}>
          {[0, 1, 2, 3].map((i) => <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-7 bg-c-primary' : 'w-2 bg-c-ink/15'}`} />)}
        </div>
        <p className="text-[13px] text-c-muted font-bold" aria-live="polite">{t.step.replace('{n}', String(step + 1))}</p>
      </div>

      <div className={`relative mt-5 rounded-[32px] ${tones[step]} shadow-float overflow-hidden pt-6 pb-2 flex flex-col items-center`}>
        <SpeechBubble key={step} pointer="top" className="mx-5 self-stretch text-[17px] font-display">{bubble}</SpeechBubble>
        <Mascot mood={moodsByStep[step]} size={190} />
      </div>

      <div className="mt-5 mb-6 space-y-4 text-[16px]">
        {step === 0 && (
          <p className="font-display text-[22px] leading-snug font-medium">{t.s1Body.replace('{mascotte}', config.mascotName).replace('{app}', config.appName)}</p>
        )}
        {step === 1 && (
          <ul className="space-y-3">
            {t.s2Items.map((i) => (
              <li key={i.title} className="flex items-center gap-4 rounded-[22px] bg-c-surface shadow-soft p-4">
                <span className="grid place-items-center w-12 h-12 rounded-2xl grad-peach text-c-on-grad shrink-0"><Icon name={i.icon as IconName} /></span>
                <span><strong className="font-display text-[18px] font-semibold">{i.title}</strong><br /><span className="text-c-muted text-[14.5px]">{i.body}</span></span>
              </li>
            ))}
          </ul>
        )}
        {step === 2 && (
          <div className="flex gap-4 items-start rounded-[22px] bg-c-surface shadow-soft p-5">
            <span className="grid place-items-center w-12 h-12 rounded-2xl grad-mint text-c-on-grad shrink-0"><Icon name="lock" /></span>
            <p>{t.s3Body}</p>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4 rounded-[22px] bg-c-surface shadow-soft p-5">
            <InstallStep />
            <RemindersStep time={settings?.reminderTime ?? config.defaultReminderTime} />
          </div>
        )}
      </div>

      <ActionBar className="flex gap-3">
        {step > 0 && (
          <Button variant="ghost" className="!w-auto px-5" onClick={() => setStep(step - 1)} aria-label={copy.common.back}><Icon name="chevron-left" /></Button>
        )}
        {step < 3
          ? <Button onClick={() => setStep(step + 1)}>{t.next}<Icon name="arrow-right" size={19} /></Button>
          : <Button onClick={finish}>{t.start}</Button>}
      </ActionBar>
    </main>
  );
}
