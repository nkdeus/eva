---
title: Référence
nav: Référence
group: reference
eyebrow: Documentation
description: Toutes les options, tous les tokens et toutes les classes, en une seule liste à plat.
---

Tout ce qu'EVA émet, au même endroit. Version 2.4.0.

## Configuration

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 12, 16, 24, 32, 48, 64, 96, 128),
  $font-sizes: (12, 14, 16, 18, 20, 24, 32),
  $build-class: true,
  $px-rem-suffix: false,
  $name-by-size: true,
  $custom-class: false,
  $class-config: (),
  $debug: false,
  $unit-fluid: 1vw,
  $reference-width: 1440,
  $fluid-runtime: true,
  $min-font-size: 0
);
```

| Option | Défaut |
|---|---|
| `$sizes` | `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` |
| `$font-sizes` | `12, 14, 16, 18, 20, 24, 32, 48` |
| `$build-class` | `true` |
| `$px-rem-suffix` | `false` |
| `$name-by-size` | `true` |
| `$custom-class` | `false` |
| `$class-config` | `()` |
| `$debug` | `false` |
| `$unit-fluid` | `1vw` |
| `$reference-width` | `1440` |
| `$fluid-runtime` | `true` |
| `$min-font-size` | `0` |

## Points d'entrée

| Entrée | Variables | Couleurs | Dégradés | Reset + typo | Classes utilitaires |
|---|---|---|---|---|---|
| `eva-css-fluid` | oui | oui | oui | oui | oui |
| `eva-css-fluid/core` | oui | oui | oui | oui | non |
| `eva-css-fluid/variables` | oui | oui | non | non | non |
| `eva-css-fluid/colors` | non | oui | non | non | non |

## Tokens de taille

Pour chaque `N` dans `$sizes` :

| Token | Comportement |
|---|---|
| `var(--N__)` | Effondrement le plus fort sur petit écran |
| `var(--N_)` | Effondrement marqué |
| `var(--N)` | Échelle standard |
| `var(--N-)` | Conservateur — plancher mobile haut |
| `var(--N-px)` | px figé, uniquement avec `$px-rem-suffix: true` |
| `var(--N-rem)` | rem figé, uniquement avec `$px-rem-suffix: true` |

Pour chaque `N` dans `$font-sizes` :

| Token | Comportement |
|---|---|
| `var(--fs-N__)` | Le plus agressif |
| `var(--fs-N_)` | Marqué |
| `var(--fs-N)` | Standard — à utiliser pour le texte courant |
| `var(--fs-N-px)` / `var(--fs-N-rem)` | Figés, avec `$px-rem-suffix: true` |

Unité runtime : `--eva-fluid-unit`, défaut `1vw`, à surcharger en `1cqi` par sous-arbre. Classes `.eva-cqi` et `.eva-root`.

## Tokens de couleur

Rôles : `brand`, `accent`, `extra`, `dark`, `light`.

| Token | Signification |
|---|---|
| `var(--<rôle>)` | Le rôle |
| `var(--<rôle>_)` | 65 % d'opacité |
| `var(--<rôle>__)` | 35 % d'opacité |
| `var(--<rôle>___)` | 15 % d'opacité |
| `var(--<rôle>-d)` | Un cran de contraste en plus |
| `var(--<rôle>-b)` | Un cran de contraste en moins |
| `var(--<rôle>-d_)` | Deux crans de contraste en plus |
| `var(--<rôle>-b_)` | Deux crans de contraste en moins |
| `var(--root-<rôle>)` | Le triplet `L C H` brut |

Entrées de thème, par rôle : `--<rôle>-lightness`, `--<rôle>-chroma`, `--<rôle>-hue`.

Pivots de mode : `--current-lightness` (`96.4%` clair / `5%` sombre), `--current-darkness` (`6.4%` / `95%`).

Formule des crans :

```text
lightness = base + décalage absolu + (butée − base) × ratio
```

| Cran | Token | Clair | Sombre | Butée (clair) | Butée (sombre) |
|---|---|---|---|---|---|
| `-d` | `--darker` | `-5%` | `10%` | `0%` | `100%` |
| `-b` | `--brighter` | `10%` | `-5%` | `100%` | `0%` |
| `-d_` | `--darker_` | `-15%` | `30%` | `0%` | `100%` |
| `-b_` | `--brighter_` | `30%` | `-15%` | `100%` | `0%` |

Surcharges par rôle, avec `<token>` dans `darker`, `brighter`, `darker_`, `brighter_` :

| Forme | Portée | Défaut |
|---|---|---|
| `--<rôle>-<token>` | un rôle | non défini |
| `--<rôle>-<token>-ratio` | un rôle | `0` |
| `--<token>-ratio` | global | `0` |
| `--<rôle>-<token>-bound` | un rôle | non défini |
| `--<token>-bound` | global | cf. tableau |

Classes sur le body : `current-theme` (obligatoire), `theme-<nom>`, `toggle-theme` (sombre), `all-grads` (dégradés).

## Classes utilitaires

**Tailles** — `w mw h p px py pt pb pr mt mb ml mr g gap br`, chacune × chaque taille × `__ _ (rien) -`.

**Taille de texte** — `fs-N`, `fs-N_`, `fs-N__`.

**Couleur** — `_c- _bg- _bc- _f- _s-` × 5 rôles × 8 variantes. Plus `_shadow`, `_shadow_`.

**Flex** — `flex`, `x`, `y`, `reverse`, `wrap`, `nowrap`, `wrap-reverse` ; `start center end space around evenly` ; formes composées `justify-align` ; `justify-*`, `items-*`, `content-*` ; `flex-1 flex-2 flex-3 flex-auto flex-initial flex-none stretch` ; `self-*` ; `order-1`…`order-12`, `order-first`, `order-last`, `order-none` ; `flex-card`, `flex-sidebar`.

**Grid** — `grid`, `auto-fit-<taille><variante>` (tailles ≥ 100 seulement), `flex-grid`, `container:flex-grid`, `col-1`…`col-12`, `col-1/1`…`col-1/12`, `max-col-1`…`max-col-12`, `xs:max-col-N`…`xxl:max-col-N`.

**Dégradés** — `grad-linear`, `grad-radial`, `grad-linear-text`, `grad-radial-text`, `grad-linear-border`, `grad-radial-border` ; `from-*`, `to-*`, `from-transparent`, `to-transparent` ; `d-t d-b d-l d-r d-tl d-tr d-bl d-br` ; `a-0`…`a-360` par pas de 5° ; `bg-size`, `bg-size_`, `bg-size__` ; `bg-center bg-top bg-bottom bg-left bg-right` ; `animated`, `animated-slow`, `animated-fast`.

**Typographie** — `fwg-1`…`fwg-8`, `fwd-1`…`fwd-13`, `f-scale`, `f-scale offset`, `bold`, `ttu`, `tac`, `lh-0`, `lh-1`.

**Mise en page** — `por poa pof pos`, `poa center`, `w-full`, `h-full`, `oh`, `ar-1`, `circle`, `border`, `border thin`, `blur blur_ blur__`, `pointer`, `hide`, `lt`, `mt-auto mb-auto ml-auto mr-auto`.

## CLI

```bash
npx eva-color convert "#ff0000"
npx eva-color to-hex 62.8 0.258 29.23
npx eva-color palette "#ff0000" 7
npx eva-color theme theme.json
npx eva-color contrast "#ffffff" "#000000"

