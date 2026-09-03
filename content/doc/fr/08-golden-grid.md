---
title: Grille dorée
nav: Grille dorée
group: system
eyebrow: Documentation
description: La grille de page opt-in — quatre pistes inégales issues du nombre d'or, des lignes nommées, et un flux éditorial porté par subgrid.
---

`golden-grid` est une grille de page en sections dorées : quatre pistes de largeurs inégales, issues de la subdivision récursive du nombre d'or, dont les fractions font exactement 1. Aucun centrage. La page a trois bords gauches au lieu d'un axe, et un élément ne déclare jamais une largeur — il déclare le rôle qu'il joue.

```text
├──── marge ────┼── rail ──┼─ épaule ─┼───── texte ─────┼─── débord ───┼──── marge ────┤
      φ⁻⁶           φ⁻³        φ⁻⁴           φ⁻²              φ⁻³            φ⁻⁶
     0,056         0,236      0,146         0,382            0,236          0,056
   de la page   └───────────── de la composition ──────────────────┘    de la page
```

Le composant est arrivé dans eva-css-fluid 2.5.0. Il est **opt-in** : ni `core` ni `variables` ne le charge, et l'entrée principale n'émet rien tant qu'il n'est pas activé. Une grille dorée est un parti pris de mise en page, pas un défaut raisonnable.

> À voir en direct : la [démo golden-grid](site:framework/golden-grid.html) fait tourner le composant avec le tracé, le repli mono-colonne et un curseur de gap, et mesure son propre alignement à chaque redimensionnement.

## L'activation {#activation}

Depuis le framework complet :

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 12, 16, 20, 32, 52, 84, 136, 220),
  $font-sizes: (12, 16, 24, 36, 52),
  $golden-grid: true,
  $golden-grid-prefix: 'gg-',      // recommandé, voir le nommage plus bas
  $golden-grid-column-gap: var(--20)
);
```

En composant isolé — le mode le plus léger, sans reset, sans utilitaires, sans gradients :

```scss
@use 'eva-css-fluid/variables';
@use 'eva-css-fluid/golden-grid' with (
  $max: 1280px,
  $prefix: 'gg-',
  $rules: true
);
```

Sans Sass, une feuille pré-compilée est livrée à côté d'`eva.css`, dont elle consomme les variables. 2,1 Ko, configuration par défaut, classes sans préfixe :

```html
<link rel="stylesheet" href="eva-css-fluid/dist/eva.css">
<link rel="stylesheet" href="eva-css-fluid/dist/golden-grid.css">
```

> `index.scss` charge toujours le module : depuis l'entrée principale, toute la configuration passe donc par les variables `$golden-grid-*`. Un `@use 'eva-css-fluid/golden-grid' with (…)` posé en plus d'un `@use 'eva-css-fluid'` échouerait — Sass refuse de configurer un module déjà chargé.

## Pourquoi pas douze colonnes {#roles}

Une grille à 12 colonnes égales est un système de **découpage** : on y prend 4, 6 ou 8 colonnes selon ce qu'on veut faire tenir. Les proportions sont un résultat, jamais une décision, et comme toutes les colonnes se valent, la seule manière de créer une hiérarchie est de centrer ou de compter.

`golden-grid` est un système de **proportion**. Les quatre pistes ont des largeurs différentes et non interchangeables, et chacune a une fonction.

| Piste | Fraction | Rôle |
|---|---|---|
| **rail** | φ⁻³ = 0,236 | Métadonnées, dates, numéros, titres de section. Aligné à droite. Premier bord gauche. |
| **épaule** | φ⁻⁴ = 0,146 | Vide, presque toujours. C'est elle qui désaxe la page. |
| **texte** | φ⁻² = 0,382 | La mesure de lecture, ≈ 53 signes. Deuxième bord gauche. |
| **débord** | φ⁻³ = 0,236 | Là où les images et les grands titres partent vers la droite. Troisième bord gauche. |

Quatre conséquences directes, et c'est là tout l'intérêt du composant :

1. **La page n'a pas d'axe, elle a une progression.** Rien n'est centré nulle part. L'œil descend en suivant des bords, pas un milieu.
2. **Le vide est une valeur, pas un reste.** L'épaule est une piste déclarée, dessinée, mesurable. Aucune classe ne la vise seule, donc un contenu qui déborde ne peut pas la récupérer.
3. **La mesure de lecture est déduite, pas réglée.** Aucun `max-width: 65ch` : 0,382 de la composition donne ≈ 442 px à 1440, soit ≈ 53 signes en corps 17. Si la page grandit, la mesure grandit dans le même rapport.
4. **La marge aussi est une part.** φ⁻⁶ de la page, pas un cran d'échelle.

Ce à quoi le composant ne sert *pas* : les grilles de composants — cartes, tableaux, formulaires. Celles-là restent du ressort d'`auto-fit-*` et de `flex-grid`, couverts dans [Classes utilitaires](doc:utilities). `golden-grid` est une grille **de page**.

## La géométrie {#geometry}

La page entière vaut 1. On lui applique la coupure dorée, puis on recoupe chacune des deux parties par la même coupure :

```text
1
├──── φ⁻² = 0,382 ────────┬──────── φ⁻¹ = 0,618 ────────────────┤   coupure 1
│                         │
├─ φ⁻³ ──┬─ φ⁻⁴ ┤         ├─ φ⁻² ──────────┬─ φ⁻³ ──┤              coupures 2 et 2'
  0,236   0,146             0,382            0,236
  rail    épaule            texte            débord
