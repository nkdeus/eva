---
title: Fluid sizing
nav: Fluid sizing
group: system
eyebrow: Documentation
description: The four scaling variants, the separate font-size namespace, and switching a subtree from viewport to container.
---

Every value in `$sizes` becomes four CSS custom properties. Every value in `$font-sizes` becomes three, under a separate prefix. None of them is a fixed number — each is a `clamp()` that interpolates between a floor and a ceiling as the viewport widens.

```css
--16__: clamp(0.5rem,  calc(1.58 * var(--eva-fluid-unit, 1vw) - 0.56rem), 1.11rem);
--16_:  clamp(0.35rem, calc(0.83 * var(--eva-fluid-unit, 1vw) + 0.25rem), 1.11rem);
--16:   clamp(0.56rem, calc(0.56 * var(--eva-fluid-unit, 1vw) + 0.5rem),  1.11rem);
--16-:  clamp(0.91rem, calc(0.28 * var(--eva-fluid-unit, 1vw) + 0.75rem), 1.11rem);
```

All four peak at the same ceiling. What separates them is how fast they get there — and therefore how small they become on a phone.

## The four variants

| Token | Behaviour | Use for |
|---|---|---|
| `var(--N__)` | Collapses hardest on small screens | Decorative space that may vanish |
| `var(--N_)` | Strong shrink | Secondary spacing |
| `var(--N)` | Standard scaling | The default — layout dimensions |
| `var(--N-)` | Conservative: the floor stays near the design value | Padding and gaps that must stay breathable on mobile |

Measured, for `$sizes` containing `16`, at a 16px root font size:

| Token | 375px | 768px | 1440px | 1920px |
|---|---|---|---|---|
| `--16__` | 8.0px | 8.0px | 13.8px | 17.8px |
| `--16_` | 7.1px | 10.4px | 16.0px | 17.8px |
| `--16` | 10.1px | 12.3px | 16.1px | 17.8px |
| `--16-` | 14.6px | 14.6px | 16.0px | 17.4px |

Read the first column, not the third: at desktop width every variant lands on the design value, so the choice is entirely about what happens on a phone. `--16__` gives back 8px of space there; `--16-` keeps 14.6px.

> A practical default: `var(--N)` for widths, heights and layout dimensions, `var(--N-)` for the paddings and gaps inside components. Cramped mobile spacing is almost always a `var(--N)` that should have been `var(--N-)`.

The rule generalises: the more suffix characters, the more aggressive the collapse. `--32__` behaves to `--32` exactly as `--16__` does to `--16`.

## Font sizes are a separate namespace {#font-sizes}

This is the single most common source of confusion. Font tokens carry an `fs-` prefix and live in their own list.

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 32),          // -> var(--16)
  $font-sizes: (14, 16, 24)        // -> var(--fs-16)
);
```

| List | Tokens emitted |
|---|---|
| `$sizes` | `--N__`, `--N_`, `--N`, `--N-` |
| `$font-sizes` | `--fs-N__`, `--fs-N_`, `--fs-N` |

The same number in both lists produces two different tokens that clamp differently. `44` in `$font-sizes` gives you `var(--fs-44)` and no `var(--44)` at all — and an undefined custom property resolves to nothing, so the declaration is silently dropped and the browser keeps its default. Nothing errors; the page just looks slightly wrong.

Font sizes have three variants rather than four, and the scale is shifted one notch toward safety:

| Token | 375px | 768px | 1440px | 1920px |
|---|---|---|---|---|
| `--fs-16__` | 7.1px | 10.4px | 16.0px | 17.8px |
| `--fs-16_` | 10.1px | 12.3px | 16.1px | 17.8px |
| `--fs-16` | 13.1px | 14.2px | 16.0px | 17.4px |

`var(--fs-16)` on a 375px screen renders 13.1px — readable. `var(--fs-16__)` renders 7.1px, which is not body copy. Use the unsuffixed variant for anything a reader has to read, and keep `_` and `__` for display type that has room to shrink.

## Fluid unit: viewport or container {#fluid-unit}

Since 2.2.0 the unit is not baked into the compiled `clamp()`. Every token multiplies a custom property, `--eva-fluid-unit`, which defaults to `1vw`. Override it on any element and that subtree changes what it measures against — no rebuild, no second stylesheet.

```css
.card {
  container-type: inline-size;   /* the card becomes a size container */
  --eva-fluid-unit: 1cqi;        /* EVA tokens inside now read the card's width */
}
```

Two utility classes do both halves at once, so you cannot forget one:

| Class | Effect |
|---|---|
| `.eva-cqi` | `container-type: inline-size` + `--eva-fluid-unit: 1cqi` on the element |
| `.eva-root` | The same, intended for a top-level wrapper |

Reach for `cqi` when a component's size should follow the box it is placed in rather than the page — a card that must look identical in a full-width hero and in a narrow sidebar, a design-system preview panel, a widget embedded at an unknown width. Keep the default `vw` for page-level type and spacing, which genuinely should respond to the whole viewport.

Set the project-wide default in SCSS:

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 24, 48),
  $font-sizes: (16, 24, 48),
  $unit-fluid: 1cqi        // every token tracks its container by default
);
```

> `$fluid-runtime: false` reverts to the pre-2.2.0 literal output, byte for byte. Only useful for diffing against an old build — it removes the ability to switch units at runtime.

## Accessibility floor

`$min-font-size` raises the lower bound of every font-size clamp. It is expressed in px and converted to rem, so it still follows browser zoom.

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 32),
  $font-sizes: (14, 16, 24, 36),
  $min-font-size: 14
);
```

The floor is the *mobile* size, not the desktop one. 13–14 is a sane value. Setting it to 16 flattens the scale: every token would start at its ceiling and stop being fluid at all. Default is `0`, which disables the floor entirely.

## Reference width

`$reference-width` (default `1440`) is the viewport at which tokens reach their design value. Lower it for a design drawn at 1280, raise it for one drawn at 1920 — the whole scale shifts with it.

## Static counterparts

With `$px-rem-suffix: true`, each size also emits a fixed pair:

```css
--16-px:  16px;
--16-rem: 1rem;
```

Two uses: comparing a fluid value against its design reference in DevTools, and the small set of dimensions that must not scale — border widths, touch targets, pill radii. For those, a literal `48px` is just as good and clearer about intent.

## Checking your work

You cannot read a `clamp()` and predict how it feels. Build a throwaway page that renders every token at every variant as a real square, and resize the browser.

```html
<div class="probe">
  <div style="width: var(--16__); height: var(--16__)"></div>
  <div style="width: var(--16_);  height: var(--16_)"></div>
  <div style="width: var(--16);   height: var(--16)"></div>
  <div style="width: var(--16-);  height: var(--16-)"></div>
</div>
```

```js
// live value at the current viewport
getComputedStyle(document.querySelector('.probe')).getPropertyValue('--16');
```

An empty string means the token does not exist — either the size is missing from `$sizes`, or you asked for a sizing token when you meant `--fs-`. That check catches most configuration mistakes in seconds.

The [Fluid CSS](site:framework/css-fluid.html) and [Sizes](site:framework/sizes.html) pages run exactly this experiment live, if you would rather resize a window than build one.

Next: [Colors](doc:colors).
