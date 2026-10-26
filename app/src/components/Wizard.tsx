import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { copy } from '../content/copy';
import { ProgressBar } from './inputs';
import { ActionBar, BackButton, Button } from './ui';
import { Icon } from '../ui/Icon';

export interface WizardStep {
  key: string;
  title: string;
  help?: string;
  /** `next` permet de passer automatiquement à la suite après un choix unique. */
  render: (next: () => void) => ReactNode;
}

/** Suite d'écrans « une question à la fois », tout est facultatif. */
export function Wizard({
  label, steps, onFinish, finishLabel, top,
}: { label: string; steps: WizardStep[]; onFinish: () => void | Promise<void>; finishLabel: string; top?: ReactNode }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const step = steps[index];
  const last = index === steps.length - 1;
  const next = () => (last ? onFinish() : setIndex((i) => Math.min(i + 1, steps.length - 1)));
  const back = () => (index > 0 ? setIndex(index - 1) : navigate(-1));

  return (
    <main className="mx-auto max-w-md px-4 pt-4 !pb-0 screen-h flex flex-col">
      <header className="flex items-center gap-3">
        <BackButton onClick={back} label={copy.common.back} />
        <div className="flex-1 space-y-1.5">
          <p className="text-[13px] font-bold text-c-muted">{label}</p>
          <ProgressBar value={(index + 1) / steps.length} label={`${index + 1} / ${steps.length}`} />
        </div>
        <span className="text-[13px] font-bold text-c-muted tabular-nums">{index + 1}/{steps.length}</span>
      </header>
      {index === 0 && top}
      <section key={step.key} className="mt-4 pb-6 space-y-4" aria-live="polite">
        <h1 className="font-display text-[28px] leading-tight font-semibold">{step.title}</h1>
        {step.help && <p className="text-c-muted">{step.help}</p>}
        {step.render(next)}
      </section>
      <ActionBar className={last ? '' : 'grid grid-cols-2 gap-3'}>
        {last ? (
          <Button onClick={next}>{finishLabel}</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={next}>{copy.common.skip}</Button>
            <Button onClick={next}>{copy.common.next}<Icon name="arrow-right" size={19} /></Button>
          </>
        )}
      </ActionBar>
    </main>
  );
}
