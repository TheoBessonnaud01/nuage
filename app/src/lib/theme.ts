import type { Settings } from '../db/types';

/** Applique le thème choisi (ou celui du système) et le mode crise sur <html>. */
export function applyTheme(theme: Settings['theme'], crisis: boolean) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'sombre' || (theme === 'auto' && prefersDark);
  root.dataset.theme = dark ? 'sombre' : 'clair';
  root.dataset.crisis = crisis ? 'on' : 'off';
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', crisis ? '#18191C' : dark ? '#1E2124' : '#8FA98F');
}
