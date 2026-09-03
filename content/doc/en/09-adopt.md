---
title: Adopting EVA
nav: Adopting EVA
group: guides
eyebrow: Documentation
description: Wiring EVA into a project that already ships — the px audit, fusing near-duplicates, aliasing design tokens, and the traps.
---

EVA slots into an existing codebase without renaming a single class. You keep your CSS; you swap fixed `px` for `var(--N)`. What changes is where the numbers come from.

The order of operations depends on when you arrive.

| Stage | Approach | Friction |
|---|---|---|
| **Greenfield** | Full entry: `@use 'eva-css-fluid'`. Pick `$sizes` from your design tokens. | Lowest |
| **Mid-project**, design system in place | Variables-only entry: `@use 'eva-css-fluid/variables'`. Alias your existing tokens onto `var(--N)`. | Low |
| **Retrofit**, large CSS already shipped | **Audit first.** Count every `px`, fuse near-duplicates, *then* configure `$sizes`. | Medium, one-time |

The retrofit case is the common one, and the audit is what separates a clean migration from freezing years of accidental design drift into named tokens. Do not skip it.

## Audit and consolidate {#audit}

### Count every px

Do not write the `$sizes` list by hand. Read it out of the codebase.

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

A mid-size codebase typically lands at **50 to 80 distinct px values**. Sorted by frequency, the top twenty are real tokens and the long tail is noise.

### Decide what stays out

Some sizes should never be fluid. Cut them before you start.

| Range | Reason | Keep as |
|---|---|---|
| `0–5px` | Borders, hairlines, outline offsets | Literal `1px`, `2px` |
| `999px` | A pill is a shape, not a size | Literal `999px` |
| Breakpoints (`768`, `1024`, `1280`) | Topology, not spacing | SCSS variables |
| Touch targets (`44`, `48`) | Accessibility floor, must not shrink | Literal `48px` |
| `> 600px` | Layout-level — often wants full scaling rather than a clamp | Case by case |

Drawing the EVA band at roughly `6–600px` removes about 30% of the audit noise immediately.

### Fuse near-duplicates

Inside the band, look for adjacent values where one clearly dominates:

```text
15px (6x)  <-> 16px (25x)  -> fuse 15 -> 16
17px (3x)  <-> 18px (6x)   -> fuse 17 -> 18
22px (3x)  <-> 24px (25x)  -> fuse 22 -> 24
26px (1x)  <-> 24px (25x)  -> fuse 26 -> 24
36px (3x)  <-> 32px (8x)   -> fuse 36 -> 32
96px (1x)  <-> 100px (3x)  -> fuse 96 -> 100
```

Heuristics that hold up in practice:

- **1–2px gap** — almost always fuse.
- **3–4px gap** — fuse if one side is used at least 5× more than the other.
- **Singletons** — fuse to the nearest neighbour, or drop entirely.
- **Ties** — pick the rounder number. Either is fine.

A real retrofit went from 61 to 49 distinct values, 27 line edits across 9 files. The visual diff was imperceptible.

### Apply with a script, never by hand

```ts
// scripts/fuse-sizes.ts — dry run by default, --apply to write
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

Read the dry run before applying. The regex matches every occurrence, including ones that are not size tokens:

```css
box-shadow: 0 20px 60px rgba(0,0,0,.2);   /* 60px is a blur radius */
```

A 4px difference in a shadow blur is invisible, so most catches are harmless — but look once.

### Re-audit, then list

Run the audit again. What survives inside the band becomes `$sizes`. A font-size-scoped variant of the same script (`/font-size\s*:\s*([^;]+)/`) gives you `$font-sizes`.

## Alias your design tokens

If the project already has SCSS tokens, point them at EVA. Every component that reads `$space-lg` becomes fluid with no component edits at all — this is the lowest-friction migration there is.

```scss
// styles/tokens.scss

// Spacing — conservative variant keeps a breathable mobile floor
$space-xs:  var(--4-);
$space-sm:  var(--8-);
$space-md:  var(--12-);
$space-lg:  var(--16-);
$space-xl:  var(--24-);
$space-2xl: var(--32-);

// Type — the fs- namespace, unsuffixed variant for body copy
$font-size-sm:   var(--fs-14);
$font-size-base: var(--fs-16);
$font-size-lg:   var(--fs-20);
$font-size-xl:   var(--fs-24);

// Radii
$radius-sm: var(--6-);
$radius-md: var(--10-);
$radius-lg: var(--16-);

// Not fluid, on purpose
$radius-pill: 999px;   // a shape
$touch-min:   48px;    // accessibility floor
$border:      1px;     // 1px is 1px
```

Four categories should never become fluid: touch targets (44–48px minimum regardless of viewport), body font size below its readable floor, border widths, and pill radii.

## Layout

The point is that components stop carrying breakpoints. Padding, gaps and type all breathe on their own.

You still need media queries for **structural** change — one column becoming a sidebar layout. EVA does not replace those, and it should not.

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

Media queries for topology. Never for spacing or typography.

## Verify visually

EVA emits `clamp()` formulas, and you cannot intuit how aggressive a variant is from the math. Build a throwaway `/dev` route with one card per token, each showing all four variants as real squares, and resize the browser.

```js
const probe = document.querySelector('.probe');
const live = getComputedStyle(probe).getPropertyValue('--16').trim();
```

It pays for itself three times over:

1. **Smoke test.** An empty value means the `@use ... with (...)` block is missing or scoped wrong.
2. **Variant choice.** Comparing `var(--16__)` next to `var(--16-)` at 320px is the only honest way to decide which one a component wants.
3. **Onboarding.** Designers can check the scale without opening component code.

## Traps

**`Error: expected "$"` in the `@use ... with ()` block.** Wrap the list in parentheses: `$sizes: (4, 8, 16)`, not `$sizes: 4, 8, 16`.

**`Size 16 is required as a base size`.** Add `16` to `$sizes`. It is the rem reference.

**Mobile spacing feels cramped.** You used `var(--16)` where you wanted `var(--16-)`. The conservative variant keeps a much higher floor on small screens.

**Body text shrinks too far.** Use the unsuffixed `var(--fs-16)`. The `_` and `__` variants are display type, not copy.

**`var(--44)` resolves to nothing even though `44` is in `$font-sizes`.** Font tokens are `--fs-44`. The two namespaces are independent — the same number is not the same token.

**`var(--15)` silently resolves to nothing after consolidation.** Removing `15` from `$sizes` does not remove `var(--15)` from your code. An undefined custom property makes the browser drop the declaration and fall back to its default, so the page still renders and the bug stays invisible. After fusing, grep for the tokens you removed.

**Component CSS beats an EVA media query.** With equal specificity, source order decides. A default written after the media query wins at every viewport:

```scss
.shell {
  @media (min-width: 1024px) { &__aside { display: flex; } }
}
.shell__aside { display: none; }   // later, same specificity -> always wins
```

Move the default above the query, or raise its specificity.

## Colors, or not

You do not have to take the color system. EVA's value is in the fluid sizing; the colors are a separate offer. If you already have a working palette and theming, keep it and adopt OKLCH later — `eva-css-fluid/variables` gives you sizes and colors, and you can simply ignore the color half.

If you do take it, convert your palette in one command and read [Colors](doc:colors):

```bash
npx eva-color convert "#2f6d3b"
npx eva-color palette "#2f6d3b" 7
```

Next: [CLI tools](doc:cli).
