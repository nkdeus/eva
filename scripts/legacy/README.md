# Legacy Scripts

This folder contains scripts that have been replaced by official EVA npm packages.

## Archived Scripts

### purge-css.js
**Replaced by**: `eva-css-purge` npm package
**Usage now**: `npm run purge` or `npx eva-purge`

This script has been replaced by the official `eva-css-purge` package which provides:
- Better performance
- More intelligent class detection
- CLI and programmatic API
- Safelist support
- Complete documentation

### hex-to-oklch.js
**Replaced by**: `eva-colors` npm package
**Usage now**: `npx eva-color convert "#hex"`

This script has been replaced by the official `eva-colors` package which provides:
- Hex ↔ OKLCH conversion
- Palette generation
- Theme generation
- Accessibility checking
- CLI and programmatic API

## Migration

All functionality from these scripts is now available via npm packages:

```bash
# Old way (deprecated)
node scripts/purge-css.js
node scripts/hex-to-oklch.js #ff0000

# New way (recommended)
npm run purge
npx eva-color convert "#ff0000"
```

See main CLAUDE.md for complete documentation on the new tools.
