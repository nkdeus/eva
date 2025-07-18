# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run watch` - Watch and compile main SCSS file (styles/main.scss � styles/main.css)
- `npm run watch-projects` - Watch all project SCSS files in projects/*/styles/*.scss and compile them
- `npm run build-css` - Build main CSS file once
- `npm run build` - Build CSS and run purge process
- `npm run purge` - Optimize CSS by removing unused classes (creates main-compressed.css)

### Project Development
- Individual project compilation: `npx sass projects/PROJECT_NAME/styles/PROJECT_NAME.scss:projects/PROJECT_NAME/render/PROJECT_NAME.css`
- Use `npm run watch-projects` for automatic compilation of all projects

## Architecture Overview

EVA CSS is a fluid SCSS framework that converts static UI designs into responsive systems. The framework uses modern CSS clamp() functions and OKLCH colors to create truly fluid, scalable designs.

### Core Framework Structure
- `styles/framework/_eva.scss` - Core fluid scaling system and variable generation
- `styles/framework/_colors.scss` - OKLCH color system with opacity/brightness modifiers
- `styles/framework/_theme.scss` - Theme switching and dark/light mode
- `styles/framework/_reset.scss` - CSS reset and base styles
- `styles/framework/_utils.scss` - Utility classes and helpers
- `styles/main.scss` - Main configuration file with size definitions

### Project Structure
```
projects/
   PROJECT_NAME/
       index.html
       styles/
          PROJECT_NAME.scss (configuration + custom styles)
       render/
           PROJECT_NAME.css (compiled output)
```

## Configuration System

### Two Development Modes

**1. Utility Classes Mode (`$build-class: true`)**
- Generates utility classes like `w-64`, `p-16`, `_bg-brand`
- Best for rapid prototyping and component-heavy projects
- Use pre-generated classes in HTML

**2. Variables Only Mode (`$build-class: false`)**
- Only generates CSS variables like `var(--64)`, `var(--brand)`
- Best for semantic classes and unique designs
- Write custom SCSS using EVA variables

### Key Configuration Variables
```scss
$build-class: true/false;        // Generate utility classes or variables only
$px-rem-suffix: true/false;      // Add px/rem static values for debugging
$name-by-size: true;             // Use size values in variable names
$sizes: 4, 8, 16, 32, 64;       // Available fluid sizes
$font-sizes: 16, 24, 36;        // Available font sizes
$auto-theme-switch: false;       // Auto theme switching vs manual toggle
```

## Fluid Scaling System

### Size Variables
- Base: `var(--16)` - Standard fluid scaling
- Modifiers: `var(--16_)` (reduced), `var(--16__)` (extrem), `var(--16-)` (extended)

### Font Size Variables
- Base: `var(--24)` - Standard fluid scaling
- Modifiers: `var(--24_)` (reduced), `var(--24__)` (extrem)


### Color System (OKLCH)
- Base colors: `var(--brand)`, `var(--accent)`, `var(--extra)`, `var(--light)`, `var(--dark)`
- Opacity modifiers: `var(--brand_)` (65%), `var(--brand__)` (35%), `var(--brand___)` (5%)
- Brightness: `var(--brand-d)` (darker), `var(--brand-b)` (brighter), `var(--brand-d_)` (more darker), `var(--brand-b_)` (more brighter)

## EVA CSS Gradients System

EVA CSS includes a modern gradient system using Emmet-style syntax for ultra-compact gradient creation.

### Core Gradient Classes
- `grad-linear` - Linear gradient using current color variables
- `grad-radial` - Radial gradient from center
- `grad-linear-text` - Linear gradient applied to text (background-clip)
- `grad-radial-text` - Radial gradient applied to text
- `grad-linear-border` - Linear gradient for borders
- `grad-radial-border` - Radial gradient for borders

### Dynamic Color Control
The gradient system uses CSS variables for dynamic color control:
```css
--current-from-color: var(--brand);  /* Start color */
--current-to-color: var(--accent);   /* End color */
--current-angle: 90deg;              /* Gradient direction */
```

### Emmet-Style Color Setters
- `from-[color]` - Set gradient start color: `from-brand`, `from-accent_`, `from-extra-d`
- `to-[color]` - Set gradient end color: `to-brand`, `to-accent_`, `to-extra-d`
- `from-transparent` / `to-transparent` - Use transparent colors

### Direction Control (Emmet-Style)
- `d-t` - to top
- `d-b` - to bottom  
- `d-l` - to left
- `d-r` - to right
- `d-tl` - to top left
- `d-tr` - to top right
- `d-bl` - to bottom left
- `d-br` - to bottom right

### Angle Control
- `a-[0-360]` - Specific angles in 5° increments: `a-45`, `a-90`, `a-180`, etc.

### Background Size Control
- `bg-size` - 150% zoom
- `bg-size_` - 200% zoom  
- `bg-size__` - 300% zoom

### Background Position
- `bg-center` - Center position
- `bg-top` / `bg-bottom` - Vertical positioning
- `bg-left` / `bg-right` - Horizontal positioning

### Animations
- `animated` - 3s gradient animation
- `animated-slow` - 6s gradient animation
- `animated-fast` - 1s gradient animation

### Usage Examples
```html
<!-- Basic linear gradient from brand to accent -->
<div class="grad-linear from-brand to-accent">Content</div>

