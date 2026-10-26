// Fiches informatives « Comprendre ma migraine ».
// Règle : uniquement des sources reconnues, paraphrasées (aucun texte copié), avec lien.
// Chaque information a été vérifiée sur la source citée en octobre 2026.

export interface InfoCard {
  id: string;
  titre: string;
  corps: string[];          // paragraphes ou puces
  sourceLabel: string;
  sourceUrl: string;
  verifiedAt: string;
}

const ICHD_GLOSSAIRE = 'https://ichd-3.org/definition-of-terms/';

export const infoCards: (InfoCard & { emoji: string; medical?: string })[] = [
  {
    id: 'phases',
    emoji: '🌗',
    titre: 'Les 4 phases d’une crise',
    corps: [
      'Une crise de migraine peut passer par quatre phases, mais tout le monde ne les vit pas toutes, ni à chaque fois.',
      'Les petits signaux d’avant : jusqu’à 48 h avant la douleur, on peut ressentir de la fatigue, une humeur qui change ou des fringales.',
      'L’aura, chez une partie des personnes seulement : des troubles de la vue ou des fourmillements, qui durent quelques dizaines de minutes (en général moins d’une heure) avant la douleur.',
      'La douleur : chez l’adulte, elle dure de 4 à 72 heures sans traitement efficace.',
      'La post-crise : jusqu’à 48 h après, une fatigue, une humeur en dents de scie ou du mal à se concentrer.',
    ],
    medical: 'prodrome, aura, céphalée, postdrome',
    sourceLabel: 'Classification internationale des céphalées (ICHD-3) — glossaire et migraine sans aura',
    sourceUrl: ICHD_GLOSSAIRE,
    verifiedAt: 'octobre 2026',
  },
  {
    id: 'signaux',
    emoji: '🥱',
    titre: 'Les petits signaux d’avant',
    corps: [
      'Avant la douleur, le corps envoie parfois de petits messages, quelques heures voire un ou deux jours avant.',
      'Les plus fréquents : bâillements à répétition, fatigue, envie de certains aliments, humeur changeante, nuque raide ou douloureuse, besoin de bouger ou au contraire de ne rien faire.',
      'Tout le monde n’en a pas, et ils ne sont pas toujours les mêmes d’une crise à l’autre.',
      'Les repérer dans ton journal peut t’aider à voir venir une crise et à t’organiser en douceur.',
    ],
    medical: 'prodrome, symptômes prémonitoires',
    sourceLabel: 'Classification internationale des céphalées (ICHD-3) — chapitre Migraine',
    sourceUrl: 'https://ichd-3.org/1-migraine/',
    verifiedAt: 'octobre 2026',
  },
  {
    id: 'aura',
    emoji: '✨',
    titre: 'L’aura, c’est quoi ?',
    corps: [
      'L’aura, ce sont des signes neurologiques passagers qui arrivent le plus souvent juste avant la douleur.',
      'Les troubles de la vue sont les plus fréquents : zigzags lumineux, points brillants, tache floue. Il peut aussi y avoir des picotements ou du mal à trouver ses mots.',
      'Elle dure le plus souvent de 30 minutes à 1 heure : chaque symptôme dure de 5 à 60 minutes, puis disparaît complètement.',
      'La migraine avec aura est environ trois fois moins fréquente que la migraine sans aura, et une même personne peut avoir des crises avec et sans aura.',
      'Si une aura ne ressemble pas à tes auras habituelles, ou ne disparaît pas complètement, parles-en à un médecin (et regarde la fiche urgence).',
    ],
    medical: 'migraine avec aura, « migraine ophtalmique »',
    sourceLabel: 'Ameli.fr — Migraine : symptômes, facteurs déclenchants et évolution ; ICHD-3 — 1.2 Migraine avec aura',
    sourceUrl: 'https://www.ameli.fr/assure/sante/themes/migraine/symptomes-facteurs-declenchants-evolution',
    verifiedAt: 'octobre 2026',
  },
  {
    id: 'declencheurs',
    emoji: '🔎',
    titre: 'Les « déclencheurs »',
    corps: [
      'On cite souvent le manque ou l’excès de sommeil, le stress ou au contraire le relâchement, les repas sautés, l’alcool, certaines odeurs ou lumières, les règles, ou une chute de la pression atmosphérique.',
      'Mais ces facteurs varient beaucoup d’une personne à l’autre, et les preuves scientifiques sont inégales.',
      'Piège classique : une envie de chocolat peut être un signal d’avant la crise. On mange du chocolat, la crise arrive, et on accuse le chocolat alors que la crise avait déjà commencé.',
      'C’est tout l’intérêt de ton journal : repérer ce qui revient chez toi, sans conclusion hâtive.',
    ],
    medical: 'facteurs déclenchants, phase prémonitoire',
    sourceLabel: 'Ameli.fr (facteurs déclenchants) et American Migraine Foundation (déclencheurs ou phase d’avant ?)',
    sourceUrl: 'https://americanmigrainefoundation.org/resource-library/the-science-behind-migraine-triggers/',
    verifiedAt: 'octobre 2026',
  },
  {
    id: 'post-crise',
    emoji: '🛋️',
    titre: 'La phase post-crise',
    corps: [
      'Quand la douleur s’en va, la crise n’est pas toujours tout à fait finie.',
      'Pendant parfois jusqu’à 48 heures, on peut se sentir épuisée, avoir du mal à se concentrer, ou avoir une humeur basse… ou étonnamment joyeuse.',
      'C’est normal : cette « gueule de bois » fait partie de la crise.',
      'L’idéal est de s’accorder du repos sans culpabiliser, et de noter quand tu te sens revenue à 100 %.',
    ],
    medical: 'postdrome',
    sourceLabel: 'Classification internationale des céphalées (ICHD-3) — glossaire ; Ameli.fr',
    sourceUrl: ICHD_GLOSSAIRE,
    verifiedAt: 'octobre 2026',
  },
  {
    id: 'medicaments',
    emoji: '💊',
    titre: 'Trop de médicaments peut entretenir les maux de tête',
    corps: [
      'Prendre très souvent des médicaments contre la crise peut, à la longue, entretenir des maux de tête presque quotidiens.',
      'Le repère des médecins : un risque quand, pendant plus de 3 mois, on prend des antalgiques simples (paracétamol, aspirine, anti-inflammatoires) au moins 15 jours par mois, ou des triptans, des associations ou des opioïdes au moins 10 jours par mois.',
      'C’est le nombre de jours de prise qui compte, pas le nombre de comprimés.',
      'L’Assurance Maladie conseille de compter ses jours de prise, de ne pas dépasser 8 jours par mois, et d’en informer son médecin.',
      'Surtout, n’arrête rien seule : parles-en à ton médecin, il saura t’accompagner.',
    ],
    medical: 'céphalée par abus médicamenteux',
    sourceLabel: 'Classification internationale des céphalées (ICHD-3) — 8.2 ; Ameli.fr — consultation et traitement',
    sourceUrl: 'https://ichd-3.org/8-headache-attributed-to-a-substance-or-its-withdrawal/8-2-medication-overuse-headache-moh/',
    verifiedAt: 'octobre 2026',
  },
  {
    id: 'consultation',
    emoji: '🩺',
    titre: 'Préparer ta consultation',
    corps: [
      'Le médecin s’appuie surtout sur le récit de tes crises et sur leur évolution.',
      'Ce qui l’aide : la date et l’heure des crises, leur durée, leur intensité, ce qui les a peut-être déclenchées (et la date des règles le cas échéant), leur retentissement sur ta vie, et les médicaments pris avec leur effet.',
      'Pour juger d’un traitement de fond, il compare souvent le nombre de crises avant et après quelques mois.',
      'Bonne nouvelle : ton journal note déjà tout ça. Pense à apporter ton export.',
    ],
    sourceLabel: 'Ameli.fr — Migraine : consultation médicale et traitement',
    sourceUrl: 'https://www.ameli.fr/assure/sante/themes/migraine/diagnostic-traitement',
    verifiedAt: 'octobre 2026',
  },
];

export const findCard = (id: string) => infoCards.find((c) => c.id === id);

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
