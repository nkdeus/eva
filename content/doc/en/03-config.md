---
title: Configuration
nav: Configuration
group: start
eyebrow: Documentation
description: Every option accepted by the SCSS entry points, what it changes in the output, and the two build modes.
---

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
