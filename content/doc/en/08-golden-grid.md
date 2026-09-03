---
title: Golden grid
nav: Golden grid
group: system
eyebrow: Documentation
description: The opt-in page grid — four unequal tracks derived from the golden ratio, named lines, and an editorial flow carried by subgrid.
---

`golden-grid` is a page grid in golden sections: four tracks of unequal width, from the recursive subdivision of the golden ratio, whose fractions sum to exactly 1. Nothing is centred. The page has three left edges instead of one axis, and an element never declares a width — it declares the role it plays.

```text
├──── margin ────┼── rail ──┼─ shoulder ─┼───── text ─────┼─── spill ───┼──── margin ────┤
      φ⁻⁶            φ⁻³         φ⁻⁴            φ⁻²             φ⁻³           φ⁻⁶
     0.056          0.236       0.146          0.382           0.236         0.056
   of the page   └────────────── of the composition ────────────────┘     of the page
```

It shipped in eva-css-fluid 2.5.0. It is **opt-in**: neither `core` nor `variables` loads it, and the main entry emits nothing until you switch it on. A golden grid is a layout stance, not a sensible default.

> See it live: the [golden-grid demo](site:framework/golden-grid.html) runs the component with the tracing, the single-column fallback and a gap slider, and measures its own alignment at every resize.

## Turning it on {#activation}

From the full framework:

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 12, 16, 20, 32, 52, 84, 136, 220),
  $font-sizes: (12, 16, 24, 36, 52),
  $golden-grid: true,
  $golden-grid-prefix: 'gg-',      // recommended, see Naming below
  $golden-grid-column-gap: var(--20)
);
```

As a standalone component — the lightest mode, with no reset, no utilities, no gradients:

```scss
@use 'eva-css-fluid/variables';
@use 'eva-css-fluid/golden-grid' with (
  $max: 1280px,
  $prefix: 'gg-',
  $rules: true
);
```

Without Sass, a pre-compiled sheet ships next to `eva.css` and consumes its variables. 2.1 KB, default configuration, unprefixed classes:

```html
<link rel="stylesheet" href="eva-css-fluid/dist/eva.css">
<link rel="stylesheet" href="eva-css-fluid/dist/golden-grid.css">
```

> `index.scss` always loads the module, so from the main entry every option goes through the `$golden-grid-*` variables. Adding a separate `@use 'eva-css-fluid/golden-grid' with (…)` on top of `@use 'eva-css-fluid'` fails — Sass refuses to configure a module that is already loaded.

## Why not twelve columns {#roles}

A 12-column grid is a system of **division**: you take 4, 6 or 8 columns depending on what has to fit. The proportions are a result, never a decision, and since every column is worth the same, the only way to build hierarchy is to centre or to count.

`golden-grid` is a system of **proportion**. The four tracks have different, non-interchangeable widths, and each one has a function.

| Track | Fraction | Role |
|---|---|---|
| **rail** | φ⁻³ = 0.236 | Metadata, dates, numbers, section titles. Right-aligned. First left edge. |
| **shoulder** | φ⁻⁴ = 0.146 | Void, almost always. It is what throws the page off-axis. |
| **text** | φ⁻² = 0.382 | The reading measure, ≈ 53 characters. Second left edge. |
| **spill** | φ⁻³ = 0.236 | Where images and large titles run off to the right. Third left edge. |

Four consequences, and they are the point of the component:

1. **The page has no axis, it has a progression.** Nothing is centred anywhere. The eye moves down along edges, not along a middle.
2. **The void is a value, not a leftover.** The shoulder is a declared, drawn, measurable track. No class targets it alone, so overflowing content cannot reclaim it.
3. **The reading measure is derived, not set.** No `max-width: 65ch`: 0.382 of the composition gives ≈ 442 px at 1440, about 53 characters at 17 px. If the page grows, the measure grows in the same ratio.
4. **The margin is a share too.** φ⁻⁶ of the page, not a step of the scale.

What it is *not* for: component grids — cards, tables, forms. Those stay with `auto-fit-*` and `flex-grid`, covered under [Utility classes](doc:utilities). `golden-grid` is a grid **of the page**.

## The geometry {#geometry}

The whole page is 1. Apply the golden cut, then cut each of the two parts by the same ratio:

```text
1
├──── φ⁻² = 0.382 ────────┬──────── φ⁻¹ = 0.618 ────────────────┤   cut 1
│                         │
├─ φ⁻³ ──┬─ φ⁻⁴ ┤         ├─ φ⁻² ──────────┬─ φ⁻³ ──┤              cuts 2 and 2'
  0.236   0.146             0.382            0.236
  rail    shoulder          text             spill
