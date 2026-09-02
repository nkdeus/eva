---
title: Classes utilitaires
nav: Classes utilitaires
group: system
eyebrow: Documentation
description: Toutes les classes émises quand $build-class vaut true — tailles, couleurs, flex, grid, typographie et mise en page.
---

Tout ce qui figure sur cette page n'existe qu'avec `$build-class: true`. Avec `eva-css-fluid/variables` ou `eva-css-fluid/core`, vous obtenez les mêmes valeurs sous forme de custom properties et vous écrivez vos propres sélecteurs.

## Tailles

Seize préfixes de propriété, combinés à chaque entrée de `$sizes` et à chacune des quatre variantes d'échelle.

| Préfixe | Propriété |
|---|---|
| `w-` | `width` |
| `mw-` | `max-width` |
| `h-` | `height` |
| `p-` | `padding` |
| `px-` | `padding-inline` |
| `py-` | `padding-block` |
| `pt-` `pb-` `pr-` | `padding-top` / `-bottom` / `-right` |
| `mt-` `mb-` `ml-` `mr-` | `margin-top` / `-bottom` / `-left` / `-right` |
| `g-` `gap-` | `gap` |
| `br-` | `border-radius` |

Le suffixe de variante vient en dernier, exactement comme sur la variable :

```html
<div class="p-32 g-16">      <!-- var(--32), var(--16)  -->
<div class="p-32- g-16-">    <!-- var(--32-), var(--16-) — conservateur -->
<div class="p-32_ g-16__">   <!-- var(--32_), var(--16__) — agressif -->
```

Avec `$px-rem-suffix: true` vous obtenez aussi la paire figée — `p-32-px`, `w-64-rem`.

> Il n'y a pas de `m-`, `mx-` ni `my-`. Les marges ne sont émises que par côté. Et notez que `px-`/`py-` correspondent aux propriétés **logiques** `padding-inline` / `padding-block` : elles suivent donc le sens d'écriture.

## Taille de texte

`fs-N` pour chaque entrée de `$font-sizes`, avec les deux variantes de réduction :

```html
<h1 class="fs-52">…</h1>
<h2 class="fs-36_">…</h2>
<p class="fs-16">…</p>
```

Rappel : elles lisent l'espace de noms `--fs-`, distinct de `$sizes`. Voir [Les tailles de texte sont un espace de noms séparé](doc:sizes#font-sizes).

## Couleurs

Cinq propriétés × cinq rôles × huit variantes — 200 classes.

| Préfixe | Propriété |
|---|---|
| `_c-` | `color` |
| `_bg-` | `background` |
| `_bc-` | `border-color` |
| `_f-` | `fill`, y compris les `path` descendants |
| `_s-` | `stroke` |

```html
<div class="_bg-light _c-dark_ _bc-dark___">
  <svg class="_f-brand">…</svg>
</div>
```

Le tiret bas initial est volontaire : il évite que les classes de couleur d'EVA n'entrent en collision avec ce qui existe déjà dans votre base de code.

Deux aides à l'ombre sont livrées avec : `_shadow` et `_shadow_`.

## Flexbox

`.flex` est le conteneur. `.x` et `.y` fixent l'axe ; sans l'un ni l'autre, la direction est `row`.

```html
<div class="flex y g-16 center">…</div>
```

| Classe | Effet |
|---|---|
| `flex` | `display: flex` |
| `x` / `y` | ligne / colonne |
| `reverse` | combinée à `x` ou `y`, inverse l'axe |
| `wrap` / `nowrap` / `wrap-reverse` | `flex-wrap` |

Raccourcis d'alignement, valables seuls ou combinés à `x` / `y` :

| Classe | `justify-content` | `align-items` |
|---|---|---|
| `start` | flex-start | flex-start |
| `center` | center | center |
| `end` | flex-end | flex-end |
| `space` | space-between | center |
| `around` | space-around | center |
| `evenly` | space-evenly | center |

À l'intérieur de `.x` ou `.y`, les deux axes se règlent indépendamment avec un nom composé — `justify-align` :

```html
<div class="flex y space-center">…</div>   <!-- space-between / center -->
<div class="flex x end-baseline">…</div>   <!-- flex-end / baseline -->
```

Les deux moitiés acceptent `start`, `center`, `end`, `space`, `around`, `evenly` sur l'axe principal, et `start`, `center`, `end`, `stretch`, `baseline` sur l'axe transversal. La forme explicite marche aussi : `justify-center`, `items-end`, `content-space`.

Classes au niveau des items :

