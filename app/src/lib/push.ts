// Notifications Web Push : abonnement, synchronisation avec le Worker, désabonnement.
// L'app fonctionne entièrement sans : toutes les erreurs sont silencieuses.
import { config } from '../config';
import { getSettings, updateSettings } from '../db/db';
import { getActiveAttack } from '../db/attacks';
import { detectPlatform, isStandalone } from './install';

export type PushState =
  | 'non-configure'      // Worker pas encore déployé
  | 'non-supporte'       // navigateur sans Web Push
  | 'ios-installer'      // iPhone : il faut ouvrir l'app depuis l'écran d'accueil
  | 'refuse'             // permission refusée
  | 'off' | 'on';

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function pushState(): Promise<PushState> {
  if (!config.workerUrl) return 'non-configure';
  if (detectPlatform() === 'ios' && !isStandalone()) return 'ios-installer';
  if (!pushSupported()) return 'non-supporte';
  if (Notification.permission === 'denied') return 'refuse';
  const s = await getSettings();
  return s.pushSubscribed && Notification.permission === 'granted' ? 'on' : 'off';
}

async function call(path: string, body: object): Promise<Response | null> {
  if (!config.workerUrl) return null;
  try {
    return await fetch(`${config.workerUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Nuage-Key': config.sharedSecret },
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }
}

function keyBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64url.length + 3) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function currentMode(): Promise<'normal' | 'suivi'> {
  return (await getActiveAttack()) ? 'suivi' : 'normal';
}

/** Envoie l'abonnement et les réglages au Worker (création ou mise à jour). */
async function register(sub: PushSubscription): Promise<boolean> {
  const s = await getSettings();
  const res = await call('/subscribe', {
    installId: s.installId,
    subscription: sub.toJSON(),
    reminderTime: s.reminderTime,
    tz: config.timeZone,
    silentDays: s.silentDays,
    mode: await currentMode(),
  });
  return !!res?.ok;
}

/** À appeler sur un geste de Noémie (bouton). */
export async function enablePush(): Promise<PushState> {
  const state = await pushState();
  if (state === 'non-configure' || state === 'non-supporte' || state === 'ios-installer') return state;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'refuse' : 'off';
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription())
      ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(config.vapidPublicKey) }));
    const ok = await register(sub);
    await updateSettings({ pushSubscribed: ok });
    return ok ? 'on' : 'off';
  } catch {
    return 'off';
  }
}

export async function disablePush(): Promise<void> {
  const s = await getSettings();
  try {
    const reg = await navigator.serviceWorker.ready;
    await (await reg.pushManager.getSubscription())?.unsubscribe();
  } catch { /* rien */ }
  await call('/unsubscribe', { installId: s.installId });
  await updateSettings({ pushSubscribed: false });
}

/** À chaque ouverture : l'abonnement peut avoir changé (ou expiré), on le renvoie au Worker. */
export async function syncPush(): Promise<void> {
  if ((await pushState()) !== 'on') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription())
      ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(config.vapidPublicKey) }));
    await register(sub);
  } catch { /* rien */ }
}

/** Met à jour heure de rappel / jours silencieux / mode, ou programme une relance. */
export async function updatePush(patch: { reminderTime?: string; silentDays?: number[]; mode?: 'normal' | 'suivi'; relance?: { at: string } }) {
  const s = await getSettings();
  if (!s.pushSubscribed) return;
  await call('/update', { installId: s.installId, ...patch });
}

export async function syncMode() {
  await updatePush({ mode: await currentMode() });
}

export async function sendTestPush(): Promise<boolean> {
  const s = await getSettings();
  const res = await call('/test', { installId: s.installId });
  return !!res?.ok;
}

