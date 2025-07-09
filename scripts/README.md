# CSS Purge Script

## Overview

The CSS Purge script is a smart tool that analyzes your HTML files to extract only the CSS classes and variables that are actually used, then creates a compressed version of your CSS file.

## Features

- 🔍 **Smart Analysis**: Scans all HTML files to find used classes and CSS variables
- 🗜️ **Compression**: Removes unused CSS rules and compresses the output
- 📊 **Statistics**: Shows compression ratio and savings
- 🚀 **Fast**: Optimized for performance
- 🎯 **Precise**: Handles complex selectors, pseudo-classes, and CSS variables

## Usage

```bash
# Run the purge command
npm run purge

# Or build and purge in one command
npm run build
```

## Output

The script creates `styles/main-compressed.css` with:
- Only the CSS rules that are actually used
- All CSS variables (from :root and .all-grads)
- Compressed and optimized code
- Header comment with generation timestamp

## How it works

1. **HTML Analysis**: Scans all `.html` files for `class` attributes and CSS variables
2. **CSS Reading**: Reads the compiled `main.css` file
3. **Extraction**: Identifies which CSS rules are needed based on used classes
4. **Compression**: Removes whitespace, comments, and optimizes the code
5. **Output**: Saves the compressed CSS to `main-compressed.css`

## Example

**Before (main.css)**: 150KB
**After (main-compressed.css)**: 25KB
**Savings**: 83%

## Configuration

The script automatically:
- Finds all HTML files in the project
- Ignores `node_modules`, `dist`, and `build` directories
- Preserves all CSS variables and root styles
- Handles complex selectors and pseudo-classes

## Integration

Add to your build process:
```json
{
  "scripts": {
    "build": "npm run build-css && npm run purge",
    "deploy": "npm run build && cp styles/main-compressed.css dist/"
  }
}
```

Perfect for production deployments! 🎉