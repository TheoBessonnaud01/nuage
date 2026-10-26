// PDF générés sur le téléphone (jamais envoyés à un serveur). Chargé à la demande (import dynamique).
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { auraTypes, efficacyLevels, labelOf, medicationCategories } from '../content/factors';
import type { Medication } from '../db/types';
import { formatDuration, hoursBetween } from './attacks';
import { addMonths, formatDayLong, formatMonth, localDay, monthOf } from './dates';
import {
  attackMax, factorsBeforeAttacks, keyFigures, symptomStats, warningSignsBefore, type InsightsData, type Range,
} from './insights';
import { compare, type CoreStats, type RecapData } from './recap';

const MENTION = 'Journal tenu par la patiente - observations, pas un diagnostic.';
const INK: [number, number, number] = [40, 44, 48];
const MUTED: [number, number, number] = [110, 116, 120];
const SAGE: [number, number, number] = [84, 112, 86];

/** Les polices standard des PDF ne connaissent que l'alphabet latin de base : on remplace le reste. */
export function pdfText(s: string): string {
  return s
    .replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/[–—]/g, '-')
    .replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/[  ]/g, ' ')
    .replace(/↑/g, '+').replace(/↓/g, '-').replace(/[^\u0000-ÿ]/g, '').replace(/\s{2,}/g, ' ').trim();
}

const dt = (iso?: string) => (iso ? new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-');
const hm = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const num = (x: number | null) => (x === null ? '-' : String(x).replace('.', ','));

function header(doc: jsPDF, title: string, subtitle: string) {
  doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(...INK).text(pdfText(title), 15, 20);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...MUTED).text(pdfText(subtitle), 15, 27);
  doc.setDrawColor(...SAGE).setLineWidth(0.6).line(15, 31, 195, 31);
}

function section(doc: jsPDF, y: number, title: string): number {
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...SAGE).text(pdfText(title), 15, y);
  return y + 3;
}

function paragraph(doc: jsPDF, y: number, lines: string[], size = 10): number {
  doc.setFont('helvetica', 'normal').setFontSize(size).setTextColor(...INK);
  for (const l of lines) {
    const wrapped = doc.splitTextToSize(pdfText(l), 180) as string[];
    if (y + wrapped.length * 5 > 280) { doc.addPage(); y = 20; }
    doc.text(wrapped, 15, y + 4);
    y += wrapped.length * 5;
  }
  return y + 2;
}

function footer(doc: jsPDF) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic').setFontSize(8).setTextColor(...MUTED);
    doc.text(pdfText(`${MENTION}  Nuage`), 15, 290);
    doc.text(`${i} / ${n}`, 195, 290, { align: 'right' });
  }
}

