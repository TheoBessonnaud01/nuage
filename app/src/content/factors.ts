// Listes par défaut. Chaque élément a un id STABLE (ne jamais le changer : il est stocké dans les données).
// Libellés, émojis et info-bulles modifiables librement.

export interface ListItem {
  id: string;
  label: string;
  emoji?: string;
  tip?: string;
}

/** Facteurs observés (check-in, enquête, analyses). */
export const factors: ListItem[] = [
  { id: 'sommeil-manque', label: 'Manque ou excès de sommeil', emoji: '🛌', tip: 'Dormir nettement moins, ou plus, que d’habitude.' },
  { id: 'sommeil-qualite', label: 'Sommeil de mauvaise qualité', emoji: '😵‍💫', tip: 'Nuit agitée, réveils, sommeil pas réparateur.' },
  { id: 'stress', label: 'Stress élevé', emoji: '🌪️', tip: 'Journée tendue, contrariété, pression.' },
  { id: 'detente', label: 'Détente après un stress', emoji: '🏖️', tip: 'Le fameux « effet week-end » : la pression retombe.' },
  { id: 'repas', label: 'Repas sauté ou décalé', emoji: '🍽️', tip: 'Un repas oublié, ou pris bien plus tard que d’habitude.' },
  { id: 'peu-bu', label: 'Peu bu', emoji: '💧', tip: 'Pas beaucoup d’eau dans la journée.' },
  { id: 'alcool', label: 'Alcool', emoji: '🍷' },
  { id: 'cafeine-plus', label: 'Caféine plus que d’habitude', emoji: '☕' },
  { id: 'cafeine-moins', label: 'Caféine moins que d’habitude', emoji: '🫖', tip: 'Le manque de café peut aussi compter.' },
  { id: 'ecrans', label: 'Beaucoup d’écrans', emoji: '📱' },
  { id: 'lumiere', label: 'Lumière forte / néons', emoji: '💡' },
  { id: 'bruit', label: 'Bruit', emoji: '🔊' },
  { id: 'odeurs', label: 'Odeurs fortes (parfum, fumée)', emoji: '👃' },
  { id: 'effort', label: 'Effort physique intense', emoji: '🏃‍♀️' },
  { id: 'voyage', label: 'Voyage / décalage horaire', emoji: '✈️', tip: 'Voyage, décalage horaire, grasse matinée : un rythme qui change.' },
  { id: 'meteo', label: 'Changement de météo', emoji: '🌦️' },
  { id: 'chaleur', label: 'Chaleur', emoji: '🥵' },
];

/** Exposition sensorielle (question du check-in). Sous-ensemble des facteurs. */
export const sensoryExposure: ListItem[] = factors.filter((f) => ['lumiere', 'bruit', 'odeurs'].includes(f.id));

/** Les petits signaux d'avant (prodrome). */
export const warningSigns: ListItem[] = [
  { id: 'baillements', label: 'Bâillements répétés', emoji: '🥱', tip: 'Bâiller encore et encore, sans être spécialement fatiguée.' },
  { id: 'fatigue', label: 'Fatigue inhabituelle', emoji: '🔋', tip: 'Une fatigue qui ne ressemble pas à ta fatigue habituelle.' },
  { id: 'fringales', label: 'Fringales / envie de sucré', emoji: '🍫', tip: 'Envie soudaine de grignoter, souvent du sucré.' },
  { id: 'appetit', label: 'Perte d’appétit', emoji: '🥄' },
  { id: 'irritabilite', label: 'Irritabilité', emoji: '😤', tip: 'Tout t’agace un peu plus vite que d’habitude.' },
  { id: 'humeur', label: 'Humeur changeante', emoji: '🎭' },
  { id: 'concentration', label: 'Difficulté à se concentrer', emoji: '🧩' },
  { id: 'nuque', label: 'Nuque raide', emoji: '🦒', tip: 'Nuque tendue ou douloureuse.' },
  { id: 'sensibilite', label: 'Sensibilité à la lumière, au bruit ou aux odeurs', emoji: '🌟', tip: 'La lumière, le bruit ou les odeurs te gênent plus que d’habitude.' },
  { id: 'soif', label: 'Soif inhabituelle', emoji: '🥤' },
  { id: 'urine', label: 'Envie fréquente d’uriner', emoji: '🚻' },
];

/** Aura. */
export const auraTypes: ListItem[] = [
  { id: 'visuelle', label: 'Troubles visuels', emoji: '✨', tip: 'Zigzags, points lumineux, tache aveugle…' },
  { id: 'fourmillements', label: 'Fourmillements / engourdissement', emoji: '🖐️' },
  { id: 'parole', label: 'Difficulté à parler', emoji: '💬' },
];

/** Symptômes de crise. */
export const crisisSymptoms: ListItem[] = [
  { id: 'nausees', label: 'Nausées', emoji: '🤢' },
  { id: 'vomissements', label: 'Vomissements', emoji: '🤮' },
  { id: 'lumiere', label: 'Gêne à la lumière', emoji: '😎' },
  { id: 'bruit', label: 'Gêne au bruit', emoji: '🔇' },
  { id: 'odeurs', label: 'Gêne aux odeurs', emoji: '👃' },
  { id: 'vertiges', label: 'Vertiges', emoji: '💫' },
  { id: 'mouvement', label: 'Douleur aggravée par le mouvement', emoji: '🚶‍♀️' },
  { id: 'fatigue', label: 'Fatigue', emoji: '🔋' },
  { id: 'concentration', label: 'Difficulté à se concentrer', emoji: '🧩' },
];

/** Post-crise. */
export const postdromeSymptoms: ListItem[] = [
  { id: 'epuisement', label: 'Épuisement', emoji: '🔋' },
  { id: 'brouillard', label: 'Brouillard mental', emoji: '🌫️' },
  { id: 'sensibilite', label: 'Sensibilité résiduelle à la lumière / au bruit', emoji: '🌟' },
  { id: 'nuque', label: 'Nuque raide', emoji: '🦒' },
  { id: 'humeur-basse', label: 'Humeur basse', emoji: '🌧️' },
  { id: 'euphorie', label: 'Euphorie', emoji: '🌈' },
  { id: 'faim', label: 'Faim', emoji: '🍞' },
  { id: 'douleur-mouvement', label: 'Douleur résiduelle au mouvement', emoji: '🚶‍♀️' },
];

export function labelOf(list: ListItem[], id: string): string {
  return list.find((i) => i.id === id)?.label ?? id;
}
