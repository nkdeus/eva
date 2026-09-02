---
title: CLI tools
nav: CLI tools
group: guides
eyebrow: Documentation
description: eva-color for OKLCH conversion, palettes, themes and contrast; eva-purge for stripping the classes you never used.
---

Two optional packages sit beside the framework. Neither is needed to compile EVA — they handle the two jobs around it: getting colors *in*, and getting unused CSS *out*.

## eva-color

```bash
npm install eva-colors
```

Five commands. Everything reads and writes plain HEX or OKLCH, so it fits any pipeline.

| Command | Does |
|---|---|
| `convert <hex>` | HEX to OKLCH |
| `to-hex <l> <c> <h>` | OKLCH back to HEX |
| `palette <hex> [steps]` | Harmonious palette, 5 steps by default |
| `theme <config.json>` | A complete `.theme-<name>` block |
| `contrast <hex1> <hex2>` | Contrast ratio and WCAG verdict |

### Converting a palette {#convert}

```bash
npx eva-color convert "#2f6d3b"
# -> oklch(43.3% 0.103 142.5)
```

Those three numbers are exactly what a theme block wants:

```scss
.theme-myproject {
  --brand-lightness: 43.3%;
  --brand-chroma: 0.103;
  --brand-hue: 142.5;
}
```

`to-hex` goes the other way, which is what you want when handing a value back to a designer working in HEX:

```bash
npx eva-color to-hex 62.8 0.258 29.23
```

### Generating a palette

```bash
npx eva-color palette "#2f6d3b" 7
```

Seven perceptually even steps from one seed. Because the steps are computed in OKLCH, the hue holds across the whole ramp — a dark step of a green stays green instead of drifting olive the way an HSL ramp does.

### Generating a whole theme

Describe the five roles in JSON:

```json
{
  "name": "myproject",
  "brand": "#ff5733",
  "accent": "#7300ff",
  "extra": "#ffe500",
  "light": "#f3f3f3",
  "dark": "#252525"
}
```

```bash
npx eva-color theme theme.json
```

Out comes a `.theme-myproject` block with all fifteen values, ready to paste into your SCSS. A generated theme writes the hues explicitly, which incidentally opts you out of the brand-tinted neutrals described in [Colors](doc:colors#the-five-roles).

### Checking contrast

```bash
npx eva-color contrast "#ffffff" "#252525"
```

Worth running on the pairs your theme actually produces — `--dark` on `--light`, `--light` on `--brand` — rather than on the seed colors. The brightness steps move lightness around, and a step that reads fine in light mode can fall under the threshold once the mode flips.

### From JavaScript

The same functions are importable:

```js
import {
  hexToOklch, oklchToHex,
  generatePalette, generateTheme,
  getContrast, checkAccessibility
} from 'eva-colors';

const theme = generateTheme({
  name: 'myproject',
  brand: '#2f6d3b',
  accent: '#c48a2f',
  extra: '#b3261e',
  light: '#fafaf7',
  dark: '#10130f'
});
```

Useful for generating themes at build time — per customer, per season, per brand — instead of hand-writing a block for each.

## eva-purge {#purge}

```bash
npm install eva-css-purge
```

`$build-class: true` emits every combination of every property and every size. Most projects use a fraction of that. `eva-purge` scans your markup and drops the rest — typically **40 to 70%** of the file.

```bash
npx eva-purge \
  --css styles/main.css \
  --content "**/*.html" \
  --output styles/main-compressed.css \
  --safelist "current-theme,toggle-theme,all-grads"
```

| Option | Default | Purpose |
|---|---|---|
| `--css <file>` | required | The stylesheet to purge |
| `--content <pattern>` | `**/*.{html,js,vue,jsx,tsx}` | Files to scan for class usage |
| `--output <file>` | `[css]-purged.css` | Where to write |
| `--safelist <classes>` | — | Comma-separated classes to keep regardless |
| `--config <file>` | — | Read the options from a config file instead |

It knows about EVA specifically, so it does not break what makes the framework work:

- every custom property in `:root` survives, because a purged class may still be referenced by hand-written CSS;
- element selectors (`body`, `h1`, `p`) are kept;
- media queries are preserved;
- theme classes are protected through the safelist.

### Safelist what JavaScript adds

The scanner reads your markup, so any class only ever added at runtime is invisible to it. Anything toggled by script must be safelisted:

```bash
--safelist "current-theme,toggle-theme,all-grads,theme-eva,theme-dark"
```

For anything more involved, a config file takes regular expressions:

```js
// eva.config.js
module.exports = {
  purge: {
    content: ['src/**/*.html', 'src/**/*.js'],
    css: 'dist/style.css',
    output: 'dist/style-purged.css',
    safelist: {
      standard: ['current-theme', 'all-grads'],
      deep: [/^theme-/],
      greedy: [/^brand-/, /^accent-/]
    }
  }
};
```

> Purge at the end of the build and ship the purged file. Keep pointing your dev pages at the full stylesheet — otherwise a class you add while working silently does nothing until the next purge.

### Wiring it up

```json
{
  "scripts": {
    "build-css": "npx sass --load-path=node_modules styles/main.scss:styles/main.css",
    "purge": "npx eva-purge --css styles/main.css --content '**/*.html' --output styles/main-compressed.css --safelist 'current-theme,toggle-theme,all-grads'",
    "build": "npm run build-css && npm run purge"
  }
}
```

The other lever is `$custom-class` — see [Configuration](doc:config). Restricting generation up front and purging afterwards are complementary, not alternatives: the first keeps the dev stylesheet small, the second keeps the shipped one small.

Next: [Reference](doc:reference).
