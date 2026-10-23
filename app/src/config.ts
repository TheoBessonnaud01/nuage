// Réglages « de fabrication » de l'app. Modifiables sans toucher au reste du code.
export const config = {
  appName: 'Nuage',
  mascotName: 'Pépite',
  firstName: 'Noémie',
  defaultReminderTime: '20:30',
  timeZone: 'Europe/Paris',
  // Notifications (étape 4). L'adresse du Worker est affichée par « npx wrangler deploy ».
  // En développement, on peut viser un Worker local avec VITE_WORKER_URL (fichier .env.local).
  workerUrl: (import.meta.env.DEV && import.meta.env.VITE_WORKER_URL) || '',
  // Clé publique VAPID (pas secrète). Générée par « npm run vapid » dans worker/.
  vapidPublicKey: 'BKEy0b3_t8cCY-dGIlSg29Tz_Y9xAHM1NFvZ9f8dLV83vyf7zwUr_7MCok_lVPKLWB9ps3ZPUv9w_tSipe_ZN8c',
  // « Petite protection » contre les appels anonymes. Visible dans le code publié : ce n'est pas un vrai secret.
  sharedSecret: '4WqVYeEJqOFRblSn2EbYdDPhNmchex2Y',
} as const;