```

Les quatre pistes ne sont pas quatre nombres choisis : ce sont les quatre feuilles d'un arbre à deux niveaux. Ce qui fait tomber la somme sur 1 est la relation de récurrence du nombre d'or, `φⁿ = φⁿ⁺¹ + φⁿ⁺²` :

```text
φ⁻³ + φ⁻⁴ = φ⁻²          (0,236068 + 0,145898 = 0,381966)
φ⁻² + φ⁻³ = φ⁻¹          (0,381966 + 0,236068 = 0,618034)
φ⁻² + φ⁻¹ = 1
```

Arrondie à trois décimales, la somme reste exactement 1 — `0,236 + 0,146 + 0,382 + 0,236 = 1,000` — et c'est ce qui autorise à écrire les valeurs telles quelles dans la feuille.

> CSS ne demande pas que les `fr` fassent 1 : `fr` normalise, et `2fr 1fr` rend comme `0.667fr 0.333fr`. Écrire des fractions qui somment à 1 est une discipline de **lecture** — chaque nombre est directement la part de la composition, et une erreur se voit à l'addition.

À 1440 px, avec des gaps `--20` : marges 2 × 81 px, cinq gaps ≈ 100 px, composition ≈ 1178 px.

| Piste | Fraction | Largeur |
|---|---|---|
| marge | 0,056 *de la page* | 81 px |
| rail | 0,236 | 278 px |
| épaule | 0,146 | 172 px |
| texte | 0,382 | 450 px |
| débord | 0,236 | 278 px |

## Lignes nommées et classes de placement {#api}

Les lignes nommées sont le contrat public. Toute règle de placement écrite dans un projet doit s'exprimer avec ces noms, jamais avec des numéros de colonne. Elles ne sont **jamais préfixées** : leur portée est celle de la grille, aucune collision n'est possible.

```text
edge-start · rail-start · rail-end/shoulder-start · shoulder-end/main-start
           · main-end/spill-start · spill-end · edge-end
