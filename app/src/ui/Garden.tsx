// Illustrations du jardin (paliers d'objectifs) et visages de l'échelle de ressenti.
// Même rendu « volume doux » que Pépite : dégradés éclairés en haut à gauche, sans contours.
import { useId } from 'react';

export type Stage = 'graine' | 'pousse' | 'arbre' | 'floraison';

const stageBadge: Record<Stage, [string, string]> = {
  graine: ['#FFF1DC', '#FFD9AE'],
  pousse: ['#E4FBF1', '#B5EFD8'],
  arbre: ['#DDF7EC', '#9FE3C6'],
  floraison: ['#FFE6EE', '#FFC2D4'],
};

export function GrowthStage({ stage, size = 96, badge = true, title }: { stage: Stage; size?: number; badge?: boolean; title?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = (n: string) => `url(#${n}${id})`;
  const leaf = (d: string, rot = 0, cx = 60, cy = 70) => <path d={d} fill={g('leaf')} transform={`rotate(${rot} ${cx} ${cy})`} />;
  const flower = (x: number, y: number, r = 6) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy={-r * .75} rx={r * .55} ry={r * .8} fill={g('petal')} transform={`rotate(${a})`} />)}
      <circle r={r * .42} fill={g('heart')} />
    </g>
  );
  const canopy = (
    <>
      <rect x="55" y="58" width="10" height="36" rx="5" fill={g('trunk')} />
      <circle cx="43" cy="60" r="16" fill={g('leaf')} />
      <circle cx="77" cy="60" r="16" fill={g('leaf')} />
      <circle cx="60" cy="46" r="23" fill={g('leaf')} />
      <ellipse cx="51" cy="36" rx="9" ry="5" transform="rotate(-25 51 36)" fill="#fff" opacity=".45" />
    </>
  );
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <radialGradient id={`bg${id}`} cx=".35" cy=".3" r=".85"><stop offset="0" stopColor={stageBadge[stage][0]} /><stop offset="1" stopColor={stageBadge[stage][1]} /></radialGradient>
        <radialGradient id={`soil${id}`} cx=".4" cy=".2" r=".9"><stop offset="0" stopColor="#C99A6E" /><stop offset="1" stopColor="#7E5232" /></radialGradient>
        <radialGradient id={`seed${id}`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#FFD98A" /><stop offset=".6" stopColor="#D9973F" /><stop offset="1" stopColor="#9A5E22" /></radialGradient>
        <radialGradient id={`leaf${id}`} cx=".35" cy=".25" r=".9"><stop offset="0" stopColor="#B8F5D8" /><stop offset=".55" stopColor="#4FD39F" /><stop offset="1" stopColor="#1E9A72" /></radialGradient>
        <linearGradient id={`trunk${id}`} x1="0" x2="1"><stop offset="0" stopColor="#C08A5A" /><stop offset="1" stopColor="#8A5733" /></linearGradient>
        <radialGradient id={`petal${id}`} cx=".4" cy=".3" r=".9"><stop offset="0" stopColor="#FFE1EA" /><stop offset="1" stopColor="#FF7FA6" /></radialGradient>
        <radialGradient id={`heart${id}`} cx=".4" cy=".3" r=".8"><stop offset="0" stopColor="#FFF0B8" /><stop offset="1" stopColor="#FFB02E" /></radialGradient>
        <radialGradient id={`shadow${id}`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#3A2440" stopOpacity=".22" /><stop offset="1" stopColor="#3A2440" stopOpacity="0" /></radialGradient>
      </defs>
      {badge && <circle cx="60" cy="60" r="58" fill={g('bg')} />}
      <ellipse cx="60" cy="102" rx="40" ry="7" fill={g('shadow')} />
      <path d="M22 98 C 26 84, 44 79, 60 79 C 76 79, 94 84, 98 98 C 86 103, 34 103, 22 98Z" fill={g('soil')} />
      <ellipse cx="46" cy="85" rx="12" ry="3" fill="#fff" opacity=".18" />
      {stage === 'graine' && (
        <>
          <ellipse cx="60" cy="78" rx="10" ry="13" transform="rotate(-18 60 78)" fill={g('seed')} />
          <ellipse cx="56" cy="72" rx="3.5" ry="5" transform="rotate(-18 56 72)" fill="#fff" opacity=".6" />
          <path d="M84 50c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5z" fill="#FFB02E" opacity=".9" />
        </>
      )}
      {stage === 'pousse' && (
        <>
          <path d="M60 86 C 60 76, 60 68, 61 58" fill="none" stroke="#2FAF80" strokeWidth="4.5" strokeLinecap="round" />
          {leaf('M61 62 C 48 60, 38 50, 39 40 C 51 40, 60 49, 61 62Z')}
          {leaf('M61 58 C 73 54, 82 44, 82 34 C 70 35, 62 44, 61 58Z')}
          <path d="M47 46 C 52 50, 56 54, 60 60 M75 41 C 70 46, 66 50, 62 56" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
        </>
      )}
      {stage === 'arbre' && canopy}
      {stage === 'floraison' && (
        <>
          {canopy}
          {flower(44, 52)}{flower(66, 34, 7)}{flower(78, 58)}{flower(56, 62, 5)}{flower(33, 64, 4.5)}
          <ellipse cx="92" cy="80" rx="3" ry="4.5" transform="rotate(40 92 80)" fill={g('petal')} />
        </>
      )}
    </svg>
  );
}

