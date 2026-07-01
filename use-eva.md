# Use EVA — Fluid + Colors

How to add **eva-css-fluid** and **eva-colors** to a project so it scales smoothly from mobile to desktop without breakpoint juggling.

The two libs:

- [`eva-css-fluid`](https://www.npmjs.com/package/eva-css-fluid) — turns static px values into `clamp()` CSS variables that scale with the viewport.
- [`eva-colors`](https://www.npmjs.com/package/eva-colors) — converts HEX → OKLCH (perceptually uniform) and generates EVA theme blocks.

## TL;DR

```bash
npm i eva-css-fluid eva-colors
```

```scss
// styles/main.scss
@use 'eva-css-fluid/variables' with (
  $sizes: (4, 8, 12, 16, 24, 32, 48, 64, 120, 240, 480, 720, 1280),
  $font-sizes: (12, 14, 16, 20, 24, 32)
);

.card {
  padding: var(--16);
  gap: var(--8);
  border-radius: var(--12);
  font-size: var(--16);
}
```

You now have fluid `var(--N)` everywhere — no media queries needed.

> **Retrofitting an existing app?** Don't write the `$sizes` list by hand — see [§3 Audit & consolidate](#3-audit--consolidate-before-configuring-retrofit-workflow). Real codebases have 50–80 distinct px values, ~20% of which are accidental near-duplicates that should be fused before you adopt EVA.

## When to adopt EVA

EVA can be wired in at any stage of a project. The workflow differs per timing:

| Timing | Approach | Friction |
|---|---|---|
| **Greenfield** — fresh project | Full entry: `@use 'eva-css-fluid'`. Pick `$sizes` from your design tokens. | Lowest |
| **Mid-project** — design system in place | Variables-only entry: `@use 'eva-css-fluid/variables'`. Alias existing tokens onto `var(--N)` (see §6). | Low |
| **End of project / retrofit** — large CSS already shipped | **Audit first** (§3): count every `px`, fuse near-duplicates *before* configuring `$sizes`. Then alias. | Medium — one-time consolidation |

The retrofit case is the most common one in practice. EVA is designed to slot into an existing codebase without breaking class names — you keep your CSS, you swap fixed `px` for `var(--N)`. The audit step (§3) is what separates a clean migration from freezing design drift into named tokens — don't skip it.

> Need an LLM-friendly summary of this guide for pasting into Cursor / Claude / ChatGPT? See [`use-eva-llm.md`](./use-eva-llm.md).

## 1. Install

```bash
npm i eva-css-fluid eva-colors
```

Peer requirement: a SCSS toolchain. Vite has one built-in via `sass-embedded` or `sass`.

## 2. Pick an entry point

`eva-css-fluid` ships several entry points — choose based on what you want:

| Entry | What you get | When to use |
|---|---|---|
| `eva-css-fluid` | Variables + utility classes (w-, p-, fs-, ...) | Greenfield projects |
| `eva-css-fluid/variables` | **Variables only** (`var(--16)`, `var(--brand)`) | **Existing projects** — drops in next to your CSS without polluting the global namespace |
| `eva-css-fluid/core` | Variables + reset + typography | Need EVA's reset too |
| `eva-css-fluid/colors` | Just the OKLCH color system | Adding only colors |

**Rule of thumb for retrofitting an existing app:** always start with `eva-css-fluid/variables`. You keep your existing class names and just swap fixed px values for `var(--N)`.

## 3. Audit & consolidate before configuring (retrofit workflow)

When retrofitting an existing project, **don't write your `$sizes` list by hand**. Audit what's actually in your CSS, then consolidate accidental near-duplicates *before* adopting EVA — otherwise you freeze design drift into named tokens.

### 3.1 Count every px in the codebase

```ts
// scripts/audit-px.ts — run with `bun run scripts/audit-px.ts`
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
for (const [v, c] of [...counts].sort((a, b) => b[1] - a[1])) console.log(`${v}px\t${c}`)
```

Real-world: a mid-size codebase typically lands at **50–80 distinct px values**. Sort by frequency — the top 20 are real tokens, the long tail is noise.

### 3.2 Decide what stays *out* of EVA

Some sizes shouldn't be fluid at all. Cut them from the list before you start:

| Range / value | Reason | Stays as |
|---|---|---|
| `0–5px` | Borders, hairlines, outline-offsets | Literal `1px`, `2px` |
| `999px` | Pill shape — not a size | Literal `999px` |
| Breakpoints (`768`, `1024`, `1280`, …) | Topology, not spacing | SCSS `$bp-md`, `$bp-lg` |
| `>600px` (case-by-case) | Layout-level — often wants full scaling, not clamp | Either literal or a separate band |

Drawing the EVA band as `6–600px` strips ~30% of audit noise instantly.

### 3.3 Fuse close neighbors

Inside the EVA band, look for **adjacent values where one side dominates** the other in frequency. Typical pattern from a real retrofit:

```
15px (6×)  ↔ 16px (25×)  → fuse 15  → 16
17px (3×)  ↔ 18px (6×)   → fuse 17  → 18
22px (3×)  ↔ 24px (25×)  → fuse 22  → 24
26px (1×)  ↔ 24px (25×)  → fuse 26  → 24
27px (4×)  ↔ 28px (7×)   → fuse 27  → 28
36px (3×)  ↔ 32px (8×)   → fuse 36  → 32
96px (1×)  ↔ 100px (3×)  → fuse 96  → 100
```

Heuristics:

- **1–2px gap** → almost always fuse
- **3–4px gap** → fuse if one side has ≥5× the frequency of the other
- **Singletons (1×)** → fuse to the nearest neighbor (or drop entirely)
- **Ties (both at same low count)** → pick the rounder number; either is fine

Concrete result: 61 → 49 distinct values (-20%) with 27 line-edits across 9 files. Visual diff: imperceptible.

### 3.4 Apply with a one-shot script (never fuse by hand)

```ts
// scripts/fuse-sizes.ts — dry-run by default, --apply to write
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
    const re = new RegExp(`\\b${from}px\\b`, 'g')
    if (re.test(text)) { text = text.replace(re, `${to}px`); dirty = true }
  }
  if (dirty && APPLY) fs.writeFileSync(f, text)
}
```

The dry-run prints every match in context. Edge case to watch:

- `box-shadow: 0 20px 60px rgba(...)` — the `60px` is a **blur radius**, not a size token. The regex catches it. In practice the diff between a 56 and 60 blur is invisible, but inspect once.

### 3.5 Re-audit, then list

After fusion, re-run the audit script. Values that survive inside the `6–600` band become `$sizes`. Run a font-size-scoped variant (`/font-size\s*:\s*([^;]+)/`) to derive `$font-sizes`.

## 4. Configure sizes

List **every** size you actually use in your design — gaps, paddings, widths, font sizes. EVA only generates variables for what you list, so the output stays small.

```scss
@use 'eva-css-fluid/variables' with (
  $sizes: (
    2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32,
    40, 44, 48, 56, 64, 80, 96,
    120, 160, 200, 240, 280, 320, 480, 720, 960, 1280
  ),
  $font-sizes: (11, 12, 13, 14, 15, 17, 19, 20, 22, 24, 32, 34)
);
```

Constraints:

- **`16` is required** in `$sizes` (it's the base reference — EVA throws otherwise).
- Keep both lists tight. Don't dump every integer 0–500 — only the ones from your design tokens.
- SCSS `with ()` requires lists wrapped in parens: `$sizes: (4, 8, 16, ...)`. Bare `$sizes: 4, 8, 16` is a parser error.

## 5. Each size has 4 variants

For every size `N` in your list, EVA generates four variants:

| Variant | Behavior | Use for |
|---|---|---|
| `var(--N__)` | Most aggressive shrink on small viewports | Decorative space |
| `var(--N_)` | Strong shrink | Secondary spacing |
| `var(--N)` | Standard fluid scaling | Default — most cases |
| `var(--N-)` | Conservative — floor stays close to `N` | **Spacing tokens, padding** — keeps mobile breathable |

Rule: the more aggressive the variant, the more the value collapses on small screens. For a mobile-first app, default to `var(--N)` for layout dimensions and `var(--N-)` for tight spacing tokens you want to keep legible on phones.

## 6. Wire EVA into your design tokens

If your project already has SCSS design tokens, alias them onto EVA variables. This is the lowest-friction migration — every component that uses `$space-lg` automatically becomes fluid.

```scss
// styles/tokens.scss

// Spacing — fluid via EVA, conservative `-` variant for mobile floor
$space-xs: var(--4-);
$space-sm: var(--8-);
$space-md: var(--12-);
$space-lg: var(--16-);
$space-xl: var(--24-);
$space-2xl: var(--32-);

// Font sizes — fluid via EVA (font formula has a safer floor than sizing)
$font-size-base: var(--17);  // body — clamps at ~14.7px floor on small phones
$font-size-sm: var(--14);
$font-size-lg: var(--20);
$font-size-xl: var(--24);
$font-size-2xl: var(--32);

// Radii — fluid
$radius-sm: var(--6-);
$radius-md: var(--10-);
$radius-lg: var(--16-);
$radius-pill: 999px;        // not fluid — pill shape is shape-based, not size

// Hard rules — DO NOT make fluid
$touch-min: 48px;            // accessibility floor (gloves, gross motor)
```

When **not** to make a value fluid:

- **Touch targets** — minimum 44–48px regardless of viewport (WCAG / TAP target rule).
- **Body font size** — readability on small screens depends on a hard 16–17px floor.
- **Border widths** — 1px is 1px.
- **Pill radii** — `999px` is a shape, not a size.

## 7. Add eva-colors theme (optional but recommended)

`eva-colors` converts your HEX brand palette to OKLCH. OKLCH is perceptually uniform: lightening or darkening doesn't shift the hue.

### One-shot conversion via CLI

```bash
npx eva-color convert "#2f6d3b"
# → oklch(43.3% 0.103 142.5)

npx eva-color palette "#2f6d3b" 7
# → 7-step harmonious palette
```

### Programmatic generation

```js
import { hexToOklch, generateTheme } from 'eva-colors'

const theme = generateTheme({
  name: 'jdf',
  brand: '#2f6d3b',
  accent: '#c48a2f',
  extra: '#b3261e',
  light: '#fafaf7',
  dark: '#10130f'
})
// → .theme-jdf { --brand-lightness: ...; --brand-chroma: ...; --brand-hue: ...; }
```

Drop the generated CSS into your stylesheet, add `.current-theme.theme-jdf` on `<body>`, and use `var(--brand)`, `var(--accent)`, `var(--brand_)` (65% opacity), `var(--brand-d)` (darker), etc.

### Or stay with your existing colors

If you already have a working color system (CSS custom properties, light/dark theming), keep it. EVA's value is in fluid sizing — the colors are a bonus. You can adopt the OKLCH theme later.

## 8. Multi-themes (seasonal / brand variants / per-month)

Define **multiple `.theme-{name}` blocks** to ship several palettes that the user can pick from. Each block only sets the OKLCH triplets — EVA's `_colors` module turns those into `var(--brand)`, `var(--brand_)`, `var(--brand-d)`, etc. on whichever element carries `.current-theme.theme-{name}`.

```scss
// styles/themes.scss
.theme-mai {
  --brand-lightness: 70%;  --brand-chroma: 0.09;  --brand-hue: 125;   // green
  --accent-lightness: 78%; --accent-chroma: 0.08; --accent-hue: 80;
  --extra-lightness: 62%;  --extra-chroma: 0.12;  --extra-hue: 25;    // danger
  --light-chroma: 0.005;   --light-hue: 120;                          // tinted bg
  --dark-chroma: 0.012;    --dark-hue: 125;                           // tinted text
}

.theme-juin { /* warmer hues */ }
.theme-decembre { /* cold blues */ }
// ... 12 monthly themes, or 5 brand variants, or 3 product modes
```

```js
// stores/theme.js — switch theme by toggling a class on <html>
function applyTheme(name) {
  const root = document.documentElement
  root.classList.add('current-theme')
  for (const t of ALL_THEMES) root.classList.remove(`theme-${t}`)
  root.classList.add(`theme-${name}`)
}
```

**Notes:**

- **One source of truth per theme** — only the OKLCH triplets. Don't duplicate `--brand` everywhere; let EVA derive it.
- **Skip `--light-lightness` / `--dark-lightness`** if you want the theme to follow the user's chosen light/dark mode. EVA's `_colors` already computes them from `--current-lightness` / `--current-darkness`. If you set them explicitly per theme, **EVA's `.toggle-theme` rule still wins** (it uses `!important`), so dark mode flips correctly anyway — you can override hardcoded values when you need a specific tint per mode.
- **Tinted surfaces** — overriding `--light-hue` / `--dark-hue` per theme tints the page background and text by season/brand. Keep `--light-chroma` low (~0.005–0.015) for subtle pastel; higher chroma reads as saturated and breaks the "neutral surface" feel.
- **Preview swatches** — to render a card showing a non-active theme's brand color, scope it: `<div class="current-theme theme-juin">` then `background: var(--brand)` resolves to that month's color inside the card, regardless of the active theme on `<html>`.

## 9. Dark / light via EVA `.toggle-theme`

EVA already ships a dark mode mechanism — don't roll your own with `.dark` / `.light` classes and HEX overrides. Use `.toggle-theme` next to `.current-theme` and bridge the semantic tokens to `var(--light)` / `var(--dark)`.

### How EVA flips lightness

Inside `_colors`, EVA defines:

```scss
:root {
  --current-lightness: 96.4%;   // light mode bg-side
  --current-darkness: 6.4%;     // light mode text-side
  --light-lightness: var(--current-lightness);
  --dark-lightness: var(--current-darkness);
}

.current-theme.toggle-theme {
  --current-lightness: 5%;      // dark mode bg-side (very dark)
  --current-darkness: 95%;      // dark mode text-side (very light)
  --light-lightness: var(--current-lightness) !important;
  --dark-lightness: var(--current-darkness) !important;
}
```

So `var(--light)` is bright in light mode, dark in dark mode. `var(--dark)` is the opposite. They literally **swap roles** — that's the whole trick.

### Bridge semantic tokens to EVA

In your global stylesheet, derive `--color-bg`, `--color-surface`, `--color-text`, etc. on `.current-theme`. They'll auto-flip with `.toggle-theme` and stay tinted by the active theme's hue.

```scss
.current-theme {
  // Surfaces — ride on var(--light) so they flip with toggle-theme
  --color-bg: var(--light);
  --color-surface: oklch(100% var(--light-chroma) var(--light-hue));
  --color-surface-alt: oklch(96% var(--light-chroma) var(--light-hue));

  // Text — ride on var(--dark)
  --color-text: var(--dark);
  --color-text-muted: var(--dark_);    // 65% opacity
  --color-text-subtle: var(--dark__);  // 35%
  --color-border: var(--dark___);      // 15%

  // Brand — driven by the active .theme-{name}
  --color-primary: var(--brand);
  --color-primary-ink: var(--brand-d);
  --color-primary-tint: var(--brand___);
}

// Dark-mode surface re-pin: surfaces use literal lightness values
// (100% / 96%) that don't track --current-lightness, so we override.
.current-theme.toggle-theme {
  --color-surface: oklch(8% var(--light-chroma) var(--light-hue));
  --color-surface-alt: oklch(12% var(--light-chroma) var(--light-hue));
}
```

### Toggle from the store

```js
function applyMode(mode) {
  const root = document.documentElement
  let dark = false
  if (mode === 'dark') dark = true
  else if (mode === 'auto')
    dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  root.classList.toggle('toggle-theme', dark)
}

// Re-apply when the system pref changes, but only if mode === 'auto'
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (currentMode === 'auto') applyMode('auto')
})
```

### Why put `.current-theme` on `<html>` (not `<body>`)

The `<html>` background fills any over-scroll area. If `.current-theme` is on `<body>`, anything that scrolls past the body shows the un-themed `:root` fallback (often visible during pull-to-refresh on mobile). Put both `.current-theme` and `.theme-{name}` on `<html>` and the entire viewport is covered.

### When to keep the SCSS-HEX `:root` fallback

For **first paint before JS runs**: if your app boots client-side and applies the theme classes in `mounted()`, there's a brief flash where neither class is present. A `:root { --color-bg: #fafaf7; ... }` block with static HEX values prevents that flash. Once JS attaches `.current-theme`, the cascading bridge takes over.

## 10. Build a responsive layout

The whole point: **no breakpoints inside components**. Use `var(--N)` for paddings, gaps, font sizes — the layout breathes by itself.

You still need media queries for **structural** changes — going from a single column to a sidebar layout. EVA doesn't replace those.

```scss
.shell {
  display: grid;
  grid-template-columns: 1fr;            // mobile

  @media (min-width: 1024px) {           // laptop: nav + main
    grid-template-columns: var(--280) minmax(0, 1fr);
  }

  @media (min-width: 1280px) {           // desktop: nav + main + aside
    grid-template-columns: var(--280) minmax(0, 1fr) var(--320);
  }
}

.shell__nav {
  padding: var(--24) var(--20);          // fluid padding scales with vw
  gap: var(--20);
}

.shell__nav-item {
  height: var(--44);
  padding: 0 var(--12);
  border-radius: var(--10-);
  font-size: var(--15);
  gap: var(--12);                        // gap between icon and label
}
```

Notice: **media queries only for layout topology** (1col → 2col → 3col), never for spacing or typography. EVA handles those automatically.

## 11. Verify visually with a /dev sandbox page

EVA emits `clamp(...)` formulas — you can't intuit how aggressive each variant is from the math. Build a single debug route with **one card per token**, each card showing every variant rendered as a real square (sizing) or text sample (font). A `Détails` toggle reveals the live computed value at the current viewport when you need the numbers.

```vue
<!-- src/views/DevSizingView.vue — non-public route /dev -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const SIZES = [/* paste your $sizes here */]
const FONT_SIZES = [/* paste your $font-sizes here */]
const VARIANTS = [
  { suffix: '__', label: '--N__' },
  { suffix: '_',  label: '--N_'  },
  { suffix: '',   label: '--N'   },
  { suffix: '-',  label: '--N-'  },
] as const

const probe = ref<HTMLElement | null>(null)
const viewport = ref({ w: 0, h: 0 })
const live = ref<Record<string, string>>({})

function refresh() {
  viewport.value = { w: innerWidth, h: innerHeight }
  const next: Record<string, string> = {}
  for (const n of SIZES) for (const v of VARIANTS) {
    const k = `--${n}${v.suffix}`
    next[k] = getComputedStyle(probe.value!).getPropertyValue(k).trim()
  }
  live.value = next
}

onMounted(() => { refresh(); addEventListener('resize', refresh) })
onBeforeUnmount(() => removeEventListener('resize', refresh))
</script>

<template>
  <div ref="probe">
    <header>
      <p>{{ viewport.w }} × {{ viewport.h }} px</p>
      <button @click="showDetails = !showDetails">Détails</button>
    </header>
    <article v-for="n in SIZES" :key="n" class="card">
      <h3>--{{ n }}</h3>
      <div class="row">
        <div v-for="v in VARIANTS" :key="v.suffix" class="variant">
          <div class="square" :style="{ width: `var(--${n}${v.suffix})`,
                                        height: `var(--${n}${v.suffix})` }" />
          <small>{{ v.label }}</small>
          <small v-if="showDetails">{{ live[`--${n}${v.suffix}`] }}</small>
        </div>
      </div>
    </article>
  </div>
</template>
```

The visual square (capped at e.g. `max-width: 100px`) shows variant *shrinkage* directly — at 320px viewport, `var(--16__)` is visibly smaller than `var(--16-)`. For `$font-sizes`, swap the `<div class="square">` for `<span :style="{ fontSize: \`var(--fs-${n}${v.suffix})\` }">Aa</span>` (note the `--fs-` prefix).

Three benefits:

1. **Smoke test** — if `live[--16]` is empty, your `@use 'eva-css-fluid/variables' with (...)` block is missing or scoped wrong.
2. **Variant choice** — comparing `var(--16__)` next to `var(--16-)` at 320px is the only honest way to feel which fits a given component.
3. **Designer onboarding** — designers can sanity-check the scale without touching component code.

Hide the live `clamp()` strings behind a `showDetails` toggle — at-a-glance comparison is the primary use; raw values are noise unless you're debugging.

## 12. Common pitfalls

**`Error: expected "$"` in SCSS `@use ... with ()`**
Wrap the list in parens: `$sizes: (4, 8, 16)`, not `$sizes: 4, 8, 16`.

**`Size 16 is required as a base size`**
Add `16` to `$sizes`. EVA uses it as the rem reference.

**Component CSS overrides EVA media queries**
Inside SCSS scoped styles, source order matters when specificity is equal. If you write:
```scss
.shell {
  @media (min-width: 1024px) { &__aside { display: flex; } }
}
.shell__aside { display: none; }   // ← later in file, same specificity → wins
```
…the bottom rule wins regardless of viewport. Move the default `display: none` *before* the media query, or scope it under a parent for higher specificity.

**Mobile spacing feels cramped**
You probably used `var(--16)` for spacing. Switch to `var(--16-)` (extended variant) — its mobile floor is much closer to the design value.

**Font sizes shrink too aggressively on phones**
EVA's font-size formula already has a safer floor than its sizing formula (0.6rem base × Φ multiplier instead of 0.5rem). For body text use `var(--fs-17)` or `var(--fs-16)` — the default no-suffix variant. Avoid the aggressive `var(--fs-N_)` / `var(--fs-N__)` variants for body copy. **Important:** font-size tokens use the `--fs-` prefix; `var(--16)` is the *sizing* token (clamps differently from `var(--fs-16)`).

**`var(--44)` is empty even though `44` is in `$font-sizes`**
EVA emits font-size tokens as `--fs-N`, not `--N`. So `44` in `$font-sizes` produces `var(--fs-44)` / `var(--fs-44_)` / `var(--fs-44__)`. There is no `var(--44)` unless `44` is *also* in `$sizes`. The two namespaces are independent — same number ≠ same token.

**`var(--15)` silently resolves to nothing after consolidation**
If you remove `15` from `$sizes` (because you fused it into `16`), every existing `var(--15)` reference in your code becomes an empty string. The browser falls back to its default (often 16px), so the page still renders — the bug is invisible until you check DevTools. After running `fuse-sizes.ts`, also grep for `var\(--15\b`, `var\(--17\b`, etc. and rewrite them to the merged token. The `/dev` sandbox catches this fast: empty live values for a removed token = leftover references somewhere.

**Fusion regex catches more than spacing**
`\b60px\b` matches `60px` anywhere — including blur radii (`box-shadow: 0 20px 60px ...`), gradient stops, and JS string literals (`return '27px'`). Most catches are harmless (1–4px diff in a shadow blur is invisible), but always dry-run the script and read every occurrence in context before `--apply`.

## 13. Fluid unit: vw vs cqi, and the accessibility floor (v2.2.0+)

By default every EVA token tracks the real browser **viewport** (`vw`). Since `eva-css-fluid@2.2.0`, that's switchable at runtime — no rebuild, no second stylesheet — via a custom property:

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 24, 48),
  $font-sizes: (16, 24, 48),
  $unit-fluid: 1vw,        // default. Use 1cqi to track containers instead
  $reference-width: 1440,  // width where tokens hit their max — was hardcoded pre-2.2.0
  $min-font-size: 14        // a11y floor in px (mobile size, not desktop) — 0 = off
);
```

Per-subtree, override the same thing at the CSS level — no SCSS recompile needed:

```css
.card {
  container-type: inline-size;   /* .card becomes a size container */
  --eva-fluid-unit: 1cqi;        /* tokens inside .card now read its own width */
}
```

Two opt-in utility classes wire both declarations at once, so you don't forget one half: `.eva-cqi` (on the element that should become the container) and `.eva-root` (same, for a top-level wrapper).

**When to reach for `cqi` instead of `vw`:** any component whose size should depend on *the box it's placed in*, not the page — a card that renders identically whether it sits in a full-width hero or a narrow sidebar, a design-system preview panel, or a widget embedded at an unknown width. `vw` (the default) is right for page-level type and spacing that should genuinely respond to the whole viewport.

**Accessibility floor** — `$min-font-size` (px, default `0` = off) prevents fluid text from shrinking below a readable size in a small container or on a small phone. This floor is the *mobile* size, not the desktop one: 13–14px is a reasonable default, not 16.

**Backward compatibility** — 100%. No `--eva-fluid-unit` set anywhere falls back to `1vw`, producing the exact same computed value as before 2.2.0. Set `$fluid-runtime: false` to get the pre-2.2.0 literal `clamp()` output byte-for-byte, if you need to diff against an old build.

## 14. Reference

- Sizes: every value in `$sizes` → `var(--N)`, `var(--N-)`, `var(--N_)`, `var(--N__)`
- Font sizes: every value in `$font-sizes` → `var(--fs-N)`, `var(--fs-N_)`, `var(--fs-N__)` — note the `fs-` prefix, font-size tokens are namespaced separately from sizing tokens
- Reference viewport: `1440px` by default, configurable via `$reference-width` since v2.2.0 (sizes hit their max value at this width)
- Default min/max scaling: `0.5rem` → `1rem` (configurable)
- Fluid unit: `vw` (viewport, default) or `cqi` (container) via `$unit-fluid` / `--eva-fluid-unit` — see §13
- Colors: `var(--brand)`, `var(--accent)`, `var(--extra)`, `var(--light)`, `var(--dark)`
- Color modifiers — opacity: `_` 65%, `__` 35%, `___` 15%; brightness: `-d` darker, `-b` brighter, `-d_` more darker, `-b_` more brighter
- Theme classes on the active root element: `.current-theme` (always), `.theme-{name}` (active palette), `.toggle-theme` (dark mode)

Full docs: <https://eva-css.xyz/>
