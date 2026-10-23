// Textes des notifications, choisis côté Worker. Génériques : aucune donnée personnelle hormis le prénom.
import type { Kind } from './schedule';

const variants: Record<Kind | 'test', string[]> = {
  soir: [
    'Petit point du soir ? 1 minute, promis juré.',
    'Ton journal a un peu faim 🥐 Tu lui racontes ta journée ?',
    '4 touches et c’est plié. Le canapé t’attend.',
    'Coucou {prenom} ! On range la journée dans mes rayures ?',
    'Une minute pour toi, et après : plaid.',
    'C’est l’heure de notre petit rendez-vous du soir 🌙',
    'Je suis prêt, crayon en patte ✏️ Et toi ?',
    'Comment s’est passée ta journée, {prenom} ?',
    'Petit point rapide ? Même les jours sans souci comptent.',
    'Hop, on note la journée et on file se reposer ?',
  ],
  'matin-suivi': [
    'Comment tu te sens ce matin ? Pas besoin d’en écrire beaucoup.',
    'Doucement ce matin. Dis-moi juste comment ça va.',
    'Bonjour {prenom}. Un mot sur ta nuit, si tu veux.',
    'Je suis là ce matin aussi. On note où tu en es ?',
  ],
  'relance-traitement': [
    'Ça va mieux depuis ton traitement ?',
    'Petite question douce : ça a aidé, ton traitement ?',
  ],
  recap: [
    'Ton récap du mois est prêt ✨',
    'Ta-da ! Le mois dernier en un coup d’œil ✨',
  ],
  sauvegarde: [
    'Petit rappel : une sauvegarde de ton journal, ça te dit ? 🔒',
    'Pense à mettre ton journal à l’abri : une sauvegarde prend 10 secondes.',
  ],
  test: ['Ça marche ! Tu recevras tes rappels ici 🐯'],
};

const urls: Record<Kind | 'test', string> = {
  soir: '#/checkin',
  'matin-suivi': '#/crise',
  'relance-traitement': '#/crise',
  recap: '#/mois',
  sauvegarde: '#/reglages',
  test: '#/',
};

export function buildMessage(kind: Kind | 'test', firstName: string, random = Math.random) {
  const list = variants[kind];
  const body = list[Math.floor(random() * list.length)].replaceAll('{prenom}', firstName);
  return { title: '🐯 Pépite', body, url: urls[kind], tag: kind };
}