```

Les zones nommées `rail`, `main`, `spill` et `edge` servent de raccourcis : `grid-column: rail` équivaut à `grid-column: rail-start / rail-end`.

Toutes les classes ci-dessous prennent `$prefix` (vide par défaut).

| Classe | Portée | Usage |
|---|---|---|
| `.golden-grid` | — | Le conteneur. Porte les six pistes et la marge dorée auto-centrante. |
| `.grid-page` | — | Sur l'ancêtre du tracé : `position: relative` + `isolation: isolate`. |
| `.rail` | `rail` | Métadonnées. Ajoute `text-align: right` : les mots butent contre le vide de l'épaule. |
| `.main` | `main` | Texte courant. Rien d'autre ne vit ici. |
| `.wide` | `shoulder-start / spill-end` | Titres, citations, images larges. Prend l'épaule, donc casse l'alignement à gauche volontairement. |
| `.spill` | `main-start / edge-end` | Débord asymétrique : bord gauche sur la colonne de texte, bord droit sur le bord de page. |
| `.bleed` | `edge` | Pleine largeur, marges comprises. |
| `.rail--sticky` | — | Le rail suit la lecture (`position: sticky`). Neutralisé en mono-colonne. |
| `.blocks` | `edge` + `subgrid` | Conteneur de flux éditorial qui rend les pistes à ses enfants. |
| `.grid-rules` | — | Le tracé de fond. |
| `.grid-debug` | — | Sur `<body>` : cerne chaque élément placé. |

```html
<article class="golden-grid">
  <p class="rail">Derniers projets</p>
  <h1 class="wide">Titre</h1>
  <div class="main">Chapô</div>
</article>
```

## Options {#options}

Chaque option existe sous deux noms : celui du composant (en isolé) et son équivalent `$golden-grid-*` sur l'entrée principale.

| Composant | Entrée principale | Défaut | Effet |
|---|---|---|---|
| `$enabled` | `$golden-grid` | `true` / `false` | `false` n'émet aucune règle. |
| `$max` | `$golden-grid-max` | `1440px` / `null` | Largeur maximale. `null` suit `$reference-width`. |
| `$gutter-phi` | `$golden-grid-gutter-phi` | `6` | Marge = φ⁻ⁿ de la page. `false` la repasse sur `$gutter-min`. |
| `$breakpoint` | `$golden-grid-breakpoint` | `54rem` | Unique point de repli (4 pistes → 1). |
| `$gutter-min` | `$golden-grid-gutter-min` | `var(--24, 1.5rem)` | Marge quand `$gutter-phi` vaut `false`. |
| `$column-gap` | `$golden-grid-column-gap` | `var(--24, 1.5rem)` | Gap entre les pistes. |
| `$row-gap` | `$golden-grid-row-gap` | `var(--32, 2rem)` | Rythme vertical du conteneur. |
| `$blocks-row-gap` | `$golden-grid-blocks-row-gap` | `var(--48, 3rem)` | Rythme vertical du flux éditorial. |
| `$prefix` | `$golden-grid-prefix` | `''` | Préfixe des classes. `'gg-'` recommandé en framework complet. |
| `$rules` | `$golden-grid-rules` | `true` | Émettre le tracé de fond. |
| `$rail-align-mobile` | `$golden-grid-rail-align-mobile` | `right` | `right` ou `left` sous le point de bascule. |
| `$auto-theme-switch` | `$golden-grid-auto-theme-switch` | `false` | Intensité du tracé en mode sombre : `prefers-color-scheme` (`true`) ou `.toggle-theme` (`false`). |
| `$phi` | — | `1.618034` | Le nombre d'or. Les quatre pistes en découlent. |

Les gaps valent par défaut `--24`, `--32` et `--48`. Ces trois nombres ne sont pas dans toutes les listes `$sizes` — celle de ce site est `(4, 8, 12, 16, 20, 32, …)` — alors mieux vaut les repasser sur l'échelle plutôt que compter sur le fallback CSS :

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 12, 16, 20, 32, 52, 84, 136, 220),
  $golden-grid: true,
  $golden-grid-column-gap: var(--20),
  $golden-grid-row-gap: var(--32),
  $golden-grid-blocks-row-gap: var(--52)
);
```

### Tokens d'exécution {#runtime-tokens}

Trois propriétés personnalisées retunent la grille **sans recompiler**. Le repli `var()` rend la valeur compilée, donc rien ne change tant que rien n'est posé — et comme les propriétés personnalisées héritent, les poser sur n'importe quel ancêtre suffit.

| Token | Repli | Effet |
|---|---|---|
| `--gg-column-gap` | `$column-gap` | L'air entre les pistes. Ne touche pas aux proportions. |
| `--gg-row-gap` | `$row-gap` | Rythme vertical du conteneur. |
| `--gg-blocks-row-gap` | `$blocks-row-gap` | Rythme vertical du flux éditorial. |

