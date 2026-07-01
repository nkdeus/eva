#!/usr/bin/env node
/**
 * EVA i18n static builder.
 *
 * Reads HTML templates from src/, applies i18n strings from i18n/<locale>.json,
 * and writes localized output to the project root (default locale) and to
 * locale subdirectories for the others.
 *
 * Template syntax:
 *   {{t.path.to.key}} - looked up in the current locale dict (falls back to the
 *                       default locale if missing)
 *   {{lang}}, {{altLang}}, {{altHref}}, {{canonical}}, {{ogLocale}},
 *   {{assetPrefix}}, {{localeRoot}}, {{home}} - built-in context variables
 *
 * {{assetPrefix}}  - relative path from current file to the project root
 *                    (use for shared assets: CSS, JS, images, llms.txt, etc.)
 * {{localeRoot}}   - relative path from current file to the locale root
 *                    (use for internal page links so the locale is preserved
 *                    when navigating)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const I18N_DIR = path.join(ROOT, 'i18n');
const BASE_URL = 'https://eva-css.xyz';

const LOCALES = {
  en: { outDir: '', ogLocale: 'en_US' },
  fr: { outDir: 'fr', ogLocale: 'fr_FR' },
};
const DEFAULT_LOCALE = 'en';

// Pages to build. Each entry is a path relative to src/.
// Sitemap priority defaults to 0.7 unless specified here.
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
  { path: 'framework/doc.html', priority: 0.9 },
  { path: 'framework/js-calculator.html', priority: 0.6 },
  { path: 'framework/auto-theme.html', priority: 0.7 },
];

function loadDict(locale) {
  const file = path.join(I18N_DIR, `${locale}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function lookup(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

const BUILTINS = new Set(['lang', 'altLang', 'altHref', 'canonical', 'ogLocale', 'assetPrefix', 'localeRoot', 'home']);

function render(template, ctx, fallbackDict, page, locale) {
  const missing = [];
  const out = template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (m, key) => {
    if (BUILTINS.has(key)) return ctx[key] != null ? ctx[key] : '';
    if (key.startsWith('t.')) {
      const path = key.slice(2);
      let v = lookup(ctx.t, path);
      if (v == null) {
        v = lookup(fallbackDict, path);
        if (v == null) {
          missing.push(key);
          return m;
        }
        console.warn(`  [warn] ${page} (${locale}): missing ${key}, using ${DEFAULT_LOCALE} fallback`);
      }
      return v;
    }
    console.warn(`  [warn] ${page} (${locale}): unknown placeholder ${m}`);
    return m;
  });
  if (missing.length) {
    throw new Error(`[i18n] Missing keys in ${locale} (no fallback): ${missing.join(', ')}`);
  }
  return out;
}

function buildPage(pageEntry, dicts) {
  const page = pageEntry.path;
  const tplPath = path.join(SRC_DIR, page);
  const template = fs.readFileSync(tplPath, 'utf8');
  const pageDir = path.dirname(page) === '.' ? '' : path.dirname(page);
  const pageBasename = path.basename(page);

  for (const [locale, config] of Object.entries(LOCALES)) {
    const outRoot = config.outDir ? path.join(ROOT, config.outDir) : ROOT;
    const outPageDir = pageDir ? path.join(outRoot, pageDir) : outRoot;
    const outPath = path.join(outPageDir, pageBasename);

    // depth from output file back to project root, in URL terms
    const localeDepth = config.outDir ? config.outDir.split('/').filter(Boolean).length : 0;
    const pageDepth = pageDir ? pageDir.split('/').filter(Boolean).length : 0;
    const depthFromRoot = localeDepth + pageDepth;
    const assetPrefix = '../'.repeat(depthFromRoot);
    // relative path from the current output file to the locale's root.
    // Use this for internal page links so the locale is preserved.
    const localeRoot = '../'.repeat(pageDepth);

    const altLocale = locale === DEFAULT_LOCALE
      ? Object.keys(LOCALES).find(l => l !== DEFAULT_LOCALE)
      : DEFAULT_LOCALE;
    const altConfig = LOCALES[altLocale];

    // altHref: URL pointing at the same page in the other locale, relative
    // to the *current* output file.
    // Go up `depthFromRoot` levels to project root, then descend into the alt
    // locale's outDir, then to the page path.
    const altOutPrefix = altConfig.outDir ? altConfig.outDir + '/' : '';
    const altHref = ('../'.repeat(depthFromRoot) + altOutPrefix + page) || './' + page;

    const canonical = `${BASE_URL}/${config.outDir ? config.outDir + '/' : ''}`;

    const ctx = {
      lang: locale,
      altLang: altLocale,
      altHref,
      canonical,
      ogLocale: config.ogLocale,
      assetPrefix,
      localeRoot,
      home: pageBasename,
      t: dicts[locale],
    };

    const rendered = render(template, ctx, dicts[DEFAULT_LOCALE], page, locale);
    fs.mkdirSync(outPageDir, { recursive: true });
    fs.writeFileSync(outPath, rendered, 'utf8');
    console.log(`  ✓ ${path.relative(ROOT, outPath).replace(/\\/g, '/')}`);
  }
}

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const entry of PAGES) {
    const sitemapPath = entry.sitemapPath !== undefined ? entry.sitemapPath : entry.path;
    const priority = entry.priority != null ? entry.priority : 0.7;

    for (const [locale, config] of Object.entries(LOCALES)) {
      const localePrefix = config.outDir ? config.outDir + '/' : '';
      const loc = `${BASE_URL}/${localePrefix}${sitemapPath}`;
      lines.push('  <url>');
      lines.push(`    <loc>${loc}</loc>`);
      lines.push(`    <lastmod>${today}</lastmod>`);
      lines.push(`    <priority>${priority.toFixed(1)}</priority>`);
      // xhtml:link rel="alternate" for each locale (Google recommends declaring every variant
      // including the current one, plus x-default).
      for (const [otherLocale, otherCfg] of Object.entries(LOCALES)) {
        const otherPrefix = otherCfg.outDir ? otherCfg.outDir + '/' : '';
        const href = `${BASE_URL}/${otherPrefix}${sitemapPath}`;
        lines.push(`    <xhtml:link rel="alternate" hreflang="${otherLocale}" href="${href}"/>`);
      }
      const defaultPrefix = LOCALES[DEFAULT_LOCALE].outDir
        ? LOCALES[DEFAULT_LOCALE].outDir + '/'
        : '';
      const defaultHref = `${BASE_URL}/${defaultPrefix}${sitemapPath}`;
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}"/>`);
      lines.push('  </url>');
    }
  }
  lines.push('</urlset>', '');
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), lines.join('\n'), 'utf8');
  console.log(`  ✓ sitemap.xml (${PAGES.length} pages × ${Object.keys(LOCALES).length} locales)`);
}

function main() {
  const dicts = {};
  for (const locale of Object.keys(LOCALES)) dicts[locale] = loadDict(locale);

  console.log(`[i18n] Building ${PAGES.length} page(s) × ${Object.keys(LOCALES).length} locale(s)`);
  for (const entry of PAGES) {
    console.log(`\n[i18n] ${entry.path}`);
    buildPage(entry, dicts);
  }
  console.log('\n[i18n] Generating sitemap.xml');
  buildSitemap();
  console.log('\n[i18n] Done.');
}

main();
