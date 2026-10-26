// Exports CSV pour analyse perso (Excel, Numbers, Google Sheets).
// Séparateur « ; » et virgule décimale : ce qu'attend un tableur réglé en français.
import { auraTypes, crisisSymptoms, labelOf, sensoryExposure, warningSigns } from '../content/factors';
import type { Attack, AttackDayLog, DayEntry, Medication } from '../db/types';
import { hoursBetween } from './attacks';
import { attackMax } from './insights';

const BOM = '﻿';

function cell(v: unknown): string {
  if (v === undefined || v === null) return '';
  let s = typeof v === 'number' ? String(v).replace('.', ',') : typeof v === 'boolean' ? (v ? 'oui' : 'non') : String(v);
  if (/[;"\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return BOM + [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n') + '\r\n';
}

const dateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '');

export function daysCsv(days: DayEntry[]): string {
  const header = ['date', 'rempli après coup', 'sommeil (h)', 'qualité du sommeil (1-5)', 'stress (1-5)', 'énergie (1-5)', 'humeur (1-5)',
    'repas sauté ou décalé', 'hydratation', 'caféine', 'alcool', 'écrans', 'exposée à', 'effort physique', 'rythme chamboulé',
    'petits signaux', 'facteurs perso', 'mal de tête', 'température max (°C)', 'pression (hPa)', 'variation de pression (hPa)', 'humidité (%)', 'note'];
  const rows = [...days].sort((a, b) => a.date.localeCompare(b.date)).map((d) => [
    d.date, d.filledLate, d.sleepHours, d.sleepQuality, d.stress, d.energy, d.mood,
    d.mealsSkippedOrLate, d.hydration, d.caffeine, d.alcohol, d.screens,
    d.sensoryExposure?.map((x) => labelOf(sensoryExposure, x)).join(', '), d.physicalEffort, d.routineChange,
    d.warningSigns?.map((x) => labelOf(warningSigns, x)).join(', '),
    Object.entries(d.customFactors ?? {}).filter(([, v]) => v).map(([k]) => k).join(', '),
    d.headacheToday, d.weather?.tempMax, d.weather?.pressureMean, d.weather?.pressureDelta, d.weather?.humidity, d.note,
  ]);
  return toCsv(header, rows);
}

export function attacksCsv(attacks: Attack[], logs: AttackDayLog[]): string {
  const header = ['début', 'fin de la douleur', 'retour à 100 %', 'durée douleur (h)', 'durée post-crise (h)', 'intensité max (0-10)', 'aura', 'type d’aura', 'symptômes', 'statut', 'autre chose de suspect'];
  const rows = [...attacks].sort((a, b) => a.startAt.localeCompare(b.startAt)).map((a) => {
    const symptoms = [...new Set(logs.filter((l) => l.attackId === a.id).flatMap((l) => l.symptoms))];
    return [
      dateTime(a.startAt), dateTime(a.endAt), dateTime(a.recoveredAt), hoursBetween(a.startAt, a.endAt), hoursBetween(a.endAt, a.recoveredAt),
      attackMax(a, logs), a.hadAura, a.auraTypes?.map((x) => labelOf(auraTypes, x)).join(', '),
      symptoms.map((x) => labelOf(crisisSymptoms, x)).join(', '), a.status, a.investigation?.suspect,
    ];
  });
  return toCsv(header, rows);
}

export function medicationsCsv(meds: Medication[], attacks: Attack[]): string {
  const header = ['pris le', 'traitement', 'catégorie', 'efficacité après 2 h', 'crise du'];
  const rows = [...meds].sort((a, b) => a.takenAt.localeCompare(b.takenAt)).map((m) => [
    dateTime(m.takenAt), m.name, m.category, m.efficacyAfter2h, dateTime(attacks.find((a) => a.id === m.attackId)?.startAt),
  ]);
  return toCsv(header, rows);
}
