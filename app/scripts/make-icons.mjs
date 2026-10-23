// Génère toutes les icônes PNG à partir des calques de Pépite (tête + yeux + bouche).
// Usage : npm run icons   (à relancer si tu redessines les calques)
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const parts = new URL('../src/mascot/parts/', import.meta.url);
const icons = new URL('../public/icons/', import.meta.url);
const out = (name) => fileURLToPath(new URL(name, icons));
const SAGE = '#8FA98F';

async function layer(path) {
  const svg = await readFile(new URL(path, parts), 'utf8');
  // Garde le contenu et remplace var(--pp-x, #hex) par #hex (sharp ne connaît pas les variables CSS)
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replace(/var\(--pp-[\w-]+,\s*(#[0-9A-Fa-f]{3,8})\)/g, '$1');
}

const head = (await Promise.all(['head/base.svg', 'eyes/open.svg', 'mouth/smile.svg'].map(layer))).join('\n');
// Cadre autour de la tête (oreilles comprises) : x 36→164, y 18→138
const headBox = { x: 36, y: 18, w: 128, h: 120 };

function iconSvg({ size, scale, radius }) {
  const w = size * scale;
  const s = w / headBox.w;
  const tx = (size - w) / 2 - headBox.x * s;
  const ty = (size - headBox.h * s) / 2 - headBox.y * s + size * 0.02;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${SAGE}"/>
  <g transform="translate(${tx} ${ty}) scale(${s})">${head}</g></svg>`;
}

// Badge Android : silhouette blanche de la tête, yeux évidés
const badgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="${headBox.x - 4} ${headBox.y - 10} ${headBox.w + 8} ${headBox.w + 8}">
  <mask id="m"><rect x="0" y="0" width="200" height="200" fill="white"/>
    <ellipse cx="78" cy="80" rx="9" ry="11" fill="black"/><ellipse cx="122" cy="80" rx="9" ry="11" fill="black"/>
    <path d="M93 96 Q100 92 107 96 Q104 103 100 104 Q96 103 93 96Z" fill="black"/></mask>
  <g fill="white" mask="url(#m)">
    <path d="M52 62 C 44 38, 52 22, 66 24 C 76 26, 86 36, 90 44 Z"/>
    <path d="M148 62 C 156 38, 148 22, 134 24 C 124 26, 114 36, 110 44 Z"/>
    <ellipse cx="100" cy="84" rx="62" ry="52"/></g></svg>`;

const icon512 = iconSvg({ size: 512, scale: 0.78, radius: 0 });
await writeFile(out('icon.svg'), iconSvg({ size: 512, scale: 0.78, radius: 112 }));
await writeFile(out('badge.svg'), badgeSvg);
await sharp(Buffer.from(icon512)).resize(192, 192).png().toFile(out('icon-192.png'));
await sharp(Buffer.from(icon512)).png().toFile(out('icon-512.png'));
// Maskable : la tête tient dans la zone de sécurité centrale (~80 %)
await sharp(Buffer.from(iconSvg({ size: 512, scale: 0.6, radius: 0 }))).png().toFile(out('icon-maskable-512.png'));
await sharp(Buffer.from(icon512)).resize(180, 180).png().toFile(out('apple-touch-icon-180.png'));
await sharp(Buffer.from(badgeSvg)).png().toFile(out('badge-96.png'));
console.log('Icônes générées ✓');
