// Composants du système visuel v2. Tous basés sur les jetons --c-* (design.css).
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

export type Tone = 'plain' | 'soft' | 'glass' | 'hero' | 'peach' | 'lilac' | 'mint' | 'sky' | 'sun' | 'night';

const toneClass: Record<Tone, string> = {
  plain: 'bg-c-surface shadow-soft',
  soft: 'bg-c-surface-2',
  glass: 'glass shadow-soft',
  hero: 'grad-hero shadow-float',
  peach: 'grad-peach',
  lilac: 'grad-lilac',
  mint: 'grad-mint',
  sky: 'grad-sky',
  sun: 'grad-sun',
  night: 'grad-night text-white',
};

/** Carte arrondie. */
export function Panel({ tone = 'plain', className = '', children, as: As = 'div' }: { tone?: Tone; className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' }) {
  return <As className={`relative overflow-hidden rounded-[28px] p-5 ${toneClass[tone]} ${className}`}>{children}</As>;
}

type BtnVariant = 'primary' | 'soft' | 'ghost' | 'light';
const btnClass: Record<BtnVariant, string> = {
  primary: 'bg-c-primary text-c-on-primary shadow-float',
  soft: 'bg-c-surface-2 text-c-ink',
  ghost: 'bg-transparent text-c-ink ring-1 ring-inset ring-c-line',
  light: 'bg-white/80 text-[#211B2E] shadow-soft',
};

/** Bouton pilule. */
export function Btn({ variant = 'primary', icon, iconRight, size = 'lg', className = '', children, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; icon?: IconName; iconRight?: IconName; size?: 'md' | 'lg' }) {
  return (
    <button {...rest} className={`press inline-flex items-center justify-center gap-2 rounded-full font-text font-bold disabled:opacity-40
      ${size === 'lg' ? 'min-h-[52px] px-6 text-[16px]' : 'min-h-[44px] px-4 text-[15px]'} ${btnClass[variant]} ${className}`}>
      {icon && <Icon name={icon} size={20} />}{children}{iconRight && <Icon name={iconRight} size={20} />}
    </button>
  );
}

/** Bouton rond (icône seule). */
export function IconBtn({ icon, label, onClick, to, className = '' }: { icon: IconName; label: string; onClick?: () => void; to?: string; className?: string }) {
  const cls = `press grid place-items-center w-11 h-11 rounded-full glass text-c-ink shadow-soft ${className}`;
  return to
    ? <Link to={to} aria-label={label} className={cls}><Icon name={icon} /></Link>
    : <button type="button" aria-label={label} onClick={onClick} className={cls}><Icon name={icon} /></button>;
}

/** Choix sélectionnable (remplace les puces à émojis). */
export function Choice({ selected, onClick, children, hint, leading }: { selected: boolean; onClick: () => void; children: ReactNode; hint?: string; leading?: ReactNode }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick}
      className={`press w-full min-h-[52px] flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-text font-semibold text-[15px] transition
        ${selected ? 'bg-c-primary text-c-on-primary shadow-float' : 'bg-c-surface text-c-ink shadow-soft'}`}>
      {leading}
      <span className="flex-1">{children}{hint && <span className={`block text-[13px] font-medium ${selected ? 'opacity-80' : 'text-c-muted'}`}>{hint}</span>}</span>
      <span className={`grid place-items-center w-6 h-6 rounded-full ${selected ? 'bg-c-on-primary text-c-primary' : 'ring-2 ring-inset ring-c-line'}`}>
        {selected && <Icon name="check" size={15} strokeWidth={2.6} />}
      </span>
    </button>
  );
}

/** Étiquette (choix multiple compact). */
export function Tag({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick}
      className={`press min-h-[44px] rounded-full px-4 font-text font-semibold text-[14.5px] transition
        ${selected ? 'bg-c-primary text-c-on-primary shadow-float' : 'bg-c-surface text-c-ink shadow-soft'}`}>
      {children}
    </button>
  );
}

export function SectionHeader({ title, action, to }: { title: string; action?: string; to?: string }) {
  return (
    <div className="flex items-end justify-between px-1 mb-3">
      <h2 className="font-display text-[22px] font-semibold text-c-ink">{title}</h2>
      {action && to && <Link to={to} className="font-text text-[14px] font-semibold text-c-accent min-h-[44px] grid place-items-center">{action}</Link>}
    </div>
  );
}

/** Bulle de Pépite (verre dépoli). */
export function Bubble({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative glass shadow-soft rounded-[22px] rounded-bl-md px-4 py-3 font-text text-[15px] font-medium text-c-ink ${className}`}>
      {children}
    </div>
  );
}

/** Anneau de progression (objectif de la semaine…). */
export function Ring({ value, size = 56, stroke = 6, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-ink) / .1)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-accent))" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export interface NavItem { to: string; label: string; icon: IconName }

/** Barre de navigation flottante, avec action centrale. Pensée pour le pouce (iPhone et Android). */
export function BottomNav({ items, active, onAction, actionLabel }: { items: NavItem[]; active: string; onAction: () => void; actionLabel: string }) {
  const half = Math.ceil(items.length / 2);
  const tab = (i: NavItem) => {
    const on = active === i.to;
    return (
      <Link key={i.to} to={i.to} aria-current={on ? 'page' : undefined}
        className={`press flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] rounded-full font-text text-[11px] font-semibold ${on ? 'text-c-ink' : 'text-c-muted'}`}>
        <span className={`grid place-items-center w-10 h-8 rounded-full ${on ? 'bg-c-accent-soft text-c-ink' : ''}`}><Icon name={i.icon} size={22} /></span>
        {i.label}
      </Link>
    );
  };
  return (
    <nav aria-label="Navigation" className="glass shadow-float rounded-[32px] flex items-center gap-1 px-2 py-1.5">
      {items.slice(0, half).map(tab)}
      <button type="button" onClick={onAction} aria-label={actionLabel}
        className="press grid place-items-center w-14 h-14 -my-3 rounded-full bg-c-primary text-c-on-primary shadow-float">
        <Icon name="plus" size={26} strokeWidth={2.2} />
      </button>
      {items.slice(half).map(tab)}
    </nav>
  );
}
