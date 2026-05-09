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
 *   {{assetPrefix}}, {{home}} - built-in context variables
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
const PAGES = [
  'index.html',
  'framework.html',
  'figma-to-eva.html',
  'framework/css-fluid.html',
  'framework/colors.html',
  'framework/fonts.html',
  'framework/sizes.html',
  'framework/grids.html',
  'framework/flex.html',
  'framework/gradients.html',
  'framework/doc.html',
  'framework/js-calculator.html',
  'framework/auto-theme.html',
];

function loadDict(locale) {
  const file = path.join(I18N_DIR, `${locale}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function lookup(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

const BUILTINS = new Set(['lang', 'altLang', 'altHref', 'canonical', 'ogLocale', 'assetPrefix', 'home']);

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

function buildPage(page, dicts) {
  const tplPath = path.join(SRC_DIR, page);
  const template = fs.readFileSync(tplPath, 'utf8');
  const pageDir = path.dirname(page) === '.' ? '' : path.dirname(page);
  const pageBasename = path.basename(page);

  for (const [locale, config] of Object.entries(LOCALES)) {
    const outRoot = config.outDir ? path.join(ROOT, config.outDir) : ROOT;
    const outPageDir = pageDir ? path.join(outRoot, pageDir) : outRoot;
    const outPath = path.join(outPageDir, pageBasename);

    // depth from output file back to project root, in URL terms
    const depthFromRoot =
      (config.outDir ? config.outDir.split('/').filter(Boolean).length : 0) +
      (pageDir ? pageDir.split('/').filter(Boolean).length : 0);
    const assetPrefix = '../'.repeat(depthFromRoot);

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
      home: pageBasename,
      t: dicts[locale],
    };

    const rendered = render(template, ctx, dicts[DEFAULT_LOCALE], page, locale);
    fs.mkdirSync(outPageDir, { recursive: true });
    fs.writeFileSync(outPath, rendered, 'utf8');
    console.log(`  ✓ ${path.relative(ROOT, outPath).replace(/\\/g, '/')}`);
  }
}

function main() {
  const dicts = {};
  for (const locale of Object.keys(LOCALES)) dicts[locale] = loadDict(locale);

  console.log(`[i18n] Building ${PAGES.length} page(s) × ${Object.keys(LOCALES).length} locale(s)`);
  for (const page of PAGES) {
    console.log(`\n[i18n] ${page}`);
    buildPage(page, dicts);
  }
  console.log('\n[i18n] Done.');
}

main();
