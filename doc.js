/**
 * Documentation shell behaviour: code copy buttons, table-of-contents
 * scroll-spy, the mobile chapter drawer, and the search overlay.
 *
 * Loaded only by the pages under /doc/. Everything degrades to a plain,
 * fully readable document if this file never runs.
 */
(function () {
  'use strict';

  var body = document.body;
  if (!body || !body.classList.contains('doc-page')) return;

  // -------------------------------------------------------------------------
  // copy buttons
  // -------------------------------------------------------------------------

  function initCopyButtons() {
    document.querySelectorAll('.doc-copy').forEach(function (button) {
      button.addEventListener('click', function () {
        var block = button.closest('.doc-block');
        var code = block && block.querySelector('code');
        if (!code) return;

        var label = button.textContent;
        var done = function () {
          button.textContent = button.dataset.copied || 'Copied';
          button.classList.add('is-copied');
          setTimeout(function () {
            button.textContent = label;
            button.classList.remove('is-copied');
          }, 1600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code.textContent).then(done, function () {});
          return;
        }
        // Fallback for non-secure contexts, where the async API is unavailable.
        var area = document.createElement('textarea');
        area.value = code.textContent;
        area.setAttribute('readonly', '');
        area.style.position = 'absolute';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand('copy');
          done();
        } catch (e) {
          /* clipboard unavailable — leave the label alone */
        }
        document.body.removeChild(area);
      });
    });
  }

  // -------------------------------------------------------------------------
  // table of contents
  // -------------------------------------------------------------------------

  function initToc() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.doc-toc-link'));
    if (!links.length) return;

    var targets = links
      .map(function (link) {
        return document.getElementById(decodeURIComponent(link.hash.slice(1)));
      })
      .filter(Boolean);
    if (!targets.length) return;

    var setCurrent = function (id) {
      links.forEach(function (link) {
        link.classList.toggle('is-current', link.hash === '#' + id);
      });
    };

    // Track which headings are above the reading line, and highlight the last
    // one — more stable than reacting to whichever entry happens to intersect.
    var visible = new Map();
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible.set(entry.target.id, entry.isIntersecting);
        });
        for (var i = targets.length - 1; i >= 0; i--) {
          if (visible.get(targets[i].id)) {
            setCurrent(targets[i].id);
            return;
          }
        }
      },
      { rootMargin: '-88px 0px -70% 0px', threshold: 0 }
    );

    targets.forEach(function (target) {
      observer.observe(target);
    });
    setCurrent(targets[0].id);
  }

  // -------------------------------------------------------------------------
  // mobile chapter drawer + sidebar position
  // -------------------------------------------------------------------------

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('doc-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var current = document.querySelector('.doc-nav-link.is-current');
    if (current && nav && nav.scrollHeight > nav.clientHeight) {
      current.scrollIntoView({ block: 'nearest' });
    }
  }

  // -------------------------------------------------------------------------
  // search
  // -------------------------------------------------------------------------

  function initSearch() {
    var overlay = document.getElementById('doc-search');
    var input = document.getElementById('doc-search-input');
    var results = document.getElementById('doc-search-results');
    if (!overlay || !input || !results) return;

    var indexUrl = body.dataset.docSearch || 'search-index.json';
    var index = null;
    var loading = null;
    var active = -1;

    function load() {
      if (index) return Promise.resolve(index);
      if (!loading) {
        loading = fetch(indexUrl)
          .then(function (r) {
            return r.ok ? r.json() : [];
          })
          .then(function (data) {
            index = Array.isArray(data) ? data : [];
            return index;
          })
          .catch(function () {
            index = [];
            return index;
          });
      }
      return loading;
    }

    function open() {
      overlay.hidden = false;
      body.classList.add('doc-search-open');
      input.value = '';
      results.innerHTML = '';
      active = -1;
      load();
      input.focus();
    }

    function close() {
      overlay.hidden = true;
      body.classList.remove('doc-search-open');
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }

    function snippet(text, terms) {
      var lower = text.toLowerCase();
      var at = -1;
      for (var i = 0; i < terms.length && at === -1; i++) at = lower.indexOf(terms[i]);
      if (at === -1) return escapeHtml(text.slice(0, 120));
      var from = Math.max(0, at - 40);
      var raw = (from > 0 ? '…' : '') + text.slice(from, from + 150) + '…';
      var html = escapeHtml(raw);
      terms.forEach(function (term) {
        if (!term) return;
        var re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        html = html.replace(re, '<mark>$1</mark>');
      });
      return html;
    }

    // Sections are short, so requiring every term inside one of them misses
    // obvious answers. Any term scores; matching them all earns a large bonus,
    // which keeps the complete matches on top.
    function score(entry, terms) {
      var heading = (entry.h || '').toLowerCase();
      var page = (entry.p || '').toLowerCase();
      var text = (entry.x || '').toLowerCase();
      var total = 0;
      var matched = 0;
      for (var i = 0; i < terms.length; i++) {
        var term = terms[i];
        var hit = 0;
        if (heading.indexOf(term) !== -1) hit += 6;
        if (page.indexOf(term) !== -1) hit += 3;
        if (text.indexOf(term) !== -1) hit += 1;
        if (hit) matched++;
        total += hit;
      }
      if (!matched) return 0;
      if (matched === terms.length) total += 10;
      return total;
    }

    function render(query) {
      var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length || !index) {
        results.innerHTML = '';
        active = -1;
        return;
      }

      var matches = index
        .map(function (entry) {
          return { entry: entry, score: score(entry, terms) };
        })
        .filter(function (m) {
          return m.score > 0;
        })
        .sort(function (a, b) {
          return b.score - a.score;
        })
        .slice(0, 12);

      if (!matches.length) {
        var empty = results.dataset.empty || 'No result for';
        results.innerHTML =
          '<p class="doc-search-none">' + escapeHtml(empty) + ' “' + escapeHtml(query) + '”</p>';
        active = -1;
        return;
      }

      results.innerHTML = matches
        .map(function (m, i) {
          var e = m.entry;
          return (
            '<a class="doc-search-hit no-hover' +
            (i === 0 ? ' is-active' : '') +
            '" href="' +
            escapeHtml(e.u) +
            '">' +
            '<span class="doc-search-hit-page">' +
            escapeHtml(e.p || '') +
            '</span>' +
            '<span class="doc-search-hit-title">' +
            escapeHtml(e.h || e.p || '') +
            '</span>' +
            '<span class="doc-search-hit-text">' +
            snippet(e.x || '', terms) +
            '</span>' +
            '</a>'
          );
        })
        .join('');
      active = 0;
    }

    function move(delta) {
      var hits = results.querySelectorAll('.doc-search-hit');
      if (!hits.length) return;
      hits[Math.max(active, 0)].classList.remove('is-active');
      active = (active + delta + hits.length) % hits.length;
      hits[active].classList.add('is-active');
      hits[active].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', function () {
      var query = input.value.trim();
      load().then(function () {
        render(query);
      });
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        move(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        move(-1);
      } else if (event.key === 'Enter') {
        var hits = results.querySelectorAll('.doc-search-hit');
        if (hits.length && active >= 0) {
          event.preventDefault();
          window.location.href = hits[active].getAttribute('href');
        }
      }
    });

    document.querySelectorAll('[data-search-open]').forEach(function (el) {
      el.addEventListener('click', open);
    });
    document.querySelectorAll('[data-search-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !overlay.hidden) {
        close();
        return;
      }
      if (!overlay.hidden) return;

      var target = event.target;
      var typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (typing) return;

      if (event.key === '/') {
        event.preventDefault();
        open();
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      }
    });
  }

  function init() {
    initCopyButtons();
    initToc();
    initNav();
    initSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