const lastY = (doc: jsPDF) => (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
const tableStyle = {
  theme: 'grid' as const,
  styles: { font: 'helvetica', fontSize: 9, textColor: INK, cellPadding: 1.8, lineColor: [220, 220, 215] as [number, number, number] },
  headStyles: { fillColor: [235, 240, 233] as [number, number, number], textColor: INK, fontStyle: 'bold' as const },
  margin: { left: 15, right: 15 },
};

const medGroup = (c: Medication['category']) =>
  c === 'antalgique simple' || c === 'anti-inflammatoire' ? 'simple' : c === 'triptan' || c === 'association' ? 'specific' : 'autre';

/** PDF « Pour mon médecin » sur une période. */
export function doctorPdf(data: InsightsData, firstName: string, range: Range): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  header(doc, `Journal de migraines - ${firstName}`, `Période : du ${formatDayLong(range.start)} au ${formatDayLong(range.end)} · généré le ${formatDayLong(localDay())}`);

  const k = keyFigures(data, range);
  let y = section(doc, 40, 'Chiffres clés');
  autoTable(doc, {
    ...tableStyle, startY: y,
    body: [
      ['Crises', String(k.attacks), 'Jours de migraine / mois', num(k.migraineDaysPerMonth)],
      ['Durée moyenne de la douleur', formatDuration(k.avgPainHours), 'Durée moyenne de la post-crise', formatDuration(k.avgPostHours)],
      ['Intensité moyenne (max) sur 10', k.avgIntensity === null ? '-' : `${num(k.avgIntensity)} (${k.maxIntensity})`, 'Crises avec aura', k.auraPercent === null ? '-' : `${k.auraPercent} %`],
      ['Jours notés dans le journal', String(k.filledDays), '', ''],
    ].map((r) => r.map(pdfText)),
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } },
  });

  const attacks = data.attacks.filter((a) => { const d = localDay(new Date(a.startAt)); return d >= range.start && d <= range.end; })
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  y = section(doc, lastY(doc) + 10, 'Crises');
  autoTable(doc, {
    ...tableStyle, startY: y,
    head: [['Début', 'Douleur', 'Post-crise', 'Intensité max', 'Aura', 'Traitements (efficacité à 2 h)']],
    body: attacks.length ? attacks.map((a) => {
      const meds = data.meds.filter((m) => m.attackId === a.id).sort((x, z) => x.takenAt.localeCompare(z.takenAt));
      const aura = a.hadAura === 'oui' ? `oui${a.auraTypes?.length ? ` (${a.auraTypes.map((t) => labelOf(auraTypes, t).toLowerCase()).join(', ')})` : ''}` : a.hadAura;
      return [
        dt(a.startAt), formatDuration(hoursBetween(a.startAt, a.endAt)), formatDuration(hoursBetween(a.endAt, a.recoveredAt)),
        attackMax(a, data.logs) === null ? '-' : `${attackMax(a, data.logs)}/10`, aura,
        meds.length ? meds.map((m) => `${m.name} ${hm(m.takenAt)} : ${efficacyLevels.find((e) => e.value === m.efficacyAfter2h)?.label.toLowerCase() ?? 'non notée'}`).join('\n') : '-',
      ].map(pdfText);
    }) : [[pdfText('Aucune crise sur la période.'), '', '', '', '', '']],
    columnStyles: { 5: { cellWidth: 62 } },
  });

  // Jours de traitement par mois
  // Mois de la période, à partir du premier mois qui contient des notes
  const firstData = [...data.entries.map((e) => e.date), ...data.attacks.map((a) => localDay(new Date(a.startAt)))].filter((d) => d >= range.start).sort()[0];
  const months: string[] = [];
  for (let m = monthOf(firstData ?? range.start); m <= monthOf(range.end); m = addMonths(m, 1)) months.push(m);
  y = section(doc, lastY(doc) + 10, 'Jours de traitement par mois');
  autoTable(doc, {
    ...tableStyle, startY: y,
    head: [['Mois', 'Antalgiques simples / anti-inflammatoires', 'Triptans / associations', 'Autres']].map((r) => r.map(pdfText)),
    body: months.map((m) => {
      const days = (g: string) => new Set(data.meds.filter((x) => medGroup(x.category) === g && localDay(new Date(x.takenAt)).startsWith(m)).map((x) => localDay(new Date(x.takenAt)))).size;
      return [formatMonth(m), String(days('simple')), String(days('specific')), String(days('autre'))].map(pdfText);
    }),
  });

  // Facteurs, signes, symptômes
  y = section(doc, lastY(doc) + 10, 'Ce qui revient avant les crises (2 jours avant vs autres jours)');
  const fs = factorsBeforeAttacks(data, range).filter((f) => f.level === 'plus' && f.before > 0).slice(0, 6);
  y = paragraph(doc, y, fs.length
    ? fs.map((f) => `- ${f.label} : ${f.before} veille(s) de crise sur ${f.beforeKnown} (${Math.round(f.pBefore * 100)} %), contre ${Math.round(f.pOther * 100)} % des autres jours.`)
    : ['Pas assez d’observations pour dégager une tendance.']);
  const ws = warningSignsBefore(data, range);
  y = section(doc, y + 4, 'Signes avant-coureurs (prodrome)');
  y = paragraph(doc, y, ws.signs.length
    ? [...ws.signs.slice(0, 5).map((s) => `- ${s.label} : ${s.attacks} crise(s) sur ${ws.attacks}`), ws.avgDelayDays !== null ? `Délai moyen avant la crise : ${num(ws.avgDelayDays)} jour(s).` : '']
    : ['Aucun signe avant-coureur noté sur la période.']);
  const ss = symptomStats(data, range);
  y = section(doc, y + 4, 'Symptômes les plus fréquents');
  paragraph(doc, y, [
    `Pendant la crise : ${ss.crisis.slice(0, 5).map((s) => `${s.label} (${s.percent} %)`).join(', ') || '-'}`,
    `Après (post-crise) : ${ss.post.slice(0, 5).map((s) => `${s.label} (${s.percent} %)`).join(', ') || '-'}`,
    'Les associations observées sont des coïncidences, pas des causes établies.',
  ]);

  footer(doc);
  return doc.output('blob');
}