```

The four tracks are not four chosen numbers: they are the four leaves of a two-level tree. What lands the sum on 1 is the golden recurrence `φⁿ = φⁿ⁺¹ + φⁿ⁺²`:

```text
φ⁻³ + φ⁻⁴ = φ⁻²          (0.236068 + 0.145898 = 0.381966)
φ⁻² + φ⁻³ = φ⁻¹          (0.381966 + 0.236068 = 0.618034)
φ⁻² + φ⁻¹ = 1
```

Rounded to three decimals the sum is still exactly 1 — `0.236 + 0.146 + 0.382 + 0.236 = 1.000` — which is what allows the values to be written as they are in the stylesheet.

> CSS does not require `fr` values to sum to 1: `fr` normalises, and `2fr 1fr` renders like `0.667fr 0.333fr`. Writing fractions that sum to 1 is a discipline of **reading** — each number is directly the share of the composition, and a mistake shows up in the addition.

At 1440 px, with `--20` gaps: margins 2 × 81 px, five gaps ≈ 100 px, composition ≈ 1178 px.

| Track | Fraction | Width |
|---|---|---|
| margin | 0.056 *of the page* | 81 px |
| rail | 0.236 | 278 px |
| shoulder | 0.146 | 172 px |
| text | 0.382 | 450 px |
| spill | 0.236 | 278 px |

## Named lines and placement classes {#api}

The named lines are the public contract. Any placement rule you write should use these names, never a column number. They are **never prefixed**: their scope is the grid itself, so no collision is possible.

```text
edge-start · rail-start · rail-end/shoulder-start · shoulder-end/main-start
           · main-end/spill-start · spill-end · edge-end
```

The named areas `rail`, `main`, `spill` and `edge` work as shorthands: `grid-column: rail` is `grid-column: rail-start / rail-end`.

The classes below all take `$prefix` (empty by default).

| Class | Span | Use |
|---|---|---|
| `.golden-grid` | — | The container. Carries the six tracks and the self-centring golden margin. |
| `.grid-page` | — | On the ancestor of the tracing: `position: relative` + `isolation: isolate`. |
| `.rail` | `rail` | Metadata. Adds `text-align: right`, so the words butt against the shoulder's void. |
| `.main` | `main` | Body text. Nothing else lives here. |
| `.wide` | `shoulder-start / spill-end` | Titles, pull quotes, wide images. Eats the shoulder, so it breaks the left alignment on purpose. |
| `.spill` | `main-start / edge-end` | Asymmetric spill: left edge on the text column, right edge on the page edge. |
| `.bleed` | `edge` | Full width, margins included. |
| `.rail--sticky` | — | The rail follows the reading (`position: sticky`). Neutralised in single-column. |
| `.blocks` | `edge` + `subgrid` | Editorial flow container that hands the tracks back to its children. |
| `.grid-rules` | — | The background tracing. |
| `.grid-debug` | — | On `<body>`: outlines every placed element. |

```html
<article class="golden-grid">
  <p class="rail">Latest work</p>
  <h1 class="wide">Title</h1>
  <div class="main">Standfirst</div>
