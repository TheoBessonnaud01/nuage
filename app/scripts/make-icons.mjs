// Génère toutes les tailles d'icônes PNG à partir des SVG de public/icons/.
// Usage : npm run icons
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dir = new URL('../public/icons/', import.meta.url);
const icon = await readFile(new URL('icon.svg', dir));
const badge = await readFile(new URL('badge.svg', dir));
const out = (name) => fileURLToPath(new URL(name, dir));

await sharp(icon).resize(192, 192).png().toFile(out('icon-192.png'));
await sharp(icon).resize(512, 512).png().toFile(out('icon-512.png'));
// Maskable : on ajoute une marge (zone de sécurité ~80 %) sur fond plein
const inner = await sharp(icon).resize(400, 400).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#8FA98F' } })
  .composite([{ input: inner, gravity: 'center' }]).png().toFile(out('icon-maskable-512.png'));
// iOS n'aime pas la transparence : fond plein
await sharp(icon).resize(180, 180).flatten({ background: '#8FA98F' }).png().toFile(out('apple-touch-icon-180.png'));
await sharp(badge).resize(96, 96).png().toFile(out('badge-96.png'));
console.log('Icônes générées ✓');
