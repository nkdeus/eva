---
title: Adopter EVA
nav: Adopter EVA
group: guides
eyebrow: Documentation
description: Brancher EVA sur un projet déjà en production — l'audit des px, la fusion des quasi-doublons, l'aliasing des tokens de design, et les pièges.
---

EVA s'insère dans une base de code existante sans renommer une seule classe. Vous gardez votre CSS ; vous remplacez les `px` figés par `var(--N)`. Ce qui change, c'est l'origine des nombres.

L'ordre des opérations dépend du moment où vous arrivez.

| Étape du projet | Approche | Friction |
|---|---|---|
| **Nouveau projet** | Entrée complète : `@use 'eva-css-fluid'`. `$sizes` se déduit de vos tokens de design. | Minimale |
| **Projet en cours**, design system en place | Entrée variables seules : `@use 'eva-css-fluid/variables'`. Aliasez vos tokens existants sur `var(--N)`. | Faible |
| **Reprise**, gros CSS déjà livré | **Auditez d'abord.** Comptez chaque `px`, fusionnez les quasi-doublons, *puis* configurez `$sizes`. | Moyenne, une seule fois |

La reprise est le cas courant, et l'audit est ce qui sépare une migration propre du fait de figer des années de dérive accidentelle dans des tokens nommés. Ne le sautez pas.

## Auditer et consolider {#audit}

### Compter chaque px

N'écrivez pas la liste `$sizes` à la main. Lisez-la dans la base de code.

```ts
// scripts/audit-px.ts
import fs from 'node:fs'
import path from 'node:path'

function walk(dir: string, files: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, files)
    else if (/\.(vue|scss|css|ts|tsx)$/.test(e.name)) files.push(p)
  }
  return files
}

const counts = new Map<string, number>()
for (const f of walk('src')) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/\b([0-9]+(?:\.[0-9]+)?)px\b/g)) {
    counts.set(m[1], (counts.get(m[1]) ?? 0) + 1)
  }
}
for (const [v, c] of [...counts].sort((a, b) => b[1] - a[1])) console.log(v + 'px\t' + c)
```

Une base de code de taille moyenne tombe généralement sur **50 à 80 valeurs px distinctes**. Triées par fréquence, la vingtaine de tête sont de vrais tokens, la longue traîne est du bruit.

### Décider de ce qui reste dehors

Certaines tailles ne doivent jamais devenir fluides. Sortez-les avant de commencer.

| Plage | Raison | À garder en |
|---|---|---|
| `0–5px` | Bordures, filets, décalages d'outline | `1px`, `2px` littéraux |
| `999px` | Une pilule est une forme, pas une taille | `999px` littéral |
| Breakpoints (`768`, `1024`, `1280`) | Topologie, pas espacement | Variables SCSS |
| Cibles tactiles (`44`, `48`) | Plancher d'accessibilité, ne doit pas rétrécir | `48px` littéral |
| `> 600px` | Niveau mise en page — veut souvent une échelle pleine plutôt qu'un clamp | Au cas par cas |

Tracer la bande EVA autour de `6–600px` élimine d'emblée environ 30 % du bruit de l'audit.

### Fusionner les quasi-doublons

Dans la bande, cherchez les valeurs adjacentes dont l'une domine clairement :

```text
15px (6x)  <-> 16px (25x)  -> fusionner 15 -> 16
17px (3x)  <-> 18px (6x)   -> fusionner 17 -> 18
22px (3x)  <-> 24px (25x)  -> fusionner 22 -> 24
26px (1x)  <-> 24px (25x)  -> fusionner 26 -> 24
36px (3x)  <-> 32px (8x)   -> fusionner 36 -> 32
96px (1x)  <-> 100px (3x)  -> fusionner 96 -> 100
```

Des heuristiques qui tiennent en pratique :

- **Écart de 1 à 2px** — fusionnez presque toujours.
- **Écart de 3 à 4px** — fusionnez si un côté est utilisé au moins 5× plus que l'autre.
- **Occurrences uniques** — fusionnez vers le plus proche voisin, ou supprimez.
- **Égalités** — prenez le nombre le plus rond. L'un vaut l'autre.

Une reprise réelle est passée de 61 à 49 valeurs distinctes, 27 lignes modifiées dans 9 fichiers. Le diff visuel était imperceptible.

### Appliquer par script, jamais à la main

```ts
// scripts/fuse-sizes.ts — simulation par défaut, --apply pour écrire
const FUSIONS: Record<number, number> = {
  15: 16, 17: 18, 19: 20,
  22: 24, 26: 24, 27: 28,
  36: 32, 48: 50, 60: 56,
  80: 72, 96: 100, 130: 120,
}
const APPLY = process.argv.includes('--apply')

for (const f of walk('src')) {
  let text = fs.readFileSync(f, 'utf8'); let dirty = false
  for (const [from, to] of Object.entries(FUSIONS)) {
    const re = new RegExp('\\b' + from + 'px\\b', 'g')
    if (re.test(text)) { text = text.replace(re, to + 'px'); dirty = true }
  }
  if (dirty && APPLY) fs.writeFileSync(f, text)
}
```

Lisez la simulation avant d'appliquer. La regex attrape toutes les occurrences, y compris celles qui ne sont pas des tokens de taille :

```css
box-shadow: 0 20px 60px rgba(0,0,0,.2);   /* 60px est un rayon de flou */
```

Une différence de 4px sur un flou d'ombre est invisible, donc la plupart des prises sont sans conséquence — mais regardez une fois.

### Ré-auditer, puis lister

Relancez l'audit. Ce qui survit dans la bande devient `$sizes`. Une variante du même script ciblant les font-size (`/font-size\s*:\s*([^;]+)/`) vous donne `$font-sizes`.

