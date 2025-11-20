# EVA CSS Framework - Monorepo

> Transform static designs into responsive fluid systems with OKLCH colors

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

EVA CSS is a modern, fluid design framework that converts static UI designs (like Figma) into fully responsive systems using CSS `clamp()` and perceptually uniform OKLCH colors. **No media queries needed.**

## ✨ Key Features

- 🎨 **Fluid Scaling** - Automatic responsive sizing using `clamp()`
- 🌈 **OKLCH Colors** - Perceptually uniform color system
- 📏 **Custom Sizes** - Define YOUR design sizes from Figma/Sketch
- 🎯 **Two Modes** - Utility classes OR CSS variables only
- ⚡ **Zero JavaScript** - Pure CSS solution
- 🗜️ **Smart Purging** - Intelligent CSS optimization
- 🎭 **Theme System** - Built-in dark/light mode

## 📦 Packages

This monorepo contains multiple npm packages:

| Package | Description | Version |
|---------|-------------|---------|
| [@eva/css](./packages/eva-css) | Core fluid design framework | 1.0.0 |
| [@eva/colors](./packages/eva-colors) | OKLCH color utilities | 1.0.0 |
| [@eva/purge](./packages/eva-purge) | Intelligent CSS purging | 1.0.0 |

## 🚀 Quick Start

### 1. Install EVA CSS

```bash
npm install @eva/css
# or
pnpm add @eva/css
```

### 2. Extract Sizes from Your Design

Look at your Figma/Sketch design and note ALL sizes used:
- Gaps, paddings, margins
- Widths, heights
- Font sizes

### 3. Configure with YOUR Sizes

```scss
// my-project.scss
@use '@eva/css' with (
  // 👇 YOUR sizes from Figma/Sketch
  $sizes: (4, 8, 16, 32, 64, 120, 141),
  $font-sizes: (16, 120),
  $build-class: true
);
```

### 4. Use Generated Utilities

```html
<div class="w-141 h-141 p-16 g-8 _bg-brand">
  <h1 class="fs-120 _c-light">Hello EVA!</h1>
  <p class="fs-16 _c-light_">Fluid design framework</p>
</div>
```

**That's it!** All sizes scale fluidly across viewports. ✨

## 💡 The Magic

Traditional CSS:
```css
/* ❌ Manual breakpoints needed */
.title { font-size: 32px; }
@media (min-width: 768px) { .title { font-size: 48px; } }
@media (min-width: 1024px) { .title { font-size: 64px; } }
```

EVA CSS:
```css
/* ✅ Automatic fluid scaling */
.fs-64 { font-size: var(--64); }
/* --64 = clamp(2.22rem, 2.22vw + 2rem, 4.44rem) */
```

## 🎯 Complete Workflow: Figma → Production

```bash
# 1. Extract colors from Figma
npx @eva/colors convert #ff0000
# → oklch(62.8% 0.258 29.23)

# 2. Create theme
npx @eva/colors theme theme-config.json > theme.scss

# 3. Compile CSS with your sizes
@use '@eva/css' with (
  $sizes: (4, 8, 16, 32, 64),  # From Figma analysis
  $font-sizes: (16, 24, 32)
);

# 4. Build and optimize
npm run build        # Compile SCSS
npx @eva/purge --css dist/style.css --content "src/**/*.html"
# → 40-70% size reduction
```

## 📚 Documentation

### Core Framework: @eva/css

```scss
@use '@eva/css' with (
  $sizes: (4, 8, 16, 32, 64, 128),
  $font-sizes: (14, 16, 20, 24, 32),
  $build-class: true,           // Generate utility classes
  $px-rem-suffix: false         // Fluid only
);
```

**Available utilities:**
- **Sizing**: `w-64`, `h-64`, `p-16`, `g-8`, `br-4`
- **Typography**: `fs-16`, `fs-24`, `fs-32`
- **Colors**: `_bg-brand`, `_c-accent`, `_c-light_`
- **Gradients**: `grad-linear from-brand to-accent`

[Full Documentation →](./packages/eva-css)

### Color Utilities: @eva/colors

```bash
# Convert hex to OKLCH
eva-color convert #ff0000

# Generate palette
eva-color palette #ff0000 7

# Check contrast
eva-color contrast #ffffff #000000
```

```javascript
import { hexToOklch, generateTheme } from '@eva/colors';

const oklch = hexToOklch('#ff0000');
// { l: 62.8, c: 0.258, h: 29.23, css: 'oklch(...)' }
```

[Full Documentation →](./packages/eva-colors)

### CSS Optimization: @eva/purge

```bash
# Purge unused CSS
eva-purge --css dist/style.css --content "src/**/*.html"

# With config
eva-purge --config eva.config.js
```

Typical results: **40-70% size reduction**

[Full Documentation →](./packages/eva-purge)

## 🎨 Example Projects

Check out the `demo/` directory for a complete showcase with examples.

[View Live Demo →](https://eva-css.xyz/demo/)

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Test packages
pnpm run test

# Develop packages
cd packages/eva-css
pnpm run watch
```

## 🤝 Contributing

Contributions welcome! Open an issue or PR on [GitHub](https://github.com/nkdeus/eva/tree/feature/npm-packages).

## 📄 License

MIT © [Michaël Tati](https://ulysse-2029.com/)

## 👨‍💻 Author

**Michaël Tati** - Full Stack Developer & Designer
- 🌐 Portfolio: [ulysse-2029.com](https://ulysse-2029.com/)
- 💼 LinkedIn: [linkedin.com/in/mtati](https://www.linkedin.com/in/mtati/)
- 🎨 EVA CSS: [eva-css.xyz](https://eva-css.xyz/)
- 📦 GitHub: [github.com/nkdeus](https://github.com/nkdeus)

---

## 🌟 Why EVA CSS?

### Traditional Approach
- ❌ Manual breakpoints for every size
- ❌ Dozens of media queries
- ❌ Inconsistent spacing
- ❌ Hard to maintain

### EVA Approach
- ✅ Define sizes once from your design
- ✅ Automatic fluid scaling
- ✅ Consistent system
- ✅ Easy to maintain

### The Result
```
Traditional CSS:  2000+ lines, 300+ media queries
EVA CSS:          Generated automatically from 7 sizes
```

## 🚀 Get Started

```bash
npm install @eva/css @eva/colors @eva/purge
```

Check out the [Live Demo](https://eva-css.xyz/demo/) or visit [eva-css.xyz](https://eva-css.xyz/).

---

**Made with ❤️ by [Michaël Tati](https://ulysse-2029.com/)**
