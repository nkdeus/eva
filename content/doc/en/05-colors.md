---
title: Colors
nav: Colors
group: system
eyebrow: Documentation
description: Five roles, three numbers each, and everything else recomposed in OKLCH — opacity fades, brightness steps, per-role tuning and dark mode.
---

EVA does not store colors. It stores **three numbers per role** and recomposes everything in OKLCH at runtime.

```text
5 roles × { lightness, chroma, hue }
        ↓
--root-<role>              = "L C H"
--<role>                   = oklch(L C H)
--<role>_ __ ___           = same L C H, at 65% / 35% / 15% opacity
--<role>-d -b -d_ -b_      = same C H, lightness shifted
```

OKLCH is what makes this work: it is perceptually uniform, so shifting lightness does not drag the hue with it. A darker orange stays orange. That is not true in HSL.

## The five roles {#the-five-roles}

| Role | Purpose | Default lightness | Default chroma | Default hue |
|---|---|---|---|---|
| `brand` | Primary color | `80%` | `0` | `0` |
| `accent` | Secondary color | `70%` | `0` | `0` |
| `extra` | Tertiary color | `60%` | `0` | `0` |
| `dark` | Ink | `var(--current-darkness)` | `0.05` | `var(--brand-hue)` |
| `light` | Surface | `var(--current-lightness)` | `0.1` | `var(--brand-hue)` |

The defaults are deliberately colorless — a theme is what gives them values.

> `dark` and `light` inherit `--brand-hue` and carry a small chroma. Ink and background are therefore **tinted by the brand**. It is a design choice, not an oversight, and it surprises people: change `--brand-hue` to test a blue and every paragraph shifts with it. To opt out, set `--dark-chroma` and `--light-chroma` to `0`, or pin `--dark-hue` and `--light-hue` explicitly.

## Variants {#variants}

Each role produces eight variables. Two independent axes: opacity and lightness.

| Variable | Meaning |
|---|---|
| `var(--brand)` | The role itself |
| `var(--brand_)` | 65% opacity |
| `var(--brand__)` | 35% opacity |
| `var(--brand___)` | 15% opacity |
| `var(--brand-d)` | One step of extra contrast |
| `var(--brand-b)` | One step of less contrast |
| `var(--brand-d_)` | Two steps of extra contrast |
| `var(--brand-b_)` | Two steps of less contrast |

The same pattern applies to `accent`, `extra`, `dark` and `light`.

> **The two axes do not cross.** There is no `--brand-d__` — no 35% version of a brightness step. Fades are inlined at build time from `$fade-values`; brightness steps are recomputed at runtime from `--<role>-lightness`. It is a known limit of the system, not a naming gap.

## Brightness steps {#brightness-steps}

Each step is computed from the role's lightness with one formula:

```text
lightness = base + absolute offset + (bound − base) × ratio
```

Four global offsets drive the four steps, and they **flip with the mode**:

| Step | Token | Light mode | Dark mode | Bound (light) | Bound (dark) |
|---|---|---|---|---|---|
| `-d` | `--darker` | `-5%` | `10%` | `0%` | `100%` |
| `-b` | `--brighter` | `10%` | `-5%` | `100%` | `0%` |
| `-d_` | `--darker_` | `-15%` | `30%` | `0%` | `100%` |
| `-b_` | `--brighter_` | `30%` | `-15%` | `100%` | `0%` |

`--darker` being *positive* in dark mode is not a bug. In dark mode the ink role is light (95%), and `-d` means "more contrast against the background", not "darker in absolute terms". The steps describe a relation. That is also why the bounds swap with the mode.

### Per-role tuning (2.4.0+)

Before 2.4.0 those four offsets were global: every role got the same step. Since 2.4.0 each role can override its own, and each step can take a **proportional share of the remaining headroom** instead of a fixed offset.

