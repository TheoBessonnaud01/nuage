/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

// Cache de toute l'app → fonctionne hors ligne après la première visite.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

// --- Notifications (branchées à l'étape 4) ---
self.addEventListener('push', (event) => {
  const data = (() => {
    try { return event.data?.json() ?? {}; } catch { return { body: event.data?.text() }; }
  })() as { title?: string; body?: string; url?: string; tag?: string };
  const scope = self.registration.scope;
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Nuage', {
      body: data.body ?? '',
      icon: `${scope}icons/icon-192.png`,
      badge: `${scope}icons/badge-96.png`,
      tag: data.tag,
      data: { url: data.url ?? '#/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const hash = (event.notification.data?.url as string) ?? '#/';
  const target = new URL(hash, self.registration.scope).href;
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const c of all) {
        if ('focus' in c) {
          await (c as WindowClient).navigate(target).catch(() => undefined);
          return (c as WindowClient).focus();
        }
      }
      return self.clients.openWindow(target);
    })(),
  );
});
