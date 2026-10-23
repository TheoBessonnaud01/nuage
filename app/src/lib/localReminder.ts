import { copy } from '../content/copy';

/**
 * Relance « ça va mieux ? » 2 h après une prise, si l'app reste ouverte et que les notifications
 * sont autorisées. Sinon, la question apparaît simplement dans l'app (et via le Worker à l'étape 4).
 */
export function scheduleLocalFollowUp(delayMs = 2 * 3600000) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  window.setTimeout(async () => {
    const reg = await navigator.serviceWorker?.ready;
    reg?.showNotification('Nuage', { body: copy.crisis.followUpNotif, tag: 'relance-traitement', data: { url: '#/crise' } });
  }, delayMs);
}