const catLabel = (c: string) => medicationCategories.find((m) => m.value === c)?.label ?? c;
const cmpLabel = (now: number | null, ref: number | null | undefined) => {
  if (ref === undefined) return '-';
  const c = compare(now, ref);
  return c === 'plus' ? 'plus' : c === 'moins' ? 'moins' : c === 'stable' ? 'stable' : '-';
};

/** Récap mensuel sur une page A4, lisible par un médecin. */
export function recapPdf(r: RecapData, firstName: string): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  header(doc, `Récap de ${formatMonth(r.month)} - ${firstName}`, `Jours notés : ${r.core.filledDays}${r.tier ? ` · palier ${r.tier.label}` : ''}`);
  const rows: [string, keyof CoreStats, (v: number | null) => string][] = [
    ['Crises', 'attacks', num], ['Jours de migraine', 'migraineDays', num],
    ['Intensité moyenne (sur 10)', 'avgIntensity', num], ['Durée moyenne de la douleur', 'avgPainHours', formatDuration],
    ['Durée moyenne de la post-crise', 'avgPostHours', formatDuration],
  ];
  autoTable(doc, {
    ...tableStyle, startY: 38,
    head: [['', 'Ce mois', 'vs mois précédent', 'vs moyenne 3 mois']].map((x) => x.map(pdfText)),
    body: rows.map(([l, key, f]) => [l, f(r.core[key]), cmpLabel(r.core[key], r.prev ? r.prev[key] : undefined), cmpLabel(r.core[key], r.avg3 ? r.avg3[key] : undefined)].map(pdfText)),
    columnStyles: { 0: { fontStyle: 'bold' } },
  });
  let y = lastY(doc) + 8;
  y = paragraph(doc, y, [
    `Avant les crises : ${r.topFactors.join(', ') || '-'}`,
    `Signes avant-coureurs : ${r.topSigns.join(', ') || '-'}`,
    `Post-crise : ${r.topPostdrome.join(', ') || '-'}`,
    `Jours de traitement : ${r.medDaysByCategory.map((m) => `${catLabel(m.category)} ${m.days} j`).join(', ') || '-'}`,
  ]);

  // Mini calendrier
  y = section(doc, y + 4, 'Le mois en un coup d’oeil') + 4;
  const fill = (kind: string, intensity: number | null): [number, number, number] =>
    kind === 'crise' ? (intensity !== null && intensity >= 7 ? [150, 135, 200] : [197, 186, 224])
      : kind === 'post-crise' ? [196, 222, 238] : kind === 'signaux' ? [244, 196, 170] : kind === 'rempli' ? [196, 214, 196] : [255, 255, 255];
  const cell = 10;
  ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((w, i) => doc.setFontSize(8).setTextColor(...MUTED).text(w, 15 + i * cell + cell / 2, y, { align: 'center' }));
  const first = (new Date(`${r.calendar[0].date}T12:00:00Z`).getUTCDay() + 6) % 7;
  r.calendar.forEach((c, i) => {
    const pos = first + i;
    const x = 15 + (pos % 7) * cell;
    const yy = y + 2 + Math.floor(pos / 7) * cell;
    doc.setFillColor(...fill(c.kind, c.intensity)).setDrawColor(210, 210, 205).rect(x, yy, cell - 1, cell - 1, 'FD');
    doc.setFontSize(8).setTextColor(...INK).text(String(Number(c.date.slice(8))), x + (cell - 1) / 2, yy + 6, { align: 'center' });
  });
  const legend: [string, [number, number, number]][] = [['notée', [196, 214, 196]], ['petits signaux', [244, 196, 170]], ['crise', [197, 186, 224]], ['crise forte (7+)', [150, 135, 200]], ['post-crise', [196, 222, 238]]];
  legend.forEach(([l, c], i) => {
    const ly = y + 4 + i * 7;
    doc.setFillColor(...c).rect(95, ly, 5, 5, 'F');
    doc.setFontSize(9).setTextColor(...INK).text(pdfText(l), 102, ly + 4);
  });

  footer(doc);
  return doc.output('blob');
}
