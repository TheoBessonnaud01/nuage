import type { IconName } from '../../ui/Icon';

/** Icône et couleur de chaque fiche « Comprendre ». */
export const cardStyle: Record<string, { icon: IconName; tone: string }> = {
  phases: { icon: 'wave', tone: 'grad-lilac' },
  signaux: { icon: 'sparkle', tone: 'grad-peach' },
  aura: { icon: 'eye', tone: 'grad-sky' },
  declencheurs: { icon: 'search', tone: 'grad-sun' },
  'post-crise': { icon: 'heart', tone: 'grad-mint' },
  medicaments: { icon: 'pill', tone: 'grad-lilac' },
  consultation: { icon: 'user', tone: 'grad-peach' },
};
export const styleOf = (id: string) => cardStyle[id] ?? { icon: 'book' as IconName, tone: 'grad-sky' };
