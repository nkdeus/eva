'use strict';
/**
 * Minimal GFM-subset markdown renderer for the EVA documentation build.
 *
 * Deliberately dependency-free: the doc build runs on Netlify with nothing but
 * the repo's own devDependencies, and the supported syntax is fixed by what the
 * chapters in content/doc/ actually use.
 *
 * Supported: frontmatter, ATX headings (h2-h4), paragraphs, fenced code blocks
 * with a language hint, GFM pipe tables, ordered/unordered lists (one nesting
 * level), blockquote callouts, thematic breaks, and the inline set
 * `code` **bold** *em* [link](href).
 *
 * Link hrefs use two custom schemes so chapters never hardcode a locale path:
 *   doc:slug[#anchor]   -> another documentation chapter
 *   site:page.html      -> any other page of the site
 * Both are resolved by the caller through opts.resolveHref.
 */

const PLACEHOLDER = '\u0000';

// ---------------------------------------------------------------------------
// escaping
// ---------------------------------------------------------------------------

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Inside <code> the double quote is legal, and leaving it alone lets the
// highlighter still recognise string literals.
function escapeCode(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function slugify(text) {
  const base = String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'section';
}

// ---------------------------------------------------------------------------
// frontmatter
// ---------------------------------------------------------------------------

function parseFrontmatter(src) {
  const text = String(src).replace(/^﻿/, '').replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: text };
  const raw = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\n/, '');
  const data = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);
    data[m[1]] = value;
  }
  return { data, body };
}

// ---------------------------------------------------------------------------
// syntax highlighting
// ---------------------------------------------------------------------------

const HASH_COMMENT_LANGS = new Set(['bash', 'sh', 'shell', 'console', 'yaml', 'yml']);
const TOKEN_CLASSES = ['tok-comment', 'tok-string', 'tok-color', 'tok-var', 'tok-at', 'tok-num'];

function highlight(code, lang) {
  const escaped = escapeCode(code);
  const comment =
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*' +
    (HASH_COMMENT_LANGS.has(lang) ? '|(?:^|\\s)#[^\\n]*' : '') +
    ')';
  const re = new RegExp(
    [
      comment,
      '("(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\')',
      '(#[0-9a-fA-F]{3,8}\\b)',
      '(--[A-Za-z0-9_][A-Za-z0-9_-]*|\\$[A-Za-z][A-Za-z0-9_-]*)',
      '(@[a-z][a-z-]*)',
      '(\\b\\d+(?:\\.\\d+)?(?:px|rem|em|%|vw|vh|cqi|cqw|s|ms|deg|fr)?\\b)',
    ].join('|'),
    'g'
  );
  return escaped.replace(re, (match, ...groups) => {
    for (let i = 0; i < TOKEN_CLASSES.length; i++) {
      if (groups[i] === undefined) continue;
      // The hash-comment branch may swallow its leading whitespace; keep it outside.
      const lead = i === 0 ? match.match(/^\s+/) : null;
      const body = lead ? match.slice(lead[0].length) : match;
      return (lead ? lead[0] : '') + '<span class="' + TOKEN_CLASSES[i] + '">' + body + '</span>';
    }
    return match;
  });
}

// ---------------------------------------------------------------------------
// inline
// ---------------------------------------------------------------------------

