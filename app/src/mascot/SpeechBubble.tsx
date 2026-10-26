import { useState, type ReactNode } from 'react';

/** Bulle de Pépite (verre dépoli). `pointer` = côté où se trouve Pépite. Un tap la ferme. */
export function SpeechBubble({
  children, pointer = 'left', onClose, className = '',
}: { children: ReactNode; pointer?: 'left' | 'top'; onClose?: () => void; className?: string }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const close = () => { setOpen(false); onClose?.(); };
  return (
    <button
      type="button"
      onClick={close}
      aria-live="polite"
      title="Toucher pour fermer"
      className={`bubble-in relative text-left glass shadow-soft px-4 py-3 text-[15.5px] leading-snug font-semibold text-c-ink
        ${pointer === 'left' ? 'rounded-[22px] rounded-bl-md' : 'rounded-[22px] rounded-tl-md'} ${className}`}
    >
      {children}
    </button>
  );
}
