// Rendu PNG haute définition de Pépite à partir des calques (pour relire un dessin).
// Usage : node scripts/render-mascot.mjs src/mascot/parts sortie.png '[["tail/up","body/sit",...]]'
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
const dir = process.argv[2], out = process.argv[3];
const read = (p) => readFileSync(`${dir}/${p}.svg`, 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<defs>[\s\S]*?<\/defs>/g, (m) => (p === '_defs/defs' ? m : ''));
const res = (s) => s.replace(/var\(--pp-[\w-]+,\s*(#[0-9A-Fa-f]{3,8})\)/g, '$1');
const combos = JSON.parse(process.argv[4]);
const tiles = [];
for (const c of combos) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -10 200 215" width="600" height="645"><rect x="0" y="-10" width="200" height="215" fill="#FBF7F4"/>${res(read('_defs/defs'))}${c.map((p) => (p.startsWith('<') ? p : res(read(p)))).join('')}</svg>`;
  tiles.push(await sharp(Buffer.from(svg)).png().toBuffer());
}
const W = 600 * tiles.length;
await sharp({ create: { width: W, height: 645, channels: 4, background: '#fff' } }).composite(tiles.map((t, i) => ({ input: t, left: i * 600, top: 0 }))).png().toFile(out);