```css
.section--dense { --gg-column-gap: var(--12); --gg-row-gap: var(--16); }
```

`--gg-gutter` n'est pas un token d'entrée : le composant la calcule sur `.golden-grid`. Pour la forcer, il faut viser cet élément ; sinon, passer par `$gutter-phi` ou `$gutter-min` à la compilation.

Les gaps sont le seul réglage de géométrie exposé à l'exécution, et c'est volontaire : `column-gap` est prélevé **avant** la distribution des `fr`, donc les quatre fractions restent `0,236 / 0,146 / 0,382 / 0,236` quelle qu'en soit la valeur. Seule la surface de composition diminue. Les pistes et la marge, elles, restent des décisions de compilation — les ouvrir à l'exécution reviendrait à laisser un projet casser la géométrie sans erreur.

## La marge dorée {#margin}

```css
--gg-gutter: max(5.6%, calc((100% - 1440px) / 2));   /* 5,6 % = φ⁻⁶ */
```

Une seule déclaration, deux régimes, et `max()` choisit :

- **sous `$max`**, le terme en pourcentage gagne : la marge vaut φ⁻⁶ de la page, elle reste donc dorée à toutes les largeurs et grandit avec la fenêtre ;
- **au-dessus**, le terme de centrage gagne : la marge absorbe la moitié du surplus et la composition se cale sur `$max`.

Le basculement se fait à `W ≈ 1622 px` pour les valeurs par défaut. La grille est donc contrainte **et** centrée sans conteneur intermédiaire : un seul élément porte à la fois la largeur maximale, les marges et les pistes. C'est pourquoi `.bleed` atteint le bord de l'écran sans le `margin-inline: calc(50% - 50vw)` habituel, et sans risque de barre de défilement horizontale.

Deux unités cohabitent, et c'est la clé du système : **la marge est une part de la page, les pistes sont des parts de la composition.** Le `1` du nombre d'or n'est pas la fenêtre — c'est ce que les marges et les gaps laissent.

Les gaps, eux, ne sont pas dorés et ne peuvent pas l'être. Il y a deux marges mais **cinq** gaps : au terme suivant de la série, ils prendraient 5 × 80,6 = 403 px sur 1440 et videraient la composition. Le gap n'est pas une division de la page, c'est l'air entre les pistes — il relève de l'échelle, pas de la série.

## Le flux éditorial {#blocks}

`subgrid` est la pièce qui rend le système utilisable sur du contenu courant.

```scss
.blocks {
  grid-column: edge;                    // occupe les six pistes
  display: grid;
  grid-template-columns: subgrid;       // et les rend à ses enfants
  row-gap: var(--gg-blocks-row-gap, var(--48, 3rem));
  grid-auto-flow: row dense;
}

.blocks > * { grid-column: main; }      // défaut : la mesure de lecture
```

`subgrid` hérite des pistes **et de leurs noms** sur l'intervalle couvert. Un bloc enfant peut donc écrire `grid-column: rail` sans rien savoir de la page qui le contient. Sans lui, il faudrait recalculer les pistes en pourcentages dans chaque conteneur — c'est-à-dire réintroduire exactement la dérive qu'on élimine.

`dense` remonte le texte sur la rangée d'un titre placé au rail au lieu d'ouvrir une rangée neuve : le tiers gauche de la page cesse d'être vide sur des écrans entiers. Ce placement peut réordonner visuellement le contenu, ce qui est un risque d'accessibilité ; ici il ne peut pas, parce que les seuls blocs à quitter la piste de texte sont les titres, et un titre précède toujours ce qu'il annonce. **Toute nouvelle règle qui déplace un bloc hors de `main` doit être vérifiée contre cette contrainte.**

> **L'ordre source compte.** `.blocks > *` et `.rail` ont la même spécificité (0,1,0) : le défaut du flux est donc émis **avant** les classes de placement. Inversez-le et chaque enfant de `.blocks` retombe dans `main` — sans erreur. Une règle projet qui ajoute son propre défaut `.blocks > *` doit respecter le même ordre, ou monter d'un cran en spécificité.

