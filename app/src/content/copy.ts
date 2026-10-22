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
  settings: {
    title: 'Réglages',
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