</article>
```

## Options {#options}

Every option exists under two names: the component's own (standalone mode) and its `$golden-grid-*` equivalent on the main entry.

| Component | Main entry | Default | Effect |
|---|---|---|---|
| `$enabled` | `$golden-grid` | `true` / `false` | `false` emits no rule at all. |
| `$max` | `$golden-grid-max` | `1440px` / `null` | Maximum width. `null` follows `$reference-width`. |
| `$gutter-phi` | `$golden-grid-gutter-phi` | `6` | Margin = φ⁻ⁿ of the page. `false` puts it back on `$gutter-min`. |
| `$breakpoint` | `$golden-grid-breakpoint` | `54rem` | The single fallback point (4 tracks → 1). |
| `$gutter-min` | `$golden-grid-gutter-min` | `var(--24, 1.5rem)` | Margin when `$gutter-phi` is `false`. |
| `$column-gap` | `$golden-grid-column-gap` | `var(--24, 1.5rem)` | Gap between tracks. |
| `$row-gap` | `$golden-grid-row-gap` | `var(--32, 2rem)` | Vertical rhythm of the container. |
| `$blocks-row-gap` | `$golden-grid-blocks-row-gap` | `var(--48, 3rem)` | Vertical rhythm of the editorial flow. |
| `$prefix` | `$golden-grid-prefix` | `''` | Class prefix. `'gg-'` recommended in the full framework. |
| `$rules` | `$golden-grid-rules` | `true` | Emit the background tracing. |
| `$rail-align-mobile` | `$golden-grid-rail-align-mobile` | `right` | `right` or `left` below the switch point. |
| `$auto-theme-switch` | `$golden-grid-auto-theme-switch` | `false` | Tracing intensity in dark mode: `prefers-color-scheme` (`true`) or `.toggle-theme` (`false`). |
| `$phi` | — | `1.618034` | The golden ratio. The four tracks derive from it. |

The gaps default to `--24`, `--32` and `--48`. Those three numbers are not in every `$sizes` list — this site's is `(4, 8, 12, 16, 20, 32, …)` — so remap them rather than relying on the CSS fallback:

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 12, 16, 20, 32, 52, 84, 136, 220),
  $golden-grid: true,
  $golden-grid-column-gap: var(--20),
  $golden-grid-row-gap: var(--32),
  $golden-grid-blocks-row-gap: var(--52)
);
```

### Runtime tokens {#runtime-tokens}

Three custom properties retune the grid **without recompiling**. The `var()` fallback is the compiled value, so nothing changes until something is set — and since custom properties inherit, setting them on any ancestor is enough.

| Token | Fallback | Effect |
|---|---|---|
| `--gg-column-gap` | `$column-gap` | The air between tracks. Does not touch the proportions. |
| `--gg-row-gap` | `$row-gap` | Vertical rhythm of the container. |
| `--gg-blocks-row-gap` | `$blocks-row-gap` | Vertical rhythm of the editorial flow. |

```css
.section--dense { --gg-column-gap: var(--12); --gg-row-gap: var(--16); }
```

`--gg-gutter` is not an input: the component computes it on `.golden-grid`. To force it you have to target that element; otherwise go through `$gutter-phi` or `$gutter-min` at compile time.

Gaps are the only geometry setting exposed at runtime, and that is deliberate: `column-gap` is taken **before** the `fr` distribution, so the four fractions stay `0.236 / 0.146 / 0.382 / 0.236` whatever its value. Only the composition surface shrinks. Tracks and margins stay compile-time decisions — opening them at runtime would let a project break the geometry with no error.

## The golden margin {#margin}

```css
--gg-gutter: max(5.6%, calc((100% - 1440px) / 2));   /* 5.6% = φ⁻⁶ */
```

One declaration, two regimes, and `max()` picks:

- **below `$max`**, the percentage term wins: the margin is φ⁻⁶ of the page, so it stays golden at every width and grows with the window;
- **above**, the centring term wins: the margin absorbs half the surplus and the composition settles on `$max`.

