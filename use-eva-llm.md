# EVA CSS — Adoption guide (LLM-condensed)

> Wire `eva-css-fluid` + `eva-colors` into a project. Works at any stage: greenfield, mid-project, retrofit. Companion of `./use-eva.md` for humans.

## Install

```bash
npm i eva-css-fluid eva-colors
```

Peer requirement: a SCSS toolchain (Vite has one via `sass-embedded`/`sass`).

## Entry points (`eva-css-fluid`)

- `eva-css-fluid` — variables + utility classes (`w-`, `p-`, `fs-`, …) — **greenfield**
- `eva-css-fluid/variables` — variables only (`var(--N)`, `var(--brand)`) — **retrofit / existing app** (preferred — no class-name pollution)
- `eva-css-fluid/core` — variables + reset + typography
- `eva-css-fluid/colors` — OKLCH colors only

## Configure

```scss
@use 'eva-css-fluid/variables' with (
  $sizes: (4, 8, 16, 32, 64, 128),
  $font-sizes: (14, 16, 24, 32)
);
```

Constraints:
- `16` MUST be in `$sizes` (rem reference; throws otherwise).
- SCSS `with ()` requires parens: `$sizes: (4, 8, 16)`. Bare list is a parser error.
- List only sizes actually used in the design. Output is generated per value.

## Variants per size

For each `N` in `$sizes`:
- `var(--N__)` — most aggressive shrink on small viewports (decorative)
- `var(--N_)` — strong shrink (secondary spacing)
- `var(--N)` — standard fluid (default; layout dimensions)
- `var(--N-)` — conservative; mobile floor close to `N` (**spacing tokens, padding** — keeps mobile breathable)

For each `N` in `$font-sizes`: `var(--fs-N)`, `var(--fs-N_)`, `var(--fs-N__)` — namespaced separately. **`var(--N)` ≠ `var(--fs-N)`**.

Reference viewport: `1440px` by default (sizes hit max here), configurable via `$reference-width` since v2.2.0. Default scaling: `0.5rem` → `1rem`.

## Fluid unit: vw vs cqi, a11y floor (v2.2.0+)

Default unit is `vw` (real viewport) — identical output to pre-2.2.0. Switch to `cqi` (container) globally or per-subtree, no rebuild:

```scss
@use 'eva-css-fluid' with (
  $unit-fluid: 1vw,        // default; 1cqi to track containers
  $reference-width: 1440,  // width where tokens hit max
  $min-font-size: 14        // a11y floor in px, mobile size — 0 = off
);
```

```css
.card { container-type: inline-size; --eva-fluid-unit: 1cqi; } /* tokens in .card now read its own width */
```

Utility classes: `.eva-cqi` / `.eva-root` set `container-type` + the `cqi` override in one class. Use `cqi` for components whose size should depend on the box they're in (design-system previews, embeddable widgets, sidebar-vs-hero cards), `vw` (default) for page-level type/spacing.

`$min-font-size` (px, default `0` = off) is a readability floor for fluid text — the *mobile* size, not desktop (13–14px is sane).

100% backward compatible: no `--eva-fluid-unit` set → falls back to `1vw`, same computed value as before. `$fluid-runtime: false` reproduces the pre-2.2.0 literal output byte-for-byte.

## When to adopt

| Timing | Approach |
|---|---|
| **Greenfield** | Full entry; pick `$sizes` from design tokens. |
| **Mid-project** | Variables-only entry; alias existing tokens onto `var(--N)`. |
| **End-of-project / retrofit** | **Audit first** (next section). Don't skip — freezes drift into named tokens otherwise. |

## Retrofit workflow (mandatory before configuring `$sizes` on existing codebases)

1. **Count every px** — walk `src/**/*.{vue,scss,css,ts,tsx}`, regex `\b([0-9]+(?:\.[0-9]+)?)px\b`. Real codebases land at 50–80 distinct values. Sort by frequency.
2. **Strip what stays out of EVA**:
   - `0–5px` → keep literal (borders, hairlines, outline-offsets)
   - `999px` → keep literal (pill shape, not a size)
   - Breakpoints (`768`, `1024`, `1280`) → SCSS `$bp-*` variables
   - `>600px` → case-by-case; often layout-level
   - EVA band: `6–600px`. Stripping the rest cuts ~30% of audit noise.
3. **Fuse close neighbors**:
   - 1–2px gap: almost always fuse
   - 3–4px gap: fuse if one side has ≥5× frequency
   - Singletons (1×): fuse to nearest neighbor (or drop)
   - Ties at low count: pick the rounder number
   - Apply via one-shot script with dry-run (`--apply` flag), never by hand. Watch for blur radii / gradient stops being caught by `\b{N}px\b`.