## Aliaser vos tokens de design

Si le projet a déjà des tokens SCSS, pointez-les sur EVA. Chaque composant qui lit `$space-lg` devient fluide sans qu'aucun composant ne soit modifié — c'est la migration la moins coûteuse qui soit.

```scss
// styles/tokens.scss

// Espacements — la variante conservatrice garde un plancher mobile respirable
$space-xs:  var(--4-);
$space-sm:  var(--8-);
$space-md:  var(--12-);
$space-lg:  var(--16-);
$space-xl:  var(--24-);
$space-2xl: var(--32-);

// Typographie — l'espace de noms fs-, variante sans suffixe pour le texte courant
$font-size-sm:   var(--fs-14);
$font-size-base: var(--fs-16);
$font-size-lg:   var(--fs-20);
$font-size-xl:   var(--fs-24);

// Rayons
$radius-sm: var(--6-);
$radius-md: var(--10-);
$radius-lg: var(--16-);

// Pas fluides, volontairement
$radius-pill: 999px;   // une forme
$touch-min:   48px;    // plancher d'accessibilité
$border:      1px;     // 1px reste 1px
```

Quatre catégories ne doivent jamais devenir fluides : les cibles tactiles (44 à 48px minimum quel que soit le viewport), la taille du texte courant sous son plancher de lisibilité, les épaisseurs de bordure et les rayons en pilule.

## Mise en page

L'idée est que les composants cessent de porter des breakpoints. Paddings, gaps et typographie respirent tout seuls.

Vous avez toujours besoin de media queries pour les changements **structurels** — une colonne qui devient une mise en page à sidebar. EVA ne les remplace pas, et ne devrait pas.

```scss
.shell {
  display: grid;
  grid-template-columns: 1fr;                        // mobile

  @media (min-width: 1024px) {                       // + nav
    grid-template-columns: var(--280) minmax(0, 1fr);
  }

  @media (min-width: 1280px) {                       // + aside
    grid-template-columns: var(--280) minmax(0, 1fr) var(--320);
  }
}

.shell__nav {
  padding: var(--24) var(--20);
  gap: var(--20);
}

.shell__nav-item {
  height: var(--44);
  padding: 0 var(--12);
  border-radius: var(--10-);
  font-size: var(--fs-15);
  gap: var(--12);
}
```

Des media queries pour la topologie. Jamais pour l'espacement ni la typographie.

## Vérifier visuellement

EVA émet des formules `clamp()`, et on ne peut pas deviner l'agressivité d'une variante à partir des maths. Fabriquez une route `/dev` jetable avec une carte par token, chacune montrant les quatre variantes sous forme de carrés réels, et redimensionnez le navigateur.

```js
const probe = document.querySelector('.probe');
const live = getComputedStyle(probe).getPropertyValue('--16').trim();
```

Ça se rentabilise trois fois :

1. **Test de fumée.** Une valeur vide signifie que le bloc `@use ... with (...)` manque ou est mal porté.
2. **Choix de variante.** Comparer `var(--16__)` et `var(--16-)` côte à côte à 320px est le seul moyen honnête de décider laquelle convient à un composant.
3. **Onboarding.** Les designers peuvent vérifier l'échelle sans ouvrir le code des composants.

## Pièges

**`Error: expected "$"` dans le bloc `@use ... with ()`.** Mettez la liste entre parenthèses : `$sizes: (4, 8, 16)`, pas `$sizes: 4, 8, 16`.

**`Size 16 is required as a base size`.** Ajoutez `16` à `$sizes`. C'est la référence rem.

**Les espacements mobiles sont à l'étroit.** Vous avez utilisé `var(--16)` là où il fallait `var(--16-)`. La variante conservatrice garde un plancher bien plus haut sur petit écran.

**Le texte courant rétrécit trop.** Utilisez `var(--fs-16)` sans suffixe. Les variantes `_` et `__` sont pour l'affichage, pas pour le corps de texte.

**`var(--44)` ne résout à rien alors que `44` est dans `$font-sizes`.** Les tokens de texte sont des `--fs-44`. Les deux espaces de noms sont indépendants — le même nombre n'est pas le même token.

**`var(--15)` ne résout plus à rien après consolidation.** Retirer `15` de `$sizes` ne retire pas `var(--15)` de votre code. Une custom property indéfinie fait abandonner la déclaration au navigateur, qui retombe sur sa valeur par défaut : la page s'affiche encore et le bug reste invisible. Après une fusion, greppez les tokens que vous avez supprimés.

**Le CSS d'un composant bat une media query EVA.** À spécificité égale, c'est l'ordre du source qui tranche. Un défaut écrit après la media query gagne à tous les viewports :

```scss
.shell {
  @media (min-width: 1024px) { &__aside { display: flex; } }
}
.shell__aside { display: none; }   // plus bas, même spécificité -> gagne toujours
```

Déplacez le défaut au-dessus de la requête, ou montez sa spécificité.

## Les couleurs, ou pas

Vous n'êtes pas obligé de prendre le système de couleurs. La valeur d'EVA est dans les tailles fluides ; les couleurs sont une offre distincte. Si vous avez déjà une palette et un thème qui fonctionnent, gardez-les et adoptez OKLCH plus tard — `eva-css-fluid/variables` vous donne les tailles et les couleurs, et vous pouvez simplement ignorer la moitié couleur.

Si vous les prenez, convertissez votre palette en une commande et lisez [Couleurs](doc:colors) :

```bash
npx eva-color convert "#2f6d3b"
npx eva-color palette "#2f6d3b" 7
```

Suite : [Outils CLI](doc:cli).
