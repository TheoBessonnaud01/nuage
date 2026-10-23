// Chaque état de Pépite = une combinaison de calques de ./parts/<emplacement>/<nom>.svg.
// Pour changer une expression : modifie la combinaison ici, ou redessine le calque SVG.

export type Mood =
  | 'joyeux' | 'fier' | 'fete' | 'detective' | 'calin' | 'fatigue'
  | 'retrouvailles' | 'curieux' | 'dort' | 'coucou' | 'pense';

export interface HeadPose { dx?: number; dy?: number; rotate?: number; scale?: number }

export interface MoodDef {
  label: string;
  tail: string;
  tailFront?: boolean;      // queue devant le corps (roulé en boule)
  armsFront?: boolean;      // pattes devant la tête (patte sous le menton)
  body: string;
  arms?: string;
  eyes: string;
  brows?: string;
  mouth: string;
  head?: HeadPose;
  acc?: {
    back?: string[];        // derrière tout
    body?: string[];        // sur le corps, sous les pattes (plaid, bouillotte…)
    head?: string[];        // suit la tête (chapeaux, lunettes)
    front?: string[];       // devant tout (étoiles, confettis, zzz…)
  };
  muted?: boolean;          // couleurs atténuées
  blinks?: boolean;         // clignement possible (yeux ouverts)
}

export const moods: Record<Mood, MoodDef> = {
  joyeux: { label: 'Joyeux', tail: 'up', body: 'sit', arms: 'down', eyes: 'open', mouth: 'smile', blinks: true },
  fier: {
    label: 'Fier', tail: 'up', body: 'proud', arms: 'down', eyes: 'happy', mouth: 'grin',
    head: { dy: -4 }, acc: { front: ['stars'] },
  },
  fete: {
    label: 'Fête', tail: 'up', body: 'sit', arms: 'open', eyes: 'happy', mouth: 'grin',
    acc: { head: ['party-hat'], front: ['confetti'] },
  },
  detective: {
    label: 'Détective', tail: 'up', body: 'sit', arms: 'down', eyes: 'open', brows: 'raised', mouth: 'small',
    head: { rotate: -4 }, acc: { head: ['detective-hat'], front: ['magnifier'] }, blinks: true,
  },
  calin: {
    label: 'Câlin', tail: 'down', body: 'sit', arms: 'hold', eyes: 'soft', brows: 'soft', mouth: 'small',
    acc: { body: ['blanket', 'hot-water-bottle'] }, muted: true,
  },
  fatigue: {
    label: 'Fatigué', tail: 'down', body: 'sit', arms: 'hold', eyes: 'heavy', brows: 'soft', mouth: 'small',
    head: { rotate: 6, dy: 3 }, acc: { body: ['pillow'] },
  },
  retrouvailles: {
    label: 'Retrouvailles', tail: 'up', body: 'sit', arms: 'open', eyes: 'happy', mouth: 'grin',
    acc: { front: ['heart'] },
  },
  curieux: {
    label: 'Curieux', tail: 'up', body: 'sit', arms: 'down', eyes: 'open', brows: 'raised', mouth: 'o',
    head: { rotate: -10 }, acc: { head: ['glasses'] }, blinks: true,
  },
  dort: {
    label: 'Dort', tail: 'curled', tailFront: true, body: 'curled', eyes: 'closed', mouth: 'small',
    head: { dx: -34, dy: 62, rotate: -12, scale: 0.72 }, acc: { front: ['zzz'] },
  },
  coucou: { label: 'Coucou', tail: 'up', body: 'sit', arms: 'wave', eyes: 'open', mouth: 'grin', blinks: true },
  pense: {
    label: 'Pense', tail: 'down', body: 'sit', arms: 'chin', armsFront: true, eyes: 'up', mouth: 'small',
    head: { rotate: 5 }, blinks: false,
  },
};

export const allMoods = Object.keys(moods) as Mood[];
