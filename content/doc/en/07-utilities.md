---
title: Utility classes
nav: Utility classes
group: system
eyebrow: Documentation
description: Every class emitted when $build-class is true — sizing, color, flex, grid, typography and layout.
---

Everything on this page exists only when `$build-class: true`. With `eva-css-fluid/variables` or `eva-css-fluid/core` you get the same values as custom properties and write your own selectors.

## Sizing

Sixteen property prefixes, each combined with every entry in `$sizes` and each of the four scaling variants.

| Prefix | Property |
|---|---|
| `w-` | `width` |
| `mw-` | `max-width` |
| `h-` | `height` |
| `p-` | `padding` |
| `px-` | `padding-inline` |
| `py-` | `padding-block` |
| `pt-` `pb-` `pr-` | `padding-top` / `-bottom` / `-right` |
| `mt-` `mb-` `ml-` `mr-` | `margin-top` / `-bottom` / `-left` / `-right` |
| `g-` `gap-` | `gap` |
| `br-` | `border-radius` |

The variant suffix comes last, exactly as on the variable:

```html
<div class="p-32 g-16">      <!-- var(--32), var(--16)  -->
<div class="p-32- g-16-">    <!-- var(--32-), var(--16-) — conservative -->
<div class="p-32_ g-16__">   <!-- var(--32_), var(--16__) — aggressive -->
```

With `$px-rem-suffix: true` you also get the static pair — `p-32-px`, `w-64-rem`.

> There is no `m-`, `mx-` or `my-`. Margins are only emitted per side. And note that `px-`/`py-` map to the **logical** properties `padding-inline` / `padding-block`, so they follow writing direction.

## Font size

`fs-N` for every entry in `$font-sizes`, with the two shrink variants:

```html
<h1 class="fs-52">…</h1>
<h2 class="fs-36_">…</h2>
<p class="fs-16">…</p>
```

