import { localDay, localHour } from '../lib/dates';
import type { Mood } from './moods';
import type { LineContext } from './lines';

export interface MoodContext {
  now: Date;
  attackStatus?: 'en cours' | 'post-crise' | null;
  attackStartedAt?: string | null;
  investigating?: boolean;
  pendingCelebration?: 'palier' | 'recap' | null;
  previousOpenedAt?: string | null; // ouverture précédente (avant celle-ci)
  checkinDoneAt?: string | null;    // check-in du jour, s'il existe
}

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

export function isNight(now: Date): boolean {
  const h = localHour(now);
  return h >= 23 || h < 6;
}

export function isReturning(ctx: MoodContext): boolean {
  if (!ctx.previousOpenedAt) return false;
  return ctx.now.getTime() - new Date(ctx.previousOpenedAt).getTime() >= 5 * DAY;
}

function checkinJustDone(ctx: MoodContext): boolean {
  if (!ctx.checkinDoneAt) return false;
  const diff = ctx.now.getTime() - new Date(ctx.checkinDoneAt).getTime();
  return diff >= 0 && diff < HOUR;
}

/**
 * État de Pépite selon le contexte. Priorité :
 * crise > post-crise > enquête > célébration > nuit > retrouvailles > check-in fait (1 h) > joyeux.
 * Pépite n'est jamais triste à cause de Noémie : aucune branche « absence » négative.
 */
export function getMood(ctx: MoodContext): Mood {
  if (ctx.attackStatus === 'en cours') return 'calin';
  if (ctx.attackStatus === 'post-crise') return 'fatigue';
  if (ctx.investigating) return 'detective';
  if (ctx.pendingCelebration) return 'fete';
  if (isNight(ctx.now)) return 'dort';
  if (isReturning(ctx)) return 'retrouvailles';
  if (checkinJustDone(ctx)) return 'fier';
  return 'joyeux';
}

/** Contexte de réplique pour la bulle d'accueil (suit la même priorité que getMood). */
export function homeLineContext(ctx: MoodContext): LineContext {
  const mood = getMood(ctx);
  const hour = localHour(ctx.now);
  switch (mood) {
    case 'calin': {
      const startedBeforeToday = ctx.attackStartedAt && localDay(new Date(ctx.attackStartedAt)) < localDay(ctx.now);
      return startedBeforeToday && hour < 12 ? 'matinCrise' : 'criseEnCours';
    }
    case 'fatigue': return 'postCrise';
    case 'detective': return 'enquete';
    case 'fete': return ctx.pendingCelebration === 'recap' ? 'recap' : 'palier';
    case 'dort': return 'nuit';
    case 'retrouvailles': return 'retrouvailles';
    case 'fier': return 'checkinFini';
    default:
      if (hour < 12) return 'accueilMatin';
      if (hour < 18) return 'accueilApresMidi';
      return 'accueilSoir';
  }
}
