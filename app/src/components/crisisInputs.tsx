import { useState, type KeyboardEvent } from 'react';
import { copy } from '../content/copy';
import type { ListItem } from '../content/factors';
import { Chip } from './inputs';

const t = copy.crisis;

/** Liste de puces à choix multiple. */
export function ChipList({ items, selected, onChange }: { items: ListItem[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <Chip key={i.id} selected={selected.includes(i.id)} onClick={() => toggle(i.id)}>{i.label}</Chip>
      ))}
    </div>
  );
}

/** Teinte de chaque niveau : menthe (léger) → pêche → lilas profond (fort). Jamais de rouge. */
const levelColor = ['#C6F3DF', '#C9F0D2', '#DDEEC4', '#F2EBB8', '#FFE2AE', '#FFD3A8', '#FFC2B0', '#F2B4CF', '#D9B2F0', '#BBA3F2', '#A08CF0'];

/** Intensité 0–10 : grand chiffre + pastilles colorées. */
export function IntensityPicker({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  const label = value === undefined ? '' : value < 4 ? t.intensityLabels[0] : value < 7 ? t.intensityLabels[1] : t.intensityLabels[2];
  return (
    <div className="space-y-4">
      <div className="text-center min-h-[84px]" aria-live="polite">
        <p className="font-display text-[56px] leading-none font-semibold tabular-nums">{value ?? '–'}<span className="text-[24px] text-c-muted">/10</span></p>
        <p className="mt-1 text-[16px] font-bold text-c-muted">{label}</p>
      </div>
      <div role="radiogroup" aria-label={t.intensityTitle} className="grid grid-cols-6 gap-2">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} sur 10`}
            onClick={() => onChange(n)}
            className={`press intensity-dot min-h-[50px] rounded-2xl text-[18px] font-bold text-[#211B2E] transition ${value === n ? 'ring-[3px] ring-c-primary scale-105 shadow-float' : 'shadow-soft'}`}
            style={{ backgroundColor: levelColor[n] }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Heure de début / de prise : raccourcis + saisie libre. Renvoie un ISO. */
export function WhenPicker({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const now = new Date();
  const ago = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
  const morning = new Date(now); morning.setHours(8, 0, 0, 0);
  const options = [
    { label: t.whenNow, iso: now.toISOString() },
    { label: t.when1h, iso: ago(1) },
    { label: t.when2h, iso: ago(2) },
    ...(now.getHours() >= 10 ? [{ label: t.whenMorning, iso: morning.toISOString() }] : []),
  ];
  const [picked, setPicked] = useState<string | null>(t.whenNow);
  // datetime-local attend l'heure locale « YYYY-MM-DDTHH:mm »
  const local = (iso: string) => {
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <Chip key={o.label} selected={picked === o.label} onClick={() => { setPicked(o.label); onChange(o.iso); }}>{o.label}</Chip>
        ))}
      </div>
      <label className="block">
        <span className="font-bold text-c-muted">{t.whenOther}</span>
        <input
          type="datetime-local"
          value={local(value)}
          max={local(now.toISOString())}
          onChange={(e) => { if (e.target.value) { setPicked(null); onChange(new Date(e.target.value).toISOString()); } }}
          className="mt-1 w-full min-h-[48px] rounded-2xl bg-c-surface shadow-soft px-4 text-[16px] text-c-ink"
        />
      </label>
    </div>
  );
}

/** Schéma de tête cliquable, de face et de profil. Vue de face : la gauche de Noémie est à droite de l'écran. */
export function HeadMap({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const zone = (id: string, label: string) => ({
    role: 'checkbox' as const,
    'aria-checked': selected.includes(id),
    'aria-label': label,
    tabIndex: 0,
    onClick: () => toggle(id),
    onKeyDown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(id); } },
    className: 'cursor-pointer outline-none',
    style: { fill: selected.includes(id) ? 'rgb(var(--g-lilac-2))' : 'rgb(var(--c-line) / 0.55)', stroke: 'rgb(var(--c-muted))', strokeWidth: 1.5 },
  });
  const outline = { fill: 'none', stroke: 'rgb(var(--c-muted))', strokeWidth: 2.5 };
  const feature = { fill: 'none', stroke: 'rgb(var(--c-muted))', strokeWidth: 2, strokeLinecap: 'round' as const };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <figure className="text-center">
          <svg viewBox="0 0 160 200" className="w-full max-w-[170px] mx-auto">
            <defs><clipPath id="face"><ellipse cx="80" cy="96" rx="58" ry="74" /></clipPath></defs>
            <ellipse cx="80" cy="96" rx="58" ry="74" fill="rgb(var(--c-surface))" />
            <g clipPath="url(#face)">
              <rect x="0" y="10" width="160" height="52" {...zone('front', 'Front')} />
              <ellipse cx="25" cy="86" rx="16" ry="22" {...zone('tempe-droite', 'Tempe droite')} />
              <ellipse cx="135" cy="86" rx="16" ry="22" {...zone('tempe-gauche', 'Tempe gauche')} />
            </g>
            <g {...zone('yeux', 'Derrière les yeux')}>
              <ellipse cx="58" cy="90" rx="17" ry="12" />
              <ellipse cx="102" cy="90" rx="17" ry="12" />
            </g>
            <ellipse cx="80" cy="96" rx="58" ry="74" {...outline} pointerEvents="none" />
            <g pointerEvents="none">
              <circle cx="58" cy="90" r="3.5" fill="rgb(var(--c-muted))" /><circle cx="102" cy="90" r="3.5" fill="rgb(var(--c-muted))" />
              <path d="M80 100 L74 122 L84 122" {...feature} /><path d="M66 140 Q80 148 94 140" {...feature} />
            </g>
          </svg>
          <figcaption className="flex justify-between text-xs text-c-muted font-bold px-2">
            <span>{t.locationLeftHint}</span><span>{t.locationFace}</span><span>{t.locationRightHint}</span>
          </figcaption>
        </figure>
        <figure className="text-center">
          <svg viewBox="0 0 160 200" className="w-full max-w-[170px] mx-auto">
            <defs><clipPath id="skull"><path d="M40 60 Q40 18 92 18 Q140 18 142 70 Q144 112 124 130 L118 176 L76 176 L72 150 Q52 148 46 128 L36 120 L42 108 Q36 90 40 60Z" /></clipPath></defs>
            <path d="M40 60 Q40 18 92 18 Q140 18 142 70 Q144 112 124 130 L118 176 L76 176 L72 150 Q52 148 46 128 L36 120 L42 108 Q36 90 40 60Z" fill="rgb(var(--c-surface))" />
            <g clipPath="url(#skull)">
              <rect x="108" y="10" width="60" height="112" {...zone('arriere', 'Arrière de la tête')} />
              <rect x="96" y="124" width="60" height="60" {...zone('nuque', 'Nuque')} />
            </g>
            <path d="M40 60 Q40 18 92 18 Q140 18 142 70 Q144 112 124 130 L118 176 L76 176 L72 150 Q52 148 46 128 L36 120 L42 108 Q36 90 40 60Z" {...outline} pointerEvents="none" />
            <g pointerEvents="none">
              <circle cx="56" cy="78" r="3.5" fill="rgb(var(--c-muted))" />
              <path d="M92 84 Q102 80 104 92 Q104 104 94 104" {...feature} />
            </g>
          </svg>
          <figcaption className="text-xs text-c-muted font-bold">{t.locationProfile}</figcaption>
        </figure>
      </div>
      <div className="flex flex-wrap gap-2">
        {[['gauche', 'Côté gauche'], ['droite', 'Côté droit'], ['toute', 'Toute la tête']].map(([id, label]) => (
          <Chip key={id} selected={selected.includes(id)} onClick={() => toggle(id)}>{label}</Chip>
        ))}
      </div>
    </div>
  );
}
