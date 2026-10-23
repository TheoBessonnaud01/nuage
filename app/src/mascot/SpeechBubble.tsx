import { useState, type ReactNode } from 'react';

/** Bulle de dialogue. `pointer` = côté où se trouve Pépite. Un tap la ferme. */
export function SpeechBubble({
  children, pointer = 'left', onClose, className = '',
}: { children: ReactNode; pointer?: 'left' | 'top'; onClose?: () => void; className?: string }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const close = () => { setOpen(false); onClose?.(); };

  const tail = pointer === 'left'
    ? 'before:left-[-9px] before:top-6 before:border-y-[9px] before:border-r-[10px] before:border-y-transparent before:border-r-surface'
    : 'before:top-[-9px] before:left-10 before:border-x-[9px] before:border-b-[10px] before:border-x-transparent before:border-b-surface';

  return (
    <button
      type="button"
      onClick={close}
      aria-live="polite"
      title="Toucher pour fermer"
      className={`bubble-in relative text-left rounded-2xl bg-surface border border-line px-4 py-3 text-[16px] leading-snug font-semibold shadow-sm
        before:absolute before:content-[''] before:w-0 before:h-0 ${tail} ${className}`}
    >
      {children}
    </button>
  );
}
