import { describe, expect, it } from 'vitest';
import { b64urlDecode, b64urlEncode, encryptPayload, vapidJwt } from '../src/webpush';

const enc = new TextEncoder();

/** Déchiffrement côté « navigateur », pour vérifier que notre chiffrement est conforme (RFC 8291). */
async function decrypt(body: Uint8Array, uaKeys: CryptoKeyPair, uaPublic: Uint8Array, auth: Uint8Array) {
  const salt = body.slice(0, 16);
  const rs = new DataView(body.buffer, body.byteOffset).getUint32(16);
  const idlen = body[20];
  const asPublic = body.slice(21, 21 + idlen);
  const cipher = body.slice(21 + idlen);
  const asKey = await crypto.subtle.importKey('raw', asPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: asKey }, uaKeys.privateKey, 256));
  const hk = async (s: Uint8Array, ikm: Uint8Array, info: Uint8Array, n: number) => {
    const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: s, info }, k, n * 8));
  };
  const keyInfo = new Uint8Array([...enc.encode('WebPush: info\0'), ...uaPublic, ...asPublic]);
  const ikm = await hk(auth, shared, keyInfo, 32);
  const cek = await hk(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hk(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']);
  const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, cipher));
  expect(plain[plain.length - 1]).toBe(2);
  return { rs, text: new TextDecoder().decode(plain.slice(0, -1)) };
}

describe('Web Push', () => {
  it('chiffre un message que le navigateur sait déchiffrer', async () => {
    const ua = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']) as CryptoKeyPair;
    const uaPublic = new Uint8Array(await crypto.subtle.exportKey('raw', ua.publicKey) as ArrayBuffer);
    const auth = crypto.getRandomValues(new Uint8Array(16));
    const sub = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: { p256dh: b64urlEncode(uaPublic), auth: b64urlEncode(auth) } };
    const body = await encryptPayload(sub, enc.encode('{"title":"Coucou Noémie 🐯"}'));
    const out = await decrypt(body, ua, uaPublic, auth);
    expect(out.rs).toBe(4096);
    expect(JSON.parse(out.text).title).toBe('Coucou Noémie 🐯');
  });

  it('produit un jeton VAPID signé et vérifiable', async () => {
    const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']) as CryptoKeyPair;
    const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
    const publicKey = b64urlEncode(new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey) as ArrayBuffer));
    const jwt = await vapidJwt('https://web.push.apple.com/QGuQyavXutnMH', { publicKey, privateJwk, subject: 'https://exemple.github.io/nuage/' }, 1_700_000_000_000);
    const [h, c, s] = jwt.split('.');
    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(c)));
    expect(claims).toEqual({ aud: 'https://web.push.apple.com', exp: 1_700_000_000 + 43200, sub: 'https://exemple.github.io/nuage/' });
    expect(b64urlDecode(s)).toHaveLength(64);
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pair.publicKey, b64urlDecode(s), enc.encode(`${h}.${c}`));
    expect(ok).toBe(true);
  });
});
