// Questions du point du jour, dans l'ordre. Textes modifiables librement.
// Chaque écran contient une ou plusieurs questions ; aucune n'est obligatoire.
import type { DayEntry } from '../db/types';

export interface ScaleOption { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }
export interface ChoiceOption<V = string | boolean> { value: V; label: string; emoji?: string }

export type Part =
  | { kind: 'hours'; field: 'sleepHours'; label: string }
  | { kind: 'scale'; field: 'sleepQuality' | 'stress' | 'energy' | 'mood'; label?: string; options: ScaleOption[] }
  | { kind: 'choice'; field: keyof DayEntry; label?: string; options: ChoiceOption[] }
  | { kind: 'multi'; field: 'sensoryExposure' | 'warningSigns' | 'customFactors'; label?: string; list: 'sensory' | 'warningSigns' | 'customFactors' }
  | { kind: 'text'; field: 'note'; placeholder: string };

export interface Screen {
  id: string;
  title: string;
  info?: { button: string; body: string };
  parts: Part[];
  /** Écran affiché seulement si la condition est vraie (ex. facteurs perso). */
  onlyIf?: 'hasCustomFactors';
}

const yesNo: ChoiceOption[] = [
  { value: false, label: 'Non', emoji: '👍' },
  { value: true, label: 'Oui', emoji: '✋' },
];

export const checkinScreens: Screen[] = [
  {
    id: 'sommeil',
    title: 'Ta nuit dernière ?',
    parts: [
      { kind: 'hours', field: 'sleepHours', label: 'Combien d’heures de sommeil ?' },
      {
        kind: 'scale', field: 'sleepQuality', label: 'Et la qualité ?',
        options: [
          { value: 1, emoji: '😫', label: 'Très mauvaise' },
          { value: 2, emoji: '😕', label: 'Bof' },
          { value: 3, emoji: '😐', label: 'Moyenne' },
          { value: 4, emoji: '🙂', label: 'Bonne' },
          { value: 5, emoji: '😴', label: 'Excellente' },
        ],
      },
    ],
  },
  {
    id: 'stress',
    title: 'Ton niveau de stress aujourd’hui ?',
    parts: [{
      kind: 'scale', field: 'stress',
      options: [
        { value: 1, emoji: '😌', label: 'Zen' },
        { value: 2, emoji: '🙂', label: 'Un peu' },
        { value: 3, emoji: '😐', label: 'Moyen' },
        { value: 4, emoji: '😟', label: 'Pas mal' },
        { value: 5, emoji: '😣', label: 'Beaucoup' },
      ],
    }],
  },
  {
    id: 'energie',
    title: 'Ton énergie et ton humeur ?',
    parts: [
      {
        kind: 'scale', field: 'energy', label: 'Énergie',
        options: [
          { value: 1, emoji: '🪫', label: 'À plat' },
          { value: 2, emoji: '🐢', label: 'Faible' },
          { value: 3, emoji: '😐', label: 'Moyenne' },
          { value: 4, emoji: '🙂', label: 'Bonne' },
          { value: 5, emoji: '⚡', label: 'Au top' },
        ],
      },
      {
        kind: 'scale', field: 'mood', label: 'Humeur',
        options: [
          { value: 1, emoji: '🌧️', label: 'Grise' },
          { value: 2, emoji: '🌥️', label: 'Bof' },
          { value: 3, emoji: '⛅', label: 'Moyenne' },
          { value: 4, emoji: '🌤️', label: 'Bonne' },
          { value: 5, emoji: '☀️', label: 'Radieuse' },
        ],
      },
    ],
  },
  {
    id: 'repas',
    title: 'Un repas sauté ou décalé aujourd’hui ?',
    parts: [{ kind: 'choice', field: 'mealsSkippedOrLate', options: yesNo }],
  },
  {
    id: 'hydratation',
    title: 'Tu as bu combien d’eau ?',
    parts: [{
      kind: 'choice', field: 'hydration',
      options: [
        { value: 'peu', label: 'Peu', emoji: '🥛' },
        { value: 'moyen', label: 'Moyen', emoji: '🥤' },
        { value: 'bien', label: 'Bien', emoji: '💧' },
      ],
    }],
  },
  {
    id: 'cafeine',
    title: 'Et la caféine (café, thé, cola) ?',
    parts: [{
      kind: 'choice', field: 'caffeine',
      options: [
        { value: 'aucune', label: 'Aucune', emoji: '🚫' },
        { value: 'habituelle', label: 'Comme d’habitude', emoji: '☕' },
        { value: 'plus', label: 'Plus que d’habitude', emoji: '⬆️' },
        { value: 'moins', label: 'Moins que d’habitude', emoji: '⬇️' },
      ],
    }],
  },
  {
    id: 'alcool',
    title: 'Un peu d’alcool aujourd’hui ?',
    parts: [{ kind: 'choice', field: 'alcohol', options: yesNo }],
  },
  {
    id: 'ecrans',
    title: 'Écrans et environnement ?',
    parts: [
      {
        kind: 'choice', field: 'screens', label: 'Les écrans',
        options: [
          { value: 'peu', label: 'Peu', emoji: '🌿' },
          { value: 'normal', label: 'Normal', emoji: '💻' },
          { value: 'beaucoup', label: 'Beaucoup', emoji: '📱' },
        ],
      },
      { kind: 'multi', field: 'sensoryExposure', label: 'Exposée à… (si c’est le cas)', list: 'sensory' },
    ],
  },
  {
    id: 'effort',
    title: 'Ton corps et ton rythme ?',
    parts: [
      {
        kind: 'choice', field: 'physicalEffort', label: 'Effort physique',
        options: [
          { value: 'aucun', label: 'Aucun', emoji: '🛋️' },
          { value: 'modéré', label: 'Modéré', emoji: '🚶‍♀️' },
          { value: 'intense', label: 'Intense', emoji: '🏃‍♀️' },
        ],
      },
      {
        kind: 'choice', field: 'routineChange', label: 'Rythme chamboulé ? (voyage, décalage, grasse mat’)',
        options: yesNo,
      },
    ],
  },
  {
    id: 'signaux',
    title: 'Des petits signaux aujourd’hui ?',
    info: {
      button: 'C’est quoi ?',
      body: 'Ce sont de petits changements qui arrivent parfois quelques heures, voire un ou deux jours, avant une migraine (les médecins disent « prodrome »). Tout le monde n’en a pas. Les repérer peut t’aider à anticiper.',
    },
    parts: [{ kind: 'multi', field: 'warningSigns', list: 'warningSigns' }],
  },
  {
    id: 'perso',
    title: 'Autre chose à noter ?',
    onlyIf: 'hasCustomFactors',
    parts: [{ kind: 'multi', field: 'customFactors', list: 'customFactors' }],
  },
  {
    id: 'mal-de-tete',
    title: 'Mal de tête aujourd’hui ?',
    parts: [{
      kind: 'choice', field: 'headacheToday',
      options: [
        { value: 'non', label: 'Non', emoji: '☀️' },
        { value: 'léger mal de tête', label: 'Un léger mal de tête', emoji: '⛅' },
        { value: 'migraine', label: 'Une migraine', emoji: '🌧️' },
      ],
    }],
  },
  {
    id: 'note',
    title: 'Un petit mot pour finir ?',
    parts: [{ kind: 'text', field: 'note', placeholder: 'Ce que tu veux : une remarque, un détail, rien du tout…' }],
  },
];
