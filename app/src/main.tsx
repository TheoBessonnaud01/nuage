import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource-variable/nunito';
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/plus-jakarta-sans';
import './design.css';
import './index.css';
import { App } from './App';
import { getSettings, requestPersistence, updateSettings } from './db/db';
import { captureInstallPrompt } from './lib/install';
import { session } from './lib/session';
import { syncPush } from './lib/push';
import { ensureRecaps } from './lib/useInsights';

registerSW({ immediate: true });
captureInstallPrompt();

// Premier lancement : réglages par défaut + demande de stockage persistant.
async function demo() {
  // Développement uniquement : ?demo=1 remplace les données par un jeu de démonstration.
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('demo')) {
    const { seedDemo } = await import('./lib/demo');
    await seedDemo();
    await ensureRecaps(3);
    history.replaceState(null, '', location.pathname + location.hash);
  }
}

demo()
  .then(() => getSettings())
  .then((s) => {
    session.previousOpenedAt = s.lastOpenedAt ?? null;
    return updateSettings({ lastOpenedAt: new Date().toISOString() });
  })
  .catch(() => undefined);
requestPersistence().catch(() => undefined);
syncPush().catch(() => undefined);
// Récap du mois écoulé (le 1er du mois, ou à la première ouverture qui suit)
ensureRecaps().catch(() => undefined);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