## Le tracé {#tracing}

```html
<div class="grid-page">
  <div class="golden-grid grid-rules" aria-hidden="true">
    <span class="rules-rail"></span>
    <span class="rules-shoulder"></span>
    <span class="rules-main"></span>
    <span class="rules-spill"></span>
  </div>
  <!-- les grilles de contenu, frères du tracé -->
</div>
```

L'élément porte **la même classe** que le contenu : ses bandes *sont* les pistes. Aucune approximation en pourcentages, aucun décalage quand la grille évolue.

C'est une pièce du dessin, pas un repère de développement : sans lui, une piste inoccupée ressemble à un oubli ; avec lui, elle se lit comme une proportion tenue. L'épaule est marquée un cran plus fort, parce que c'est elle qui désaxe la page.

```css
:root         { --rule: 1.5%; --rule-void: 2.75%; }
.toggle-theme { --rule: 2%;   --rule-void: 3.5%;  }
```

La couleur vient de `color-mix(in oklab, var(--dark) var(--rule), transparent)`, et `--dark` bascule déjà avec le thème : le tracé s'inverse donc tout seul. Voir [Mode sombre](doc:colors#dark-mode).

Trois contraintes d'implémentation, dont la première est fournie par le composant :

- `.grid-page` sur l'ancêtre — `position: relative` **et** `isolation: isolate`. Sans contexte d'empilement, `z-index: -1` fait passer le tracé derrière le fond du `body` et il disparaît.
- Le tracé doit être **frère** des grilles de contenu, et de même largeur.
- `align-items: stretch` et `row-gap: 0` sur `.grid-rules`, sinon les bandes héritent d'`align-items: start` et se réduisent à zéro.

## Le repli mono-colonne {#fallback}

```scss
@media (max-width: 54rem) {
  .golden-grid {
    grid-template-columns:
      [edge-start] var(--gg-gutter)
      [rail-start shoulder-start main-start spill-start] minmax(0, 1fr)
      [rail-end shoulder-end main-end spill-end] var(--gg-gutter) [edge-end];
  }
}
```

Toutes les lignes nommées se rabattent sur les deux bords de l'unique piste. **Aucune règle de placement n'est réécrite** : `.rail`, `.main`, `.wide` et les placements écrits par les projets continuent de résoudre, et résolvent tous vers la même colonne. Ajouter un bloc n'oblige donc jamais à écrire sa contrepartie mobile — c'est le principal gain de maintenance du composant.

Trois exceptions seulement sont redéclarées : `.spill` garde son débord à droite, `.rail--sticky` repasse en `static`, et `.grid-rules` est masqué — une seule piste n'a plus rien à montrer.

## La règle, et comment la vérifier {#rule}

> **Tout conteneur commence et finit sur une ligne de la grille.** Aucune largeur en `ch`, aucune largeur en pixels, aucun `margin: auto` horizontal. La piste *est* la mesure ; le contenu en ligne coule à l'intérieur.

Cette règle n'a de valeur que parce qu'elle est vérifiable. On lit `grid-template-columns` sur le rendu, on en déduit les abscisses de ligne, puis on mesure chaque conteneur placé. Ce contrôle appartient au guide de styles du projet, **pas** au composant :

```js
const style = getComputedStyle(grid)
const gap   = parseFloat(style.columnGap)
const lines = [0]
let x = 0

for (const track of style.gridTemplateColumns.split(' ').map(parseFloat).filter(Number.isFinite)) {
  x += track; lines.push(Math.round(x))
  x += gap;   lines.push(Math.round(x))
}

const onLine = (v) => lines.some((line) => Math.abs(line - v) < 3)
```

`.grid-debug` sur `<body>` le complète : le tracé montre les pistes, le liseré montre ce qui les occupe.

## Nommage et collisions {#naming}

`_grid.scss` définit déjà `.grid`, `.flex-grid`, `.auto-fit-*` et `.col-*` : le conteneur s'appelle donc `.golden-grid`, jamais `.grid`.

