# @eva/colors

> OKLCH color utilities for EVA CSS framework

Powerful color conversion and manipulation tools focused on the perceptually uniform OKLCH color space.

## 🎯 Features

- **Hex ↔ OKLCH Conversion**: Seamless conversion between color formats
- **Palette Generation**: Create harmonious color palettes from a base color
- **Theme Generator**: Generate EVA CSS themes from color configs
- **Accessibility Checks**: WCAG contrast validation
- **CLI & Programmatic API**: Use via command line or in your code

## 📦 Installation

```bash
npm install @eva/colors
# or
pnpm add @eva/colors
# or
yarn add @eva/colors
```

## 🚀 Usage

### CLI Usage

```bash
# Convert hex to OKLCH
eva-color convert #ff0000

# Convert OKLCH to hex
eva-color to-hex 62.8 0.258 29.23

# Generate a 7-step palette
eva-color palette #ff0000 7

# Generate theme CSS
eva-color theme my-theme.json

# Check color contrast
eva-color contrast #ffffff #000000
```

### Programmatic Usage

```javascript
import {
  hexToOklch,
  oklchToHex,
  generatePalette,
  generateTheme,
  checkAccessibility
} from '@eva/colors';

// Convert hex to OKLCH
const oklch = hexToOklch('#ff0000');
console.log(oklch);
// {
//   l: 62.8,
//   c: 0.258,
//   h: 29.23,
//   css: 'oklch(62.8% 0.258 29.23)',
//   scss: {
//     lightness: '62.8%',
//     chroma: '0.258',
//     hue: '29.23'
//   }
// }

// Convert OKLCH to hex
const hex = oklchToHex({ l: 62.8, c: 0.258, h: 29.23 });
console.log(hex); // '#ff0000'

// Generate palette
const palette = generatePalette('#ff0000', 5);
console.log(palette);
// [
//   { hex: '#...', oklch: {...}, name: 'step-1' },
//   { hex: '#...', oklch: {...}, name: 'step-2' },
//   ...
// ]

// Generate theme
const theme = generateTheme({
  name: 'my-theme',
  brand: '#ff0000',
  accent: '#7300ff',
  extra: '#ffe500',
  light: '#f3f3f3',
  dark: '#252525'
});
console.log(theme);
// .theme-my-theme {
//   --brand-lightness: 62.8%;
//   --brand-chroma: 0.258;
//   --brand-hue: 29.23;
//   ...
// }

// Check accessibility
const result = checkAccessibility('#ffffff', '#000000', 'AA');
console.log(result);
// {
//   pass: true,
//   contrast: '0.821',
//   level: 'AA'
// }
```

## 📚 API Reference

### `hexToOklch(hex)`

Convert hex color to OKLCH format.

**Parameters:**
- `hex` (string): Hex color code (e.g., "#ff0000")

**Returns:** Object with OKLCH values and CSS/SCSS formats, or `null` if invalid

### `oklchToHex({ l, c, h })`

Convert OKLCH color to hex format.

**Parameters:**
- `l` (number): Lightness (0-100)
- `c` (number): Chroma (0-0.4)
- `h` (number): Hue (0-360)

**Returns:** Hex color string, or `null` if invalid

### `generatePalette(baseColor, steps = 5)`

Generate a color palette from a base color.

**Parameters:**
- `baseColor` (string): Base hex color
- `steps` (number): Number of palette steps (default: 5)

**Returns:** Array of color objects

### `generateTheme(config)`

Generate EVA CSS theme variables from config.

**Parameters:**
- `config` (object): Theme configuration
  - `name` (string): Theme name
  - `brand` (string): Brand color hex
  - `accent` (string): Accent color hex
  - `extra` (string): Extra color hex
  - `light` (string): Light color hex
  - `dark` (string): Dark color hex

**Returns:** CSS string with theme variables

### `checkAccessibility(foreground, background, level = 'AA')`

Check WCAG contrast requirements.

**Parameters:**
- `foreground` (string): Foreground hex color
- `background` (string): Background hex color
- `level` (string): 'AA' or 'AAA' (default: 'AA')

**Returns:** Object with pass/fail result and contrast value

## 🎨 Example: Figma to EVA Workflow

```bash
# 1. Extract colors from Figma
# (via Figma MCP or manually)

# 2. Convert to OKLCH
eva-color convert #ff5733

# 3. Create theme config (theme.json)
{
  "name": "my-project",
  "brand": "#ff5733",
  "accent": "#33ff57",
  "extra": "#3357ff",
  "light": "#f5f5f5",
  "dark": "#1a1a1a"
}

# 4. Generate theme CSS
eva-color theme theme.json > my-theme.scss

# 5. Use in your EVA CSS project
```

## 🌈 Why OKLCH?

OKLCH is a perceptually uniform color space that provides:

- **Better color interpolation**: Smooth gradients without muddy midtones
- **Predictable lightness**: L values directly correlate to perceived brightness
- **Wide gamut support**: Access to vibrant colors beyond sRGB
- **Consistent chroma**: Colors with same C value have similar saturation

## 📄 License

MIT © [Michaël Tati](https://ulysse-2029.com/)

## 👨‍💻 Author

**Michaël Tati**
- Portfolio: [ulysse-2029.com](https://ulysse-2029.com/)
- LinkedIn: [linkedin.com/in/mtati](https://www.linkedin.com/in/mtati/)
- Website: [eva-css.xyz](https://eva-css.xyz/)

## 🔗 Related Packages

- [@eva/css](https://www.npmjs.com/package/@eva/css) - Fluid design framework
- [@eva/purge](https://www.npmjs.com/package/@eva/purge) - CSS optimization tool
- [@eva/mcp-server](https://www.npmjs.com/package/@eva/mcp-server) - Figma to HTML MCP server
