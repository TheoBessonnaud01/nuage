// TOUS les textes de l'interface. Modifie librement : le code ne contient aucun texte en dur.
// {prenom} est remplacé par le prénom réglé dans l'app.

export const copy = {
  common: {
    back: 'Retour',
    skip: 'Passer',
    next: 'Suivant',
    save: 'Enregistrer',
    close: 'Fermer',
    soon: 'Bientôt ici 🌱',
    soonBody: 'Cette partie arrive dans une prochaine étape. Merci de ta patience !',
  },
  home: {
    title: 'Accueil',
    greetingMorning: 'Bonjour {prenom} ☀️',
    greetingAfternoon: 'Coucou {prenom} 🌤️',
    greetingEvening: 'Bonsoir {prenom} 🌙',
    dailyCardTitle: 'Mon point du jour',
    dailyCardTodo: '1 minute, promis juré.',
    dailyCardDone: 'C’est fait ✓ Merci pour toi.',
    migraineButton: '🌧️ J’ai une migraine',
    nav: {
      calendar: 'Calendrier',
      months: 'Mes mois',
      info: 'Comprendre',
      settings: 'Réglages',
    },
  },
  onboarding: {
    next: 'Suivant',
    start: 'C’est parti !',
    later: 'Plus tard',
    step: 'Étape {n} sur 4',
    s1Title: 'Coucou {prenom} 👋',
    s1Body: 'Moi c’est {mascotte}, le petit tigre de {app}. Je suis là pour t’aider à y voir plus clair dans tes migraines.',
    s2Title: 'Comment ça marche',
    s2Items: [
      { icon: '📝', title: 'Le point du jour', body: '1 minute le soir, même quand tout va bien.' },
      { icon: '🌧️', title: 'Le bouton migraine', body: 'Pour suivre une crise du début à la fin, sans effort.' },
      { icon: '🔎', title: 'Tes analyses', body: 'Elles se débloquent au fil des jours notés.' },
    ],
    s3Title: 'Tout reste chez toi 🔒',
    s3Body: 'Tout reste sur ton téléphone. Personne d’autre ne voit tes réponses. Pense juste à faire une sauvegarde de temps en temps.',
    s4Title: 'Installe-moi sur ton écran d’accueil',
    s4Installed: 'Je suis déjà installé ✓ Tu m’ouvres depuis mon icône, parfait.',
    s4Ios: [
      'Ouvre cette page dans Safari.',
      'Touche le bouton Partager (le carré avec une flèche vers le haut).',
      'Choisis « Sur l’écran d’accueil », puis « Ajouter ».',
      'Ouvre-moi ensuite depuis mon icône 🐯',
    ],
    s4AndroidButton: 'Installer l’app',
    s4AndroidManual: 'Dans Chrome, ouvre le menu ⋮ puis « Installer l’application ».',
    s4Other: 'Ouvre cette page sur ton téléphone (Safari sur iPhone, Chrome sur Android) pour m’installer.',
    s4Reminders: 'Les rappels du soir arrivent bientôt : tu pourras les activer dans les Réglages.',
  },
  settings: {
    title: 'Réglages',
    mascot: 'Pépite',
    mascotOptions: { normal: 'Normal', discret: 'Discret', 'masqué': 'Masqué' },
    mascotHelp: 'Discret : plus petit, et il ne parle que sur l’accueil et pour les grandes occasions.',
    replayOnboarding: 'Revoir la présentation',
    theme: 'Thème',
    themeOptions: { auto: 'Auto', clair: 'Clair', sombre: 'Sombre' },
    storage: 'Stockage protégé',
    storageOn: 'Oui, ton téléphone garde tes données précieusement.',
    storageOff: 'Pas encore. Installe l’app sur l’écran d’accueil pour mieux la protéger.',
    version: 'Version',
    disclaimer:
      'Nuage t’aide à observer tes migraines et à préparer tes rendez-vous. Ce n’est pas un dispositif médical : il ne pose pas de diagnostic et ne recommande aucun traitement.',
  },
} as const;

export function withName(text: string, firstName: string): string {
  return text.replaceAll('{prenom}', firstName);
}
