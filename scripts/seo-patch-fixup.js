#!/usr/bin/env node
/**
 * Cosmetic fix-up after seo-patch.js: tidy <main>/<footer> indentation.
 * Safe to run multiple times.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');
const FILES = [
  'index.html', 'framework.html', 'figma-to-eva.html',
  'framework/css-fluid.html', 'framework/colors.html', 'framework/fonts.html',
  'framework/sizes.html', 'framework/grids.html', 'framework/flex.html',
  'framework/gradients.html', 'framework/doc.html',
  'framework/js-calculator.html', 'framework/auto-theme.html',
];

let changed = 0;
for (const rel of FILES) {
  const fp = path.join(SRC, rel);
  let c = fs.readFileSync(fp, 'utf8');
  const before = c;

  // Normalize </main> indent to 2 spaces, with one blank line before <footer.
  c = c.replace(/\n\s*<\/main>\s*\n\s*<footer/g, '\n  </main>\n\n  <footer');
  // Some templates (js-calculator) have <footer indented 4 spaces inside an extra wrapper.
  // If we lost the original 4-space indent but the surrounding lines use 4, restore via context.
  c = c.replace(/<\/main>\n\n  <footer (class="px-220__ py-136 flex x g-20 w-full">\n      <div)/g,
                '</main>\n\n    <footer $1');

  if (c !== before) {
    fs.writeFileSync(fp, c, 'utf8');
    console.log(`  ✓ ${rel}`);
    changed += 1;
  }
}
console.log(`\nFixed ${changed} files.`);