4. **Re-audit** post-fusion → final list = `$sizes`. Run a font-size-scoped variant (`/font-size\s*:\s*([^;]+)/`) for `$font-sizes`.
5. **Alias your tokens** onto `var(--N)` / `var(--N-)` (see "Wire into design tokens" below).

Realistic outcome: 61 → 49 distinct values (-20%) with ~27 line-edits across ~9 files. Visual diff: imperceptible.

## Wire into design tokens

```scss
$space-xs: var(--4-);   $space-sm: var(--8-);   $space-md: var(--12-);
$space-lg: var(--16-);  $space-xl: var(--24-);  $space-2xl: var(--32-);

$font-size-base: var(--17);   // body — clamps at ~14.7px floor on small phones
$font-size-sm: var(--14);     $font-size-lg: var(--20);
$font-size-xl: var(--24);     $font-size-2xl: var(--32);

$radius-sm: var(--6-);   $radius-md: var(--10-);   $radius-lg: var(--16-);
$radius-pill: 999px;     // not fluid — pill is shape, not size

$touch-min: 48px;        // accessibility floor — never make fluid
```

## Don't make fluid

- **Touch targets** (44–48px floor — WCAG/TAP target rule)
- **Body font** (16–17px floor for readability)
- **Border widths** (1px is 1px)
- **Pill radii** (`999px` is a shape)

## Theme (eva-colors, optional)

CLI:
```bash
npx eva-color convert "#hex"       # → oklch(L% C H)
npx eva-color palette "#hex" 7     # 7-step harmonious palette
```

Programmatic:
```js
import { hexToOklch, generateTheme } from 'eva-colors'
const theme = generateTheme({ name: 'jdf', brand: '#2f6d3b', accent: '#c48a2f', extra: '#b3261e', light: '#fafaf7', dark: '#10130f' })
// → .theme-jdf { --brand-lightness: …; --brand-chroma: …; --brand-hue: …; }
```

Apply on root: `<html class="current-theme theme-jdf">`. Use `var(--brand)`, `var(--brand_)` (65% opacity), `var(--brand__)` (35%), `var(--brand-d)` (darker), `var(--brand-b)` (brighter).

## Multi-themes

N seasonal/brand variants = N `.theme-NAME` blocks. Each sets only OKLCH triplets — EVA derives the rest:

```scss
.theme-mai     { --brand-lightness: 70%; --brand-chroma: 0.09; --brand-hue: 125; ... }
.theme-juin    { /* warmer hues */ }
.theme-decembre{ /* cold blues */ }
```

Switch by toggling class on `<html>`. Single source of truth: only the OKLCH triplets, never duplicate `--brand`. For tinted surfaces, override `--light-hue`/`--dark-hue` per theme; keep `--light-chroma` low (~0.005–0.015).

## Dark mode (use EVA's `.toggle-theme`, don't roll your own)

EVA's mechanism: inside `_colors`, `.current-theme.toggle-theme` flips `--current-lightness` (96.4% → 5%) and `--current-darkness` (6.4% → 95%) with `!important`. `var(--light)` and `var(--dark)` literally **swap roles**.

Bridge semantic tokens:
```scss
.current-theme {
  --color-bg: var(--light);
  --color-text: var(--dark);
  --color-text-muted: var(--dark_);   // 65% opacity
  --color-border: var(--dark___);     // 15%
  --color-primary: var(--brand);
}
.current-theme.toggle-theme {
  // Optional: re-pin surfaces that use literal lightness values
  --color-surface: oklch(8% var(--light-chroma) var(--light-hue));
}
```

Toggle: `root.classList.toggle('toggle-theme', dark)` on `<html>`. Re-apply on `prefers-color-scheme` change only if mode === 'auto'.

**Put `.current-theme` on `<html>`, not `<body>`** — `<html>` background covers over-scroll areas.

For first-paint flash before JS attaches the class: keep a static `:root { --color-bg: #...; ... }` HEX fallback.

## Brightness steps per role (v2.4.0+)

`lightness = base + absolute offset + (bound − base) × ratio`. Each of the four steps (`-d`, `-b`, `-d_`, `-b_`) reads a per-role token first, falling back to the global one. `<base>` ∈ `brand|accent|extra|dark|light`, `<token>` ∈ `darker|brighter|darker_|brighter_`.

| Form | Scope | Default |
|------|-------|---------|
| `--<base>-<token>` | per role | *(unset)* → global `--<token>` |
| `--<base>-<token>-ratio` / `--<token>-ratio` | per role / global | `0` (term cancels out) |
| `--<base>-<token>-bound` / `--<token>-bound` | per role / global | `0%` / `100%`, flips with the mode |

