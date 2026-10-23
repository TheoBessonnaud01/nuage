// Worker « Nuage » : abonnements Web Push + envoi des rappels (cron toutes les 15 min).
// Ne stocke AUCUNE donnée de santé : seulement l'abonnement, l'heure de rappel, le fuseau,
// les jours silencieux, un indicateur de mode et d'éventuelles relances.
import { buildMessage } from './messages';
import { decide, type Kind, type SubRecord } from './schedule';
import { sendPush, type PushSubscriptionJSON, type Vapid } from './webpush';

export interface Env {
  SUBS: KVNamespace;
  ALLOWED_ORIGIN: string;
  FIRST_NAME: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_SUBJECT: string;
  VAPID_PRIVATE_JWK: string; // secret
  SHARED_SECRET: string;     // secret
}

const KEY = (installId: string) => `sub:${installId}`;

function cors(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Nuage-Key',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const json = (env: Env, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(env) } });

const vapidOf = (env: Env): Vapid => ({
  publicKey: env.VAPID_PUBLIC_KEY,
  privateJwk: JSON.parse(env.VAPID_PRIVATE_JWK),
  subject: env.VAPID_SUBJECT,
});

const isHHMM = (s: unknown): s is string => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const isDays = (d: unknown): d is number[] => Array.isArray(d) && d.every((x) => Number.isInteger(x) && x >= 0 && x <= 6);
const isSub = (s: unknown): s is PushSubscriptionJSON => {
  const x = s as PushSubscriptionJSON;
  return !!x && typeof x.endpoint === 'string' && x.endpoint.startsWith('https://') && typeof x.keys?.p256dh === 'string' && typeof x.keys?.auth === 'string';
};
const isId = (s: unknown): s is string => typeof s === 'string' && /^[0-9a-f-]{36}$/i.test(s);

async function notify(env: Env, rec: SubRecord, kind: Kind | 'test'): Promise<number> {
  const status = await sendPush(rec.subscription, buildMessage(kind, env.FIRST_NAME), vapidOf(env));
  if (status === 404 || status === 410) await env.SUBS.delete(KEY(rec.installId)); // abonnement expiré
  return status;
}

async function handle(req: Request, env: Env): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) });
  if (req.method !== 'POST') return json(env, 405, { error: 'méthode' });
  if (req.headers.get('X-Nuage-Key') !== env.SHARED_SECRET) return json(env, 401, { error: 'clé' });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json(env, 400, { error: 'json' }); }
  if (!isId(body.installId)) return json(env, 400, { error: 'installId' });
  const key = KEY(body.installId);
  const path = new URL(req.url).pathname;

  if (path === '/subscribe') {
    if (!isSub(body.subscription)) return json(env, 400, { error: 'subscription' });
    const prev = await env.SUBS.get<SubRecord>(key, 'json');
    const rec: SubRecord = {
      installId: body.installId,
      subscription: { endpoint: body.subscription.endpoint, keys: { p256dh: body.subscription.keys.p256dh, auth: body.subscription.keys.auth } },
      reminderTime: isHHMM(body.reminderTime) ? body.reminderTime : prev?.reminderTime ?? '20:30',
      tz: typeof body.tz === 'string' ? body.tz : prev?.tz ?? 'Europe/Paris',
      silentDays: isDays(body.silentDays) ? body.silentDays : prev?.silentDays ?? [],
      mode: body.mode === 'suivi' ? 'suivi' : 'normal',
      relances: prev?.relances ?? [],
      sent: prev?.sent ?? {},
      updatedAt: new Date().toISOString(),
    };
    await env.SUBS.put(key, JSON.stringify(rec));
    return json(env, 200, { ok: true });
  }

  const rec = await env.SUBS.get<SubRecord>(key, 'json');
  if (!rec) return json(env, 404, { error: 'inconnu' });

  if (path === '/update') {
    if (isHHMM(body.reminderTime)) rec.reminderTime = body.reminderTime;
    if (isDays(body.silentDays)) rec.silentDays = body.silentDays;
    if (body.mode === 'suivi' || body.mode === 'normal') rec.mode = body.mode;
    const relance = body.relance as { at?: string } | undefined;
    if (relance?.at && !Number.isNaN(Date.parse(relance.at))) {
      rec.relances = [...rec.relances.filter((r) => Date.parse(r.at) > Date.now()), { at: relance.at, kind: 'relance-traitement' as const }].slice(-10);
    }
    rec.updatedAt = new Date().toISOString();
    await env.SUBS.put(key, JSON.stringify(rec));
    return json(env, 200, { ok: true });
  }
  if (path === '/unsubscribe') {
    await env.SUBS.delete(key);
    return json(env, 200, { ok: true });
  }
  if (path === '/test') {
    const status = await notify(env, rec, 'test');
    return json(env, status < 300 ? 200 : 502, { ok: status < 300, status });
  }
  return json(env, 404, { error: 'route' });
}

async function tick(env: Env, now: Date) {
  let cursor: string | undefined;
  do {
    const page = await env.SUBS.list({ prefix: 'sub:', cursor });
    for (const k of page.keys) {
      const rec = await env.SUBS.get<SubRecord>(k.name, 'json');
      if (!rec) continue;
      const d = decide(rec, now);
      if (!d.changed) continue;
      await env.SUBS.put(k.name, JSON.stringify(d.record)); // d'abord : jamais de double envoi
      for (const kind of d.send) {
        const status = await notify(env, d.record, kind);
        if (status === 404 || status === 410) break;
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
}

export default {
  fetch: (req: Request, env: Env) => handle(req, env).catch(() => json(env, 500, { error: 'serveur' })),
  scheduled: (_e: ScheduledController, env: Env, ctx: ExecutionContext) => ctx.waitUntil(tick(env, new Date())),
} satisfies ExportedHandler<Env>;