<!-- Diagonal gradient with opacity -->
<div class="grad-linear from-brand_ to-accent-d d-br">Content</div>

<!-- Animated radial gradient -->
<div class="grad-radial from-extra to-transparent animated bg-size_">Content</div>

<!-- Gradient text -->
<h1 class="grad-linear-text from-brand to-accent d-r">Gradient Text</h1>

<!-- Custom angle -->
<div class="grad-linear from-brand to-accent a-135">Content</div>
```

### Container Setup
Add the `.all-grads` class to your container to enable gradient variables:
```html
<body class="current-theme theme-PROJECT_NAME all-grads">
```

## Theme Configuration

Themes are defined as CSS classes:
```scss
.theme-PROJECT_NAME {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;
  // ... other color definitions
}
```

HTML structure requires:
```html
<body class="current-theme theme-PROJECT_NAME">
```

## Complete Project Creation Workflow (Figma MCP → EVA CSS)

This section provides a comprehensive step-by-step process to create a new EVA CSS project from a Figma design using MCP server integration.

### Prerequisites
- Figma MCP server running (via Cursor or compatible tool)
- Node.js and npm installed
- `culori` package for color conversion: `npm install culori --save-dev`

### Step 1: Figma Analysis & Data Extraction

**Input:** Figma frame URL (e.g., `https://www.figma.com/design/fileId/fileName?node-id=1-2`)

**MCP Commands:**
```bash
# Extract React/HTML code from Figma frame
mcp_Figma_get_code(nodeId: "1:2")

# Extract design variables (sizes, colors, fonts)
mcp_Figma_get_variable_defs(nodeId: "1:2")
```

**Expected Output:**
```json
{
  "H1": "120",           // Font sizes
  "p": "16", 
  "brand": "#ff0000",    // Color palette
  "accent": "#7300ff",
  "extra": "#ffe500",
  "light": "#f3f3f3",
  "dark": "#252525"
}
```

### Step 2: Size Analysis & Extraction

Analyze the generated Figma code to identify ALL sizes used:
- **Gaps**: `gap-4`, `gap-8`, `gap-32`, `gap-64`
- **Dimensions**: `w-[141]`, `h-[141]`, `size-[141]`
- **Spacing**: `p-[16]`, `px-[32]`, `py-[64]`
- **Typography**: `text-[120px]`, `text-[16px]`

**Create comprehensive size arrays:**
```scss
$sizes: 4, 8, 16, 32, 64, 120, 141;  // All layout/spacing dimensions
$font-sizes: 16, 120;                // All typography sizes
```

### Step 3: Color Conversion to OKLCH

**Convert hex colors to OKLCH format:**
```bash
# Convert all extracted colors
node scripts/hex-to-oklch.js #ff0000 #7300ff #ffe500 #f3f3f3 #252525
```

**Output:**
```
oklch(62.8% 0.258 29.23)   // brand
oklch(51.7% 0.293 289.66)  // accent  
oklch(91.5% 0.191 101.03)  // extra
oklch(96.4% 0.000 0)       // light
oklch(26.4% 0.000 0)       // dark
```

### Step 4: Project Structure Creation

**Create project directory:**
```bash
mkdir -p projects/PROJECT_NAME/styles
mkdir -p projects/PROJECT_NAME/render
touch projects/PROJECT_NAME/index.html
touch projects/PROJECT_NAME/styles/PROJECT_NAME.scss
```

### Step 5: SCSS Configuration

**Create `projects/PROJECT_NAME/styles/PROJECT_NAME.scss`:**
```scss
// ===========================================
// EVA CSS PROJECT CONFIGURATION
// ===========================================

// Choose development mode
$build-class: true;              // true = utility classes / false = variables only
$custom-class: false;
$px-rem-suffix: false;          // false = fluid only / true = add debug px/rem
$name-by-size: true;

// ===========================================  
// EXTRACTED SIZES FROM FIGMA
// ===========================================

// All dimensions found in Figma design
$sizes: 4, 8, 16, 32, 64, 120, 141;
// 4px (content gap), 8px (color gap), 16px (padding), 
// 32px (section gap), 64px (hero gap), 120px (H1), 141px (circles)

// All font sizes from Figma
$font-sizes: 16, 120;  // 16px (body), 120px (heading)

// ===========================================
// EVA CSS FRAMEWORK IMPORTS
// ===========================================

@import "../../../styles/framework/eva";      // Core system
@import "../../../styles/framework/colors";   // OKLCH colors
@import "../../../styles/framework/gradients"; // Gradient system  
@import "../../../styles/framework/theme";    // Theme management

// ===========================================
// PROJECT THEME (OKLCH VALUES)
// ===========================================

.theme-PROJECT_NAME {
  // Brand color (converted from Figma hex)
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;

  // Accent color
  --accent-lightness: 51.7%;
  --accent-chroma: 0.293;
  --accent-hue: 289.66;

  // Extra color
  --extra-lightness: 91.5%;
  --extra-chroma: 0.191;
  --extra-hue: 101.03;

  // Hybrid light/dark configuration
  --current-lightness: 96.4%;    // Light theme base
  --current-darkness: 26.4%;     // Dark theme base

  // Auto-linked dark/light colors
  --light-lightness: var(--current-lightness);
  --light-chroma: 0.000;
  --light-hue: 0;

  --dark-lightness: var(--current-darkness);
  --dark-chroma: 0.000;
  --dark-hue: 0;
}

// ===========================================
// CUSTOM PROJECT STYLES
// ===========================================

// Mode $build-class: true → Minimal custom styles
// Mode $build-class: false → Full semantic styles using EVA variables
```