```css
.current-theme {
  --dark-darker: -2%; --dark-brighter: 4%;   /* tight neutrals */
  --accent-brighter_: 12%;                   /* wide accent, only this step moves */

  --light-brighter:  0%; --light-brighter-ratio:  .35;   /* proportional: never clips */
  --light-brighter_: 0%; --light-brighter_-ratio: .7;
}
```

Why: OKLCH lightness is clamped to `0–100%`. At `--light-lightness: 96.4%`, `--light-b` (106.4%) and `--light-b_` (126.4%) both clamp to white — two steps, one color. Symmetric in dark mode on `--dark-d` / `--dark-d_`. A ratio makes the step take a share of the remaining headroom instead, so it stays in gamut.

Gotchas: `--darker` is **positive** in dark mode (`-d` = more contrast with the background, not darker in absolute terms). `--dark-hue` / `--light-hue` default to `var(--brand-hue)` with chroma `0.05` / `0.1`, so ink and background are brand-tinted — zero the chromas or pin the hues for neutral. Opacity and brightness don't cross: no `--dark-d` at 35%.

## Layout (responsive without breakpoints)

Use `var(--N)` for paddings, gaps, font-sizes — layout breathes by itself. Media queries only for **structural** topology changes (1col → 2col → 3col), never for spacing or typography:

```scss
.shell {
  display: grid;
  grid-template-columns: 1fr;
  @media (min-width: 1024px) { grid-template-columns: var(--280) minmax(0, 1fr); }
  @media (min-width: 1280px) { grid-template-columns: var(--280) minmax(0, 1fr) var(--320); }
}
.shell__nav { padding: var(--24) var(--20); gap: var(--20); }
.shell__nav-item { height: var(--44); padding: 0 var(--12); border-radius: var(--10-); font-size: var(--15); }
```

## Pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| `expected "$"` in `@use ... with ()` | Bare list | Wrap in parens: `$sizes: (4, 8, 16)` |
| `Size 16 is required as a base size` | `16` missing from `$sizes` | Add `16` |
| Source-order conflict overrides EVA media query | Same-specificity rule comes later in file | Move default `display: none` before the media query |
| Mobile spacing feels cramped | Using `var(--N)` for spacing | Switch to `var(--N-)` (conservative variant) |
| Font sizes shrink too aggressively | Using `var(--fs-N_)` / `var(--fs-N__)` for body | Use `var(--fs-16)` / `var(--fs-17)` (no suffix) |
| `var(--44)` is empty (yet `44 ∈ $font-sizes`) | Font tokens are `var(--fs-N)`, not `var(--N)` | Use `var(--fs-44)`. Namespaces are independent. |
| `var(--15)` empty after consolidation | Removed `15` from `$sizes`, leftover refs in code | Grep `var\(--15\b` post-fusion; rewrite to merged token |
| Fusion regex hits blur radii / gradient stops | `\b60px\b` matches anywhere | Always dry-run; 1–4px diff in shadow blur invisible — inspect once |

## Reference

- Sizes: every value in `$sizes` → `var(--N)`, `var(--N-)`, `var(--N_)`, `var(--N__)`
- Font sizes: every value in `$font-sizes` → `var(--fs-N)`, `var(--fs-N_)`, `var(--fs-N__)` — `fs-` prefix, separate namespace
- Reference viewport: `1440px` by default, configurable via `$reference-width` since v2.2.0 (sizes hit max there). Default min/max: `0.5rem` → `1rem`
- Fluid unit: `vw` (viewport, default) or `cqi` (container) via `$unit-fluid` / `--eva-fluid-unit`; `$min-font-size` a11y floor — see "Fluid unit: vw vs cqi" above
- Colors: `var(--brand)`, `var(--accent)`, `var(--extra)`, `var(--light)`, `var(--dark)`
- Color modifiers — opacity: `_` 65%, `__` 35%, `___` 15%; brightness: `-d` darker, `-b` brighter, `-d_` / `-b_` more
- Brightness steps tunable per role since v2.4.0 — `--<base>-<token>`, `-ratio`, `-bound` — see "Brightness steps per role"
- Theme classes (on `<html>`): `.current-theme` (always), `.theme-NAME` (active palette), `.toggle-theme` (dark mode)

## Verify visually

EVA emits `clamp(...)` formulas — you can't intuit shrink intensity from the math. Build a `/dev` route with one card per token, each showing every variant rendered as a real square (sizing) or text sample (font). A `Détails` toggle reveals the live computed value. Hidden by default; visible side-by-side comparison is the primary test.

Three benefits: (1) smoke test (empty live values = misconfigured `@use`), (2) variant choice (visual at 320px reveals which fits), (3) designer onboarding without touching component code.

---

Full human guide: `./use-eva.md` · Framework docs: <https://eva-css.xyz/>
