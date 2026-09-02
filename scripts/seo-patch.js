#!/usr/bin/env node
/**
 * One-shot SEO/a11y patch for src/ templates.
 * Idempotent: each transform short-circuits if its target is already present.
 *
 * Run: `node scripts/seo-patch.js`
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const PAGES = {
  'index.html':                       { og: 't.meta',           urlSuffix: '' },
  'framework.html':                   { og: 't.addons.meta',    urlSuffix: 'framework.html' },
  'figma-to-eva.html':                { og: 't.figmaToEva.meta',urlSuffix: 'figma-to-eva.html' },
  'framework/css-fluid.html':         { og: 't.cssFluid.meta',  urlSuffix: 'framework/css-fluid.html' },
  'framework/colors.html':            { og: 't.colors.meta',    urlSuffix: 'framework/colors.html' },
  'framework/fonts.html':             { og: 't.fonts.meta',     urlSuffix: 'framework/fonts.html' },
  'framework/sizes.html':             { og: 't.sizes.meta',     urlSuffix: 'framework/sizes.html' },
  'framework/grids.html':             { og: 't.grids.meta',     urlSuffix: 'framework/grids.html' },
  'framework/flex.html':              { og: 't.flex.meta',      urlSuffix: 'framework/flex.html' },
  'framework/gradients.html':         { og: 't.gradients.meta', urlSuffix: 'framework/gradients.html' },
  'framework/js-calculator.html':     { og: 't.jsCalc.meta',    urlSuffix: 'framework/js-calculator.html' },
  'framework/auto-theme.html':        { og: 't.autoTheme.meta', urlSuffix: 'framework/auto-theme.html' },
};

const TOGGLE_OPEN_OLD = `<a href="" class="dark-light-toggle no-hover">`;
const TOGGLE_OPEN_NEW = `<button type="button" class="dark-light-toggle no-hover" aria-label="{{t.a11y.toggleTheme}}">`;
const TOGGLE_SVG_OLD = `<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 100 100" x="0px" y="0px"><path`;
const TOGGLE_SVG_NEW = `<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 100 100" x="0px" y="0px" aria-hidden="true"><path`;
const TOGGLE_CLOSE_OLD = `</svg>\n  </a>`;
const TOGGLE_CLOSE_NEW = `</svg>\n  </button>`;

const BURGER_OLD = `<button id="burger-menu" class="burger-menu">`;
const BURGER_NEW = `<button id="burger-menu" class="burger-menu" type="button" aria-label="{{t.a11y.burgerMenu}}" aria-expanded="false" aria-controls="menu">`;

const GITHUB_OLD = `<a href="https://github.com/nkdeus/eva-framework" target="_blank" class=`;
const GITHUB_NEW = `<a href="https://github.com/nkdeus/eva-framework" target="_blank" rel="noopener" aria-label="{{t.a11y.github}}" class=`;

function ensureOgTitleDesc(content, ogPrefix) {
  if (/property="og:title"/.test(content)) return content;
  const descRe = /(<meta name="description" content="[^"]*">)/;
  if (!descRe.test(content)) return content;
  return content.replace(
    descRe,
    `$1\n    <meta property="og:title" content="{{${ogPrefix}.ogTitle}}">\n    <meta property="og:description" content="{{${ogPrefix}.ogDescription}}">`
  );
}

// Insert a missing meta tag before `<link rel="canonical"`.
function ensureMeta(content, marker, line) {
  if (content.includes(marker)) return content;
  const re = /(    <link rel="canonical")/;
  if (!re.test(content)) return content;
  return content.replace(re, `${line}\n$1`);
}

function injectFaviconAndSocial(content, ogPrefix, urlSuffix) {
  content = ensureMeta(
    content,
    `rel="icon"`,
    `    <link rel="icon" type="image/svg+xml" href="{{assetPrefix}}assets/favicon.svg">`
  );
  content = ensureMeta(
    content,
    `apple-touch-icon`,
    `    <link rel="apple-touch-icon" href="{{assetPrefix}}assets/imgs/eva.jpg">`
  );
  content = ensureMeta(
    content,
    `rel="manifest"`,
    `    <link rel="manifest" href="{{assetPrefix}}site.webmanifest">`
  );
  content = ensureMeta(
    content,
    `name="theme-color"`,
    `    <meta name="theme-color" content="#ff8a3d">`
  );
  content = ensureMeta(
    content,
    `og:site_name`,
    `    <meta property="og:site_name" content="EVA CSS">`
  );
  content = ensureMeta(
    content,
    `og:type`,
    `    <meta property="og:type" content="website">`
  );
  content = ensureMeta(
    content,
    `og:url`,
    `    <meta property="og:url" content="{{canonical}}${urlSuffix}">`
  );
  content = ensureMeta(
    content,
    `og:image`,
    [
      `    <meta property="og:image" content="https://eva-css.xyz/assets/imgs/eva.jpg">`,
      `    <meta property="og:image:width" content="512">`,
      `    <meta property="og:image:height" content="512">`,
      `    <meta property="og:image:alt" content="EVA CSS — fluid SCSS framework">`,
    ].join('\n')
  );
  content = ensureMeta(
    content,
    `twitter:card`,
    [
      `    <meta name="twitter:card" content="summary_large_image">`,
      `    <meta name="twitter:title" content="{{${ogPrefix}.ogTitle}}">`,
      `    <meta name="twitter:description" content="{{${ogPrefix}.ogDescription}}">`,
      `    <meta name="twitter:image" content="https://eva-css.xyz/assets/imgs/eva.jpg">`,
    ].join('\n')
  );
  return content;
}

function ensureXDefault(content, urlSuffix) {
  if (/hreflang="x-default"/.test(content)) return content;
  const frRe = /(<link rel="alternate" hreflang="fr" href="[^"]+">)/;
  if (!frRe.test(content)) return content;
  const fullUrl = `https://eva-css.xyz/${urlSuffix}`;
  return content.replace(
    frRe,
    `$1\n    <link rel="alternate" hreflang="x-default" href="${fullUrl}">`
  );
}

function wrapMain(content) {
  if (content.includes('<main>')) return content;
  const navClose = '</nav>';
  const navIdx = content.indexOf(navClose);
  if (navIdx === -1) return content;
  const insertAfter = navIdx + navClose.length;
  const footerMatch = content.slice(insertAfter).match(/(\n\s*)<footer\b/);
  if (!footerMatch) return content;
  const beforeFooterIdx = insertAfter + footerMatch.index;       // newline before indent
  const footerStartIdx = beforeFooterIdx + footerMatch[1].length;
  const footerIndent = footerMatch[1].replace(/^\n+/, '');       // whitespace only

  return (
    content.slice(0, insertAfter) +
    '\n\n  <main>\n' +
    content.slice(insertAfter, beforeFooterIdx) +
    `\n  </main>\n\n${footerIndent}` +
    content.slice(footerStartIdx)
  );
}

let patched = 0;
let skipped = 0;
for (const [page, cfg] of Object.entries(PAGES)) {
  const filePath = path.join(SRC, page);
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;

  content = content.split(TOGGLE_OPEN_OLD).join(TOGGLE_OPEN_NEW);
  content = content.split(TOGGLE_CLOSE_OLD).join(TOGGLE_CLOSE_NEW);
  content = content.split(TOGGLE_SVG_OLD).join(TOGGLE_SVG_NEW);
  content = content.split(BURGER_OLD).join(BURGER_NEW);
  content = content.split(GITHUB_OLD).join(GITHUB_NEW);

  content = ensureOgTitleDesc(content, cfg.og);
  content = injectFaviconAndSocial(content, cfg.og, cfg.urlSuffix);
  content = ensureXDefault(content, cfg.urlSuffix);
  content = wrapMain(content);

  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ ${page}`);
    patched += 1;
  } else {
    console.log(`  · ${page} (no change)`);
    skipped += 1;
  }
}
console.log(`\nPatched ${patched}, skipped ${skipped}.`);
