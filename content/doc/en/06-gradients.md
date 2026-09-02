---
title: Gradients
nav: Gradients
group: system
eyebrow: Documentation
description: Composable gradient classes — one applier, then setters for colors, direction, zoom and animation.
---

A gradient in EVA is not one class, it is a small stack: an **applier** that draws it, and **setters** that feed it. Everything travels through three custom properties, so any part can be overridden anywhere.

```html
<body class="current-theme theme-eva all-grads">
  <div class="grad-linear from-brand to-accent d-br">…</div>
</body>
```

> The container must carry `all-grads`. That class is what declares the three variables; without it the appliers have nothing to read.

## The three variables

| Variable | Default | Set by |
|---|---|---|
| `--current-from-color` | `var(--brand)` | `from-*` |
| `--current-to-color` | `var(--accent)` | `to-*` |
| `--current-angle` | `90deg` | `d-*` and `a-*` |

Set them by hand when the class vocabulary is not enough:

```css
.hero {
  --current-from-color: oklch(70% 0.2 300);
  --current-to-color: var(--extra___);
  --current-angle: 17deg;
}
```

## Appliers

| Class | Draws |
|---|---|
| `grad-linear` | Linear gradient as background |
| `grad-radial` | Radial gradient from the center |
| `grad-linear-text` | Linear gradient clipped to the text |
| `grad-radial-text` | Radial gradient clipped to the text |
| `grad-linear-border` | Linear gradient as `border-image` |
| `grad-radial-border` | Radial gradient as `border-image` |

The `-text` variants set `background-clip: text` and a transparent fill. The `-border` variants use `border-image`, so the element needs a `border-style` and a `border-width` for anything to show.

## Color setters

`from-*` and `to-*` accept every color role and every one of its variants — the same vocabulary as the [color system](doc:colors#variants).

```html
<div class="grad-linear from-brand to-accent">…</div>
<div class="grad-linear from-brand_ to-extra-d">…</div>
<div class="grad-radial from-accent to-transparent">…</div>
```

| Pattern | Example | Result |
|---|---|---|
| `from-<role>` | `from-brand` | Start at the role |
| `from-<role>_` | `from-brand_` | Start at 65% opacity |
| `from-<role>-d` | `from-extra-d` | Start at the darker step |
| `to-transparent` | `to-transparent` | Fade out |
| `from-transparent` | `from-transparent` | Fade in |

Because the endpoints are theme variables, a gradient re-derives itself on theme switch and in dark mode. Nothing to redeclare.

## Direction

Eight shorthands, and full angle control when you need it.

| Class | Direction |
|---|---|
| `d-t` | to top |
| `d-b` | to bottom |
| `d-l` | to left |
| `d-r` | to right |
| `d-tl` | to top left |
| `d-tr` | to top right |
| `d-bl` | to bottom left |
| `d-br` | to bottom right |

`a-0` through `a-360` in 5° steps — 73 classes: `a-45`, `a-90`, `a-135`, `a-215`, `a-360`.

```html
<h1 class="grad-linear-text from-brand to-accent a-135">Angled</h1>
```

> `d-*` and `a-*` both declare `--current-angle` with `!important`. Do not put both on one element — the winner is whichever comes later in the stylesheet, not in your class attribute.

## Zoom and position

Enlarging the gradient box is what makes the animation readable — a gradient at 100% has nowhere to travel.

| Class | `background-size` |
|---|---|
| `bg-size` | 150% |
| `bg-size_` | 200% |
| `bg-size__` | 300% |

| Class | `background-position` |
|---|---|
| `bg-center` | center |
| `bg-top` / `bg-bottom` | top / bottom |
| `bg-left` / `bg-right` | left / right |

## Animation

| Class | Duration |
|---|---|
| `animated` | 3s |
| `animated-slow` | 6s |
| `animated-fast` | 1s |

All three run the same `gradient-shift` keyframes, which pans the background position. Pair them with a `bg-size*` class or nothing will appear to move.

```html
<div class="grad-radial from-extra to-transparent bg-size_ animated">…</div>
```

## Putting it together

```html
<!-- diagonal, brand fading into a dark accent -->
<div class="grad-linear from-brand_ to-accent-d d-br br-12 p-32">Card</div>

<!-- gradient headline -->
<h1 class="grad-linear-text from-brand to-accent d-r fs-52">Gradient Text</h1>

<!-- slow animated radial glow -->
<div class="grad-radial from-extra to-transparent bg-size__ animated-slow">Glow</div>

<!-- gradient border, note the border-style -->
<div class="grad-linear-border from-brand to-extra" style="border: 2px solid">Framed</div>
```

The [Gradients](site:framework/gradients.html) page has the whole vocabulary as a live playground.

Next: [Utility classes](doc:utilities).