function renderInline(text, opts) {
  const spans = [];
  let s = String(text).replace(/`([^`]+)`/g, (m, c) => {
    spans.push(c);
    return PLACEHOLDER + (spans.length - 1) + PLACEHOLDER;
  });

  s = escapeHtml(s);

  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
    const link = opts.resolveHref(href);
    const attrs = link.external ? ' target="_blank" rel="noopener"' : '';
    return '<a href="' + link.href + '" class="doc-link no-hover"' + attrs + '>' + label + '</a>';
  });

  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');

  const restore = new RegExp(PLACEHOLDER + '(\\d+)' + PLACEHOLDER, 'g');
  s = s.replace(restore, (m, i) => '<code class="doc-inline-code">' + escapeCode(spans[Number(i)]) + '</code>');
  return s;
}

// ---------------------------------------------------------------------------
// blocks
// ---------------------------------------------------------------------------

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map(cell => cell.trim().replace(/\\\|/g, '|'));
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}

function listItemMatch(line) {
  const bullet = line.match(/^(\s*)[-*]\s+(.*)$/);
  if (bullet) return { indent: bullet[1].length, ordered: false, text: bullet[2] };
  const ordered = line.match(/^(\s*)\d+\.\s+(.*)$/);
  if (ordered) return { indent: ordered[1].length, ordered: true, text: ordered[2] };
  return null;
}

/**
 * @param {string} body markdown source (frontmatter already stripped)
 * @param {object} opts
 * @param {(href:string)=>{href:string,external:boolean}} opts.resolveHref
 * @param {string} opts.copyLabel   label of the code "copy" button
 * @param {string} opts.copiedLabel label shown after a successful copy
 * @param {string} opts.anchorLabel aria-label of the heading anchor link
 * @returns {{html:string, headings:Array<{level:number,text:string,id:string}>}}
 */
function render(body, opts) {
  const lines = String(body).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const headings = [];
  const usedIds = new Set();
  const paragraph = [];
  let i = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    out.push('<p class="doc-p">' + renderInline(paragraph.join(' '), opts) + '</p>');
    paragraph.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    const fence = line.match(/^```\s*([A-Za-z0-9_+-]*)\s*$/);
    if (fence) {
      flushParagraph();
      const lang = (fence[1] || '').toLowerCase();
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++; // closing fence
      out.push(
        '<figure class="doc-block">' +
          '<figcaption class="doc-block-bar flex x space center">' +
            '<span class="doc-block-lang">' + escapeHtml(lang || 'text') + '</span>' +
            '<button type="button" class="doc-copy" data-copy data-copied="' +
              escapeHtml(opts.copiedLabel) + '">' + escapeHtml(opts.copyLabel) + '</button>' +
          '</figcaption>' +
          '<pre class="doc-pre"><code>' + highlight(buf.join('\n'), lang) + '</code></pre>' +
        '</figure>'
      );
      continue;
    }

    // heading
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const level = Math.min(Math.max(heading[1].length, 2), 4);
      // `## Title {#custom-id}` pins the anchor so cross-chapter links survive
      // a wording change.
      const explicit = heading[2].match(/^(.*?)\s*\{#([A-Za-z0-9_-]+)\}\s*$/);
      const text = (explicit ? explicit[1] : heading[2]).trim();
      const stem = explicit ? explicit[2] : slugify(text);
      let id = stem;
      let n = 2;
      while (usedIds.has(id)) id = stem + '-' + n++;
      usedIds.add(id);
      headings.push({ level, text: text.replace(/`/g, ''), id });
      out.push(
        '<h' + level + ' id="' + id + '" class="doc-h doc-h' + level + '">' +
          renderInline(text, opts) +
          '<a class="doc-anchor no-hover" href="#' + id + '" aria-label="' + escapeHtml(opts.anchorLabel) + '">#</a>' +
        '</h' + level + '>'
      );
      i++;
      continue;
    }

    // thematic break
    if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
      flushParagraph();
      out.push('<hr class="doc-hr">');
      i++;
      continue;
    }

    // table
    if (/^\s*\|/.test(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushParagraph();
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(splitRow(lines[i++]));
      out.push(
        '<div class="doc-table-wrap">' +
          '<table class="doc-table"><thead><tr>' +
          head.map(c => '<th>' + renderInline(c, opts) + '</th>').join('') +
          '</tr></thead><tbody>' +
          rows
            .map(r => '<tr>' + r.map(c => '<td>' + renderInline(c, opts) + '</td>').join('') + '</tr>')
            .join('') +
          '</tbody></table>' +
        '</div>'
      );
      continue;
    }

    // blockquote callout
    if (/^>\s?/.test(line)) {
      flushParagraph();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push('<aside class="doc-callout">' + render(buf.join('\n'), opts).html + '</aside>');
      continue;
    }

    // list
    if (listItemMatch(line)) {
      flushParagraph();
      const first = listItemMatch(line);
      const tag = first.ordered ? 'ol' : 'ul';
      const items = [];
      const baseIndent = first.indent;
      while (i < lines.length) {
        const item = listItemMatch(lines[i]);
        if (!item) {
          // a blank line is tolerated as long as the list continues after it
          if (lines[i].trim() === '' && i + 1 < lines.length && listItemMatch(lines[i + 1])) {
            i++;
            continue;
          }
          break;
        }
        if (item.indent > baseIndent) {
          const nestedIndent = item.indent;
          const nestedTag = item.ordered ? 'ol' : 'ul';
          const nested = [];
          while (i < lines.length) {
            const sub = listItemMatch(lines[i]);
            if (!sub || sub.indent < nestedIndent) break;
            nested.push('<li>' + renderInline(sub.text, opts) + '</li>');
            i++;
          }
          const sublist =
            '<' + nestedTag + ' class="doc-list doc-list-nested">' + nested.join('') + '</' + nestedTag + '>';
          if (items.length) {
            items[items.length - 1] = items[items.length - 1].replace(/<\/li>$/, sublist + '</li>');
          } else {
            items.push('<li>' + sublist + '</li>');
          }
          continue;
        }
        items.push('<li>' + renderInline(item.text, opts) + '</li>');
        i++;
      }
      out.push('<' + tag + ' class="doc-list">' + items.join('') + '</' + tag + '>');
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      i++;
      continue;
    }

    paragraph.push(line.trim());
    i++;
  }

  flushParagraph();
  return { html: out.join('\n'), headings };
}

/** Strips markdown syntax down to searchable plain text. */
function toPlainText(body) {
  return String(body)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*\|.*$/gm, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*>_#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { render, parseFrontmatter, slugify, escapeHtml, escapeCode, toPlainText };
