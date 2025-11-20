# @eva/purge

> Intelligent CSS purging tool for EVA CSS projects

Removes unused CSS classes, IDs, and optimizes your stylesheets while keeping what matters.

## 🎯 Features

- **Smart Analysis**: Scans HTML, JS, Vue, JSX, TSX files
- **CSS Variables**: Preserves all CSS variables (critical for EVA CSS)
- **Element Selectors**: Keeps all HTML element styles
- **Dynamic Classes**: Detects classes used in JavaScript
- **Compression**: Minifies output CSS
- **Safelist**: Protect specific classes from removal
- **CLI & Programmatic**: Use via command line or in your build process

## 📦 Installation

```bash
npm install @eva/purge
# or
pnpm add @eva/purge
# or
yarn add @eva/purge
```

## 🚀 Usage

### CLI Usage

```bash
# Basic usage
eva-purge --css dist/style.css --content "src/**/*.html"

# Multiple content patterns
eva-purge --css dist/style.css --content "src/**/*.{html,js,vue}"

# Custom output
eva-purge --css dist/style.css --content "src/**/*" --output dist/style-purged.css

# With safelist (classes to always keep)
eva-purge --css dist/style.css --safelist "theme-,current-,all-grads"

# Using config file
eva-purge --config eva.config.js
```

### Configuration File

Create `eva.config.js`:

```javascript
module.exports = {
  purge: {
    // Content files to scan
    content: [
      'src/**/*.html',
      'src/**/*.js',
      'src/**/*.vue',
      'src/**/*.jsx',
      'src/**/*.tsx'
    ],

    // CSS file to purge
    css: 'dist/style.css',

    // Output file
    output: 'dist/style-purged.css',

    // Classes to keep (optional)
    safelist: {
      standard: ['current-theme', 'all-grads', 'toggle-theme'],
      deep: [/^theme-/],        // Regex patterns
      greedy: [/^brand-/, /^accent-/]
    }
  }
};
```

Then run:

```bash
eva-purge --config eva.config.js
```

### Programmatic Usage

```javascript
const CSSPurger = require('@eva/purge');

const config = {
  content: ['src/**/*.{html,js}'],
  css: 'dist/style.css',
  output: 'dist/style-purged.css'
};

const purger = new CSSPurger(config);
await purger.purge();
```

### Integration with Build Tools

**With npm scripts:**

```json
{
  "scripts": {
    "build:css": "sass src/styles.scss dist/style.css",
    "purge:css": "eva-purge --css dist/style.css --content 'src/**/*.html'",
    "build": "npm run build:css && npm run purge:css"
  }
}
```

**With Vite:**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { exec } from 'child_process';

export default defineConfig({
  plugins: [
    {
      name: 'eva-purge',
      closeBundle() {
        exec('eva-purge --css dist/assets/style.css --content "dist/**/*.html"');
      }
    }
  ]
});
```

## 📋 What Gets Kept

@eva/purge intelligently keeps:

✅ **CSS Variables** - All `:root` variables (essential for EVA CSS)
✅ **HTML Elements** - `body`, `h1`, `p`, `button`, etc.
✅ **Used Classes** - Classes found in HTML/JS files
✅ **Used IDs** - IDs found in HTML/JS files
✅ **Media Queries** - All responsive breakpoints
✅ **Theme Classes** - `.current-theme`, `.all-grads`, etc.
✅ **Dynamic Classes** - Classes from `classList.add()`, `querySelector()`

## ❌ What Gets Removed

❌ **Unused Classes** - Classes not found in any content files
❌ **Unused IDs** - IDs not referenced anywhere
❌ **Comments** - CSS comments (optional)
❌ **Whitespace** - Extra spaces and newlines

## 🎨 Perfect for EVA CSS

@eva/purge is specifically designed for EVA CSS projects:

- Preserves all CSS variable definitions in `:root`
- Keeps utility classes like `w-64`, `p-16`, `fs-32`
- Maintains color classes like `_bg-brand`, `_c-accent`
- Protects theme classes like `.theme-*`
- Preserves gradient system classes `.all-grads`

## 📊 Example Results

```
Original CSS:  120 KB
Purged CSS:     45 KB
Space saved:   62.5%
```

Typical savings: **40-70%** depending on your project.

## 🧪 Testing

Run the included test suite:

```bash
cd packages/eva-purge
pnpm test
```

## 📄 License

MIT © EVA Team

## 🔗 Related Packages

- [@eva/css](https://www.npmjs.com/package/@eva/css) - Fluid design framework
- [@eva/colors](https://www.npmjs.com/package/@eva/colors) - OKLCH color utilities
- [@eva/mcp-server](https://www.npmjs.com/package/@eva/mcp-server) - Figma to HTML MCP server
