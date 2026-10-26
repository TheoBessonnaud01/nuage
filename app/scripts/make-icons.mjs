// Génère les icônes PNG à partir des calques de Pépite v2 (tête + yeux + bouche) sur fond « Aube ».
// Usage : npm run icons   (à relancer si tu redessines les calques)
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const parts = new URL('../src/mascot/parts/', import.meta.url);
const icons = new URL('../public/icons/', import.meta.url);
const out = (name) => fileURLToPath(new URL(name, icons));

/** Contenu d'un calque, couleurs résolues (sharp ne connaît pas les variables CSS). */
async function layer(path, keepDefs = false) {
  const svg = await readFile(new URL(path, parts), 'utf8');
  let inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  if (!keepDefs) inner = inner.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  return inner.replace(/var\(--pp-[\w-]+,\s*(#[0-9A-Fa-f]{3,8})\)/g, '$1');
}

const defs = await layer('_defs/defs.svg', true);
const head = (await Promise.all(['head/base.svg', 'eyes/open.svg', 'mouth/smile.svg'].map((p) => layer(p)))).join('\n');
// Cadre de la tête (oreilles comprises) : x 30→170, y 14→140
const box = { x: 30, y: 14, w: 140, h: 126 };

const background = (size, radius) => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFC9A6"/><stop offset=".55" stop-color="#FF9FBE"/><stop offset="1" stop-color="#BBA8FF"/>
    </linearGradient>
    <radialGradient id="glow" cx=".3" cy=".25" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#glow)"/>`;

function iconSvg({ size, scale, radius }) {
  const w = size * scale;
  const s = w / box.w;
  const tx = (size - w) / 2 - box.x * s;
  const ty = (size - box.h * s) / 2 - box.y * s + size * 0.03;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${background(size, radius)}
  <ellipse cx="${size / 2}" cy="${size * 0.86}" rx="${size * 0.3}" ry="${size * 0.04}" fill="#3A2440" opacity=".12"/>
  <g transform="translate(${tx} ${ty}) scale(${s})">${defs}${head}</g></svg>`;
}

// Badge Android : silhouette blanche de la tête (collerette comprise), yeux et nez évidés
const HEAD_PATH = 'M100 28 C 137 28, 165 51, 167 82 C 168 92, 166 99, 162 105 L 170 110 L 160 113 L 165 121 L 152 120 C 141 133, 122 139, 100 139 C 78 139, 59 133, 48 120 L 35 121 L 40 113 L 30 110 L 38 105 C 34 99, 32 92, 33 82 C 35 51, 63 28, 100 28 Z';
const badgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="22 6 156 156">
  <mask id="m"><rect x="0" y="0" width="200" height="200" fill="white"/>
    <ellipse cx="79" cy="84" rx="11" ry="13" fill="black"/><ellipse cx="121" cy="84" rx="11" ry="13" fill="black"/>
    <path d="M92.5 97 Q100 92.5 107.5 97 Q105.5 104.5 100 106.5 Q94.5 104.5 92.5 97Z" fill="black"/></mask>
  <g fill="white" mask="url(#m)">
    <path d="M50 62 C 42 38, 48 19, 63 16 C 76 14, 87 27, 93 40 Z"/>
    <path d="M150 62 C 158 38, 152 19, 137 16 C 124 14, 113 27, 107 40 Z"/>
    <path d="${HEAD_PATH}"/></g></svg>`;

const icon512 = iconSvg({ size: 512, scale: 0.74, radius: 0 });
await writeFile(out('icon.svg'), iconSvg({ size: 512, scale: 0.74, radius: 112 }));
await writeFile(out('badge.svg'), badgeSvg);
await sharp(Buffer.from(icon512)).resize(192, 192).png().toFile(out('icon-192.png'));
await sharp(Buffer.from(icon512)).png().toFile(out('icon-512.png'));
// Maskable : la tête tient dans la zone de sécurité centrale (~80 %)
await sharp(Buffer.from(iconSvg({ size: 512, scale: 0.58, radius: 0 }))).png().toFile(out('icon-maskable-512.png'));
await sharp(Buffer.from(icon512)).resize(180, 180).png().toFile(out('apple-touch-icon-180.png'));
await sharp(Buffer.from(badgeSvg)).png().toFile(out('badge-96.png'));
console.log('Icônes générées ✓');
