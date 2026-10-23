// Fiches informatives. Règle : uniquement des sources reconnues, paraphrasées, avec lien.
// Les autres fiches arrivent à l'étape 6.

export interface InfoCard {
  id: string;
  titre: string;
  corps: string[];          // paragraphes ou puces
  sourceLabel: string;
  sourceUrl: string;
  verifiedAt: string;
}

/** Fiche « Quand consulter en urgence » : accessible en 1 tap depuis le mode crise. Pas de mascotte. */
export const urgentCard: InfoCard & { call15: string[]; soon: string[]; soonDays: string[] } = {
  id: 'urgence',
  titre: 'Quand consulter en urgence',
  corps: ['Une crise de migraine habituelle ne demande pas d’aller aux urgences. Mais certains maux de tête doivent faire appeler les secours sans attendre.'],
  call15: [
    'Un mal de tête soudain et violent avec une faiblesse ou une paralysie brutale, des mouvements anormaux, du mal à parler ou une confusion',
    'Une douleur explosive, insupportable, au maximum dès la première seconde',
    'Un mal de tête avec vomissements, fièvre, nuque raide ou un état général qui se dégrade',
    'Un mal de tête brutal avec douleur dans un œil ou les deux et vision floue',
    'Un mal de tête après un choc violent à la tête',
  ],
  soon: [
    'Un mal de tête nouveau et intense',
    'Un mal de tête avec vomissements, douleurs musculaires, fatigue, troubles de la mémoire ou baisse de la vision',
  ],
  soonDays: [
    'Des maux de tête qui s’aggravent petit à petit sur des semaines',
    'Un mal de tête différent de ceux que tu connais',
    'Un mal de tête qui ne passe pas avec ton traitement habituel',
  ],
  sourceLabel: 'Ameli.fr (Assurance Maladie) — Maux de tête : quand consulter en urgence ?',
  sourceUrl: 'https://www.ameli.fr/assure/sante/themes/mal-tete/calmer-cas-faut-consulter',
  verifiedAt: 'octobre 2026',
};

/** Gestes de confort pendant une crise (non médicamenteux). */
export const comfortTips = {
  dark: { id: 'dark', emoji: '🌑', text: 'T’allonger dans une pièce calme et peu éclairée.' },
  cold: { id: 'cold', emoji: '🧊', text: 'Poser un linge froid sur ton front.' },
  water: { id: 'water', emoji: '💧', text: 'Boire de l’eau, par petites gorgées, surtout si tu as des nausées ou des vomissements.' },
  sourceLabel: 'Ameli.fr — Que faire et quand consulter en cas de migraine ?',
  sourceUrl: 'https://www.ameli.fr/assure/sante/themes/migraine/bons-reflexes-cas-faut-consulter',
  verifiedAt: 'octobre 2026',
};
