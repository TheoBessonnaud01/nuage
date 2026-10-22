import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Card({
  children, className = '', tone = 'bg-surface',
}: { children: ReactNode; className?: string; tone?: string }) {
  return <div className={`rounded-card border border-line p-5 shadow-sm ${tone} ${className}`}>{children}</div>;
}

type Variant = 'primary' | 'secondary' | 'ghost';
const variants: Record<Variant, string> = {
  primary: 'bg-sauge-fort text-surface',
  secondary: 'bg-lavande/60 text-ink',
  ghost: 'bg-transparent text-ink border border-line',
};

export function Button({
  variant = 'primary', className = '', ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`min-h-touch w-full rounded-2xl px-5 py-3 text-lg font-bold active:scale-[0.98] transition ${variants[variant]} ${className}`}
    />
  );
}

export function PageHeader({ title, backTo = '/' }: { title: string; backTo?: string }) {
  return (
    <header className="flex items-center gap-2 mb-4">
      <Link to={backTo} aria-label="Retour" className="min-h-touch min-w-touch grid place-items-center rounded-full text-2xl">
        ‹
      </Link>
      <h1 className="text-2xl font-extrabold">{title}</h1>
    </header>
  );
}
