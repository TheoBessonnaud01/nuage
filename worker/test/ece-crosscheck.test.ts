// Vérification croisée avec http_ece (bibliothèque de référence Node pour RFC 8188/8291).
import { createECDH } from 'node:crypto';
import { describe, expect, it } from 'vitest';
// @ts-expect-error : pas de types pour http_ece
import ece from 'http_ece';
import { b64urlEncode, encryptPayload } from '../src/webpush';

describe('compatibilité avec http_ece', () => {
  it('http_ece déchiffre nos messages', async () => {
    const ua = createECDH('prime256v1');
    ua.generateKeys();
    const auth = crypto.getRandomValues(new Uint8Array(16));
    const sub = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/x',
      keys: { p256dh: b64urlEncode(new Uint8Array(ua.getPublicKey())), auth: b64urlEncode(auth) },
    };
    const body = await encryptPayload(sub, new TextEncoder().encode('{"body":"Petit point du soir ?"}'));
    const plain = ece.decrypt(Buffer.from(body), { version: 'aes128gcm', privateKey: ua, authSecret: Buffer.from(auth) });
    expect(plain.toString()).toBe('{"body":"Petit point du soir ?"}');
  });
});