Remember these read the `--fs-` namespace, which is separate from `$sizes`. See [Font sizes are a separate namespace](doc:sizes#font-sizes).

## Colors

Five properties × five roles × eight variants — 200 classes.

| Prefix | Property |
|---|---|
| `_c-` | `color` |
| `_bg-` | `background` |
| `_bc-` | `border-color` |
| `_f-` | `fill`, including descendant `path` elements |
| `_s-` | `stroke` |

```html
<div class="_bg-light _c-dark_ _bc-dark___">
  <svg class="_f-brand">…</svg>
</div>
```

The leading underscore is deliberate: it keeps EVA's color classes from colliding with anything already in your codebase.

Two shadow helpers ship alongside: `_shadow` and `_shadow_`.

## Flexbox

`.flex` is the container. `.x` and `.y` set the axis; without either, the direction is `row`.

```html
<div class="flex y g-16 center">…</div>
```

| Class | Effect |
|---|---|
| `flex` | `display: flex` |
| `x` / `y` | row / column |
| `reverse` | combined with `x` or `y`, reverses the axis |
| `wrap` / `nowrap` / `wrap-reverse` | `flex-wrap` |

Alignment shorthands, valid on their own or combined with `x` / `y`:

| Class | `justify-content` | `align-items` |
|---|---|---|
| `start` | flex-start | flex-start |
| `center` | center | center |
| `end` | flex-end | flex-end |
| `space` | space-between | center |
| `around` | space-around | center |
| `evenly` | space-evenly | center |

Inside `.x` or `.y` the two axes can be set independently with a compound name — `justify-align`:

```html
<div class="flex y space-center">…</div>   <!-- space-between / center -->
<div class="flex x end-baseline">…</div>   <!-- flex-end / baseline -->
```

Both halves accept `start`, `center`, `end`, `space`, `around`, `evenly` on the main axis, and `start`, `center`, `end`, `stretch`, `baseline` on the cross axis. The explicit form works too: `justify-center`, `items-end`, `content-space`.

Item-level classes:

| Class | Effect |
|---|---|
| `flex-1` / `flex-2` / `flex-3` | `flex: N 1 0%` |
| `flex-auto` / `flex-initial` / `flex-none` | `flex: 1 1 auto` / `0 1 auto` / `none` |
| `stretch` | `flex: 1` |
| `self-start` … `self-baseline` | `align-self` |
| `order-1` … `order-12` | `order` |
| `order-first` / `order-last` / `order-none` | `-9999` / `9999` / `0` |

Two composed patterns are included: `.flex-card` (header / body / footer, body grows) and `.flex-sidebar` (`.flex-sidebar-nav` fixed, `.flex-sidebar-main` grows with `min-width: 0`).

## Grid

Two independent systems.

### Auto-fit grid

```html
<div class="grid auto-fit-356- gap-32">…</div>
```

`auto-fit-<size><variant>` sets the `minmax()` floor of a `repeat(auto-fit, …)` template. The column count follows the available width by itself — no breakpoints.

> `auto-fit-*` classes are only generated for sizes **≥ 100**. A `auto-fit-64` will not exist even if `64` is in `$sizes`, because a 64px column floor is not a useful grid.

### Twelve-column flex grid

```html
<div class="flex-grid max-col-12">
  <div class="col-6">half</div>
  <div class="col-3">quarter</div>
  <div class="col-1/4">quarter</div>
</div>
```

| Class | Effect |
|---|---|
| `flex-grid` | Wrapping flex container using `--current-gap` |
| `container:flex-grid` | The same, plus container queries that pick the column count from the container width |
| `col-1` … `col-12` | Span N of `--grid-columns` |
| `col-1/1` … `col-1/12` | Fraction notation |
| `max-col-1` … `max-col-12` | Set `--grid-columns` locally |
| `xs:max-col-N` … `xxl:max-col-N` | The same under a `max-width` media query |

Breakpoints for the responsive form: `xs` 200px, `sm` 500px, `md` 700px, `lg` 1000px, `xl` 1200px, `xxl` 1400px.

## Typography

Variable-font axis classes, driven by two custom properties:

| Class | Sets |
|---|---|
| `fwg-1` … `fwg-8` | Weight axis step |
| `fwd-1` … `fwd-13` | Width axis step |
| `f-scale` | Scales the glyph to the box; `f-scale offset` shifts it |

| Class | Effect |
|---|---|
| `bold` | `font-weight: bold` |
| `ttu` | `text-transform: uppercase` |
| `tac` | `text-align: center` |
| `lh-0` / `lh-1` | `line-height: 0` / `1` |

> `lh-1-5` does not exist. For any other line height, declare it yourself.

## Layout

| Class | Effect |
|---|---|
| `por` / `poa` / `pof` / `pos` | `position: relative` / `absolute` / `fixed` / `sticky` |
| `poa center` | absolute, centred on both axes |
| `w-full` / `h-full` | `width: 100%` / `height: 100%` |
| `oh` | `overflow: hidden` |
| `ar-1` | `aspect-ratio: 1` |
| `circle` | `border-radius: 50%` |
| `border` / `border thin` | 1px border in the current color |
| `blur` / `blur_` / `blur__` | Three backdrop blur strengths |
| `pointer` | `cursor: pointer` |
| `hide` | `display: none` |
| `lt` | Letter-spacing helper |
| `mt-auto` / `mb-auto` / `ml-auto` / `mr-auto` | Auto margin on one side |

## Runtime containers

| Class | Effect |
|---|---|
| `eva-cqi` | `container-type: inline-size` + `--eva-fluid-unit: 1cqi` |
| `eva-root` | The same, for a top-level wrapper |

See [Fluid unit](doc:sizes#fluid-unit).

## Trimming the output

All of this compiles to a large stylesheet. Two ways to cut it down:

- `$custom-class: true` with `$class-config` restricts generation up front — see [Configuration](doc:config).
- [eva-purge](doc:cli#purge) removes what your markup never uses, after the fact. Typically 40–70%.

Next: [Adopting EVA](doc:adopt).
