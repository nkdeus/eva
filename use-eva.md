# Use EVA — installation, configuration, adoption

> Generated from content/doc/en. The canonical, human-readable version lives at https://eva-css.xyz/doc/index.html


---

# Installation

Source: https://eva-css.xyz/doc/install.html

EVA ships as three independent npm packages. Only the first is required.

```bash
npm install eva-css-fluid eva-css-purge eva-colors
```

| Package | Role | Required |
|---|---|---|
| `eva-css-fluid` | The framework itself — fluid sizes, colors, gradients, utilities | Yes |
| `eva-colors` | CLI and JS API: HEX→OKLCH conversion, palettes, theme generation, contrast checks | No |
| `eva-css-purge` | Removes unused classes from the compiled CSS | No |

The only peer requirement is a SCSS toolchain. `sass` on its own is enough; Vite, Astro, Next and friends already bundle one.

## Pick an entry point

`eva-css-fluid` exposes four entry points. They differ in how much they emit, not in what they can do.

| Entry | Emits | Use when |
|---|---|---|
| `eva-css-fluid` | Variables, colors, gradients, theme, reset, typography, flex, grid, utility classes | New projects |
| `eva-css-fluid/variables` | Variables, colors, theme — nothing else | Existing projects: drops in beside your CSS without touching the global namespace |
| `eva-css-fluid/core` | Everything except the utility classes | You want the reset and typography but write your own components |
| `eva-css-fluid/colors` | The OKLCH color system and theme only | You only want the colors |

```scss
// new project — the full framework
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 32, 64, 128),
  $font-sizes: (14, 16, 24, 36, 52)
);
```

```scss
// existing project — variables only, zero class collisions
@use 'eva-css-fluid/variables' with (
  $sizes: (4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 128),
  $font-sizes: (12, 14, 16, 18, 20, 24, 32)
);
```

> `eva-css-fluid/colors` takes no configuration — it has no sizes to generate. The other three accept the full option set described in [Configuration](doc:config).

## Compile

EVA is plain SCSS, so the reference command is plain `sass`. The `--load-path` is what lets `@use 'eva-css-fluid'` resolve from `node_modules`.

```bash
npx sass --load-path=node_modules styles/main.scss:styles/main.css
```

Wire the two useful variants into `package.json`:

```json
{
  "scripts": {
    "build-css": "npx sass --load-path=node_modules styles/main.scss:styles/main.css --style expanded",
    "watch": "npx sass --load-path=node_modules --watch styles/main.scss:styles/main.css --style expanded",
    "purge": "npx eva-purge --css styles/main.css --content '**/*.html' --output styles/main-compressed.css"
  }
}
```

Use `--style expanded` while developing: the emitted `clamp()` formulas are the thing you inspect in DevTools, and compressed output makes them unreadable. Compress at the end, or let [eva-purge](doc:cli) do it.

## Project layout

Nothing is imposed. A single-target project usually looks like this:

```text
project/
├── index.html
├── styles/
│   ├── main.scss          # @use 'eva-css-fluid' with (...)
│   └── main.css           # compiled output
└── node_modules/
    ├── eva-css-fluid/
    ├── eva-css-purge/
    └── eva-colors/
```

When several designs live in one repo, give each its own entry file and its own `$sizes` — the whole point of listing sizes explicitly is that each target only carries what it uses.

```text
projects/
├── project-a/
│   ├── index.html
│   ├── styles/project-a.scss     # @use 'eva-css-fluid' with (...)
│   └── render/project-a.css
└── project-b/
    ├── index.html
    ├── styles/project-b.scss
    └── render/project-b.css
```

```bash
npx sass --load-path=node_modules \
  projects/project-a/styles/project-a.scss:projects/project-a/render/project-a.css
```

## Mark up the page

Two classes on the root element switch the whole system on.

```html
<body class="current-theme theme-eva">
```

