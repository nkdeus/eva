#!/usr/bin/env node
'use strict';
/**
 * Documentation builder.
 *
 * Reads the chapters in content/doc/<locale>/, renders them through
 * src/doc/_layout.html and writes:
 *
 *   /doc/<slug>.html            (default locale)
 *   /<locale>/doc/<slug>.html   (other locales)
 *   /doc/search-index.json      (per locale, fetched lazily by doc.js)
 *   /llms.txt, /llms-full.txt,
 *   /use-eva.md, /use-eva-llm.md   (plain-text mirrors, no longer linked from
 *                                   the site but still served — generated here
 *                                   so they cannot drift from the chapters)
 *
 * Chapter order comes from the numeric filename prefix. The default locale is
 * authoritative: a chapter missing from a translation falls back to the default
 * body rather than disappearing from the navigation.
 */

const fs = require('fs');
const path = require('path');

const md = require('./lib/markdown');
const site = require('./lib/site');

const CONTENT_DIR = path.join(site.ROOT, 'content', 'doc');
const LAYOUT = path.join(site.SRC_DIR, 'doc', '_layout.html');
const DOC_DIR = 'doc';
const SEARCH_FILE = 'search-index.json';

// ---------------------------------------------------------------------------
// chapters
// ---------------------------------------------------------------------------

function chapterFiles(locale) {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort();
}

function readChapter(locale, file) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, locale, file), 'utf8');
  const { data, body } = md.parseFrontmatter(raw);
  const slug = data.slug || file.replace(/^\d+[-_]/, '').replace(/\.md$/, '');
  return {
    file,
    slug,
    title: data.title || slug,
    nav: data.nav || data.title || slug,
    group: data.group || 'reference',
    eyebrow: data.eyebrow || '',
    description: data.description || '',
    body,
  };
}

/** Chapter list for a locale, ordered and completed by the default locale. */
function loadChapters(locale) {
  const base = chapterFiles(site.DEFAULT_LOCALE).map(f => readChapter(site.DEFAULT_LOCALE, f));
  if (locale === site.DEFAULT_LOCALE) return base;

  const translated = new Map(chapterFiles(locale).map(f => [f, readChapter(locale, f)]));
  return base.map(chapter => {
    const match = translated.get(chapter.file);
    if (match) return match;
    console.warn(`  [warn] doc (${locale}): ${chapter.file} not translated, using ${site.DEFAULT_LOCALE}`);
    return chapter;
  });
}

// ---------------------------------------------------------------------------
// link resolution
// ---------------------------------------------------------------------------

/**
 * `doc:slug#anchor` -> sibling chapter, `site:page.html` -> elsewhere on the
 * site (one level up from /doc/), anything else passes through.
 */
