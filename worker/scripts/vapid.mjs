// Génère les clés VAPID (signature des notifications) et le secret partagé.
// Usage : npm run vapid
//  - la clé PUBLIQUE va dans app/src/config.ts et wrangler.toml (elle n'a rien de secret) ;
//  - la clé PRIVÉE est écrite dans .vapid-private.json (jamais envoyé sur GitHub) puis donnée à Cloudflare
//    avec : npx wrangler secret put VAPID_PRIVATE_JWK < .vapid-private.json
import { existsSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

if (existsSync('.vapid-private.json') && !process.argv.includes('--force')) {
  console.log('Des clés existent déjà (.vapid-private.json). Ajoute --force pour en générer de nouvelles');
  console.log('(attention : les abonnements existants devront être refaits).');
  process.exit(0);
}

const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const raw = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
const publicKey = Buffer.from(raw).toString('base64url');
const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
const sharedSecret = Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString('base64url');

writeFileSync('.vapid-private.json', JSON.stringify(privateJwk));
writeFileSync('.shared-secret', sharedSecret);
console.log('✓ Clé publique VAPID :', publicKey);
console.log('✓ Clé privée écrite dans .vapid-private.json');
console.log('✓ Secret partagé écrit dans .shared-secret :', sharedSecret);