- `current-theme` — required. It is the element the color variables are computed on.
- `theme-<name>` — the active palette. See [Theme configuration](doc:colors#themes).
- `toggle-theme` — add it to flip to dark mode. See [Dark mode](doc:colors#dark-mode).
- `all-grads` — add it if you use the gradient classes. See [Gradients](doc:gradients).

> Put `current-theme` on `<html>` rather than `<body>` if the page can over-scroll. The `<html>` background fills the bounce area on mobile; a themed `<body>` leaves an unthemed strip visible during pull-to-refresh.

Next: [Configuration](doc:config).

---

# Configuration

Source: https://eva-css.xyz/doc/config.html

Configuration is a single `@use ... with (...)` block. There is no config file, no CLI step, no plugin — `sass` reads it and emits the stylesheet.

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

> SCSS requires the lists to be parenthesised. `$sizes: (4, 8, 16)` compiles; `$sizes: 4, 8, 16` is a parser error.

## Options

| Option | Default | Effect |
|---|---|---|
| `$sizes` | `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` | Every value becomes a fluid `var(--N)` plus its three variants |
| `$font-sizes` | `12, 14, 16, 18, 20, 24, 32, 48` | Every value becomes `var(--fs-N)` plus its two variants |
| `$build-class` | `true` | `true` emits utility classes, `false` emits variables only |
| `$px-rem-suffix` | `false` | Adds static `--N-px` / `--N-rem` tokens next to the fluid ones |
| `$name-by-size` | `true` | `true` names tokens by value (`--32`), `false` by index (`--3`) |
| `$custom-class` | `false` | Enables per-property class filtering through `$class-config` |
| `$class-config` | `()` | Map of property → allowed sizes, e.g. `(w: (64, 128), px: (24))` |
| `$debug` | `false` | Prints a class-generation summary during compilation |
| `$unit-fluid` | `1vw` | The fluid unit and its runtime fallback — `1vw` or `1cqi` |
| `$reference-width` | `1440` | Viewport width at which tokens reach their maximum |
| `$fluid-runtime` | `true` | `false` emits literal `clamp()` values instead of the switchable form |
| `$min-font-size` | `0` | Accessibility floor in px applied to font-size minimums; `0` disables it |

`$unit-fluid`, `$reference-width`, `$fluid-runtime` and `$min-font-size` arrived in 2.2.0. `eva-css-fluid/colors` accepts none of these — it generates no sizes.

Twelve more options, all prefixed `$golden-grid-`, configure the opt-in page grid added in 2.5.0. It emits nothing at all until `$golden-grid: true`, and the whole list is in [Golden grid](doc:golden-grid#options).

## Choosing `$sizes`

List what your design uses. Nothing else. The list drives the output size directly: every entry produces four sizing tokens, and with `$build-class: true`, sixteen properties × four variants of utility classes.

Two constraints:

- **`16` is required.** It is the rem reference. Leave it out and the compile fails with `Size 16 is required as a base size`.
- **Neither list may be empty.**

Some values should never enter the list:

| Value | Why | Keep it as |
|---|---|---|
| `0–5px` | Borders, hairlines, outline offsets | Literal `1px`, `2px` |
| `999px` | A pill is a shape, not a size | Literal `999px` |
| Breakpoints (`768`, `1024`, `1280`) | Layout topology, not spacing | SCSS variables |
| Touch targets (`44`, `48`) | Accessibility floor, must not shrink | Literal `48px` |

Retrofitting an existing codebase is a different exercise: derive the list from what is actually in the CSS instead of writing it by hand. That workflow is [Adopting EVA](doc:adopt#audit).

## The two build modes

`$build-class` is the one option that changes how you write markup. Pick one per project and hold it.

### Utility classes — `$build-class: true`

EVA emits classes for sixteen properties across every size, plus color, flex, grid and layout utilities.

```html
<div class="flex y g-16 p-32 br-12 _bg-light _c-dark">
  <h2 class="fs-24">Title</h2>
</div>
```

Fast to write, and the markup carries the design. The tradeoff is stylesheet weight — which is what [eva-purge](doc:cli#purge) exists to solve.

### Variables only — `$build-class: false`

EVA emits nothing but custom properties. You write ordinary CSS.

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

Better for design systems, component libraries, and anything dropped into a codebase that already has class names. `eva-css-fluid/variables` and `eva-css-fluid/core` force this mode.

> Don't mix the two in one project. Half the components reading utility classes and half reading semantic CSS is the fastest way to lose track of where a value comes from.

## Trimming the class output

With `$custom-class: true`, `$class-config` restricts generation per property. Only the sizes you list are emitted for that property; unlisted properties are skipped entirely.

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

The keys must be real property prefixes — `w mw h p px pr py br mb mr ml mt pt pb g gap`. Anything else is a compile error. The variables are unaffected: `var(--32)` still exists even when no `w-32` class does.

## Static escape hatches

`$px-rem-suffix: true` adds a fixed counterpart to each size:

```css
--32-px: 32px;
--32-rem: 2rem;
```

Useful in two situations: debugging a fluid value against its design reference, and the handful of dimensions that must not scale. With `$build-class: true` you also get `w-32-px`, `p-32-rem` and so on.

## Fluid unit and accessibility floor

Since 2.2.0 the fluid unit is a runtime variable rather than a baked-in literal. Configure the default in SCSS, override it per subtree in CSS. This is covered in full under [Fluid sizing](doc:sizes#fluid-unit).

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 24, 48),
  $font-sizes: (16, 24, 48),
  $unit-fluid: 1vw,        // 1cqi to track containers instead of the viewport
  $reference-width: 1440,  // where tokens hit their maximum
  $min-font-size: 14       // px floor on font-size minimums; 0 = off
);
```

`$min-font-size` is the *mobile* floor, not the desktop size. 13–14 is a reasonable value; 16 would flatten the scale.

Next: [Fluid sizing](doc:sizes).

---

# Adopting EVA

Source: https://eva-css.xyz/doc/adopt.html

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
