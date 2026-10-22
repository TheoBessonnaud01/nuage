import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource-variable/nunito';
import './index.css';
import { App } from './App';
import { getSettings, requestPersistence, updateSettings } from './db/db';

registerSW({ immediate: true });

// Premier lancement : réglages par défaut + demande de stockage persistant.
getSettings()
  .then(() => updateSettings({ lastOpenedAt: new Date().toISOString() }))
  .catch(() => undefined);
requestPersistence().catch(() => undefined);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
