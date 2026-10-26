# Nuage 🐯 — le journal de migraines de Noémie

Nuage est une application web installable (PWA) : on l'ouvre depuis l'écran d'accueil du téléphone comme une vraie app, sans passer par l'App Store ni le Play Store.

- **Adresse de l'app** : https://theobessonnaud01.github.io/nuage/
- **Code** : https://github.com/TheoBessonnaud01/nuage
- **Serveur de notifications** : https://nuage-notifications.bessonnaudtheo.workers.dev (Cloudflare)

> **Confidentialité.** Toutes les réponses de Noémie restent sur son téléphone. Seules deux choses partent sur Internet, et seulement si elle les active : une position approximative (≈ 1 km) vers le service météo Open-Meteo, et l'heure de son rappel vers le serveur de notifications. Aucune donnée de santé n'est envoyée nulle part.

> **Avertissement.** Nuage n'est pas un dispositif médical : il aide à observer et à préparer une consultation, il ne pose pas de diagnostic et ne recommande aucun traitement.

---

## Sommaire

1. [Installer l'app sur un téléphone](#1-installer-lapp-sur-un-téléphone)
2. [Activer et tester les notifications](#2-activer-et-tester-les-notifications)
3. [Sauvegarder et restaurer le journal (pour Noémie)](#3-sauvegarder-et-restaurer-le-journal-pour-noémie)
4. [Ce qu'il te faut sur l'ordinateur](#4-ce-quil-te-faut-sur-lordinateur)
5. [Lancer l'app sur l'ordinateur](#5-lancer-lapp-sur-lordinateur)
6. [Mettre à jour l'app en ligne](#6-mettre-à-jour-lapp-en-ligne)
7. [Le serveur de notifications (Cloudflare)](#7-le-serveur-de-notifications-cloudflare)
8. [Que faire si les notifications ne marchent pas](#8-que-faire-si-les-notifications-ne-marchent-pas)
9. [Modifier les textes, Pépite, les couleurs](#9-modifier-les-textes-pépite-les-couleurs)
10. [Où est quoi dans le code](#10-où-est-quoi-dans-le-code)

---

## 1. Installer l'app sur un téléphone

### Sur iPhone (Safari, iOS 16.4 ou plus récent)

1. Ouvre **Safari** (pas Chrome : sur iPhone, seul Safari sait installer une app web).
2. Va sur https://theobessonnaud01.github.io/nuage/
3. En bas de l'écran, touche le bouton **Partager** : un carré avec une flèche qui pointe vers le haut.
4. Fais défiler la liste vers le bas et touche **« Sur l'écran d'accueil »**.
5. Le nom « Nuage » et l'icône de Pépite apparaissent : touche **Ajouter** en haut à droite.
6. Retourne sur l'écran d'accueil et **ouvre Nuage depuis son icône**. L'app s'affiche en plein écran, sans la barre de Safari. C'est important : les notifications ne marchent que depuis l'icône.

> **Mise à jour de l'icône.** iOS ne met jamais à jour une icône déjà posée sur l'écran d'accueil. Si l'icône change un jour, il faut supprimer l'app de l'écran d'accueil et la réinstaller. ⚠️ Sur iPhone, supprimer l'app efface aussi ses données : **fais une sauvegarde avant** (voir § 3).

### Sur Android (Chrome)

1. Ouvre **Chrome** et va sur https://theobessonnaud01.github.io/nuage/
2. Au premier lancement, la présentation propose un bouton **« Installer l'app »** à l'étape 4. Sinon : menu **⋮** (en haut à droite) → **« Installer l'application »** (ou « Ajouter à l'écran d'accueil »).
3. Confirme. L'icône de Pépite apparaît sur l'écran d'accueil.

### Premier lancement

Pépite présente l'app en 4 écrans : comment ça marche, confidentialité, installation et rappels. On peut revoir cette présentation depuis **Réglages → Revoir la présentation**.

---

## 2. Activer et tester les notifications

1. Ouvre Nuage **depuis son icône**.
2. **Réglages → Rappels → 🔔 Activer les rappels**, puis **Autoriser** quand le téléphone le demande.
3. Touche **Envoyer une notification de test** : « 🐯 Pépite — Ça marche ! » arrive en quelques secondes.
4. Dans le même bloc, on règle **l'heure du rappel** (20:30 par défaut) et les **jours sans rappel**.

Ce que Pépite envoie :

| Quand | Message |
|---|---|
| Chaque soir à l'heure choisie (sauf jours sans rappel) | Petit point du jour |
| 9 h, pendant une crise ou une post-crise | « Comment tu te sens ce matin ? » |
| 2 h après un traitement noté | « Ça va mieux depuis ton traitement ? » |
| Le 1er du mois, 10 h | Le récap du mois est prêt |
| Le 15 du mois, 10 h | Petit rappel de sauvegarde |

> Le serveur passe toutes les 15 minutes : un rappel réglé à 20:40 arrive vers 20:45.

**Pas de notifications possibles ?** Réglages → Rappels → « Pas de notifications ? Crée un rappel sur ton téléphone » explique comment créer un rappel avec l'app Raccourcis (iPhone) ou Google Agenda (Android).

---

## 3. Sauvegarder et restaurer le journal (pour Noémie)

Le journal vit **uniquement sur le téléphone**. Si le téléphone est perdu, réinitialisé ou si l'app est supprimée, tout part avec. D'où les sauvegardes.

### Faire une sauvegarde (≈ 10 secondes)

1. **Réglages → 📦 Mes données → Faire une sauvegarde.**
2. Le téléphone ouvre sa feuille de partage : choisis où ranger le fichier `nuage-sauvegarde-AAAA-MM-JJ.json`, par exemple **Enregistrer dans Fichiers**, **Drive**, ou un message **WhatsApp / mail à toi-même**.
3. Une bannière discrète sur l'accueil rappelle de le refaire quand la dernière sauvegarde a plus d'un mois.

### Restaurer (nouveau téléphone, réinstallation…)

1. Installe l'app (§ 1), puis **Réglages → 📦 Mes données → Choisir le fichier**.
2. Sélectionne le fichier de sauvegarde : l'app affiche ce qu'il contient (« 97 jours, 9 crises… »).
3. Choisis :
   - **Fusionner avec mon journal** : ajoute ce qui manque ; pour un même jour, garde la version la plus récente.
   - **Remplacer mon journal** : remplace tout par la sauvegarde (demande une confirmation).

### Les autres exports

- **🩺 PDF « Pour mon médecin »** (3, 6 ou 12 mois) : chiffres clés, tableau des crises, traitements, ce qui revient avant les crises.
- **📄 PDF d'un récap mensuel** : depuis « Mes mois », ouvrir un mois → « Exporter ce récap en PDF ».
- **📊 CSV** : trois tableaux (jours, crises, traitements) à ouvrir dans Excel, Numbers ou Google Sheets.

---

## 4. Ce qu'il te faut sur l'ordinateur

- **Node.js 22** : https://nodejs.org → bouton « LTS », puis installer.
- **Git** : déjà présent sur Mac (sinon, `xcode-select --install`).
- Le dossier du projet : `Application Noémie/nuage/`, avec `app/` (l'application) et `worker/` (le serveur de notifications).

---

## 5. Lancer l'app sur l'ordinateur

Dans le Terminal :

```bash
cd ~/Documents/"Application Noémie"/nuage/app
```

La première fois seulement, installe les dépendances :

```bash
npm install
```

Puis lance l'app :

```bash
npm run dev
```

Ouvre l'adresse affichée (http://localhost:5173). Pour arrêter : **Ctrl + C**.

**Données de démonstration** (uniquement sur l'ordinateur, jamais sur le site) : ouvre http://localhost:5173/?demo=1. 4 mois de fausses données sont chargées pour voir les analyses, les récaps et les PDF. ⚠️ Cela remplace les données de ce navigateur.

**Planche de Pépite** (tous ses états, en clair et en sombre) : http://localhost:5173/#/mascot-preview

**Lancer les tests** (71 tests pour l'app, 10 pour le serveur) :

```bash
npm test
```

---

## 6. Mettre à jour l'app en ligne

Chaque envoi sur la branche `main` de GitHub reconstruit et republie l'app automatiquement (≈ 2 minutes ; on suit ça dans l'onglet **Actions** du dépôt).

```bash
cd ~/Documents/"Application Noémie"/nuage
```

```bash
git add -A
```

```bash
git commit -m "Ce que j'ai changé"
```

```bash
git push
```

Sur le téléphone, la nouvelle version se charge toute seule à la prochaine ouverture. Si besoin, ferme complètement l'app et rouvre-la.

> Le dépôt est **public**, ce qui est nécessaire pour GitHub Pages en offre gratuite. Il ne contient aucune donnée de Noémie. Le site n'est pas référencé par Google (`noindex` + `robots.txt`).

---

## 7. Le serveur de notifications (Cloudflare)

Il est déjà en ligne. Tu n'as besoin de cette partie que pour le modifier ou le réinstaller.

Toutes les commandes se lancent **dans le dossier du serveur** :

```bash
cd ~/Documents/"Application Noémie"/nuage/worker
```

| Action | Commande |
|---|---|
| Se connecter à Cloudflare (une fois par ordinateur) | `npx wrangler login` |
| Mettre en ligne une nouvelle version du serveur | `npx wrangler deploy` |
| Voir ce qui se passe en direct (journal) | `npx wrangler tail` |
| Lancer les tests | `npm test` |

**Les secrets** sont déjà enregistrés chez Cloudflare. Ne les refaire qu'en cas de réinstallation :

```bash
npx wrangler secret put VAPID_PRIVATE_JWK < .vapid-private.json
```

```bash
npx wrangler secret put SHARED_SECRET < .shared-secret
```

> ⚠️ Les fichiers `.vapid-private.json` et `.shared-secret` ne sont **que sur ton Mac** : ils ne sont jamais envoyés sur GitHub. Garde-en une copie à l'abri, par exemple dans un gestionnaire de mots de passe. Si tu régénères les clés (`npm run vapid -- --force`), il faudra aussi mettre la nouvelle clé publique dans `app/src/config.ts` et `worker/wrangler.toml`, redéployer les deux, puis réactiver les rappels sur chaque téléphone.

**Ce que le serveur stocke** (espace KV « SUBS ») : un identifiant aléatoire, l'abonnement aux notifications, l'heure du rappel, le fuseau horaire, les jours sans rappel, un indicateur « crise en cours » et les relances à venir. **Aucune donnée de santé.** Les abonnements expirés sont supprimés automatiquement.

L'offre gratuite de Cloudflare suffit largement : 100 000 requêtes par jour, alors que Nuage en utilise quelques centaines.

---

## 8. Que faire si les notifications ne marchent pas

1. **Sur iPhone : l'app est-elle ouverte depuis l'icône ?** Les notifications ne fonctionnent pas dans Safari, seulement depuis l'écran d'accueil (iOS 16.4 ou plus).
2. **Le téléphone les autorise-t-il ?**
   - iPhone : Réglages → Notifications → Nuage → Autoriser.
   - Android : Paramètres → Applications → Nuage (ou Chrome) → Notifications.
3. **Le mode Concentration / Ne pas déranger** peut les masquer.
4. Dans Nuage : **Réglages → Rappels → Désactiver**, puis **Activer les rappels** à nouveau, puis **Envoyer une notification de test**.
5. Si « L'envoi n'a pas marché » s'affiche, regarde le journal du serveur pendant que tu renvoies un test :
   ```bash
   cd ~/Documents/"Application Noémie"/nuage/worker
   ```
   ```bash
   npx wrangler tail
   ```
6. En dernier recours : la page « Crée un rappel sur ton téléphone » (§ 2).

---

## 9. Modifier les textes, Pépite, les couleurs

Tout est rassemblé pour être modifiable sans toucher au reste du code (dans `app/src/`) :

| Quoi | Où |
|---|---|
| Prénom, nom de l'app, heure de rappel par défaut, adresse du serveur | `config.ts` |
| Tous les textes de l'interface | `content/copy.ts` |
| Les questions du point du jour | `content/questions.ts` |
| Listes par défaut (facteurs, signaux, symptômes, traitements…) | `content/factors.ts` |
| Fiches « Comprendre ma migraine » (avec leurs sources) | `content/infoCards.ts` |
| Répliques de Pépite (≥ 8 par situation) | `mascot/lines.ts` |
| Expressions de Pépite (combinaison des calques) | `mascot/moods.ts` |
| Dessins de Pépite, un fichier SVG par calque | `mascot/parts/` |
| Couleurs de l'app et de Pépite (clair, sombre, mode crise) | `index.css` (variables en haut du fichier) |
| Messages des notifications | `worker/src/messages.ts` (puis `npx wrangler deploy`) |

**Redessiner Pépite.** Un illustrateur peut remplacer les fichiers de `mascot/parts/` (même cadre 200 × 215, mêmes noms de fichiers). Pour regénérer ensuite les icônes de l'app :

```bash
npm run icons
```

> Après une modification de `factors.ts`, ne change jamais les `id` existants : ils sont enregistrés dans le journal de Noémie. On peut librement changer les libellés, émojis et info-bulles.

---

## 10. Où est quoi dans le code

```
nuage/
├── app/                        Application (Vite + React + TypeScript + Tailwind)
│   ├── public/icons/           Icônes (générées depuis Pépite : npm run icons)
│   ├── scripts/                Génération des icônes et des calques de Pépite
│   └── src/
│       ├── config.ts           Réglages de fabrication
│       ├── content/            Textes, questions, listes, fiches
│       ├── db/                 Base locale (Dexie / IndexedDB) : schéma, crises, check-ins
│       ├── features/           Écrans : accueil, point du jour, crise, calendrier, objectifs,
│       │                       analyses, mois, fiches, réglages, présentation
│       ├── lib/                Calculs (analyses, récaps, objectifs, dates), PDF, CSV,
│       │                       sauvegarde, notifications, météo — avec leurs tests (*.test.ts)
│       ├── mascot/             Pépite : calques SVG, humeurs, répliques, bulle
│       └── sw.ts               Service worker : hors ligne + réception des notifications
├── worker/                     Serveur de notifications (Cloudflare Worker)
│   ├── src/webpush.ts          Chiffrement et signature des notifications (Web Push / VAPID)
│   ├── src/schedule.ts         Quand envoyer quoi (testé)
│   └── wrangler.toml           Configuration Cloudflare
└── .github/workflows/deploy.yml  Publication automatique sur GitHub Pages
```

**Briques utilisées** : Vite, React 18, TypeScript, Tailwind CSS, Dexie (IndexedDB), vite-plugin-pwa / Workbox, Recharts, jsPDF, date-fns, Open-Meteo, Cloudflare Workers + KV, Vitest.

**Sources des fiches** : Classification internationale des céphalées (ICHD-3), Ameli.fr (Assurance Maladie), American Migraine Foundation. Contenu vérifié en octobre 2026.
