import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource-variable/nunito';
import './index.css';
import { App } from './App';
import { getSettings, requestPersistence, updateSettings } from './db/db';
import { captureInstallPrompt } from './lib/install';
import { session } from './lib/session';
import { syncPush } from './lib/push';

registerSW({ immediate: true });
captureInstallPrompt();

// Premier lancement : réglages par défaut + demande de stockage persistant.
getSettings()
  .then((s) => {
    session.previousOpenedAt = s.lastOpenedAt ?? null;
    return updateSettings({ lastOpenedAt: new Date().toISOString() });
  })
  .catch(() => undefined);
requestPersistence().catch(() => undefined);
syncPush().catch(() => undefined);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
