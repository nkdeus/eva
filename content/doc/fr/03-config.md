---
title: Configuration
nav: Configuration
group: start
eyebrow: Documentation
description: Toutes les options acceptées par les points d'entrée SCSS, ce qu'elles changent dans la sortie, et les deux modes de build.
---

La configuration tient dans un seul bloc `@use ... with (...)`. Pas de fichier de config, pas d'étape CLI, pas de plugin — `sass` le lit et émet la feuille de style.

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 12, 16, 24, 32, 48, 64, 96, 128),
  $font-sizes: (12, 14, 16, 18, 20, 24, 32),
  $build-class: true,
  $px-rem-suffix: false,
  $name-by-size: true,
  $custom-class: false
);
```

> SCSS exige que les listes soient entre parenthèses. `$sizes: (4, 8, 16)` compile ; `$sizes: 4, 8, 16` est une erreur de parsing.

## Options

| Option | Défaut | Effet |
|---|---|---|
| `$sizes` | `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` | Chaque valeur devient un `var(--N)` fluide et ses trois variantes |
| `$font-sizes` | `12, 14, 16, 18, 20, 24, 32, 48` | Chaque valeur devient `var(--fs-N)` et ses deux variantes |
| `$build-class` | `true` | `true` émet les classes utilitaires, `false` uniquement les variables |
| `$px-rem-suffix` | `false` | Ajoute des tokens statiques `--N-px` / `--N-rem` à côté des fluides |
| `$name-by-size` | `true` | `true` nomme par valeur (`--32`), `false` par index (`--3`) |
| `$custom-class` | `false` | Active le filtrage des classes par propriété via `$class-config` |
| `$class-config` | `()` | Map propriété → tailles autorisées, ex. `(w: (64, 128), px: (24))` |
| `$debug` | `false` | Affiche un récapitulatif de génération pendant la compilation |
| `$unit-fluid` | `1vw` | L'unité fluide et son repli runtime — `1vw` ou `1cqi` |
| `$reference-width` | `1440` | Largeur de viewport à laquelle les tokens atteignent leur maximum |
| `$fluid-runtime` | `true` | `false` émet des `clamp()` littéraux au lieu de la forme commutable |
| `$min-font-size` | `0` | Plancher d'accessibilité en px sur les minimums de font-size ; `0` désactive |

`$unit-fluid`, `$reference-width`, `$fluid-runtime` et `$min-font-size` sont arrivés en 2.2.0. `eva-css-fluid/colors` n'en accepte aucun — il ne génère aucune taille.

## Choisir `$sizes`

Listez ce que votre design utilise. Rien d'autre. La liste pilote directement le poids de la sortie : chaque entrée produit quatre tokens de taille et, avec `$build-class: true`, seize propriétés × quatre variantes de classes utilitaires.

Deux contraintes :

- **`16` est obligatoire.** C'est la référence rem. Sans lui, la compilation échoue avec `Size 16 is required as a base size`.
- **Aucune des deux listes ne peut être vide.**

Certaines valeurs n'ont rien à faire dans la liste :

| Valeur | Pourquoi | À garder en |
|---|---|---|
| `0–5px` | Bordures, filets, décalages d'outline | `1px`, `2px` littéraux |
| `999px` | Une pilule est une forme, pas une taille | `999px` littéral |
| Breakpoints (`768`, `1024`, `1280`) | Topologie de mise en page, pas d'espacement | Variables SCSS |
| Cibles tactiles (`44`, `48`) | Plancher d'accessibilité, ne doit pas rétrécir | `48px` littéral |

Reprendre une base de code existante est un exercice différent : la liste se déduit de ce qui est réellement dans le CSS au lieu de s'écrire à la main. Ce workflow est décrit dans [Adopter EVA](doc:adopt#audit).

## Les deux modes de build

`$build-class` est la seule option qui change votre façon d'écrire le markup. Choisissez-en un par projet et tenez-vous-y.

### Classes utilitaires — `$build-class: true`

EVA émet des classes pour seize propriétés sur toutes les tailles, plus les utilitaires de couleur, flex, grid et layout.

```html
<div class="flex y g-16 p-32 br-12 _bg-light _c-dark">
  <h2 class="fs-24">Titre</h2>
</div>
```

Rapide à écrire, et le markup porte le design. La contrepartie est le poids de la feuille de style — ce que [eva-purge](doc:cli#purge) est là pour régler.

### Variables seules — `$build-class: false`

EVA n'émet rien d'autre que des custom properties. Vous écrivez du CSS ordinaire.

```scss
.card {
  display: flex;
  flex-direction: column;
  gap: var(--16);
  padding: var(--32);
  border-radius: var(--12);
  background: var(--light);
  color: var(--dark);
}

.card__title { font-size: var(--fs-24); }
```

Préférable pour un design system, une bibliothèque de composants, et tout ce qui s'insère dans une base de code qui a déjà ses noms de classes. `eva-css-fluid/variables` et `eva-css-fluid/core` imposent ce mode.

> Ne mélangez pas les deux dans un même projet. La moitié des composants pilotée par des classes utilitaires et l'autre par du CSS sémantique, c'est le moyen le plus rapide de ne plus savoir d'où vient une valeur.

## Réduire les classes générées

Avec `$custom-class: true`, `$class-config` restreint la génération par propriété. Seules les tailles listées sont émises pour cette propriété ; les propriétés absentes sont ignorées entièrement.

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 24, 32, 64, 128),
  $font-sizes: (14, 16, 24),
  $custom-class: true,
  $class-config: (
    w: (64, 128),
    px: (16, 24),
    g: (8, 16)
  )
);
```

Les clés doivent être de vrais préfixes de propriété — `w mw h p px pr py br mb mr ml mt pt pb g gap`. Toute autre valeur est une erreur de compilation. Les variables ne sont pas touchées : `var(--32)` existe toujours même si aucune classe `w-32` n'est émise.

## Échappatoires statiques

`$px-rem-suffix: true` ajoute une contrepartie figée à chaque taille :

```css
--32-px: 32px;
--32-rem: 2rem;
```

Deux usages : comparer une valeur fluide à sa référence de maquette dans les devtools, et la poignée de dimensions qui ne doivent pas s'adapter. Avec `$build-class: true` vous obtenez aussi `w-32-px`, `p-32-rem`, etc.

## Unité fluide et plancher d'accessibilité

Depuis 2.2.0, l'unité fluide est une variable d'exécution plutôt qu'une valeur figée au build. Vous configurez le défaut en SCSS, vous le surchargez par sous-arbre en CSS. Tout le détail est dans [Tailles fluides](doc:sizes#fluid-unit).

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 24, 48),
  $font-sizes: (16, 24, 48),
  $unit-fluid: 1vw,        // 1cqi pour suivre les conteneurs plutôt que le viewport
  $reference-width: 1440,  // là où les tokens atteignent leur maximum
  $min-font-size: 14       // plancher px sur les minimums de font-size ; 0 = off
);
```

`$min-font-size` est le plancher *mobile*, pas la taille desktop. 13–14 est une valeur raisonnable ; 16 aplatirait toute l'échelle.

Suite : [Tailles fluides](doc:sizes).