### Step 6: HTML Integration

**Create `projects/PROJECT_NAME/index.html`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROJECT_NAME - EVA CSS</title>
    <link rel="stylesheet" href="render/PROJECT_NAME.css">
</head>
<body class="current-theme theme-PROJECT_NAME all-grads">
    <!-- Theme toggle button -->
    <button onclick="document.body.classList.toggle('toggle-theme')" 
            class="theme-toggle">🌙/☀️</button>
    
    <!-- Content based on chosen mode -->
    
    <!-- IF $build-class: true (Utility Classes Mode) -->
    <div class="hero _bg-brand _c-light p-64">
        <div class="content g-4">
            <h1 class="fs-120">Project Title</h1>
            <p class="fs-16 _c-light_">Subtitle with opacity</p>
        </div>
        <div class="colors g-32">
            <div class="color-circle _bg-accent w-141 h-141 br-50"></div>
            <div class="color-circle _bg-extra w-141 h-141 br-50"></div>
        </div>
    </div>
    
    <!-- IF $build-class: false (Variables Mode) -->
    <!-- Use semantic classes with EVA variables in CSS -->
    
</body>
</html>
```

### Step 7: Compilation & Watch Mode

**Start watch mode for automatic compilation:**
```bash
# Watch all projects (recommended)
npm run watch-projects

# Or compile single project manually
npx sass projects/PROJECT_NAME/styles/PROJECT_NAME.scss:projects/PROJECT_NAME/render/PROJECT_NAME.css
```

### Step 8: Development & Testing

**Validation checklist:**
- [ ] SCSS compiles without errors
- [ ] All extracted sizes are defined in `$sizes` array
- [ ] All font sizes are defined in `$font-sizes` array  
- [ ] OKLCH colors are correctly converted and applied
- [ ] Theme toggle works (light/dark mode)
- [ ] Responsive behavior is fluid across viewports
- [ ] Mode consistency (utility classes vs variables)

### Step 9: Integration with Main Site

**Add project link to main index.html:**
```html
<!-- In main index.html -->
<div class="project-links">
    <a href="projects/PROJECT_NAME/index.html">PROJECT_NAME</a>
</div>
```

### Development Mode Guidelines

**Utility Classes Mode (`$build-class: true`):**
- Use EVA CSS classes directly in HTML: `w-64`, `p-16`, `_bg-brand`
- Minimal custom CSS needed
- Fast prototyping and consistent styling

**Variables Mode (`$build-class: false`):**
- Write semantic CSS using EVA variables: `var(--64)`, `var(--brand)`
- Full control over CSS output
- Better for unique designs and optimized builds

### Quick Command Reference

```bash
# Create new project structure
mkdir -p projects/NEW_PROJECT/{styles,render}

# Convert colors to OKLCH
node scripts/hex-to-oklch.js #color1 #color2 #color3

# Start development
npm run watch-projects

# Manual compilation
npx sass projects/PROJECT/styles/PROJECT.scss:projects/PROJECT/render/PROJECT.css

# Validate compilation
npx sass projects/PROJECT/styles/PROJECT.scss:projects/PROJECT/render/PROJECT.css --no-source-map
```

This workflow ensures a systematic, repeatable process for creating pixel-perfect, responsive EVA CSS projects directly from Figma designs.

## Important Rules

### Never Use Fixed Values
- L `width: 64px;` or `color: #ff0000;`
-  `width: var(--64);` and `color: var(--brand);`

### Size Configuration
- Only include sizes actually used in `$sizes` array
- Extract all dimensions from Figma design systematically
- Document size usage with comments

### Mode Consistency
- If `$build-class: true` - use utility classes in HTML
- If `$build-class: false` - write semantic CSS with EVA variables
- Never mix modes in the same project

## Utility Scripts

- `scripts/hex-to-oklch.js` - Convert hex colors to OKLCH format
- `scripts/purge-css.js` - Remove unused CSS for production
- `scripts/watch-projects.js` - Multi-project compilation watcher

## Testing and Validation

- Compile without errors: Check SCSS compilation succeeds
- Verify theme switching: Test toggle between light/dark modes
- Validate responsive behavior: Test fluid scaling across viewport sizes
- Check accessibility: Ensure color contrast meets standards