// Réglages « de fabrication » de l'app. Modifiables sans toucher au reste du code.
export const config = {
  appName: 'Nuage',
  mascotName: 'Pépite',
  firstName: 'Noémie',
  defaultReminderTime: '20:30',
  timeZone: 'Europe/Paris',
  // Renseignés à l'étape 4 (notifications)
  workerUrl: '',
  vapidPublicKey: '',
  sharedSecret: '',
} as const;