| Form | Scope | Default | Role |
|---|---|---|---|
| `--<role>-<token>` | one role | *unset* | replaces the global absolute offset |
| `--<role>-<token>-ratio` | one role | `0` | share of the remaining headroom |
| `--<token>-ratio` | global | `0` | the same, for all five roles |
| `--<role>-<token>-bound` | one role | *unset* | aim at a different bound |
| `--<token>-bound` | global | see table | the limit the step pushes toward |

`<role>` is `brand`, `accent`, `extra`, `dark` or `light`. `<token>` is `darker`, `brighter`, `darker_` or `brighter_`.

**Why the ratio exists.** OKLCH lightness is clamped to `0%–100%`. With `--light-lightness: 96.4%`:

```text
--light-b  = 96.4% + 10% = 106.4%  ->  100%
--light-b_ = 96.4% + 30% = 126.4%  ->  100%
```

Two steps, one color. And it is symmetric: in dark mode `--dark-d` and `--dark-d_` collapse together on black. On every neutral, in every mode, two of the four steps were unusable — precisely on `dark` and `light`, the two most-used roles.

Measured in the browser, in OKLCH lightness, before and after switching to proportional:

| | before | after |
|---|---|---|
| `--light-b` (light mode) | `1.0` | `0.9766` |
| `--light-b_` (light mode) | `1.0` | `0.9892` |
| `--dark-d` (dark mode) | `1.0` | `0.9675` |
| `--dark-d_` (dark mode) | `1.0` | `0.985` |

### Recipes

Tight neutrals, wide accent — only the named step moves, `--dark-b_` keeps the global value:

```css
.current-theme {
  --dark-darker:  -2%;
  --dark-brighter: 4%;
  --accent-brighter_: 12%;
}
```

Steps that never saturate — an absolute part of `0` makes the step purely proportional, and it holds in both modes:

```css
.current-theme {
  --light-brighter:  0%;  --light-brighter-ratio:  .35;
  --light-brighter_: 0%;  --light-brighter_-ratio: .7;
}
```

Both terms add up — a guaranteed minimum plus a share of what is left:

```css
.current-theme {
  --dark-darker: -2%;
  --dark-darker-ratio: .3;
}
```

These are plain custom properties. Set them on `.current-theme`, or on any nested element that also carries `.current-theme`, to preview a variation in place.

> Fully backward compatible. While a per-role token is unset the native `var()` fallback lands on the original global value, and an unset ratio is `0`, so its term cancels. Upgrading changes no computed value.

## Themes {#themes}

A theme is a CSS class that sets the OKLCH triplets. Nothing else.

```scss
.theme-myproject {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;

  --accent-lightness: 55%;
  --accent-chroma: 0.3;
  --accent-hue: 290;

  --extra-lightness: 62%;
  --extra-chroma: 0.12;
  --extra-hue: 25;

  --light-chroma: 0.005;
  --light-hue: 120;
  --dark-chroma: 0.012;
  --dark-hue: 125;
}
```

```html
<body class="current-theme theme-myproject">
```

