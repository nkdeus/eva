# @eva/css

> Fluid design framework with OKLCH colors - Transform static designs into responsive fluid systems

## 🎯 Features

- **Fluid Scaling System**: Modern clamp() functions for truly responsive designs
- **OKLCH Colors**: Perceptually uniform color system with opacity/brightness modifiers
- **Modern Gradients**: Emmet-style syntax for ultra-compact gradient creation
- **Theme System**: Built-in dark/light mode with seamless switching
- **Two Modes**: Utility classes or CSS variables only
- **Zero JavaScript**: Pure CSS/SCSS solution

## 📦 Installation

```bash
npm install @eva/css
# or
pnpm add @eva/css
# or
yarn add @eva/css
```

## 🚀 Quick Start

### Using Pre-built CSS

```html
<link rel="stylesheet" href="node_modules/@eva/css/dist/eva.css">
```

### Using SCSS with Default Configuration

```scss
@use '@eva/css';
```

### Using SCSS with Custom Configuration

**This is the main feature of EVA CSS!** Simply change the `$sizes` to match your Figma design:

```scss
// Example: Sizes extracted from Figma design
@use '@eva/css' with (
  $sizes: 4, 8, 16, 32, 64, 128,        // 👈 Change these to YOUR design sizes!
  $font-sizes: 14, 16, 20, 24, 32,      // 👈 Change these to YOUR font sizes!
  $build-class: true,
  $px-rem-suffix: false
);
```

**Real example from a Figma project:**

```scss
// Extracted from Figma: gaps, paddings, widths, heights
@use '@eva/css' with (
  $sizes: 4, 8, 16, 32, 64, 120, 141,   // 4=content-gap, 8=color-gap, 16=padding,
                                         // 32=section-gap, 64=hero-gap,
                                         // 120=H1, 141=circles
  $font-sizes: 16, 120,                  // 16=body, 120=heading
  $build-class: true
);

// Now all these sizes are available as fluid variables!
// var(--4), var(--8), var(--16), var(--32), var(--64), var(--120), var(--141)
```

## 🎨 Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `$sizes` | `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` | Available fluid size values |
| `$font-sizes` | `12, 14, 16, 18, 20, 24, 32, 48` | Available font sizes |
| `$build-class` | `true` | Generate utility classes (`true`) or variables only (`false`) |
| `$px-rem-suffix` | `false` | Add px/rem static values for debugging |
| `$name-by-size` | `true` | Use size values in variable names |
| `$custom-class` | `false` | Enable custom class generation |

## 💡 Usage Examples

### Utility Classes Mode (`$build-class: true`)

```html
<div class="w-64 h-64 p-16 _bg-brand _c-light">
  <h1 class="fs-32 _c-accent">Hello EVA</h1>
  <p class="fs-16 _c-light_">Fluid design framework</p>
</div>
```

### Variables Mode (`$build-class: false`)

```scss
.hero {
  width: var(--64);
  padding: var(--16);
  background: var(--brand);
  color: var(--light);

  h1 {
    font-size: var(--32);
    color: var(--accent);
  }
}
```

## 🎨 Fluid Scaling

EVA CSS uses modern CSS `clamp()` for fluid scaling:

```scss
// Size variables
var(--16)    // Standard fluid scaling
var(--16_)   // Reduced scaling
var(--16__)  // Extreme reduced
var(--16-)   // Extended scaling

// Font size variables
var(--24)    // Standard fluid font
var(--24_)   // Reduced scaling
var(--24__)  // Extreme reduced
```

## 🌈 OKLCH Color System

```scss
// Base colors
var(--brand)     // Base brand color
var(--accent)    // Accent color
var(--extra)     // Extra color
var(--light)     // Light color
var(--dark)      // Dark color

// Opacity modifiers
var(--brand_)    // 65% opacity
var(--brand__)   // 35% opacity
var(--brand___)  // 5% opacity

// Brightness modifiers
var(--brand-d)   // Darker
var(--brand-b)   // Brighter
var(--brand-d_)  // More darker
var(--brand-b_)  // More brighter
```

## 🎨 Gradient System

```html
<!-- Linear gradient -->
<div class="grad-linear from-brand to-accent d-r">Content</div>

<!-- Radial gradient -->
<div class="grad-radial from-extra to-transparent bg-size_">Content</div>

<!-- Gradient text -->
<h1 class="grad-linear-text from-brand to-accent d-br">Gradient Text</h1>

<!-- Animated gradient -->
<div class="grad-linear from-brand to-accent a-45 animated">Content</div>
```

## 🌓 Theme System

```html
<body class="current-theme theme-myproject">
  <!-- Content -->
  <button onclick="document.body.classList.toggle('toggle-theme')">
    Toggle Theme
  </button>
</body>
```

```scss
// Define your theme
.theme-myproject {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;

  --accent-lightness: 51.7%;
  --accent-chroma: 0.293;
  --accent-hue: 289.66;

  --current-lightness: 96.4%;  // Light mode
  --current-darkness: 26.4%;   // Dark mode
}
```

## 📚 Documentation

- [Full Documentation](https://eva-css.xyz/)
- [GitHub Repository](https://github.com/nkdeus/eva)
- [Examples & Demo](https://eva-css.xyz/demo/)

## 🎯 Quick Workflow: Figma → EVA CSS

```bash
# 1. Analyze your Figma design and extract ALL sizes used
# Look for: gaps, paddings, margins, widths, heights, font-sizes

# 2. Create your project SCSS file
# my-project.scss
@use '@eva/css' with (
  $sizes: 4, 8, 16, 32, 64, 120, 141,   # ALL sizes from Figma
  $font-sizes: 16, 120,                  # ALL font sizes from Figma
  $build-class: true
);

# 3. Compile
npx sass my-project.scss:my-project.css

# 4. Use in HTML with generated utility classes
<div class="w-141 h-141 p-16 g-8">...</div>

# 5. Or use CSS variables in custom CSS
.my-component {
  width: var(--141);
  padding: var(--16);
  gap: var(--8);
}
```

**The magic:** All sizes scale fluidly across viewport sizes using `clamp()` - no media queries needed!

## 🛠️ Build from Source

```bash
cd packages/eva-css
npm run build        # Build expanded CSS
npm run build:min    # Build minified CSS
npm run watch        # Watch mode for development
```

## 📄 License

MIT © [Michaël Tati](https://ulysse-2029.com/)

## 👨‍💻 Author

**Michaël Tati**
- Portfolio: [ulysse-2029.com](https://ulysse-2029.com/)
- LinkedIn: [linkedin.com/in/mtati](https://www.linkedin.com/in/mtati/)
- Website: [eva-css.xyz](https://eva-css.xyz/)

## 🔗 Related Packages

- [@eva/colors](https://www.npmjs.com/package/@eva/colors) - OKLCH color utilities
- [@eva/purge](https://www.npmjs.com/package/@eva/purge) - CSS optimization tool
- [@eva/mcp-server](https://www.npmjs.com/package/@eva/mcp-server) - Figma to HTML MCP server
