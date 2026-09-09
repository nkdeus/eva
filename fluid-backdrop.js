/**
 * Addon « Fluid Backdrop » — pilotage côté page.
 *
 * Un seul fichier pour deux usages :
 *   • `#fb-canvas`   le banc de réglage de framework/fluid-backdrop.html
 *   • `#hero-canvas` la couche de fond du hero de la home
 *
 * Le moteur lui-même vit dans assets/fluid-backdrop.js (bundle vgpu). Ici on ne
 * fait que résoudre les couleurs du thème, construire l'interface, et garder la
 * configuration — localStorage pour la session, JSON pour l'export.
 *
 * Sans WebGPU, sans le bundle, ou sous `prefers-reduced-motion`, rien de tout
 * ceci ne s'exécute et les pages restent exactement ce qu'elles sont.
 */
(function () {
  'use strict';

  var api = window.EvaFluid;
  if (!api) return;

  var STORE_KEY = 'eva.fluid-backdrop.v1';

  // ---------------------------------------------------------------------------
  // couleurs : hex ↔ OKLCH ↔ variables de thème
  // ---------------------------------------------------------------------------

  // La conversion aller est faite à la main ; la conversion retour est confiée
  // au navigateur, en faisant peindre la couleur dans un canvas 1 × 1. C'est le
  // seul convertisseur `oklch()` disponible sans dépendance.
  var probe = document.createElement('span');
  probe.style.display = 'none';
  var pixelCanvas = document.createElement('canvas');
  pixelCanvas.width = pixelCanvas.height = 1;
  var pixelCtx = pixelCanvas.getContext('2d', { willReadFrequently: true });

  function srgbToLinear(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function hexToOklch(hex) {
    var r = srgbToLinear(parseInt(hex.slice(1, 3), 16) / 255);
    var g = srgbToLinear(parseInt(hex.slice(3, 5), 16) / 255);
    var b = srgbToLinear(parseInt(hex.slice(5, 7), 16) / 255);
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    var L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    var A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    var B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    var h = (Math.atan2(B, A) * 180) / Math.PI;
    return { l: L * 100, c: Math.sqrt(A * A + B * B), h: h < 0 ? h + 360 : h };
  }

  function resolveRgb(cssColor) {
    if (!probe.isConnected) document.body.appendChild(probe);
    probe.style.color = '';
    probe.style.color = cssColor;
    var computed = getComputedStyle(probe).color;
    pixelCtx.fillStyle = '#000';
    pixelCtx.fillStyle = computed;
    pixelCtx.fillRect(0, 0, 1, 1);
    var d = pixelCtx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }

  function rgbToHex(rgb) {
    return (
      '#' +
      rgb
        .map(function (v) {
          return Math.round(Math.max(0, Math.min(1, v)) * 255)
            .toString(16)
            .padStart(2, '0');
        })
        .join('')
    );
  }

  /** Les deux teintes du thème, telles que le navigateur les calcule. */
  function themeColors() {
    return { colorA: resolveRgb('var(--brand)'), colorB: resolveRgb('var(--accent)') };
  }

  // ---------------------------------------------------------------------------
  // fond du hero
  // ---------------------------------------------------------------------------

  // Volontairement sobre : le titre passe devant. La teinture ne s'efface qu'à
  // peine, la plaque noire est retirée (`plate: 0`) pour que la couleur se
  // compose sur le fond de la page, et la pixellisation casse le côté
  // « écran de veille » d'une simulation lisse.
  var HERO_SETTINGS = {
    plate: 0,
    filter: 1,
    filterCell: 16,
    filterAmount: 1,
    emitterGain: 0.85,
    dyeDissipation: 0.985,
    exposure: 1.1,
    vignette: 0.55,
    ink: 0.3,
    pointerForce: 0.6,
  };

  function initHero() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    var settings = Object.assign({}, HERO_SETTINGS, themeColors());
    var controller = api.mountFluid(canvas, { settings: settings });
    controller.start();
    // vgpu n'autorise qu'une surface par canvas : sans cette poignée, on ne
    // peut ni régler ni arrêter le fond depuis la console sans le dupliquer.
    window.evaHeroBackdrop = controller;

    // Le thème bouge de deux façons : le bouton clair/sombre (classe) et les
    // balles du logo qu'on fait glisser pour choisir la teinte (style inline).
    // Les deux doivent retinter le fond, sinon il se désolidarise de la page.
    // Le glissé écrit à chaque frame : on coalesce sur un rAF, parce que
    // relire une couleur calculée coûte un aller-retour dans un canvas.
    var queued = false;
    var observer = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        controller.setSettings(themeColors());
      });
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
  }

  // ---------------------------------------------------------------------------
  // banc de réglage
  // ---------------------------------------------------------------------------

  var SLIDERS = [
    { key: 'vorticity', min: 0, max: 50, step: 1 },
    { key: 'dyeDissipation', min: 0.9, max: 1, step: 0.001, digits: 3 },
    { key: 'velocityDissipation', min: 0.9, max: 1, step: 0.001, digits: 3 },
    { key: 'pointerForce', min: 0, max: 3, step: 0.05, digits: 2 },
    { key: 'splatRadius', min: 0.0002, max: 0.01, step: 0.0002, digits: 4 },
    { key: 'ink', min: 0, max: 1.5, step: 0.01, digits: 2 },
    { key: 'emitterGain', min: 0, max: 2, step: 0.05, digits: 2 },
    { key: 'pressureIterations', min: 1, max: 10, step: 1 },
    { key: 'exposure', min: 0.2, max: 4, step: 0.05, digits: 2 },
    { key: 'vignette', min: 0, max: 1, step: 0.01, digits: 2 },
    { key: 'plate', min: 0, max: 1, step: 0.01, digits: 2 },
  ];

  var FILTER_SLIDERS = [
    { key: 'filterCell', min: 2, max: 80, step: 1 },
    { key: 'filterAmount', min: 0, max: 1, step: 0.01, digits: 2 },
    { key: 'filterLevels', min: 2, max: 12, step: 1 },
  ];

  function readLabels() {
    var node = document.getElementById('fb-labels');
    if (!node) return {};
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.warn('[fluid-backdrop] libellés illisibles', error);
      return {};
    }
  }

  function loadStored() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      return raw ? api.normalizeSettings(JSON.parse(raw)) : null;
    } catch (error) {
      // Navigation privée, stockage refusé, JSON corrompu : on repart des
      // valeurs d'origine plutôt que de casser la page.
      return null;
    }
  }

  function initLab() {
    var canvas = document.getElementById('fb-canvas');
    if (!canvas) return;

    var L = readLabels();
    var D = api.DEFAULT_SETTINGS;
    var FILTERS = L.filters || api.FILTERS;

    var stateEl = document.getElementById('fb-state');
    var noteEl = document.getElementById('fb-note');
    var ioEl = document.getElementById('fb-io');
    var fallback = document.getElementById('fb-fallback');
    var fallbackTitle = document.getElementById('fb-fallback-title');
    var fallbackBody = document.getElementById('fb-fallback-body');
    var filterSelect = document.getElementById('fb-filter');
    var brandInput = document.getElementById('fb-color-brand');
    var accentInput = document.getElementById('fb-color-accent');

    var controller = null;
    var inputs = {};
    var statusText = '';
    var fps = '';

    function say(message) {
      if (noteEl) noteEl.textContent = message || '';
    }

    function format(spec, value) {
      return spec.digits ? Number(value).toFixed(spec.digits) : String(value);
    }

    function buildSlider(spec, host) {
      var field = document.createElement('div');
      field.className = 'fb-field';
      field.innerHTML =
        '<div class="fb-field__top"><label for="fb-s-' +
        spec.key +
        '">' +
        ((L.sliders && L.sliders[spec.key]) || spec.key) +
        '</label><span class="fb-field__value" id="fb-v-' +
        spec.key +
        '"></span></div><input class="fb-range" type="range" id="fb-s-' +
        spec.key +
        '" min="' +
        spec.min +
        '" max="' +
        spec.max +
        '" step="' +
        spec.step +
        '" />';
      host.appendChild(field);

      var input = field.querySelector('input');
      var readout = field.querySelector('.fb-field__value');
      input.addEventListener('input', function () {
        var value = Number(input.value);
        readout.textContent = format(spec, value);
        var patch = {};
        patch[spec.key] = value;
        if (controller) controller.setSettings(patch);
        say('');
      });
      inputs[spec.key] = { input: input, readout: readout, spec: spec };
    }

    SLIDERS.forEach(function (spec) {
      buildSlider(spec, document.getElementById('fb-sliders'));
    });
    FILTER_SLIDERS.forEach(function (spec) {
      buildSlider(spec, document.getElementById('fb-filter-sliders'));
    });

    FILTERS.forEach(function (name, index) {
      var option = document.createElement('option');
      option.value = index;
      option.textContent = name;
      filterSelect.appendChild(option);
    });
    filterSelect.addEventListener('change', function () {
      if (controller) controller.setSettings({ filter: Number(filterSelect.value) });
      say('');
    });

    // --- couleurs -----------------------------------------------------------

    function paintMeta(base, hex) {
      var meta = document.getElementById('fb-meta-' + base);
      if (!meta) return;
      var o = hexToOklch(hex);
      meta.textContent = o.l.toFixed(1) + '% · ' + o.c.toFixed(3) + ' · ' + o.h.toFixed(0) + '°';
    }

    // Le picker n'écrit pas une palette à part : il réécrit les variables du
    // thème, donc la page entière suit, et la simulation relit ensuite les
    // couleurs calculées. Le thème reste la source unique.
    function applyThemeColor(base, hex) {
      var o = hexToOklch(hex);
      document.body.style.setProperty('--' + base + '-lightness', o.l.toFixed(2) + '%');
      document.body.style.setProperty('--' + base + '-chroma', o.c.toFixed(4));
      document.body.style.setProperty('--' + base + '-hue', o.h.toFixed(2));
      paintMeta(base, hex);
    }

    function syncColorInputs() {
      var colors = themeColors();
      brandInput.value = rgbToHex(colors.colorA);
      accentInput.value = rgbToHex(colors.colorB);
      paintMeta('brand', brandInput.value);
      paintMeta('accent', accentInput.value);
    }

    function pushColors() {
      applyThemeColor('brand', brandInput.value);
      applyThemeColor('accent', accentInput.value);
      if (controller) controller.setSettings(themeColors());
      say('');
    }

    brandInput.addEventListener('input', pushColors);
    accentInput.addEventListener('input', pushColors);

    // --- état ---------------------------------------------------------------

    function paintState() {
      if (stateEl) stateEl.textContent = statusText + (fps ? ' · ' + fps : '');
    }

    function onStatus(status) {
      var labels = L.status || {};
      statusText = labels[status.state] || status.state;
      if (status.state === 'paused') statusText = labels.paused || 'pause';
      paintState();

      var blocked =
        status.state === 'unsupported' ||
        status.state === 'reduced-motion' ||
        status.state === 'failed';
      if (fallback) fallback.dataset.shown = blocked ? 'true' : 'false';

      if (blocked && fallbackTitle && fallbackBody) {
        var copy = (L.fallback && L.fallback[status.state]) || {};
        fallbackTitle.textContent = copy.title || '';
        fallbackBody.textContent = copy.body || '';
      }
      if (status.state === 'failed') console.error('[fluid-backdrop]', status.error);
    }

    // --- configuration ------------------------------------------------------

    /** Les réglages tels que l'interface les décrit à cet instant. */
    function currentSettings() {
      var out = {};
      Object.keys(inputs).forEach(function (key) {
        out[key] = Number(inputs[key].input.value);
      });
      out.filter = Number(filterSelect.value);
      var colors = themeColors();
      out.colorA = colors.colorA;
      out.colorB = colors.colorB;
      return out;
    }

    /** Écrit un jeu de réglages dans l'interface. N'appelle pas le moteur. */
    function fillControls(settings) {
      Object.keys(inputs).forEach(function (key) {
        var value = settings[key] != null ? settings[key] : D[key];
        inputs[key].input.value = value;
        // Le champ borne à son propre min/max, qui est plus serré que celui du
        // solveur : on relit ce qu'il a retenu, sinon l'affichage annonce une
        // valeur que le moteur ne recevra jamais.
        inputs[key].readout.textContent = format(inputs[key].spec, Number(inputs[key].input.value));
      });
      filterSelect.value = settings.filter != null ? settings.filter : D.filter;
      if (settings.colorA) applyThemeColor('brand', rgbToHex(settings.colorA));
      if (settings.colorB) applyThemeColor('accent', rgbToHex(settings.colorB));
      syncColorInputs();
    }

    function mount() {
      if (controller) controller.destroy();
      controller = api.mountFluid(canvas, {
        settings: currentSettings(),
        onStatus: onStatus,
      });
      controller.start();
    }

    // --- enregistrer / exporter / importer -----------------------------------

    function exportable() {
      var settings = currentSettings();
      // Les couleurs partent en hex : plus lisible qu'un triplet 0..1, et c'est
      // ce qu'on colle dans un autre projet.
      settings.colorA = rgbToHex(settings.colorA);
      settings.colorB = rgbToHex(settings.colorB);
      return settings;
    }

    function toEngineSettings(parsed) {
      // L'export sort les couleurs en hex ; le moteur les veut en 0..1.
      var copy = Object.assign({}, parsed);
      ['colorA', 'colorB'].forEach(function (key) {
        var value = copy[key];
        if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
          copy[key] = [
            parseInt(value.slice(1, 3), 16) / 255,
            parseInt(value.slice(3, 5), 16) / 255,
            parseInt(value.slice(5, 7), 16) / 255,
          ];
        }
      });
      return api.normalizeSettings(copy);
    }

    function snippet(settings) {
      return (
        '<canvas id="backdrop"></canvas>\n' +
        '<script src="https://eva-css.xyz/assets/fluid-backdrop.js"><\/script>\n' +
        '<script>\n' +
        '  EvaFluid.mountFluid(document.getElementById("backdrop"), {\n' +
        '    settings: ' +
        JSON.stringify(settings, null, 2).replace(/\n/g, '\n    ') +
        ',\n  }).start();\n' +
        '<\/script>'
      );
    }

    function copy(text, done) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () {
            say(done);
          },
          function () {
            say((L.actions && L.actions.copyFailed) || '');
          }
        );
        return;
      }
      say((L.actions && L.actions.copyFailed) || '');
    }

    function refreshIo() {
      if (ioEl) ioEl.value = JSON.stringify(exportable(), null, 2);
    }

    function on(id, handler) {
      var element = document.getElementById(id);
      if (element) element.addEventListener('click', handler);
    }

    on('fb-save', function () {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(exportable()));
        say((L.actions && L.actions.saved) || '');
      } catch (error) {
        say((L.actions && L.actions.saveFailed) || '');
      }
    });

    on('fb-export', function () {
      refreshIo();
      copy(JSON.stringify(exportable(), null, 2), (L.actions && L.actions.copiedJson) || '');
    });

    on('fb-snippet', function () {
      var code = snippet(exportable());
      if (ioEl) ioEl.value = code;
      copy(code, (L.actions && L.actions.copiedSnippet) || '');
    });

    on('fb-import', function () {
      if (!ioEl) return;
      var parsed;
      try {
        parsed = JSON.parse(ioEl.value);
      } catch (error) {
        say((L.actions && L.actions.importFailed) || '');
        return;
      }
      var settings = toEngineSettings(parsed);
      if (!Object.keys(settings).length) {
        say((L.actions && L.actions.importEmpty) || '');
        return;
      }
      fillControls(Object.assign({}, D, settings));
      mount();
      say((L.actions && L.actions.imported) || '');
    });

    on('fb-reset', function () {
      ['brand', 'accent'].forEach(function (base) {
        ['lightness', 'chroma', 'hue'].forEach(function (part) {
          document.body.style.removeProperty('--' + base + '-' + part);
        });
      });
      try {
        localStorage.removeItem(STORE_KEY);
      } catch (error) {
        /* rien à faire : l'interface repart quand même des valeurs d'origine */
      }
      fillControls(D);
      mount();
      refreshIo();
      say((L.actions && L.actions.reset) || '');
    });

    // --- démarrage ----------------------------------------------------------

    fillControls(Object.assign({}, D, loadStored() || {}));
    mount();
    refreshIo();

    // Le compteur mesure la page, pas la simulation : s'il décroche, c'est que
    // le GPU rend la main trop tard.
    var frames = 0;
    var last = performance.now();
    (function loop(now) {
      frames++;
      if (now - last >= 500) {
        fps = Math.round((frames * 1000) / (now - last)) + ' fps';
        frames = 0;
        last = now;
        paintState();
      }
      requestAnimationFrame(loop);
    })(performance.now());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initHero();
      initLab();
    });
  } else {
    initHero();
    initLab();
  }
})();
