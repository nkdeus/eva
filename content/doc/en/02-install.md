---
title: Installation
nav: Installation
group: start
eyebrow: Documentation
description: The three packages, the four SCSS entry points, and how to compile and watch.
---

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