Restent les classes de placement. Avec `$prefix: ''`, le composant émet `.rail`, `.main`, `.wide`, `.spill`, `.bleed`, `.blocks` — des noms génériques dans un espace de noms partagé, et `.main` se confond à la lecture avec le sélecteur d'élément `main`. Aucune de ces six classes n'apparaît dans `dist/eva.css` : la collision n'est donc pas avec le framework, elle est avec les classes du projet.

**Posez `$golden-grid-prefix: 'gg-'` si votre projet a déjà des classes de ce nom** — sinon le défaut convient, et c'est pourquoi la feuille pré-compilée le garde. Le préfixe s'applique à toutes les classes, conteneur compris (`.gg-golden-grid`, `.gg-rail`, `.gg-main`). Les lignes nommées ne changent pas : les placements écrits par les projets restent valides quel que soit le préfixe.

## Recettes {#recipes}

Titre de section et texte côte à côte — le placement dense fait remonter le texte sur la rangée du titre :

```scss
.block-heading {
  grid-column: rail;
  text-align: right;
  text-wrap: balance;
}
```

Cartes posées sur la coupure dorée, deux par rangée, inégales par construction :

```scss
.cards {
  grid-column: edge;
  display: grid;
  grid-template-columns: subgrid;
  row-gap: var(--96);
}

.cards > :nth-child(odd)  { grid-column: rail-start / shoulder-end; }  // 0,382
.cards > :nth-child(even) { grid-column: main-start / spill-end; }     // 0,618
```

Chaque carte peut devenir conteneur de requête et rebasculer l'unité fluide d'EVA sur sa propre largeur, sans requête média — voir [Unité fluide](doc:sizes#fluid-unit) :

```scss
.card { container-type: inline-size; --eva-fluid-unit: 1cqi; }
```

> `container-type` applique le confinement de style, qui **isole les compteurs CSS**. Un numéro de carte doit venir du gabarit, pas d'un `counter-increment` — sinon toutes les cartes affichent `01`.

Sur une échelle de Fibonacci, seuls les gaps sont à repasser ; la marge est un pourcentage de la page et ne consomme aucun cran :

```scss
@use 'eva-css-fluid' with (
  $sizes: (8, 13, 16, 21, 34, 55, 89, 144),
  $golden-grid: true,
  $golden-grid-column-gap: var(--21),
  $golden-grid-row-gap: var(--34),
  $golden-grid-blocks-row-gap: var(--55)
);
```

## Ce qu'il consomme, et ce qu'il ne fait pas {#limits}

| Dépendance | Origine |
|---|---|
| `--24`, `--32`, `--48` | l'échelle `$sizes` — gaps et rythme vertical, fallback CSS si absents |
| `--dark` | le système de couleurs — tracé, via `color-mix` |
| `--brand__` | le système de couleurs — liseré de `.grid-debug` |
| `--rule`, `--rule-void` | posés par le composant, surchargeables en CSS |
| `--gg-*` | posés par le composant — marge calculée et tokens d'exécution |

Rien d'autre. Ni reset, ni utilitaires, ni gradients : `eva-css-fluid/variables` suffit.

Limites connues :

- **Une seule bascule.** Un état intermédiaire à deux pistes est possible mais n'est pas fourni : il demanderait de choisir quelles pistes fusionnent, ce qui est une décision de projet.
- **Le tracé suppose une page à grille unique.** Plusieurs grilles de largeurs différentes rendraient le tracé faux pour l'une d'elles.
- **Pas de variante RTL.** Les rôles sont pensés avec un bord gauche fort ; une version logique demanderait de revoir le sens de l'asymétrie, pas seulement d'échanger les noms.
- **Le contrôle d'alignement est en JS et hors composant.** Sans lui, la règle ci-dessus redevient une simple intention.

`subgrid` est le plancher réel : Chrome 117, Safari 16, Firefox 71 — disponible partout depuis septembre 2023. Sans lui, `.blocks` devient une grille à une colonne : la page reste lisible, elle perd son asymétrie.

```css
@supports not (grid-template-columns: subgrid) {
  .blocks { grid-column: main; display: block; }
}
```

Suite : [Adopter EVA](doc:adopt).