| Classe | Effet |
|---|---|
| `flex-1` / `flex-2` / `flex-3` | `flex: N 1 0%` |
| `flex-auto` / `flex-initial` / `flex-none` | `flex: 1 1 auto` / `0 1 auto` / `none` |
| `stretch` | `flex: 1` |
| `self-start` … `self-baseline` | `align-self` |
| `order-1` … `order-12` | `order` |
| `order-first` / `order-last` / `order-none` | `-9999` / `9999` / `0` |

Deux motifs composés sont inclus : `.flex-card` (header / body / footer, le body grandit) et `.flex-sidebar` (`.flex-sidebar-nav` fixe, `.flex-sidebar-main` grandit avec `min-width: 0`).

## Grid

Deux systèmes indépendants.

### Grille auto-fit

```html
<div class="grid auto-fit-356- gap-32">…</div>
```

`auto-fit-<taille><variante>` pose le plancher du `minmax()` d'un template `repeat(auto-fit, …)`. Le nombre de colonnes suit la largeur disponible tout seul — sans breakpoints.

> Les classes `auto-fit-*` ne sont générées que pour les tailles **≥ 100**. Un `auto-fit-64` n'existera pas même si `64` est dans `$sizes`, parce qu'un plancher de colonne à 64px ne fait pas une grille utile.

### Grille flex à douze colonnes

```html
<div class="flex-grid max-col-12">
  <div class="col-6">moitié</div>
  <div class="col-3">quart</div>
  <div class="col-1/4">quart</div>
</div>
```

| Classe | Effet |
|---|---|
| `flex-grid` | Conteneur flex avec retour à la ligne, utilisant `--current-gap` |
| `container:flex-grid` | Idem, plus des container queries qui déduisent le nombre de colonnes de la largeur du conteneur |
| `col-1` … `col-12` | Occupe N colonnes sur `--grid-columns` |
| `col-1/1` … `col-1/12` | Notation en fraction |
| `max-col-1` … `max-col-12` | Pose `--grid-columns` localement |
| `xs:max-col-N` … `xxl:max-col-N` | Idem, sous une media query `max-width` |

Breakpoints de la forme responsive : `xs` 200px, `sm` 500px, `md` 700px, `lg` 1000px, `xl` 1200px, `xxl` 1400px.

## Typographie

Classes d'axes de police variable, pilotées par deux custom properties :

| Classe | Pose |
|---|---|
| `fwg-1` … `fwg-8` | Cran sur l'axe de graisse |
| `fwd-1` … `fwd-13` | Cran sur l'axe de largeur |
| `f-scale` | Met le glyphe à l'échelle de sa boîte ; `f-scale offset` le décale |

| Classe | Effet |
|---|---|
| `bold` | `font-weight: bold` |
| `ttu` | `text-transform: uppercase` |
| `tac` | `text-align: center` |
| `lh-0` / `lh-1` | `line-height: 0` / `1` |

> `lh-1-5` n'existe pas. Pour toute autre interlettre, déclarez-la vous-même.

## Mise en page

| Classe | Effet |
|---|---|
| `por` / `poa` / `pof` / `pos` | `position: relative` / `absolute` / `fixed` / `sticky` |
| `poa center` | absolu, centré sur les deux axes |
| `w-full` / `h-full` | `width: 100%` / `height: 100%` |
| `oh` | `overflow: hidden` |
| `ar-1` | `aspect-ratio: 1` |
| `circle` | `border-radius: 50%` |
| `border` / `border thin` | Bordure de 1px dans la couleur courante |
| `blur` / `blur_` / `blur__` | Trois intensités de flou d'arrière-plan |
| `pointer` | `cursor: pointer` |
| `hide` | `display: none` |
| `lt` | Aide au letter-spacing |
| `mt-auto` / `mb-auto` / `ml-auto` / `mr-auto` | Marge auto sur un côté |

## Conteneurs runtime

| Classe | Effet |
|---|---|
| `eva-cqi` | `container-type: inline-size` + `--eva-fluid-unit: 1cqi` |
| `eva-root` | Idem, pour un conteneur de premier niveau |

Voir [Unité fluide](doc:sizes#fluid-unit).

## Réduire la sortie

Tout cela compile en une grosse feuille de style. Deux leviers pour la réduire :

- `$custom-class: true` avec `$class-config` restreint la génération en amont — voir [Configuration](doc:config).
- [eva-purge](doc:cli#purge) retire après coup ce que votre markup n'utilise jamais. Typiquement 40 à 70 %.

Suite : [Adopter EVA](doc:adopt).
