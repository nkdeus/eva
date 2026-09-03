# EVA CSS — condensed reference

> Generated from content/doc/en. The canonical, human-readable version lives at https://eva-css.xyz/doc/index.html

## Chapters

- [Getting started](https://eva-css.xyz/doc/index.html) — What EVA CSS is, the two ideas it is built on, and a working setup in three commands.
- [Installation](https://eva-css.xyz/doc/install.html) — The three packages, the four SCSS entry points, and how to compile and watch.
- [Configuration](https://eva-css.xyz/doc/config.html) — Every option accepted by the SCSS entry points, what it changes in the output, and the two build modes.
- [Fluid sizing](https://eva-css.xyz/doc/sizes.html) — The four scaling variants, the separate font-size namespace, and switching a subtree from viewport to container.
- [Colors](https://eva-css.xyz/doc/colors.html) — Five roles, three numbers each, and everything else recomposed in OKLCH — opacity fades, brightness steps, per-role tuning and dark mode.
- [Gradients](https://eva-css.xyz/doc/gradients.html) — Composable gradient classes — one applier, then setters for colors, direction, zoom and animation.
- [Utility classes](https://eva-css.xyz/doc/utilities.html) — Every class emitted when $build-class is true — sizing, color, flex, grid, typography and layout.
- [Golden grid](https://eva-css.xyz/doc/golden-grid.html) — The opt-in page grid — four unequal tracks derived from the golden ratio, named lines, and an editorial flow carried by subgrid.
- [Adopting EVA](https://eva-css.xyz/doc/adopt.html) — Wiring EVA into a project that already ships — the px audit, fusing near-duplicates, aliasing design tokens, and the traps.
- [CLI tools](https://eva-css.xyz/doc/cli.html) — eva-color for OKLCH conversion, palettes, themes and contrast; eva-purge for stripping the classes you never used.
- [Reference](https://eva-css.xyz/doc/reference.html) — Every option, token and class in one flat list.

---

# Reference

Source: https://eva-css.xyz/doc/reference.html

Everything EVA emits, in one place. Version 2.6.0.

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

| Option | Default |
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

## Entry points

| Entry | Variables | Colors | Gradients | Reset + type | Utility classes |
|---|---|---|---|---|---|
| `eva-css-fluid` | yes | yes | yes | yes | yes |
| `eva-css-fluid/core` | yes | yes | yes | yes | no |
| `eva-css-fluid/variables` | yes | yes | no | no | no |
| `eva-css-fluid/colors` | no | yes | no | no | no |
| `eva-css-fluid/golden-grid` | no | no | no | no | the [golden grid](doc:golden-grid) only |

## Size tokens

For each `N` in `$sizes`:

| Token | Behaviour |
|---|---|
| `var(--N__)` | Most aggressive collapse on small screens |
| `var(--N_)` | Strong collapse |
| `var(--N)` | Standard scaling |
| `var(--N-)` | Conservative — high mobile floor |
| `var(--N-px)` | Static px, only with `$px-rem-suffix: true` |
| `var(--N-rem)` | Static rem, only with `$px-rem-suffix: true` |

For each `N` in `$font-sizes`:

| Token | Behaviour |
|---|---|
| `var(--fs-N__)` | Most aggressive |
| `var(--fs-N_)` | Strong |
| `var(--fs-N)` | Standard — use for body copy |
| `var(--fs-N-px)` / `var(--fs-N-rem)` | Static, with `$px-rem-suffix: true` |

Runtime unit: `--eva-fluid-unit`, default `1vw`, override to `1cqi` per subtree. Classes `.eva-cqi` and `.eva-root`.

## Color tokens

Roles: `brand`, `accent`, `extra`, `dark`, `light`.

| Token | Meaning |
|---|---|
| `var(--<role>)` | The role |
| `var(--<role>_)` | 65% opacity |
| `var(--<role>__)` | 35% opacity |
| `var(--<role>___)` | 15% opacity |
| `var(--<role>-d)` | One step more contrast |
| `var(--<role>-b)` | One step less contrast |
| `var(--<role>-d_)` | Two steps more contrast |
| `var(--<role>-b_)` | Two steps less contrast |
| `var(--root-<role>)` | The raw `L C H` triplet |

Theme inputs, per role: `--<role>-lightness`, `--<role>-chroma`, `--<role>-hue`.

Mode pivots: `--current-lightness` (`96.4%` light / `5%` dark), `--current-darkness` (`6.4%` / `95%`).

Brightness formula:

```text
lightness = base + absolute offset + (bound − base) × ratio
```

| Step | Token | Light | Dark | Bound (light) | Bound (dark) |
|---|---|---|---|---|---|
| `-d` | `--darker` | `-5%` | `10%` | `0%` | `100%` |
| `-b` | `--brighter` | `10%` | `-5%` | `100%` | `0%` |
| `-d_` | `--darker_` | `-15%` | `30%` | `0%` | `100%` |
| `-b_` | `--brighter_` | `30%` | `-15%` | `100%` | `0%` |

Per-role overrides, with `<token>` in `darker`, `brighter`, `darker_`, `brighter_`:

| Form | Scope | Default |
|---|---|---|
| `--<role>-<token>` | one role | unset |
| `--<role>-<token>-ratio` | one role | `0` |
| `--<token>-ratio` | global | `0` |
| `--<role>-<token>-bound` | one role | unset |
| `--<token>-bound` | global | see table |

Body classes: `current-theme` (required), `theme-<name>`, `toggle-theme` (dark), `all-grads` (gradients).

## Utility classes

**Sizing** — `w mw h p px py pt pb pr mt mb ml mr g gap br`, each × every size × `__ _ (none) -`.

**Font size** — `fs-N`, `fs-N_`, `fs-N__`.

**Color** — `_c- _bg- _bc- _f- _s-` × 5 roles × 8 variants. Plus `_shadow`, `_shadow_`.

**Flex** — `flex`, `x`, `y`, `reverse`, `wrap`, `nowrap`, `wrap-reverse`; `start center end space around evenly`; compound `justify-align` forms; `justify-*`, `items-*`, `content-*`; `flex-1 flex-2 flex-3 flex-auto flex-initial flex-none stretch`; `self-*`; `order-1`…`order-12`, `order-first`, `order-last`, `order-none`; `flex-card`, `flex-sidebar`.

**Grid** — `grid`, `auto-fit-<size><variant>` (sizes ≥ 100 only), `flex-grid`, `container:flex-grid`, `col-1`…`col-12`, `col-1/1`…`col-1/12`, `max-col-1`…`max-col-12`, `xs:max-col-N`…`xxl:max-col-N`.

**Gradients** — `grad-linear`, `grad-radial`, `grad-linear-text`, `grad-radial-text`, `grad-linear-border`, `grad-radial-border`; `from-*`, `to-*`, `from-transparent`, `to-transparent`; `d-t d-b d-l d-r d-tl d-tr d-bl d-br`; `a-0`…`a-360` in 5° steps; `bg-size`, `bg-size_`, `bg-size__`; `bg-center bg-top bg-bottom bg-left bg-right`; `animated`, `animated-slow`, `animated-fast`.

**Typography** — `fwg-1`…`fwg-8`, `fwd-1`…`fwd-13`, `f-scale`, `f-scale offset`, `bold`, `ttu`, `tac`, `lh-0`, `lh-1`.

**Layout** — `por poa pof pos`, `poa center`, `w-full`, `h-full`, `oh`, `ar-1`, `circle`, `border`, `border thin`, `blur blur_ blur__`, `pointer`, `hide`, `lt`, `mt-auto mb-auto ml-auto mr-auto`.

## Golden grid

Opt-in page grid, 2.5.0. Full chapter: [Golden grid](doc:golden-grid).

```scss
@use 'eva-css-fluid' with (
  $golden-grid: false,
  $golden-grid-prefix: '',
  $golden-grid-max: null,
  $golden-grid-gutter-phi: 6,
  $golden-grid-breakpoint: 54rem,
  $golden-grid-gutter-min: var(--24, 1.5rem),
  $golden-grid-column-gap: var(--24, 1.5rem),
  $golden-grid-row-gap: var(--32, 2rem),
  $golden-grid-blocks-row-gap: var(--48, 3rem),
  $golden-grid-rules: true,
  $golden-grid-rail-align-mobile: right,
  $golden-grid-auto-theme-switch: false
);
```

Tracks, as fractions of the composition: rail `0.236`, shoulder `0.146`, text `0.382`, spill `0.236`. Margins: `0.056` of the page.

Named lines — never prefixed: `edge-start`, `rail-start`, `rail-end`/`shoulder-start`, `shoulder-end`/`main-start`, `main-end`/`spill-start`, `spill-end`, `edge-end`. Shorthand areas: `rail`, `main`, `spill`, `edge`.

Classes, all taking `$golden-grid-prefix`: `.golden-grid`, `.grid-page`, `.blocks`, `.rail`, `.rail--sticky`, `.main`, `.wide`, `.spill`, `.bleed`, `.grid-rules` (+ `.rules-rail`, `.rules-shoulder`, `.rules-main`, `.rules-spill`), `.grid-debug`.

Runtime tokens: `--gg-column-gap`, `--gg-row-gap`, `--gg-blocks-row-gap`. Computed by the component: `--gg-gutter`, `--rule`, `--rule-void`.

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

## Rules

1. No fixed values. `var(--64)`, not `64px`. `var(--brand)`, not `#ff5733`.
2. Only list the sizes the design actually uses.
3. `16` is mandatory in `$sizes`.
4. Font tokens are `--fs-N`. `$sizes` and `$font-sizes` are independent namespaces.
5. Pick one build mode per project and hold it.
6. `current-theme` on the root element, always.
7. `all-grads` on the container if you use gradients.
8. Media queries for layout topology only — never for spacing or type.

## Known limits

- **The two color axes do not cross.** No opacity variant of a brightness step; no `--brand-d__`.
- **Fades are inlined at build time.** `$fade-values` (65 / 35 / 15%) is a SCSS variable, not a runtime one — no per-theme control.
- **`dark` and `light` inherit `--brand-hue`** with a non-zero chroma, so neutrals are brand-tinted unless you pin them.
- **Dark mode overrides configured lightness.** `.toggle-theme` sets `--dark-lightness` and `--light-lightness` with `!important`; only hue and chroma survive the switch.
- **`auto-fit-*` exists only for sizes ≥ 100.**

## Links

- [GitHub](https://github.com/nkdeus/eva)
- [eva-css-fluid on npm](https://www.npmjs.com/package/eva-css-fluid)
- [eva-colors on npm](https://www.npmjs.com/package/eva-colors)
- [eva-css-purge on npm](https://www.npmjs.com/package/eva-css-purge)
