# Nuage — le journal de migraines de Noémie

> Guide en cours de rédaction : il sera complété à chaque étape (version finale à l'étape 8).

## Ce qu'il te faut

- Un ordinateur avec **Node.js 22** (https://nodejs.org → bouton « LTS »).
- Un compte **GitHub** (gratuit).

## Lancer l'app sur ton ordinateur

```bash
cd app
npm install
npm run dev
```

Puis ouvre l'adresse affichée (http://localhost:5173).

## Lancer les tests

```bash
cd app
npm test
```

## Mettre l'app en ligne (GitHub Pages)

1. Crée un repo sur GitHub, par exemple `nuage`.
   - **Compte GitHub gratuit** : le repo doit être **public** pour utiliser Pages. Ce n'est pas grave : le code est public, mais **aucune donnée de Noémie n'y est**, tout reste sur son téléphone. L'adresse n'est pas référencée par Google (`noindex` + `robots.txt`).
   - **GitHub Pro / Team** : le repo peut être privé.
2. Dans le repo : **Settings → Pages → Build and deployment → Source : « GitHub Actions »**.
3. Envoie le code (depuis le dossier `nuage/`) :
   ```bash
   git remote add origin https://github.com/<ton-compte>/nuage.git
   git push -u origin main
   ```
4. Onglet **Actions** : attends la coche verte (~1–2 min). L'app est en ligne à
   `https://<ton-compte>.github.io/nuage/`.

À chaque `git push` sur `main`, l'app se met à jour toute seule.

## Installer sur iPhone (Safari, iOS 16.4+)

1. Ouvre l'adresse de l'app dans **Safari** (pas Chrome).
2. Touche le bouton **Partager** (carré avec flèche vers le haut).
3. Fais défiler et touche **« Sur l'écran d'accueil »**, puis **Ajouter**.
4. Ouvre l'app **depuis l'icône** : elle s'affiche en plein écran, sans barre Safari.

## Installer sur Android (Chrome)

1. Ouvre l'adresse dans **Chrome**.
2. Menu **⋮** → **« Installer l'application »** (ou « Ajouter à l'écran d'accueil »).