function makeResolver() {
  return href => {
    if (href.startsWith('doc:')) {
      const rest = href.slice(4);
      const hash = rest.indexOf('#');
      const slug = hash === -1 ? rest : rest.slice(0, hash);
      const anchor = hash === -1 ? '' : rest.slice(hash);
      return { href: `${slug}.html${anchor}`, external: false };
    }
    if (href.startsWith('site:')) {
      return { href: `../${href.slice(5)}`, external: false };
    }
    return { href, external: /^https?:\/\//.test(href) };
  };
}

// ---------------------------------------------------------------------------
// chrome
// ---------------------------------------------------------------------------

function esc(s) {
  return md.escapeHtml(s);
}

function renderSidebar(chapters, current, dict) {
  const groups = [];
  for (const chapter of chapters) {
    let group = groups.find(g => g.key === chapter.group);
    if (!group) {
      group = { key: chapter.group, chapters: [] };
      groups.push(group);
    }
    group.chapters.push(chapter);
  }

  return groups
    .map(group => {
      const label =
        site.lookup(dict, `docs.groups.${group.key}`) ||
        group.key.charAt(0).toUpperCase() + group.key.slice(1);
      const items = group.chapters
        .map(chapter => {
          const active = chapter.slug === current.slug;
          const cls = 'doc-nav-link no-hover' + (active ? ' is-current' : '');
          const aria = active ? ' aria-current="page"' : '';
          return `<li><a class="${cls}" href="${chapter.slug}.html"${aria}>${esc(chapter.nav)}</a></li>`;
        })
        .join('');
      return (
        '<div class="doc-nav-section">' +
        `<p class="doc-nav-heading">${esc(label)}</p>` +
        `<ul class="doc-nav-list">${items}</ul>` +
        '</div>'
      );
    })
    .join('');
}

function renderToc(headings) {
  const items = headings.filter(h => h.level === 2 || h.level === 3);
  if (!items.length) return '';
  return (
    '<ul class="doc-toc-list">' +
    items
      .map(
        h =>
          `<li><a class="doc-toc-link no-hover" data-level="${h.level}" href="#${h.id}">${esc(h.text)}</a></li>`
      )
      .join('') +
    '</ul>'
  );
}

function renderPager(chapters, index, dict) {
  const prev = index > 0 ? chapters[index - 1] : null;
  const next = index < chapters.length - 1 ? chapters[index + 1] : null;
  if (!prev && !next) return '';

  const prevLabel = site.lookup(dict, 'docs.prev') || 'Previous';
  const nextLabel = site.lookup(dict, 'docs.next') || 'Next';

  const left = prev
    ? `<a class="doc-pager-link no-hover doc-pager-prev" href="${prev.slug}.html">` +
      `<span class="doc-pager-dir">${esc(prevLabel)}</span>` +
      `<span class="doc-pager-title">${esc(prev.nav)}</span></a>`
    : '<span class="doc-pager-spacer"></span>';

  const right = next
    ? `<a class="doc-pager-link no-hover doc-pager-next" href="${next.slug}.html">` +
      `<span class="doc-pager-dir">${esc(nextLabel)}</span>` +
      `<span class="doc-pager-title">${esc(next.nav)}</span></a>`
    : '<span class="doc-pager-spacer"></span>';

  return `<nav class="doc-pager flex x space g-20">${left}${right}</nav>`;
}

// ---------------------------------------------------------------------------
// search index
// ---------------------------------------------------------------------------

/**
 * One entry per h2 section, so a hit deep-links into the chapter rather than
 * dropping the reader at the top of a long page.
 */
function buildSearchEntries(chapter, headings) {
  const lines = chapter.body.replace(/\r\n/g, '\n').split('\n');
  const entries = [];
  let current = { heading: '', anchor: '', lines: [] };
  let headingIndex = 0;
  let inFence = false;

  const push = () => {
    const text = md.toPlainText(current.lines.join('\n'));
    if (!text && !current.heading) return;
    entries.push({
      u: `${chapter.slug}.html${current.anchor}`,
      p: chapter.title,
      h: current.heading,
      x: text.slice(0, 1200),
    });
  };

  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    const heading = !inFence && line.match(/^(#{2,3})\s+/);
    if (heading && headingIndex < headings.length) {
      push();
      // headings[] is produced by the renderer, in document order
      while (
        headingIndex < headings.length &&
        headings[headingIndex].level > 3
      ) {
        headingIndex++;
      }
      const h = headings[headingIndex++];
      current = { heading: h ? h.text : '', anchor: h ? `#${h.id}` : '', lines: [] };
      continue;
    }
    current.lines.push(line);
  }
  push();

  return entries;
}

// ---------------------------------------------------------------------------
// link validation
// ---------------------------------------------------------------------------

/**
 * Cross-chapter links are written as `doc:slug#anchor`, and the anchor comes
 * from a heading — so a reworded heading silently breaks the link in one locale
 * only. Fail the build instead.
 */
function validateLinks(chapters, anchorsBySlug, locale) {
  const problems = [];
  for (const chapter of chapters) {
    const links = chapter.body.match(/\(doc:[^)\s]+\)/g) || [];
    for (const raw of links) {
      const target = raw.slice(5, -1);
      const [slug, anchor] = target.split('#');
      if (!anchorsBySlug.has(slug)) {
        problems.push(`${chapter.slug}.md -> doc:${target} (no such chapter)`);
      } else if (anchor && !anchorsBySlug.get(slug).has(anchor)) {
        problems.push(`${chapter.slug}.md -> doc:${target} (no such anchor)`);
      }
    }
  }
  if (problems.length) {
    throw new Error(`[doc] Broken links in ${locale}:\n  ` + problems.join('\n  '));
  }
}

// ---------------------------------------------------------------------------
// machine mirrors
// ---------------------------------------------------------------------------

/**
 * The four plain-text mirrors are no longer linked from the site, but they are
 * still served for anyone (or anything) that has them bookmarked. Generating
 * them from the same chapters is what keeps them from drifting.
 */
function writeMachineMirrors(chapters) {
  const url = slug => `${site.BASE_URL}/${DOC_DIR}/${slug}.html`;
  const bySlug = slug => chapters.find(c => c.slug === slug);
  const chapterBlock = c =>
    c ? ['', '---', '', `# ${c.title}`, '', `Source: ${url(c.slug)}`, '', c.body.trim()] : [];

  const short = [
    '# EVA CSS',
    '',
    '> A fluid SCSS framework that turns a static design into a responsive system using CSS clamp() and OKLCH colors.',
    '',
    'Generated from the documentation source. Human-readable version: ' + `${site.BASE_URL}/${DOC_DIR}/index.html`,
    '',
    '## Documentation',
    '',
    ...chapters.map(c => `- [${c.title}](${url(c.slug)}) — ${c.description}`),
    '',
    '## Links',
    '',
    '- Website: ' + site.BASE_URL,
    '- GitHub: https://github.com/nkdeus/eva',
    '- npm: eva-css-fluid, eva-colors, eva-css-purge',
    '- Full text: ' + site.BASE_URL + '/llms-full.txt',
    '',
  ].join('\n');

  const full = [
    '# EVA CSS — Full documentation',
    '',
    '> Generated from content/doc/en. The canonical, human-readable version lives at ' +
      `${site.BASE_URL}/${DOC_DIR}/index.html`,
    '',
    ...chapters.flatMap(chapterBlock),
    '',
  ].join('\n');

  // The adoption path, for someone wiring EVA into an existing codebase.
  const adoption = [
    '# Use EVA — installation, configuration, adoption',
    '',
    '> Generated from content/doc/en. The canonical, human-readable version lives at ' +
      `${site.BASE_URL}/${DOC_DIR}/index.html`,
    '',
    ...[bySlug('install'), bySlug('config'), bySlug('adopt')].flatMap(chapterBlock),
    '',
  ].join('\n');

  // The dense version: a chapter index plus the flat reference.
  const condensed = [
    '# EVA CSS — condensed reference',
    '',
    '> Generated from content/doc/en. The canonical, human-readable version lives at ' +
      `${site.BASE_URL}/${DOC_DIR}/index.html`,
    '',
    '## Chapters',
    '',
    ...chapters.map(c => `- [${c.title}](${url(c.slug)}) — ${c.description}`),
    ...chapterBlock(bySlug('reference')),
    '',
  ].join('\n');

  site.writeFile(path.join(site.ROOT, 'llms.txt'), short);
  site.writeFile(path.join(site.ROOT, 'llms-full.txt'), full);
  site.writeFile(path.join(site.ROOT, 'use-eva.md'), adoption);
  site.writeFile(path.join(site.ROOT, 'use-eva-llm.md'), condensed);
}

// ---------------------------------------------------------------------------
// build
// ---------------------------------------------------------------------------

/** Paths, relative to the site root, of every generated doc page. */
function docPagePaths() {
  return chapterFiles(site.DEFAULT_LOCALE)
    .map(f => readChapter(site.DEFAULT_LOCALE, f))
    .map(c => `${DOC_DIR}/${c.slug}.html`);
}

function buildDocs(dicts) {
  const layout = fs.readFileSync(LAYOUT, 'utf8');
  const resolveHref = makeResolver();

  for (const locale of Object.keys(site.LOCALES)) {
    const dict = dicts[locale];
    const chapters = loadChapters(locale);
    const searchIndex = [];
    const anchorsBySlug = new Map();

    chapters.forEach((chapter, index) => {
      const page = `${DOC_DIR}/${chapter.slug}.html`;
      const rendered = md.render(chapter.body, {
        resolveHref,
        copyLabel: site.lookup(dict, 'docs.copy') || 'Copy',
        copiedLabel: site.lookup(dict, 'docs.copied') || 'Copied',
        anchorLabel: site.lookup(dict, 'docs.anchor') || 'Link to this section',
      });

      const ctx = site.makeContext(page, locale, dict);
      ctx.docTitle = esc(chapter.title);
      ctx.docNav = esc(chapter.nav);
      ctx.docDescription = esc(chapter.description);
      ctx.docEyebrow = esc(chapter.eyebrow);
      ctx.docSlug = chapter.slug;
      ctx.docPath = page;
      ctx.docBody = rendered.html;
      ctx.docSidebar = renderSidebar(chapters, chapter, dict);
      ctx.docToc = renderToc(rendered.headings);
      ctx.docPager = renderPager(chapters, index, dict);
      ctx.docIndexUrl = 'index.html';
      ctx.docSearchUrl = SEARCH_FILE;

      const html = site.render(layout, ctx, dicts[site.DEFAULT_LOCALE], page, locale);
      site.writeFile(site.outputPath(page, locale), html);

      anchorsBySlug.set(chapter.slug, new Set(rendered.headings.map(h => h.id)));
      searchIndex.push(...buildSearchEntries(chapter, rendered.headings));
    });

    validateLinks(chapters, anchorsBySlug, locale);

    site.writeFile(
      site.outputPath(`${DOC_DIR}/${SEARCH_FILE}`, locale),
      JSON.stringify(searchIndex)
    );
  }

  writeMachineMirrors(loadChapters(site.DEFAULT_LOCALE));
}

module.exports = { buildDocs, docPagePaths, loadChapters, DOC_DIR };

if (require.main === module) {
  const dicts = {};
  for (const locale of Object.keys(site.LOCALES)) dicts[locale] = site.loadDict(locale);
  console.log('[doc] Building documentation');
  buildDocs(dicts);
  console.log('[doc] Done.');
}
