---
title: Outils CLI
nav: Outils CLI
group: guides
eyebrow: Documentation
description: eva-color pour la conversion OKLCH, les palettes, les thèmes et le contraste ; eva-purge pour retirer les classes jamais utilisées.
---

Deux paquets optionnels accompagnent le framework. Aucun n'est nécessaire pour compiler EVA — ils traitent les deux tâches qui l'entourent : faire *entrer* les couleurs, et faire *sortir* le CSS inutilisé.

## eva-color

```bash
npm install eva-colors
```

Cinq commandes. Tout lit et écrit du HEX ou de l'OKLCH ordinaire, donc ça s'intègre à n'importe quelle chaîne.

| Commande | Ce qu'elle fait |
|---|---|
| `convert <hex>` | HEX vers OKLCH |
| `to-hex <l> <c> <h>` | OKLCH vers HEX |
| `palette <hex> [étapes]` | Palette harmonieuse, 5 étapes par défaut |
| `theme <config.json>` | Un bloc `.theme-<nom>` complet |
| `contrast <hex1> <hex2>` | Ratio de contraste et verdict WCAG |

### Convertir une palette {#convert}

```bash
npx eva-color convert "#2f6d3b"
# -> oklch(43.3% 0.103 142.5)
```

Ces trois nombres sont exactement ce qu'attend un bloc de thème :

```scss
.theme-monprojet {
  --brand-lightness: 43.3%;
  --brand-chroma: 0.103;
  --brand-hue: 142.5;
}
```

`to-hex` fait le chemin inverse, ce qu'il faut pour rendre une valeur à un designer qui travaille en HEX :

```bash
npx eva-color to-hex 62.8 0.258 29.23
```

### Générer une palette

```bash
npx eva-color palette "#2f6d3b" 7
```

Sept étapes perceptuellement régulières depuis une seule graine. Comme les étapes sont calculées en OKLCH, la teinte tient sur toute la rampe — une étape sombre d'un vert reste verte au lieu de dériver vers l'olive comme le ferait une rampe HSL.

### Générer un thème entier

Décrivez les cinq rôles en JSON :

```json
{
  "name": "monprojet",
  "brand": "#ff5733",
  "accent": "#7300ff",
  "extra": "#ffe500",
  "light": "#f3f3f3",
  "dark": "#252525"
}
```

```bash
npx eva-color theme theme.json
```

Il en sort un bloc `.theme-monprojet` avec les quinze valeurs, prêt à coller dans votre SCSS. Un thème généré écrit les hues explicitement, ce qui vous fait sortir au passage des neutres teintés par la marque décrits dans [Couleurs](doc:colors#the-five-roles).

### Contrôler le contraste

```bash
npx eva-color contrast "#ffffff" "#252525"
```

À lancer sur les paires que votre thème produit réellement — `--dark` sur `--light`, `--light` sur `--brand` — plutôt que sur les couleurs de départ. Les crans de luminosité déplacent la lightness, et un cran qui passe en mode clair peut tomber sous le seuil une fois le mode inversé.

### Depuis JavaScript

Les mêmes fonctions sont importables :

```js
import {
  hexToOklch, oklchToHex,
  generatePalette, generateTheme,
  getContrast, checkAccessibility
} from 'eva-colors';

const theme = generateTheme({
  name: 'monprojet',
  brand: '#2f6d3b',
  accent: '#c48a2f',
  extra: '#b3261e',
  light: '#fafaf7',
  dark: '#10130f'
});
```

Pratique pour générer des thèmes au build — par client, par saison, par marque — au lieu d'écrire un bloc à la main pour chacun.

## eva-purge {#purge}

```bash
npm install eva-css-purge
```

`$build-class: true` émet toutes les combinaisons de toutes les propriétés et de toutes les tailles. La plupart des projets en utilisent une fraction. `eva-purge` scanne votre markup et supprime le reste — en général **40 à 70 %** du fichier.

```bash
npx eva-purge \
  --css styles/main.css \
  --content "**/*.html" \
  --output styles/main-compressed.css \
  --safelist "current-theme,toggle-theme,all-grads"
```

| Option | Défaut | Rôle |
|---|---|---|
| `--css <fichier>` | requis | La feuille de style à purger |
| `--content <motif>` | `**/*.{html,js,vue,jsx,tsx}` | Fichiers à scanner pour l'usage des classes |
| `--output <fichier>` | `[css]-purged.css` | Où écrire |
| `--safelist <classes>` | — | Classes à conserver quoi qu'il arrive, séparées par des virgules |
| `--config <fichier>` | — | Lire les options depuis un fichier de config |

Il connaît EVA spécifiquement, donc il ne casse pas ce qui fait fonctionner le framework :

- toutes les custom properties de `:root` survivent, car une classe purgée peut rester référencée par du CSS écrit à la main ;
- les sélecteurs d'élément (`body`, `h1`, `p`) sont conservés ;
- les media queries sont préservées ;
- les classes de thème sont protégées par la safelist.

### Mettre en safelist ce que le JavaScript ajoute

Le scanner lit votre markup : toute classe ajoutée uniquement à l'exécution lui est invisible. Ce qui est basculé par script doit être mis en safelist :

```bash
--safelist "current-theme,toggle-theme,all-grads,theme-eva,theme-dark"
```

Pour les cas plus complexes, un fichier de config accepte les expressions régulières :

```js
// eva.config.js
module.exports = {
  purge: {
    content: ['src/**/*.html', 'src/**/*.js'],
    css: 'dist/style.css',
    output: 'dist/style-purged.css',
    safelist: {
      standard: ['current-theme', 'all-grads'],
      deep: [/^theme-/],
      greedy: [/^brand-/, /^accent-/]
    }
  }
};
```

> Purgez à la fin du build et livrez le fichier purgé. Continuez à pointer vos pages de développement sur la feuille de style complète — sinon une classe ajoutée pendant le travail ne fait silencieusement rien jusqu'à la purge suivante.

### Le brancher

```json
{
  "scripts": {
    "build-css": "npx sass --load-path=node_modules styles/main.scss:styles/main.css",
    "purge": "npx eva-purge --css styles/main.css --content '**/*.html' --output styles/main-compressed.css --safelist 'current-theme,toggle-theme,all-grads'",
    "build": "npm run build-css && npm run purge"
  }
}
```

L'autre levier est `$custom-class` — voir [Configuration](doc:config). Restreindre la génération en amont et purger après coup sont complémentaires, pas alternatifs : le premier garde la feuille de développement petite, le second garde petite celle qui est livrée.

Suite : [Référence](doc:reference).
