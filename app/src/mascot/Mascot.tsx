import { useEffect, useId, useMemo, useState } from 'react';
import { config } from '../config';
import { moods, type HeadPose, type Mood } from './moods';

// Tous les calques sont chargés depuis ./parts/<emplacement>/<nom>.svg.
// Remplacer un fichier suffit à redessiner Pépite, sans toucher au code.
const raw = import.meta.glob('./parts/*/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const parts: Record<string, string> = {};
for (const [path, svg] of Object.entries(raw)) {
  const key = path.replace('./parts/', '').replace('.svg', '');
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  // Les dégradés (<defs>) sont injectés une seule fois par Pépite affiché : on les retire des calques.
  parts[key] = key === '_defs/defs' ? inner : inner.replace(/<defs>[\s\S]*?<\/defs>/g, '');
}

/** Identifiants propres à chaque Pépite : un Pépite atténué (crise) ne prend pas les couleurs d'un autre. */
const scoped = (svg: string, uid: string) => svg.replace(/url\(#pp-/g, `url(#pp-${uid}-`).replace(/id="pp-/g, `id="pp-${uid}-`);

const HEAD_CX = 100;
const HEAD_CY = 84;

function headTransform({ dx = 0, dy = 0, rotate = 0, scale = 1 }: HeadPose = {}) {
  return `translate(${dx} ${dy}) rotate(${rotate} ${HEAD_CX} ${HEAD_CY}) translate(${HEAD_CX} ${HEAD_CY}) scale(${scale}) translate(${-HEAD_CX} ${-HEAD_CY})`;
}

function Layer({ slot, name, uid }: { slot: string; name?: string; uid: string }) {
  if (!name) return null;
  const svg = parts[`${slot}/${name}`];
  if (!svg) return null;
  return <g className={`pp-${slot}`} dangerouslySetInnerHTML={{ __html: scoped(svg, uid) }} />;
}

const sizes = { xs: 44, sm: 64, md: 116, lg: 170 } as const;

export interface MascotProps {
  mood: Mood;
  size?: keyof typeof sizes | number;
  animated?: boolean;
  onTap?: () => void;
  className?: string;
  /** Tête seule (avatar). */
  portrait?: boolean;
}

export function Mascot({ mood, size = 'md', animated = true, onTap, className = '', portrait = false }: MascotProps) {
  const def = moods[mood];
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const px = typeof size === 'number' ? size : sizes[size];
  const [blink, setBlink] = useState(false);
  const [wiggle, setWiggle] = useState(0);

  // Clignement aléatoire toutes les 4–7 s
  useEffect(() => {
    if (!animated || !def.blinks) return;
    let t: number;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 140);
        loop();
      }, 4000 + Math.random() * 3000);
    };
    loop();
    return () => window.clearTimeout(t);
  }, [animated, def.blinks]);

  const eyes = blink ? 'closed' : def.eyes;
  const tail = <Layer uid={uid} slot="tail" name={def.tail} />;
  const label = useMemo(() => `${config.mascotName}, le petit tigre (${def.label.toLowerCase()})`, [def.label]);

  const handleTap = () => {
    setWiggle((w) => w + 1);
    onTap?.();
  };

  if (portrait) {
    return (
      <svg viewBox="26 8 148 140" width={px} height={(px * 140) / 148} role="img" aria-label={label} className={`pp ${def.muted ? 'pp-muted' : ''} ${className}`}>
        <g dangerouslySetInnerHTML={{ __html: scoped(parts['_defs/defs'] ?? '', uid) }} />
        <Layer uid={uid} slot="head" name="base" />
        <Layer uid={uid} slot="eyes" name={eyes} />
        <Layer uid={uid} slot="brows" name={def.brows} />
        <Layer uid={uid} slot="mouth" name={def.mouth} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 -10 200 215"
      width={px}
      height={(px * 215) / 200}
      role="img"
      aria-label={label}
      onClick={onTap ? handleTap : undefined}
      className={`pp ${animated ? 'pp-animated' : ''} ${def.muted ? 'pp-muted' : ''} ${onTap ? 'cursor-pointer' : ''} ${className}`}
    >
      <g dangerouslySetInnerHTML={{ __html: scoped(parts['_defs/defs'] ?? '', uid) }} />
      {def.acc?.back?.map((a) => <Layer key={a} uid={uid} slot="acc" name={a} />)}
      <g key={wiggle} className={wiggle ? 'pp-wiggle' : ''}>{!def.tailFront && tail}</g>
      <g className="pp-breathe">
        <Layer uid={uid} slot="body" name={def.body} />
        {def.acc?.body?.map((a) => <Layer key={a} uid={uid} slot="acc" name={a} />)}
        {!def.armsFront && <Layer uid={uid} slot="arms" name={def.arms} />}
        <g transform={headTransform(def.head)}>
          <Layer uid={uid} slot="head" name="base" />
          <Layer uid={uid} slot="eyes" name={eyes} />
          <Layer uid={uid} slot="brows" name={def.brows} />
          <Layer uid={uid} slot="mouth" name={def.mouth} />
          {def.acc?.head?.map((a) => <Layer key={a} uid={uid} slot="acc" name={a} />)}
        </g>
        {def.armsFront && <Layer uid={uid} slot="arms" name={def.arms} />}
      </g>
      {def.tailFront && tail}
      {def.acc?.front?.map((a) => <Layer key={a} uid={uid} slot="acc" name={a} />)}
    </svg>
  );
}
