'use strict';
/**
 * Shared plumbing for the static builders.
 *
 * scripts/build-i18n.js renders the hand-written templates in src/;
 * scripts/build-doc.js renders the documentation chapters from content/doc/.
 * Both need the same locale table, the same placeholder syntax and the same
 * relative-path arithmetic, so it lives here.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC_DIR = path.join(ROOT, 'src');
const I18N_DIR = path.join(ROOT, 'i18n');
const BASE_URL = 'https://eva-css.xyz';

const LOCALES = {
  en: { outDir: '', ogLocale: 'en_US' },
  fr: { outDir: 'fr', ogLocale: 'fr_FR' },
};
const DEFAULT_LOCALE = 'en';

const BUILTINS = new Set([
  'lang',
  'altLang',
  'altHref',
  'canonical',
  'ogLocale',
  'assetPrefix',
  'localeRoot',
  'home',
  // documentation shell
  'docTitle',
  'docNav',
  'docDescription',
  'docEyebrow',
  'docSlug',
  'docPath',
  'docBody',
  'docSidebar',
  'docToc',
  'docPager',
  'docIndexUrl',
  'docSearchUrl',
]);

function loadDict(locale) {
  return JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${locale}.json`), 'utf8'));
}

function lookup(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/**
 * Builds the locale/path context for one output page.
 * @param {string} page path relative to the site root, e.g. "framework/colors.html"
 * @param {string} locale
 * @param {object} dict the locale dictionary, exposed as ctx.t
 */
function makeContext(page, locale, dict) {
  const config = LOCALES[locale];
  const pageDir = path.dirname(page) === '.' ? '' : path.dirname(page);

  const localeDepth = config.outDir ? config.outDir.split('/').filter(Boolean).length : 0;
  const pageDepth = pageDir ? pageDir.split('/').filter(Boolean).length : 0;
  const depthFromRoot = localeDepth + pageDepth;

  const altLocale =
    locale === DEFAULT_LOCALE
      ? Object.keys(LOCALES).find(l => l !== DEFAULT_LOCALE)
      : DEFAULT_LOCALE;
  const altOutPrefix = LOCALES[altLocale].outDir ? LOCALES[altLocale].outDir + '/' : '';

  return {
    lang: locale,
    altLang: altLocale,
    altHref: '../'.repeat(depthFromRoot) + altOutPrefix + page || './' + page,
    canonical: `${BASE_URL}/${config.outDir ? config.outDir + '/' : ''}`,
    ogLocale: config.ogLocale,
    // relative path back to the project root — shared assets (CSS, JS, images)
    assetPrefix: '../'.repeat(depthFromRoot),
    // relative path back to the locale root — internal links, keeps the locale
    localeRoot: '../'.repeat(pageDepth),
    home: path.basename(page),
    t: dict,
  };
}

/** Resolves the absolute output path for a page in a locale. */
function outputPath(page, locale) {
  const outDir = LOCALES[locale].outDir;
  return outDir ? path.join(ROOT, outDir, page) : path.join(ROOT, page);
}

/**
 * Substitutes {{...}} placeholders. Missing t.* keys fall back to the default
 * locale with a warning; a key missing from both aborts the build.
 */
function render(template, ctx, fallbackDict, page, locale) {
  const missing = [];
  const out = template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, key) => {
    if (BUILTINS.has(key)) return ctx[key] != null ? ctx[key] : '';
    if (key.startsWith('t.')) {
      const dotted = key.slice(2);
      let value = lookup(ctx.t, dotted);
      if (value == null) {
        value = lookup(fallbackDict, dotted);
        if (value == null) {
          missing.push(key);
          return match;
        }
        console.warn(`  [warn] ${page} (${locale}): missing ${key}, using ${DEFAULT_LOCALE} fallback`);
      }
      return value;
    }
    console.warn(`  [warn] ${page} (${locale}): unknown placeholder ${match}`);
    return match;
  });
  if (missing.length) {
    throw new Error(`[i18n] Missing keys in ${locale} (no fallback): ${missing.join(', ')}`);
  }
  return out;
}

function writeFile(absPath, content) {
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content, 'utf8');
  console.log(`  ✓ ${path.relative(ROOT, absPath).replace(/\\/g, '/')}`);
}

module.exports = {
  ROOT,
  SRC_DIR,
  I18N_DIR,
  BASE_URL,
  LOCALES,
  DEFAULT_LOCALE,
  BUILTINS,
  loadDict,
  lookup,
  makeContext,
  outputPath,
  render,
  writeFile,
};