npx eva-purge --css styles/main.css --content "**/*.html" \
  --output styles/main-compressed.css --safelist "current-theme,toggle-theme,all-grads"
```

## Règles

1. Aucune valeur figée. `var(--64)`, pas `64px`. `var(--brand)`, pas `#ff5733`.
2. Ne listez que les tailles que le design utilise réellement.
3. `16` est obligatoire dans `$sizes`.
4. Les tokens de texte sont des `--fs-N`. `$sizes` et `$font-sizes` sont deux espaces de noms indépendants.
5. Un seul mode de build par projet, et on s'y tient.
6. `current-theme` sur l'élément racine, toujours.
7. `all-grads` sur le conteneur si vous utilisez les dégradés.
8. Des media queries pour la topologie de mise en page uniquement — jamais pour l'espacement ni la typographie.

## Limites connues

- **Les deux axes de couleur ne se croisent pas.** Pas de variante d'opacité d'un cran de luminosité ; pas de `--brand-d__`.
- **Les fondus sont inlinés au build.** `$fade-values` (65 / 35 / 15 %) est une variable SCSS, pas une variable d'exécution — aucun contrôle par thème.
- **`dark` et `light` héritent de `--brand-hue`** avec un chroma non nul : les neutres sont donc teintés par la marque tant que vous ne les fixez pas.
- **Le mode sombre écrase la lightness configurée.** `.toggle-theme` pose `--dark-lightness` et `--light-lightness` en `!important` ; seuls la hue et le chroma survivent à la bascule.
- **`auto-fit-*` n'existe que pour les tailles ≥ 100.**

## Liens

- [GitHub](https://github.com/nkdeus/eva)
- [eva-css-fluid sur npm](https://www.npmjs.com/package/eva-css-fluid)
- [eva-colors sur npm](https://www.npmjs.com/package/eva-colors)
- [eva-css-purge sur npm](https://www.npmjs.com/package/eva-css-purge)
