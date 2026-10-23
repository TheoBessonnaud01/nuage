import { useEffect, useMemo, useState } from 'react';
import { config } from '../config';
import { moods, type HeadPose, type Mood } from './moods';

// Tous les calques sont chargés depuis ./parts/<emplacement>/<nom>.svg.
// Remplacer un fichier suffit à redessiner Pépite, sans toucher au code.
const raw = import.meta.glob('./parts/*/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const parts: Record<string, string> = {};
for (const [path, svg] of Object.entries(raw)) {
  const key = path.replace('./parts/', '').replace('.svg', '');
  parts[key] = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

const HEAD_CX = 100;
const HEAD_CY = 84;

function headTransform({ dx = 0, dy = 0, rotate = 0, scale = 1 }: HeadPose = {}) {
  return `translate(${dx} ${dy}) rotate(${rotate} ${HEAD_CX} ${HEAD_CY}) translate(${HEAD_CX} ${HEAD_CY}) scale(${scale}) translate(${-HEAD_CX} ${-HEAD_CY})`;
}

function Layer({ slot, name }: { slot: string; name?: string }) {
  if (!name) return null;
  const svg = parts[`${slot}/${name}`];
  if (!svg) return null;
  return <g className={`pp-${slot}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}

const sizes = { xs: 48, sm: 72, md: 140, lg: 200 } as const;

export interface MascotProps {
  mood: Mood;
  size?: keyof typeof sizes | number;
  animated?: boolean;
  onTap?: () => void;
  className?: string;
}

export function Mascot({ mood, size = 'md', animated = true, onTap, className = '' }: MascotProps) {
  const def = moods[mood];
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
  const tail = <Layer slot="tail" name={def.tail} />;
  const label = useMemo(() => `${config.mascotName}, le petit tigre (${def.label.toLowerCase()})`, [def.label]);

  const handleTap = () => {
    setWiggle((w) => w + 1);
    onTap?.();
  };

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
      {def.acc?.back?.map((a) => <Layer key={a} slot="acc" name={a} />)}
      <g key={wiggle} className={wiggle ? 'pp-wiggle' : ''}>{!def.tailFront && tail}</g>
      <g className="pp-breathe">
        <Layer slot="body" name={def.body} />
        {def.acc?.body?.map((a) => <Layer key={a} slot="acc" name={a} />)}
        {!def.armsFront && <Layer slot="arms" name={def.arms} />}
        <g transform={headTransform(def.head)}>
          <Layer slot="head" name="base" />
          <Layer slot="eyes" name={eyes} />
          <Layer slot="brows" name={def.brows} />
          <Layer slot="mouth" name={def.mouth} />
          {def.acc?.head?.map((a) => <Layer key={a} slot="acc" name={a} />)}
        </g>
        {def.armsFront && <Layer slot="arms" name={def.arms} />}
      </g>
      {def.tailFront && tail}
      {def.acc?.front?.map((a) => <Layer key={a} slot="acc" name={a} />)}
    </svg>
  );
}
