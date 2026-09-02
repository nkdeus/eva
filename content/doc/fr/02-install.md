---
title: Installation
nav: Installation
group: start
eyebrow: Documentation
description: Les trois paquets, les quatre points d'entrée SCSS, et comment compiler et surveiller les fichiers.
---

EVA se distribue en trois paquets npm indépendants. Seul le premier est obligatoire.

```bash
npm install eva-css-fluid eva-css-purge eva-colors
```

| Paquet | Rôle | Requis |
|---|---|---|
| `eva-css-fluid` | Le framework lui-même — tailles fluides, couleurs, dégradés, utilitaires | Oui |
| `eva-colors` | CLI et API JS : conversion HEX→OKLCH, palettes, génération de thème, contrôle de contraste | Non |
| `eva-css-purge` | Retire du CSS compilé les classes jamais utilisées | Non |

La seule dépendance requise est une chaîne SCSS. `sass` seul suffit ; Vite, Astro, Next et compagnie en embarquent déjà une.

## Choisir un point d'entrée

`eva-css-fluid` expose quatre points d'entrée. Ils diffèrent par ce qu'ils émettent, pas par ce qu'ils savent faire.

| Entrée | Émet | À utiliser quand |
|---|---|---|
| `eva-css-fluid` | Variables, couleurs, dégradés, thème, reset, typographie, flex, grid, classes utilitaires | Nouveau projet |
| `eva-css-fluid/variables` | Variables, couleurs, thème — rien d'autre | Projet existant : s'installe à côté de votre CSS sans toucher à l'espace de noms global |
| `eva-css-fluid/core` | Tout sauf les classes utilitaires | Vous voulez le reset et la typographie mais écrivez vos propres composants |
| `eva-css-fluid/colors` | Le système de couleurs OKLCH et le thème, uniquement | Vous ne voulez que les couleurs |

```scss
// nouveau projet — le framework complet
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 32, 64, 128),
  $font-sizes: (14, 16, 24, 36, 52)
);
```

```scss
// projet existant — variables seules, zéro collision de classes
@use 'eva-css-fluid/variables' with (
  $sizes: (4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 128),
  $font-sizes: (12, 14, 16, 18, 20, 24, 32)
);
```

> `eva-css-fluid/colors` n'accepte aucune configuration — il n'a aucune taille à générer. Les trois autres acceptent l'ensemble des options décrites dans [Configuration](doc:config).

## Compiler

EVA est du SCSS ordinaire, donc la commande de référence est `sass` ordinaire. C'est `--load-path` qui permet à `@use 'eva-css-fluid'` de se résoudre depuis `node_modules`.

```bash
npx sass --load-path=node_modules styles/main.scss:styles/main.css
```

Branchez les deux variantes utiles dans `package.json` :

```json
{
  "scripts": {
    "build-css": "npx sass --load-path=node_modules styles/main.scss:styles/main.css --style expanded",
    "watch": "npx sass --load-path=node_modules --watch styles/main.scss:styles/main.css --style expanded",
    "purge": "npx eva-purge --css styles/main.css --content '**/*.html' --output styles/main-compressed.css"
  }
}
```

Utilisez `--style expanded` pendant le développement : les formules `clamp()` émises sont précisément ce que vous inspectez dans les devtools, et la sortie compressée les rend illisibles. Compressez à la fin, ou laissez [eva-purge](doc:cli) s'en charger.

## Structure de projet

Rien n'est imposé. Un projet à cible unique ressemble en général à ceci :

```text
project/
├── index.html
├── styles/
│   ├── main.scss          # @use 'eva-css-fluid' with (...)
│   └── main.css           # sortie compilée
└── node_modules/
    ├── eva-css-fluid/
    ├── eva-css-purge/
    └── eva-colors/
```

Quand plusieurs maquettes cohabitent dans un même dépôt, donnez à chacune son fichier d'entrée et son propre `$sizes` — tout l'intérêt de lister les tailles explicitement est que chaque cible ne transporte que ce qu'elle utilise.

```text
projects/
├── project-a/
│   ├── index.html
│   ├── styles/project-a.scss     # @use 'eva-css-fluid' with (...)
│   └── render/project-a.css
└── project-b/
    ├── index.html
    ├── styles/project-b.scss
    └── render/project-b.css
```

```bash
npx sass --load-path=node_modules \
  projects/project-a/styles/project-a.scss:projects/project-a/render/project-a.css
```

## Baliser la page

Deux classes sur l'élément racine activent tout le système.

```html
<body class="current-theme theme-eva">
```

- `current-theme` — obligatoire. C'est l'élément sur lequel les variables de couleur sont calculées.
- `theme-<nom>` — la palette active. Voir [Configuration de thème](doc:colors#themes).
- `toggle-theme` — à ajouter pour basculer en mode sombre. Voir [Mode sombre](doc:colors#dark-mode).
- `all-grads` — à ajouter si vous utilisez les classes de dégradé. Voir [Dégradés](doc:gradients).

> Placez `current-theme` sur `<html>` plutôt que sur `<body>` si la page peut sur-défiler. Le fond de `<html>` remplit la zone de rebond sur mobile ; un `<body>` thémé laisse apparaître une bande non thémée pendant le pull-to-refresh.

Suite : [Configuration](doc:config).
