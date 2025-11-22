# EVA CSS Framework - Improvements TODO

This document lists suggested improvements to make the `eva-css-fluid` package easier to integrate and configure.

## Priority 1: Critical for Better DX

### 1. Auto-detect node_modules path
**Problem**: Users must always add `--load-path=node_modules` when compiling
**Solution**: Create a Sass importer that auto-resolves the package path
**Impact**: Simplifies compilation commands
```bash
# Current (verbose)
npx sass --load-path=node_modules styles/main.scss:styles/main.css

# Desired (simple)
npx sass styles/main.scss:styles/main.css
```

### 2. Support $class-config variable for custom-class mode
**Problem**: `$custom-class: true` requires `$class-config` variable which isn't configurable via `@use with`
**Current workaround**: Users must disable `$custom-class`
**Solution**: Add `$class-config` as a configurable parameter in `_config.scss`
```scss
// Desired usage
@use 'eva-css-fluid/src' as * with (
  $sizes: (24, 50, 100),
  $custom-class: true,
  $class-config: (
    w: (50),
    px: (24),
    g: (24, 50)
  )
);
```

### 3. Provide pre-configured entry points
**Problem**: Users need to understand all configuration options upfront
**Solution**: Create multiple entry points for common use cases
```scss
// Minimal config (only variables)
@use 'eva-css-fluid/variables';

// Full utility classes (default)
@use 'eva-css-fluid';

// Framework only (no utilities)
@use 'eva-css-fluid/core';

// Colors only
@use 'eva-css-fluid/colors';
```

## Priority 2: Developer Experience Enhancements

### 4. Add TypeScript/JSON configuration support
**Problem**: SCSS-only configuration limits tooling integration
**Solution**: Support configuration via `eva.config.js` or `package.json`
```json
// package.json
{
  "eva": {
    "sizes": [4, 8, 16, 32, 64],
    "fontSizes": [16, 24, 36],
    "buildClass": true
  }
}
```

### 5. Create configuration validator
**Problem**: Silent failures or cryptic Sass errors for invalid config
**Solution**: Add validation function that provides clear error messages
```scss
// In _config.scss
@if not list.index($sizes, 16) {
  @error "EVA CSS: Size 16 is required as a base size";
}
```

### 6. Add debug mode
**Problem**: Hard to understand which classes are generated
**Solution**: Add debug output showing generated classes
```scss
@use 'eva-css-fluid/src' as * with (
  $debug: true  // Outputs class generation summary to console
);
```

## Priority 3: Documentation & Examples

### 7. Create interactive configuration generator
**Problem**: Too many options, unclear which to choose
**Solution**: Web-based tool at eva-css.xyz/configurator
- Input: Design sizes (from Figma/manual)
- Output: Ready-to-use SCSS configuration

### 8. Add migration guide
**Problem**: Users coming from internal framework need guidance
**Solution**: Create MIGRATION.md with:
- Before/after examples
- Common gotchas
- Breaking changes

### 9. Provide starter templates
**Problem**: Empty project setup is time-consuming
**Solution**: Create npm initializer
```bash
npm init eva-css my-project
# Prompts for configuration
# Generates complete project structure
```

## Priority 4: Advanced Features

### 10. Support CSS custom properties configuration
**Problem**: Can't override colors at runtime easily
**Solution**: Generate CSS custom properties for all config values
```css
:root {
  --eva-sizes: 4, 8, 16, 32, 64;
  --eva-brand: oklch(62.8% 0.258 29.23);
}
```

### 11. Add tree-shaking support
**Problem**: Unused utility classes bloat CSS output
**Solution**: Integrate PurgeCSS or similar in build process
```bash
npm run eva:build --purge
```

### 12. Create PostCSS plugin alternative
**Problem**: Some projects prefer PostCSS over Sass
**Solution**: Port core functionality to PostCSS plugin
```js
// postcss.config.js
module.exports = {
  plugins: [
    require('eva-css-postcss')({
      sizes: [4, 8, 16, 32, 64]
    })
  ]
}
```

## Priority 5: Testing & Quality

### 13. Add automated tests
**Test coverage needed:**
- Size generation accuracy
- Color system calculations
- Breakpoint interpolation
- Theme switching

### 14. Create visual regression tests
**Problem**: Changes might break visual output
**Solution**: Screenshot-based testing for generated CSS

### 15. Performance benchmarks
**Track:**
- Compilation time
- Output CSS size
- Number of generated classes
- Memory usage

## Implementation Roadmap

### Phase 1 (v1.1.0) - Quick Wins
- [ ] #2: Support $class-config variable
- [ ] #5: Configuration validator
- [ ] #8: Add migration guide

### Phase 2 (v1.2.0) - DX Improvements
- [ ] #1: Auto-detect node_modules
- [ ] #3: Pre-configured entry points
- [ ] #6: Debug mode

### Phase 3 (v2.0.0) - Major Features
- [ ] #4: JSON configuration support
- [ ] #9: Starter templates
- [ ] #11: Tree-shaking support

### Phase 4 (Future) - Ecosystem
- [ ] #7: Interactive configurator
- [ ] #12: PostCSS plugin
- [ ] #13-15: Testing infrastructure

## Contributing

Issues and PRs welcome at: https://github.com/nkdeus/eva

## Notes

- All changes should maintain backward compatibility in minor versions
- Breaking changes only in major versions
- Keep bundle size minimal
- Prioritize clarity over cleverness
