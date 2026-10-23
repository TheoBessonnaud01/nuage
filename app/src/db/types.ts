export type Scale5 = 1 | 2 | 3 | 4 | 5;

export interface Weather {
  tempMax: number;
  pressureMean: number;
  pressureDelta: number;
  humidity: number;
}

export interface DayEntry {
  date: string; // YYYY-MM-DD (jour local Europe/Paris), clé primaire
  createdAt: string;
  updatedAt: string;
  filledLate: boolean;
  sleepHours?: number;
  sleepQuality?: Scale5;
  stress?: Scale5;
  energy?: Scale5;
  mood?: Scale5;
  mealsSkippedOrLate?: boolean;
  hydration?: 'peu' | 'moyen' | 'bien';
  caffeine?: 'aucune' | 'habituelle' | 'plus' | 'moins';
  alcohol?: boolean;
  screens?: 'peu' | 'normal' | 'beaucoup';
  sensoryExposure?: string[];
  physicalEffort?: 'aucun' | 'modéré' | 'intense';
  routineChange?: boolean;
  warningSigns?: string[];
  customFactors?: Record<string, boolean>;
  weather?: Weather;
  note?: string;
  headacheToday?: 'non' | 'léger mal de tête' | 'migraine';
}

export interface InvestigationAnswers {
  /** Jours explorés (veille, avant-veille) : les réponses vont dans leurs check-ins (DayEntry). */
  days?: string[];
  /** « Autre chose qui te semble suspect ? » */
  suspect?: string;
  doneAt?: string;
}

export interface Attack {
  id: string;
  startAt: string;
  endAt?: string;
  recoveredAt?: string;
  hadAura: 'oui' | 'non' | 'je ne sais pas';
  auraTypes?: string[];
  investigation: InvestigationAnswers;
  status: 'en cours' | 'post-crise' | 'terminée';
}

export interface AttackDayLog {
  id: string;
  attackId: string;
  date: string;
  time: string;
  intensity?: number; // 0..10 (facultatif : tout peut être passé)
  locations: string[];
  painType: string[];
  symptoms: string[];
  worsenedBy: string[];
  relievedBy: string[];
  functional?: 'normale' | 'ralentie' | 'au lit';
  note?: string;
}

export interface Medication {
  id: string;
  attackId?: string;
  takenAt: string;
  name: string;
  category: 'antalgique simple' | 'anti-inflammatoire' | 'triptan' | 'association' | 'autre';
  efficacyAfter2h?: 'aucune' | 'un peu' | 'bien' | 'totalement';
}

export interface PostdromeLog {
  id: string;
  attackId: string;
  date: string;
  symptoms: string[];
  percentBack: number; // 0..100
  note?: string;
}

// Détaillé à l'étape 5
export type MonthlyRecapData = Record<string, unknown>;

export interface MonthlyRecap {
  month: string; // YYYY-MM
  generatedAt: string;
  data: MonthlyRecapData;
  seen: boolean;
}

export interface CustomLists {
  factors: string[];
  symptoms: string[];
  warningSigns: string[];
  postdromeSymptoms: string[];
  medications: string[];
}

export interface MedicationDef {
  name: string;
  category: Medication['category'];
}

export interface Settings {
  firstName: string;
  reminderTime: string;
  silentDays: number[]; // 0 = dimanche … 6 = samedi
  theme: 'auto' | 'clair' | 'sombre';
  mascotMode: 'normal' | 'discret' | 'masqué';
  weatherEnabled: boolean;
  location?: { lat: number; lon: number; label: string };
  customLists: CustomLists;
  hiddenDefaults: string[];
  pushSubscribed: boolean;
  installId: string;
  onboardingDone: boolean;
  lastBackupAt?: string;
  lastOpenedAt?: string;
  medicationCatalog?: MedicationDef[]; // traitements de Noémie (nom + catégorie), vide par défaut
  maxTier?: number;          // meilleur palier d'objectif atteint (on ne redescend jamais)
  celebratedTier?: number;   // dernier palier fêté
}
