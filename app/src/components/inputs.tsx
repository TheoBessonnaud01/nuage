import type { ReactNode } from 'react';

/** Puce à toucher (choix simple ou multiple). */
export function Chip({
  selected, onClick, children, emoji, className = '',
}: { selected: boolean; onClick: () => void; children: ReactNode; emoji?: string; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-touch rounded-2xl border-2 px-4 py-2 text-left font-bold flex items-center gap-2 transition
        ${selected ? 'border-sauge-fort bg-sauge/30' : 'border-line bg-surface'} ${className}`}
    >
      {emoji && <span aria-hidden className="text-xl">{emoji}</span>}
      <span>{children}</span>
    </button>
  );
}

/** Échelle 1–5 en émojis. */
export function EmojiScale<V extends number>({
  value, onChange, options, label,
}: { value?: V; onChange: (v: V) => void; options: { value: V; emoji: string; label: string }[]; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-5 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          aria-label={o.label}
          onClick={() => onChange(o.value)}
          className={`min-h-[64px] rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition
            ${value === o.value ? 'border-sauge-fort bg-sauge/30 scale-105' : 'border-line bg-surface'}`}
        >
          <span className="text-2xl" aria-hidden>{o.emoji}</span>
          <span className="text-[11px] font-bold leading-tight text-muted">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Sélecteur d'heures (0–12, pas de 0,5) avec gros boutons. */
export function HoursPicker({
  value, defaultValue = 7, onChange, format, lessLabel, moreLabel,
}: { value?: number; defaultValue?: number; onChange: (v: number) => void; format: (h: number) => string; lessLabel: string; moreLabel: string }) {
  const v = value ?? defaultValue;
  const set = (x: number) => onChange(Math.min(12, Math.max(0, Math.round(x * 2) / 2)));
  return (
    <div className="flex items-center gap-3">
      <button type="button" aria-label={lessLabel} onClick={() => set(v - 0.5)} className="min-h-touch min-w-touch rounded-full border-2 border-line text-2xl font-bold">−</button>
      <div className="flex-1 text-center">
        <div className={`text-3xl font-extrabold ${value === undefined ? 'text-muted' : ''}`}>{format(v)}</div>
        <input
          type="range" min={0} max={12} step={0.5} value={v}
          onChange={(e) => set(Number(e.target.value))}
          aria-label={format(v)}
          className="w-full accent-[rgb(var(--sauge-fort))] mt-2"
        />
      </div>
      <button type="button" aria-label={moreLabel} onClick={() => set(v + 0.5)} className="min-h-touch min-w-touch rounded-full border-2 border-line text-2xl font-bold">+</button>
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}
      className="h-2 rounded-full bg-line overflow-hidden">
      <div className="h-full bg-sauge-fort rounded-full transition-all duration-300" style={{ width: `${value * 100}%` }} />
    </div>
  );
}