/** 5 visages pour les échelles 1–5 (du plus difficile au meilleur). */
export function Face({ level, size = 40 }: { level: 1 | 2 | 3 | 4 | 5; size?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const colors: Record<number, [string, string]> = {
    1: ['#E2DBFF', '#9D8CF2'], 2: ['#DDE9FF', '#8DB4F0'], 3: ['#FFF0CC', '#F4C766'], 4: ['#FFE2CC', '#FFAA72'], 5: ['#FFD6E2', '#FF7FA3'],
  };
  const ink = '#2B1A1F';
  const eyes = level === 1
    ? <path d="M13 17 q3 2.5 6 0 M25 17 q3 2.5 6 0" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
    : level === 5
      ? <path d="M13 18 q3 -4 6 0 M25 18 q3 -4 6 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      : <><circle cx="16" cy="17.5" r="2.3" fill={ink} /><circle cx="28" cy="17.5" r="2.3" fill={ink} /><circle cx="16.8" cy="16.6" r=".8" fill="#fff" /><circle cx="28.8" cy="16.6" r=".8" fill="#fff" /></>;
  const mouth = {
    1: <path d="M15 29 q3.5 -3 7 0 q3.5 3 7 0" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />,
    2: <path d="M16 28.5 q6 -2.5 12 0" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />,
    3: <path d="M16.5 27.5 h11" stroke={ink} strokeWidth="2" strokeLinecap="round" />,
    4: <path d="M15.5 26 q6.5 5.5 13 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />,
    5: <path d="M14.5 25 q7.5 9 15 0z" fill="#7A2638" />,
  }[level];
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} aria-hidden>
      <defs><radialGradient id={`f${id}`} cx=".35" cy=".3" r=".85"><stop offset="0" stopColor={colors[level][0]} /><stop offset="1" stopColor={colors[level][1]} /></radialGradient></defs>
      <circle cx="22" cy="22" r="20" fill={`url(#f${id})`} />
      <ellipse cx="15" cy="11" rx="6" ry="3.5" transform="rotate(-25 15 11)" fill="#fff" opacity=".5" />
      {(level === 4 || level === 5) && <><ellipse cx="11" cy="25" rx="3.5" ry="2" fill="#FF7FA3" opacity=".35" /><ellipse cx="33" cy="25" rx="3.5" ry="2" fill="#FF7FA3" opacity=".35" /></>}
      {eyes}{mouth}
    </svg>
  );
}
