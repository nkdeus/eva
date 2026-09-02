---
title: Getting started
nav: Getting started
group: start
eyebrow: Documentation
description: What EVA CSS is, the two ideas it is built on, and a working setup in three commands.
---

EVA CSS turns a static design into a responsive system without a single breakpoint. You give it the sizes your design actually uses; it gives you back CSS custom properties that scale continuously with the viewport, and an OKLCH color system where a whole theme is a handful of numbers.

It is a SCSS package. There is no runtime, no JavaScript, no build plugin — you compile it with `sass` and ship the CSS.

## The two ideas

Everything in EVA comes from two decisions.

**Sizes are `clamp()` formulas, not values.** A design says a card has `32px` of padding. On a phone that is too much; on a 4K screen it is too little. EVA emits `--32` as a `clamp()` that interpolates between a floor and a ceiling as the viewport widens. You write `padding: var(--32)` once and never write a media query for it.

**Colors are three numbers, not a palette.** Each of the five base roles stores a lightness, a chroma and a hue, and every variant — opacity fades, brightness steps, the whole dark mode — is recomposed from those three at runtime in OKLCH. Swapping a theme means swapping fifteen numbers.

```scss
// what you write
.card {
  padding: var(--32);
  gap: var(--16);
  border-radius: var(--12);
  background: var(--light);
  color: var(--dark_);
}
```

```css
/* what the browser gets */
--32: clamp(1.11rem, calc(1.11 * var(--eva-fluid-unit, 1vw) + 1rem), 2.22rem);
--light: oklch(var(--root-light));
--dark_: oklch(var(--root-dark) / 65%);
```

## Quickstart

Three commands and a config block. Full detail in [Installation](doc:install) and [Configuration](doc:config).

```bash
npm install eva-css-fluid eva-css-purge eva-colors
```

```scss
// styles/main.scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 12, 16, 24, 32, 48, 64, 128),
  $font-sizes: (12, 14, 16, 20, 24, 32),
  $build-class: true
);
```

```bash
npx sass --load-path=node_modules styles/main.scss:styles/main.css
```

```html
<body class="current-theme theme-eva all-grads">
  <div class="flex y g-16 p-32 br-12 _bg-light">
    <h1 class="fs-32 _c-dark">Fluid by default</h1>
    <p class="fs-16 _c-dark_">Resize the window. Nothing jumps.</p>
  </div>
</body>
```

> `16` is mandatory in `$sizes` — EVA uses it as the rem reference and throws a compile error without it.

## What you get

| Layer | You get | Chapter |
|---|---|---|
| Sizing | `var(--N)` and three scaling variants per size, `var(--fs-N)` for type | [Fluid sizing](doc:sizes) |
| Color | 5 roles × 8 variants in OKLCH, dark mode included | [Colors](doc:colors) |
| Gradients | Emmet-style composable gradient classes | [Gradients](doc:gradients) |
| Utilities | Sizing, color, flex, grid and layout classes | [Utility classes](doc:utilities) |
| Tooling | HEX→OKLCH conversion, palette generation, CSS purging | [CLI tools](doc:cli) |

## Where to go next

- Starting a new project — read [Installation](doc:install), then [Configuration](doc:config).
- Adding EVA to a codebase that already ships — go straight to [Adopting EVA](doc:adopt). The audit step there is what separates a clean migration from freezing years of design drift into named tokens.
- Looking for one specific variable or class — [Reference](doc:reference) is the flat list.
- Want to see it move — the [Fluid CSS](site:framework/css-fluid.html) and [Colors](site:framework/colors.html) pages have live, resizable demos.
