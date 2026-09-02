#!/usr/bin/env node
/**
 * Inject BreadcrumbList JSON-LD into framework subpages and figma-to-eva.
 * Idempotent: skips if a BreadcrumbList block already exists.
 *
 * Run: `node scripts/seo-jsonld.js`
 */

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');

// Each entry: src path → ordered breadcrumb trail of {name, url}.
// `url` is relative to the per-locale canonical, so we prefix with {{canonical}}.
// For the home crumb we use the bare canonical.
const TRAILS = {
  'framework.html': [
    { name: 'EVA CSS', urlSuffix: '' },
    { name: 'Addons',  urlSuffix: 'framework.html' },
  ],
  'figma-to-eva.html': [
    { name: 'EVA CSS',      urlSuffix: '' },
    { name: 'Figma to EVA', urlSuffix: 'figma-to-eva.html' },
  ],
  'framework/css-fluid.html': [
    { name: 'EVA CSS',   urlSuffix: '' },
    { name: 'Fluid CSS', urlSuffix: 'framework/css-fluid.html' },
  ],
  'framework/colors.html': [
    { name: 'EVA CSS', urlSuffix: '' },
    { name: 'Addons',  urlSuffix: 'framework.html' },
    { name: 'Colors',  urlSuffix: 'framework/colors.html' },
  ],
  'framework/fonts.html': [
    { name: 'EVA CSS',    urlSuffix: '' },
    { name: 'Addons',     urlSuffix: 'framework.html' },
    { name: 'Typography', urlSuffix: 'framework/fonts.html' },
  ],
  'framework/sizes.html': [
    { name: 'EVA CSS', urlSuffix: '' },
    { name: 'Addons',  urlSuffix: 'framework.html' },
    { name: 'Sizes',   urlSuffix: 'framework/sizes.html' },
  ],
  'framework/grids.html': [
    { name: 'EVA CSS', urlSuffix: '' },
    { name: 'Addons',  urlSuffix: 'framework.html' },
    { name: 'Grids',   urlSuffix: 'framework/grids.html' },
  ],
  'framework/flex.html': [
    { name: 'EVA CSS', urlSuffix: '' },
    { name: 'Addons',  urlSuffix: 'framework.html' },
    { name: 'Flex',    urlSuffix: 'framework/flex.html' },
  ],
  'framework/gradients.html': [
    { name: 'EVA CSS',   urlSuffix: '' },
    { name: 'Addons',    urlSuffix: 'framework.html' },
    { name: 'Gradients', urlSuffix: 'framework/gradients.html' },
  ],
  'framework/js-calculator.html': [
    { name: 'EVA CSS',       urlSuffix: '' },
    { name: 'JS Calculator', urlSuffix: 'framework/js-calculator.html' },
  ],
  'framework/auto-theme.html': [
    { name: 'EVA CSS',    urlSuffix: '' },
    { name: 'Auto Theme', urlSuffix: 'framework/auto-theme.html' },
  ],
};

function buildBreadcrumb(trail) {
  const items = trail.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: `{{canonical}}${c.urlSuffix}`,
  }));
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
  return `    <script type="application/ld+json">\n${JSON.stringify(data, null, 2)
    .split('\n').map(l => '    ' + l).join('\n')}\n    </script>`;
}

let changed = 0;
for (const [page, trail] of Object.entries(TRAILS)) {
  const fp = path.join(SRC, page);
  let c = fs.readFileSync(fp, 'utf8');
  if (c.includes('"BreadcrumbList"')) {
    console.log(`  · ${page} (already has BreadcrumbList)`);
    continue;
  }
  const block = buildBreadcrumb(trail);
  // Insert just before the closing </head>.
  const re = /(\n  <\/head>)/;
  if (!re.test(c)) {
    console.log(`  ! ${page} (no </head> match)`);
    continue;
  }
  c = c.replace(re, `\n${block}$1`);
  fs.writeFileSync(fp, c, 'utf8');
  console.log(`  ✓ ${page}`);
  changed += 1;
}
console.log(`\nInjected BreadcrumbList in ${changed} files.`);