The switch happens at `W ≈ 1622 px` with the defaults. The grid is therefore constrained **and** centred with no intermediate wrapper: one element carries the maximum width, the margins and the tracks at once. Which is why `.bleed` reaches the screen edge without the usual `margin-inline: calc(50% - 50vw)`, and without risking a horizontal scrollbar.

Two units live side by side, and that is the key to the system: **the margin is a share of the page, the tracks are shares of the composition.** The `1` of the golden ratio is not the window — it is what the margins and the gaps leave.

The gaps are not golden, and cannot be. There are two margins but **five** gaps: at the next term of the series they would take 5 × 80.6 = 403 px out of 1440 and empty the composition. A gap is not a division of the page, it is the air between tracks — it belongs to the scale, not to the series.

## The editorial flow {#blocks}

`subgrid` is the piece that makes the system usable on running content.

```scss
.blocks {
  grid-column: edge;                    // spans the six tracks
  display: grid;
  grid-template-columns: subgrid;       // and hands them to its children
  row-gap: var(--gg-blocks-row-gap, var(--48, 3rem));
  grid-auto-flow: row dense;
}

.blocks > * { grid-column: main; }      // default: the reading measure
```

`subgrid` inherits the tracks **and their names** over the span it covers. A child block can write `grid-column: rail` without knowing anything about the page that contains it. Without it you would have to recompute the tracks in percentages inside every container — reintroducing exactly the drift the component removes.

`dense` pulls the text up onto the row of a title placed on the rail instead of opening a new row, so the left third of the page stops being empty for whole screens. It can reorder content visually, which is an accessibility risk; here it cannot, because the only blocks that leave the text track are titles, and a title always precedes what it announces. **Any new rule that moves a block out of `main` has to be checked against that constraint.**

> **Source order matters.** `.blocks > *` and `.rail` have the same specificity (0,1,0), so the flow default is emitted **before** the placement classes. Reverse it and every child of `.blocks` falls back into `main` — silently. A project rule that adds its own `.blocks > *` default has to respect the same order, or gain a specificity notch.

## The tracing {#tracing}

```html
<div class="grid-page">
  <div class="golden-grid grid-rules" aria-hidden="true">
    <span class="rules-rail"></span>
    <span class="rules-shoulder"></span>
    <span class="rules-main"></span>
    <span class="rules-spill"></span>
  </div>
  <!-- the content grids, siblings of the tracing -->
</div>
```

The element carries **the same class** as the content: its bands *are* the tracks. No percentage approximation, no drift when the grid changes.

This is a piece of the drawing, not a development guide: without it an unoccupied track looks like an oversight; with it, it reads as a proportion that is being held. The shoulder is marked one notch stronger, because it is what throws the page off-axis.

```css
:root         { --rule: 1.5%; --rule-void: 2.75%; }
.toggle-theme { --rule: 2%;   --rule-void: 3.5%;  }
```

