---
title: Démarrer
nav: Démarrer
group: start
eyebrow: Documentation
description: Ce qu'est EVA CSS, les deux idées sur lesquelles il repose, et une installation qui tourne en trois commandes.
---

EVA CSS transforme une maquette figée en système responsive sans un seul breakpoint. Vous lui donnez les tailles que votre design utilise réellement ; il vous rend des custom properties CSS qui suivent le viewport en continu, et un système de couleurs OKLCH où un thème entier tient dans une poignée de nombres.

C'est un paquet SCSS. Pas de runtime, pas de JavaScript, pas de plugin de build — vous compilez avec `sass` et vous livrez le CSS.

## Les deux idées

Tout dans EVA découle de deux décisions.

**Les tailles sont des formules `clamp()`, pas des valeurs.** La maquette dit qu'une carte a `32px` de padding. Sur un téléphone c'est trop ; sur un écran 4K c'est trop peu. EVA émet `--32` sous forme de `clamp()` qui interpole entre un plancher et un plafond à mesure que le viewport s'élargit. Vous écrivez `padding: var(--32)` une fois, et plus jamais de media query pour ça.

**Les couleurs sont trois nombres, pas une palette.** Chacun des cinq rôles de base stocke une lightness, un chroma et une hue, et toutes les variantes — fondus d'opacité, crans de luminosité, le mode sombre entier — sont recomposées à partir de ces trois valeurs, en OKLCH, à l'exécution. Changer de thème, c'est changer quinze nombres.

```scss
// ce que vous écrivez
.card {
  padding: var(--32);
  gap: var(--16);
  border-radius: var(--12);
  background: var(--light);
  color: var(--dark_);
}
```

```css
/* ce que reçoit le navigateur */
--32: clamp(1.11rem, calc(1.11 * var(--eva-fluid-unit, 1vw) + 1rem), 2.22rem);
--light: oklch(var(--root-light));
--dark_: oklch(var(--root-dark) / 65%);
```

## Démarrage rapide

Trois commandes et un bloc de configuration. Le détail complet est dans [Installation](doc:install) et [Configuration](doc:config).

```bash
npm install eva-css-fluid eva-css-purge eva-colors
```

```scss
// styles/main.scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 12, 16, 24, 32, 48, 64, 128),
  $font-sizes: (12, 14, 16, 20, 24, 32),
  $build-class: true
);
```

```bash
npx sass --load-path=node_modules styles/main.scss:styles/main.css
```

```html
<body class="current-theme theme-eva all-grads">
  <div class="flex y g-16 p-32 br-12 _bg-light">
    <h1 class="fs-32 _c-dark">Fluide par défaut</h1>
    <p class="fs-16 _c-dark_">Redimensionnez la fenêtre. Rien ne saute.</p>
  </div>
</body>
```

> `16` est obligatoire dans `$sizes` — EVA s'en sert comme référence rem et lève une erreur de compilation sans lui.

## Ce que vous obtenez

| Couche | Contenu | Chapitre |
|---|---|---|
| Tailles | `var(--N)` et trois variantes d'échelle par taille, `var(--fs-N)` pour le texte | [Tailles fluides](doc:sizes) |
| Couleur | 5 rôles × 8 variantes en OKLCH, mode sombre inclus | [Couleurs](doc:colors) |
| Dégradés | Classes de dégradé composables, syntaxe façon Emmet | [Dégradés](doc:gradients) |
| Utilitaires | Classes de taille, de couleur, flex, grid et layout | [Classes utilitaires](doc:utilities) |
| Outillage | Conversion HEX→OKLCH, génération de palettes, purge CSS | [Outils CLI](doc:cli) |

## Par où continuer

- Nouveau projet — lisez [Installation](doc:install), puis [Configuration](doc:config).
- Ajouter EVA à un projet déjà en production — allez directement à [Adopter EVA](doc:adopt). L'étape d'audit décrite là est ce qui sépare une migration propre du fait de figer des années de dérive de design dans des tokens nommés.
- Vous cherchez une variable ou une classe précise — [Référence](doc:reference) est la liste à plat.
- Vous voulez le voir bouger — les pages [Fluid CSS](site:framework/css-fluid.html) et [Colors](site:framework/colors.html) proposent des démos redimensionnables en direct.
