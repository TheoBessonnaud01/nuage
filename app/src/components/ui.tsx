// Composants de base (système visuel v2 « Aube »). Réutilisés par tous les écrans.
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';

/** Carte arrondie. `tone` : 'bg-c-surface' (défaut) ou un dégradé (grad-mint, grad-lilac…). */
export function Card({
  children, className = '', tone = 'bg-c-surface',
}: { children: ReactNode; className?: string; tone?: string }) {
  const isGrad = tone.includes('grad-');
  return (
    <div className={`relative rounded-[26px] p-5 ${isGrad ? 'text-c-on-grad' : 'shadow-soft'} ${tone} ${className}`}>
      {children}
    </div>
  );
}

type Variant = 'primary' | 'secondary' | 'ghost';
const variants: Record<Variant, string> = {
  primary: 'bg-c-primary text-c-on-primary shadow-float',
  secondary: 'bg-c-surface text-c-ink shadow-soft',
  ghost: 'bg-transparent text-c-ink ring-1 ring-inset ring-c-line',
};

/** Bouton pilule pleine largeur. */
export function Button({
  variant = 'primary', className = '', ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`press min-h-[52px] w-full rounded-full px-6 py-3 text-[16px] font-bold inline-flex items-center justify-center gap-2 disabled:opacity-40 ${variants[variant]} ${className}`}
    />
  );
}

/** En-tête de page : bouton retour rond + grand titre. */
export function PageHeader({ title, backTo = '/', backLabel, right, noBack = false }: { title: string; backTo?: string; backLabel?: string; right?: ReactNode; noBack?: boolean }) {
  if (noBack) {
    return (
      <header className="mb-4 flex items-end justify-between gap-2 pt-1">
        <h1 className="font-display text-[32px] leading-[1.1] font-semibold text-c-ink">{title}</h1>
        {right}
      </header>
    );
  }
  return (
    <header className="mb-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Link
          to={backTo}
          aria-label={backLabel ?? 'Retour'}
          className={`press inline-flex items-center gap-1 h-11 rounded-full glass shadow-soft text-c-ink font-bold text-[14px] ${backLabel ? 'pl-2.5 pr-4' : 'w-11 justify-center'}`}
        >
          <Icon name="chevron-left" size={22} />{backLabel}
        </Link>
        {right}
      </div>
      <h1 className="font-display text-[30px] leading-[1.1] font-semibold text-c-ink">{title}</h1>
    </header>
  );
}

/** Bouton retour seul (écrans en plusieurs étapes). */
export function BackButton({ onClick, label = 'Retour' }: { onClick?: () => void; label?: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={onClick ?? (() => navigate(-1))} aria-label={label}
      className="press grid place-items-center w-11 h-11 rounded-full glass shadow-soft text-c-ink shrink-0">
      <Icon name="chevron-left" size={22} />
    </button>
  );
}

/** Barre de boutons toujours visible en bas de l'écran (même si la page est longue). */
export function ActionBar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`sticky bottom-0 -mx-4 mt-auto px-4 pt-3 glass rounded-t-[28px] shadow-float ${className}`}
      style={{ paddingBottom: 'calc(0.9rem + env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  );
}

/** Pastille d'icône (dans les cartes). */
export function IconTile({ name, className = '' }: { name: Parameters<typeof Icon>[0]['name']; className?: string }) {
  return <span className={`grid place-items-center w-11 h-11 rounded-2xl bg-c-surface/70 text-c-ink shrink-0 ${className}`}><Icon name={name} /></span>;
}

/** Sélecteur segmenté (périodes, onglets…). */
export function Segmented<V extends string | number>({ options, value, onChange, label }: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-full bg-c-surface shadow-soft p-1">
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={`press flex-1 min-h-[42px] rounded-full px-2 text-[14px] font-bold ${value === o.value ? 'bg-c-primary text-c-on-primary shadow-soft' : 'text-c-muted'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Écran d'attente doux (calculs en cours). */
export function Loading({ text }: { text: string }) {
  return (
    <div className="grid place-items-center py-16 text-center gap-3" role="status">
      <span className="w-10 h-10 rounded-full border-4 border-c-ink/10 border-t-c-accent animate-spin" aria-hidden />
      <p className="font-semibold text-c-muted">{text}</p>
    </div>
  );
}