The colour comes from `color-mix(in oklab, var(--dark) var(--rule), transparent)`, and `--dark` already flips with the theme, so the tracing inverts on its own. See [Dark mode](doc:colors#dark-mode).

Three implementation constraints, the first of which the component provides:

- `.grid-page` on the ancestor — `position: relative` **and** `isolation: isolate`. With no stacking context, `z-index: -1` puts the tracing behind the `body` background and it disappears.
- The tracing must be a **sibling** of the content grids and the same width.
- `align-items: stretch` and `row-gap: 0` on `.grid-rules`, or the bands inherit `align-items: start` and collapse to zero height.

## The single-column fallback {#fallback}

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

Every named line collapses onto the two edges of the single track. **No placement rule is rewritten**: `.rail`, `.main`, `.wide` and the placements written by projects all keep resolving, and they all resolve to the same column. Adding a block never means writing its mobile counterpart — that is the component's main maintenance gain.

Only three exceptions are redeclared: `.spill` keeps its right-hand run-off, `.rail--sticky` goes back to `static`, and `.grid-rules` is hidden — one track has nothing left to show.

## The rule, and how to check it {#rule}

> **Every container starts and ends on a grid line.** No width in `ch`, no width in pixels, no horizontal `margin: auto`. The track *is* the measure; inline content flows inside it.

The rule is only worth something because it is checkable. Read `grid-template-columns` off the rendering, derive the line positions, then measure every placed container. This check lives in the project's style guide, **not** in the component:

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

`.grid-debug` on `<body>` complements it: the tracing shows the tracks, the outline shows what occupies them.

## Naming and collisions {#naming}

`_grid.scss` already defines `.grid`, `.flex-grid`, `.auto-fit-*` and `.col-*`, so the container is called `.golden-grid`, never `.grid`.

The placement classes are the real question. With `$prefix: ''` the component emits `.rail`, `.main`, `.wide`, `.spill`, `.bleed`, `.blocks` — generic names in a shared namespace, and `.main` reads like the `main` element selector. None of those six appears anywhere in `dist/eva.css`, so the collision is not with the framework: it is with the project's own classes.

**Set `$golden-grid-prefix: 'gg-'` if your project already uses names like that** — otherwise the default is fine, which is why the pre-compiled sheet keeps it. The prefix applies to every class, container included (`.gg-golden-grid`, `.gg-rail`, `.gg-main`). Named lines never change, so project placements stay valid whatever the prefix.

## Recipes {#recipes}

Section title and text side by side — dense placement pulls the text up onto the title's row:

```scss
.block-heading {
  grid-column: rail;
  text-align: right;
  text-wrap: balance;
}
```

Cards on the golden cut, two per row, unequal by construction:

```scss
.cards {
  grid-column: edge;
  display: grid;
  grid-template-columns: subgrid;
  row-gap: var(--96);
}

.cards > :nth-child(odd)  { grid-column: rail-start / shoulder-end; }  // 0.382
.cards > :nth-child(even) { grid-column: main-start / spill-end; }     // 0.618
```

Each card can become a query container and switch EVA's fluid unit onto its own width, with no media query — see [Fluid unit](doc:sizes#fluid-unit):

```scss
.card { container-type: inline-size; --eva-fluid-unit: 1cqi; }
```

> `container-type` applies style containment, which **isolates CSS counters**. A card number has to come from the template, not from a `counter-increment` — otherwise every card shows `01`.

A Fibonacci scale only needs the gaps remapped; the margin is a percentage of the page and consumes no step:

```scss
@use 'eva-css-fluid' with (
  $sizes: (8, 13, 16, 21, 34, 55, 89, 144),
  $golden-grid: true,
  $golden-grid-column-gap: var(--21),
  $golden-grid-row-gap: var(--34),
  $golden-grid-blocks-row-gap: var(--55)
);
```

## What it consumes, and what it does not do {#limits}

| Dependency | Origin |
|---|---|
| `--24`, `--32`, `--48` | the `$sizes` scale — gaps and vertical rhythm, CSS fallback if absent |
| `--dark` | the color system — tracing, through `color-mix` |
| `--brand__` | the color system — `.grid-debug` outline |
| `--rule`, `--rule-void` | set by the component, overridable in CSS |
| `--gg-*` | set by the component — computed margin and runtime tokens |

Nothing else. No reset, no utilities, no gradients: `eva-css-fluid/variables` is enough.

Known limits:

- **One switch only.** A two-track intermediate state is possible but not shipped: it would mean deciding which tracks merge, and that is a project decision.
- **The tracing assumes a single grid per page.** Several grids of different widths would make it wrong for one of them.
- **No RTL variant.** The roles are built around a strong left edge; a logical version would mean rethinking the direction of the asymmetry, not just swapping names.
- **The alignment check is JS and lives outside the component.** Without it, the rule above is just an intention.

`subgrid` is the real floor: Chrome 117, Safari 16, Firefox 71 — available everywhere since September 2023. Without it, `.blocks` becomes a one-column grid and the page stays readable but loses its asymmetry:

```css
@supports not (grid-template-columns: subgrid) {
  .blocks { grid-column: main; display: block; }
}
```

Next: [Adopting EVA](doc:adopt).
