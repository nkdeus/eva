#!/usr/bin/env node
/**
 * EVA static site builder.
 *
 * Reads the HTML templates in src/, applies the strings from i18n/<locale>.json,
 * and writes the localized output to the project root (default locale) and to a
 * subdirectory per other locale. Then delegates the documentation section to
 * scripts/build-doc.js and emits a sitemap covering both.
 *
 * Template syntax:
 *   {{t.path.to.key}}  looked up in the current locale, falling back to the
 *                      default locale when missing
 *   {{lang}}, {{altLang}}, {{altHref}}, {{canonical}}, {{ogLocale}},
 *   {{assetPrefix}}, {{localeRoot}}, {{home}}
 *
 * {{assetPrefix}}  relative path to the project root — shared assets
 * {{localeRoot}}   relative path to the locale root — internal links, so the
 *                  locale survives navigation
 */

const fs = require('fs');
const path = require('path');

const site = require('./lib/site');
const { buildDocs, docPagePaths } = require('./build-doc');

// Pages to build, relative to src/. Sitemap priority defaults to 0.7.
const PAGES = [
  { path: 'index.html', sitemapPath: '', priority: 1.0 },
  { path: 'framework.html', priority: 0.9 },
  { path: 'figma-to-eva.html', priority: 0.8 },
  { path: 'use-cases.html', priority: 0.8 },
  { path: 'use-cases/tailwind.html', priority: 0.7 },
  { path: 'use-cases/webflow.html', priority: 0.7 },
  { path: 'use-cases/ycode.html', priority: 0.7 },
  { path: 'framework/css-fluid.html', priority: 0.8 },
  { path: 'framework/colors.html', priority: 0.8 },
  { path: 'framework/fonts.html', priority: 0.7 },
  { path: 'framework/sizes.html', priority: 0.8 },
  { path: 'framework/grids.html', priority: 0.7 },
  { path: 'framework/flex.html', priority: 0.7 },
  { path: 'framework/gradients.html', priority: 0.7 },
  { path: 'framework/js-calculator.html', priority: 0.6 },
  { path: 'framework/auto-theme.html', priority: 0.7 },
];

function buildPage(pageEntry, dicts) {
  const page = pageEntry.path;
  const template = fs.readFileSync(path.join(site.SRC_DIR, page), 'utf8');

  for (const locale of Object.keys(site.LOCALES)) {
    const ctx = site.makeContext(page, locale, dicts[locale]);
    const rendered = site.render(template, ctx, dicts[site.DEFAULT_LOCALE], page, locale);
    site.writeFile(site.outputPath(page, locale), rendered);
  }
}

function buildSitemap(entries) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const entry of entries) {
    const sitemapPath = entry.sitemapPath !== undefined ? entry.sitemapPath : entry.path;
    const priority = entry.priority != null ? entry.priority : 0.7;

    for (const [locale, config] of Object.entries(site.LOCALES)) {
      const localePrefix = config.outDir ? config.outDir + '/' : '';
      lines.push('  <url>');
      lines.push(`    <loc>${site.BASE_URL}/${localePrefix}${sitemapPath}</loc>`);
      lines.push(`    <lastmod>${today}</lastmod>`);
      lines.push(`    <priority>${priority.toFixed(1)}</priority>`);
      // Google wants every variant declared, the current one included, plus x-default.
      for (const [otherLocale, otherCfg] of Object.entries(site.LOCALES)) {
        const otherPrefix = otherCfg.outDir ? otherCfg.outDir + '/' : '';
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${otherLocale}" href="${site.BASE_URL}/${otherPrefix}${sitemapPath}"/>`
        );
      }
      const defaultPrefix = site.LOCALES[site.DEFAULT_LOCALE].outDir
        ? site.LOCALES[site.DEFAULT_LOCALE].outDir + '/'
        : '';
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${site.BASE_URL}/${defaultPrefix}${sitemapPath}"/>`
      );
      lines.push('  </url>');
    }
  }

  lines.push('</urlset>', '');
  fs.writeFileSync(path.join(site.ROOT, 'sitemap.xml'), lines.join('\n'), 'utf8');
  console.log(`  ✓ sitemap.xml (${entries.length} pages × ${Object.keys(site.LOCALES).length} locales)`);
}

function main() {
  const dicts = {};
  for (const locale of Object.keys(site.LOCALES)) dicts[locale] = site.loadDict(locale);

  const localeCount = Object.keys(site.LOCALES).length;
  console.log(`[i18n] Building ${PAGES.length} page(s) × ${localeCount} locale(s)`);
  for (const entry of PAGES) {
    console.log(`\n[i18n] ${entry.path}`);
    buildPage(entry, dicts);
  }

  console.log('\n[doc] Building documentation');
  buildDocs(dicts);

  console.log('\n[i18n] Generating sitemap.xml');
  const docEntries = docPagePaths().map(p => ({
    path: p,
    priority: p.endsWith('/index.html') ? 0.9 : 0.8,
  }));
  buildSitemap([...PAGES, ...docEntries]);

  console.log('\n[i18n] Done.');
}

main();