Convert your existing HEX palette with the [eva-color CLI](doc:cli#convert):

```bash
npx eva-color convert "#2f6d3b"
# -> oklch(43.3% 0.103 142.5)
```

### Several themes at once

Declare as many `.theme-<name>` blocks as you need and swap the class. Seasonal palettes, brand variants, per-customer themes — all the same mechanism.

```scss
.theme-may {
  --brand-lightness: 70%;  --brand-chroma: 0.09;  --brand-hue: 125;
  --accent-lightness: 78%; --accent-chroma: 0.08; --accent-hue: 80;
  --extra-lightness: 62%;  --extra-chroma: 0.12;  --extra-hue: 25;
  --light-chroma: 0.005;   --light-hue: 120;
  --dark-chroma: 0.012;    --dark-hue: 125;
}

.theme-december { /* cold blues */ }
```

```js
function applyTheme(name) {
  const root = document.documentElement;
  root.classList.add('current-theme');
  for (const t of ALL_THEMES) root.classList.remove('theme-' + t);
  root.classList.add('theme-' + name);
}
```

Two things worth knowing:

- **One source of truth per theme.** Set only the triplets. Never redeclare `--brand` itself; let EVA derive it.
- **Preview swatches scope cleanly.** To show a non-active theme's color, wrap the swatch in `<div class="current-theme theme-december">` and `background: var(--brand)` resolves to that theme's color inside the card, whatever the page is running.

Keep `--light-chroma` low — around `0.005` to `0.015`. Higher reads as saturated and breaks the neutral-surface feel.

## Dark mode {#dark-mode}

EVA ships dark mode. Do not build your own with `.dark` classes and HEX overrides.

Two variables decide the mode, and they are the only place it is decided:

| Variable | Light | Dark |
|---|---|---|
| `--current-lightness` | `96.4%` | `5%` |
| `--current-darkness` | `6.4%` | `95%` |

`light` reads the first, `dark` reads the second. Adding `.toggle-theme` swaps them:

```css
.current-theme.toggle-theme {
  --current-lightness: 5%;
  --current-darkness: 95%;
  --dark-lightness:  var(--current-darkness)  !important;
  --light-lightness: var(--current-lightness) !important;
  --darker: 10%;  --brighter: -5%;
  --darker_: 30%; --brighter_: -15%;
  --darker-bound: 100%;  --brighter-bound: 0%;
  --darker_-bound: 100%; --brighter_-bound: 0%;
}
```

`var(--light)` is bright in light mode and dark in dark mode. `var(--dark)` is the opposite. The two roles literally swap — that is the whole trick, and it is why no color needs redefining.

```html
<body class="current-theme theme-myproject toggle-theme">
```

```js
function applyMode(mode) {
  const root = document.documentElement;
  const dark = mode === 'dark'
    || (mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('toggle-theme', dark);
}

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (currentMode === 'auto') applyMode('auto');
});
```

> The `!important` on the two lightness lines means a theme's configured `--dark-lightness` and `--light-lightness` are **overridden in dark mode**. Only the hue and chroma of `dark` and `light` survive the switch. That is intentional — it is what guarantees contrast — but it catches people who tuned those values per theme.

### Bridging semantic tokens

If your codebase already has `--color-bg`, `--color-text` and friends, alias them onto EVA rather than replacing them. They then flip with `.toggle-theme` and stay tinted by the active theme for free.

```scss
.current-theme {
  --color-bg: var(--light);
  --color-surface: oklch(100% var(--light-chroma) var(--light-hue));
  --color-surface-alt: oklch(96% var(--light-chroma) var(--light-hue));

  --color-text: var(--dark);
  --color-text-muted: var(--dark_);
  --color-text-subtle: var(--dark__);
  --color-border: var(--dark___);

  --color-primary: var(--brand);
  --color-primary-ink: var(--brand-d);
  --color-primary-tint: var(--brand___);
}

// Surfaces pinned to literal lightness values don't track --current-lightness,
// so re-pin them for dark mode.
.current-theme.toggle-theme {
  --color-surface: oklch(8% var(--light-chroma) var(--light-hue));
  --color-surface-alt: oklch(12% var(--light-chroma) var(--light-hue));
}
```

If the app boots client-side and applies the theme classes after mount, keep a static `:root { --color-bg: #fafaf7; }` fallback to avoid a flash of unthemed content on first paint.

## Color utility classes

With `$build-class: true`, EVA emits 200 color classes — five properties × five roles × eight variants.

| Prefix | Property |
|---|---|
| `._c-` | `color` |
| `._bg-` | `background` |
| `._bc-` | `border-color` |
| `._f-` | `fill` (also applies to descendant `path` elements) |
| `._s-` | `stroke` |

```html
<body class="current-theme theme-myproject _bg-light _c-dark_">
  <span class="_c-brand-d">High-contrast brand text</span>
  <svg class="_f-accent">…</svg>
</body>
```

The [Colors](site:framework/colors.html) and [Auto theme](site:framework/auto-theme.html) pages let you drag the hue and watch all 200 update live.

Next: [Gradients](doc:gradients).
