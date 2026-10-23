import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../../config';
import { copy, withName } from '../../content/copy';
import { ActionBar, Button, Card } from '../../components/ui';
import { updateSettings } from '../../db/db';
import { canPromptInstall, detectPlatform, isStandalone, onInstallAvailable, promptInstall } from '../../lib/install';
import { Mascot } from '../../mascot/Mascot';
import type { Mood } from '../../mascot/moods';
import { SpeechBubble } from '../../mascot/SpeechBubble';
import { useSettings } from '../../lib/useSettings';

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

  return (
    <main className="mx-auto max-w-md px-4 pt-6 !pb-0 screen-h flex flex-col">
      <p className="text-sm text-muted font-bold" aria-live="polite">{t.step.replace('{n}', String(step + 1))}</p>
      <div className="flex items-start gap-2 mt-4">
        <Mascot mood={moodsByStep[step]} size="md" />
        <SpeechBubble key={step} className="mt-4 flex-1 text-lg">{bubble}</SpeechBubble>
      </div>

      <Card className="mt-6 mb-6 space-y-4 text-[17px]">
        {step === 0 && (
          <p>{t.s1Body.replace('{mascotte}', config.mascotName).replace('{app}', config.appName)}</p>
        )}
        {step === 1 && (
          <ul className="space-y-4">
            {t.s2Items.map((i) => (
              <li key={i.title} className="flex gap-3">
                <span className="text-2xl" aria-hidden>{i.icon}</span>
                <span><strong>{i.title}</strong><br /><span className="text-muted">{i.body}</span></span>
              </li>
            ))}
          </ul>
        )}
        {step === 2 && <p>{t.s3Body}</p>}
        {step === 3 && (
          <>
            <InstallStep />
            <p className="text-muted text-[15px]">{t.s4Reminders}</p>
          </>
        )}
      </Card>

      <ActionBar className="space-y-2">
        {step < 3
          ? <Button onClick={() => setStep(step + 1)}>{t.next}</Button>
          : <Button onClick={finish}>{t.start}</Button>}
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>{copy.common.back}</Button>
        )}
      </ActionBar>
    </main>
  );
}
