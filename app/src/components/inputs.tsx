import type { ReactNode } from 'react';
import { Face } from '../ui/Garden';
import { Icon } from '../ui/Icon';

/** Choix à toucher (simple ou multiple). Pas d'émoji : un rendu identique sur iPhone et Android. */
export function Chip({
  selected, onClick, children, className = '',
}: { selected: boolean; onClick: () => void; children: ReactNode; emoji?: string; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`press min-h-[48px] rounded-2xl px-4 py-2.5 text-left text-[15px] font-semibold flex items-center gap-2.5 transition
        ${selected ? 'bg-c-primary text-c-on-primary shadow-float' : 'bg-c-surface text-c-ink shadow-soft'} ${className}`}
    >
      <span className="flex-1">{children}</span>
      {selected && <Icon name="check" size={17} strokeWidth={2.6} className="shrink-0" />}
    </button>
  );
}

/** Échelle 1–5 en visages dessinés. `invert` : 1 = le mieux (ex. stress « zen »). */
export function EmojiScale<V extends number>({
  value, onChange, options, label, invert = false,
}: { value?: V; onChange: (v: V) => void; options: { value: V; emoji?: string; label: string }[]; label?: string; invert?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-5 gap-1.5">
      {options.map((o) => {
        const level = (invert ? 6 - o.value : o.value) as 1 | 2 | 3 | 4 | 5;
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.label}
            onClick={() => onChange(o.value)}
            className={`press min-h-[78px] rounded-2xl flex flex-col items-center justify-center gap-1 transition
              ${on ? 'bg-c-surface shadow-float ring-2 ring-c-accent' : 'bg-c-surface/60'}`}
          >
            <span className={on ? 'scale-110 transition' : 'transition'}><Face level={level} size={40} /></span>
            <span className="text-[11px] font-bold leading-tight text-c-muted">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Sélecteur d'heures (0–12, pas de 0,5) avec gros boutons. */
export function HoursPicker({
  value, defaultValue = 7, onChange, format, lessLabel, moreLabel,
}: { value?: number; defaultValue?: number; onChange: (v: number) => void; format: (h: number) => string; lessLabel: string; moreLabel: string }) {
  const v = value ?? defaultValue;
  const set = (x: number) => onChange(Math.min(12, Math.max(0, Math.round(x * 2) / 2)));
  const round = 'press grid place-items-center w-12 h-12 rounded-full bg-c-surface shadow-soft text-c-ink shrink-0';
  return (
    <div className="rounded-[26px] bg-c-surface/60 p-4">
      <div className="flex items-center gap-3">
        <button type="button" aria-label={lessLabel} onClick={() => set(v - 0.5)} className={round}><Icon name="minus" /></button>
        <div className={`flex-1 text-center font-display text-[44px] leading-none font-semibold tabular-nums ${value === undefined ? 'text-c-muted' : 'text-c-ink'}`}>{format(v)}</div>
        <button type="button" aria-label={moreLabel} onClick={() => set(v + 0.5)} className={round}><Icon name="plus" /></button>
      </div>
      <input
        type="range" min={0} max={12} step={0.5} value={v}
        onChange={(e) => set(Number(e.target.value))}
        aria-label={format(v)}
        className="w-full accent-[rgb(var(--c-accent))] mt-4"
      />
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}
      className="h-2 rounded-full bg-c-ink/10 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-300 grad-hero" style={{ width: `${value * 100}%` }} />
    </div>
  );
}
