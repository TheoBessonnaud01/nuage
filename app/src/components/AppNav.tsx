import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { copy } from '../content/copy';
import { useActiveAttack } from '../lib/useAttack';
import { Icon, type IconName } from '../ui/Icon';

const t = copy.nav;

/** Onglets principaux. Un onglet est actif pour ses sous-pages (ex. /mois/2026-09 → Évolution). */
const tabs: { to: string; label: string; icon: IconName; match: RegExp }[] = [
  { to: '/', label: t.home, icon: 'home', match: /^\/(objectifs|reglages.*|rappels)?$/ },
  { to: '/calendrier', label: t.journal, icon: 'calendar', match: /^\/(calendrier|jour\/.*)$/ },
  { to: '/analyses', label: t.evolution, icon: 'chart', match: /^\/(analyses|mois.*)$/ },
  { to: '/comprendre', label: t.learn, icon: 'book', match: /^\/comprendre.*$/ },
];

/** Écrans où la barre est masquée : parcours guidés, présentation, mode crise. */
export const hideNavOn = (path: string) => /^\/(checkin|crise|bienvenue|palier|urgence|mascot-preview)/.test(path);

interface Action { to: string; title: string; hint: string; icon: IconName; tone: string }

function ActionSheet({ onClose }: { onClose: () => void }) {
  const active = useActiveAttack();
  const navigate = useNavigate();
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    first.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const status = active?.attack.status;
  const actions: Action[] = status === 'en cours'
    ? [
      { to: '/crise/suivi', title: t.aLog, hint: t.aLogHint, icon: 'edit', tone: 'grad-lilac' },
      { to: '/crise/traitement', title: t.aMed, hint: t.aMedHint, icon: 'pill', tone: 'grad-sky' },
      { to: '/crise/fin', title: t.aEnd, hint: t.aEndHint, icon: 'sun', tone: 'grad-sun' },
    ]
    : status === 'post-crise'
      ? [
        { to: '/crise/post', title: t.aPost, hint: t.aPostHint, icon: 'heart', tone: 'grad-sky' },
        { to: '/checkin', title: t.aCheckin, hint: t.aCheckinHint, icon: 'sparkle', tone: 'grad-peach' },
        { to: '/crise/traitement', title: t.aMed, hint: t.aMedHint, icon: 'pill', tone: 'grad-lilac' },
      ]
      : [
        { to: '/checkin', title: t.aCheckin, hint: t.aCheckinHint, icon: 'sparkle', tone: 'grad-peach' },
        { to: '/crise/debut', title: t.aCrisis, hint: t.aCrisisHint, icon: 'rain', tone: 'grad-lilac' },
        { to: '/crise/traitement', title: t.aMed, hint: t.aMedHint, icon: 'pill', tone: 'grad-sky' },
        { to: '/calendrier', title: t.aLate, hint: t.aLateHint, icon: 'calendar', tone: 'grad-mint' },
      ];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t.sheetTitle}>
      <button type="button" aria-label={copy.common.close} onClick={onClose} className="absolute inset-0 bg-[#15121E]/40 backdrop-blur-[2px] sheet-fade" />
      <div className="absolute left-0 right-0 bottom-0 mx-auto max-w-md sheet-up">
        <div className="m-3 rounded-[32px] bg-c-surface shadow-float p-4 space-y-2" style={{ marginBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-c-ink/15" aria-hidden />
          <p className="font-display text-[22px] font-semibold px-2 pb-1">{t.sheetTitle}</p>
          {actions.map((a, i) => (
            <button key={a.to + a.title} ref={i === 0 ? first : undefined} type="button"
              onClick={() => { onClose(); navigate(a.to); }}
              className="press w-full flex items-center gap-4 rounded-[22px] p-3 text-left hover:bg-c-surface-2 focus-visible:bg-c-surface-2">
              <span className={`grid place-items-center w-12 h-12 rounded-2xl text-c-on-grad ${a.tone}`}><Icon name={a.icon} /></span>
              <span className="flex-1">
                <span className="block font-bold text-[16px]">{a.title}</span>
                <span className="block text-[13.5px] text-c-muted">{a.hint}</span>
              </span>
              <Icon name="chevron-right" className="text-c-muted" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Barre de navigation flottante + bouton central « + ». */
export function AppNav() {
  const { pathname } = useLocation();
  const [sheet, setSheet] = useState(false);
  const hidden = hideNavOn(pathname);
  useEffect(() => { setSheet(false); }, [pathname]);
  // Réserve la place de la barre en bas des pages (voir « main » dans index.css)
  useEffect(() => {
    document.documentElement.style.setProperty('--nav-space', hidden ? '0px' : '84px');
  }, [hidden]);
  if (hidden) return null;
  const tab = (x: typeof tabs[number]) => {
    const on = x.match.test(pathname);
    return (
      <Link key={x.to} to={x.to} aria-current={on ? 'page' : undefined}
        className={`press flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] rounded-full text-[11px] font-bold ${on ? 'text-c-ink' : 'text-c-muted'}`}>
        <span className={`grid place-items-center w-11 h-8 rounded-full transition ${on ? 'bg-c-accent-soft' : ''}`}><Icon name={x.icon} size={22} /></span>
        {x.label}
      </Link>
    );
  };
  return (
    <>
      <div className="fixed z-40 left-0 right-0 bottom-0 pointer-events-none" style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}>
        <nav aria-label={t.label} className="pointer-events-auto mx-auto max-w-md px-3">
          <div className="glass shadow-float rounded-[32px] flex items-center gap-1 px-2 py-1.5">
            {tabs.slice(0, 2).map(tab)}
            <button type="button" onClick={() => setSheet(true)} aria-label={t.add} aria-haspopup="dialog"
              className="press grid place-items-center w-14 h-14 -my-4 rounded-full grad-hero text-[#211B2E] shadow-float ring-4 ring-c-bg">
              <Icon name="plus" size={28} strokeWidth={2.4} />
            </button>
            {tabs.slice(2).map(tab)}
          </div>
        </nav>
      </div>
      {sheet && <ActionSheet onClose={() => setSheet(false)} />}
    </>
  );
}
