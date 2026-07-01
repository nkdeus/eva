# TODO SEO

## Lighthouse scores (mobile, navigation) — baseline before fixes

| Page                   | SEO | Best Pract. | A11y | Agentic |
|------------------------|-----|-------------|------|---------|
| /                      | 100 | 100         | 71   | 67      |
| /fr/                   | 100 | 100         | 71   | 67      |
| /framework/colors.html | 100 | 100         | 68   | 67      |

SEO core ✓. Les pertes sont en accessibilité, qui influence le ranking moderne (Google + AI search bots).

---

## ✅ Done — applied 2026-05-09

### 🔴 Bloquants — done

1. **OG image** — `<meta property="og:image">` pointant vers `/assets/imgs/eva.jpg` (512×512) ajouté sur les 26 pages (13 × 2 langs). `og:image:width/height/alt` aussi. ⚠️ Note : ratio 1:1, pas le 1200×630 idéal — un `og-image.png` dédié reste à produire en aval.
2. **Favicon, apple-touch-icon, manifest** — `assets/favicon.svg` créé (orange/dark, brand). `site.webmanifest` créé. Liens injectés dans toutes les pages.
3. **Sitemap.xml bilingue** — auto-généré par `scripts/build-i18n.js` à chaque build : 13 pages × 2 langs (EN + FR) = 26 URLs, avec `js-calculator.html` désormais inclus.
4. **`xhtml:link rel="alternate"` dans le sitemap** — chaque `<url>` déclare `en`, `fr` et `x-default`.
5. **`x-default` hreflang** — ajouté sur les 10 pages framework/* (toutes les pages ont maintenant les 3 hreflang).
6. **`<main>` landmark** — wrappe le contenu de `</nav>` à `<footer` sur les 26 pages générées. Lighthouse "landmark-one-main" devrait passer.

### 🟠 À améliorer — done

7. **`twitter:card`, `twitter:site`, `og:site_name`** — `summary_large_image`, `og:site_name=EVA CSS`, et `twitter:title/description/image` ajoutés partout.
8. **`og:title` / `og:description` sur sous-pages** — ajoutés sur colors, sizes, grids, flex, fonts, gradients, doc (clés `meta.ogTitle` / `meta.ogDescription` dans `i18n/{en,fr}.json`).
9. **`og:type=website`** — ajouté partout où il manquait.
10. **JSON-LD** —
    - Home : `WebSite` + `SearchAction` ajouté à côté du `SoftwareApplication` existant.
    - 12 sous-pages : `BreadcrumbList` injecté (script `scripts/seo-jsonld.js`).
    - `TechArticle` : non ajouté — `BreadcrumbList` couvre l'essentiel et un `TechArticle` sur ces pages serait sémantiquement faible (pages référence, pas articles).
11. **Sitemap lastmod** — auto-généré avec date du build (`new Date().toISOString().slice(0, 10)`). Plus de `2026-03-04` figé.
12. **Titres trop courts** — étendus à 50-60 chars sur colors, sizes, grids, flex, fonts, gradients, doc, et leurs équivalents FR. Ex: "EVA CSS — Flex" → "EVA CSS — Flex Utilities for Two-Axis Fluid Layouts".
13. **Hiérarchie h1→h2→h3** — `framework/js-calculator.html` : Config / Variables / Classes promus h3→h2 (1 h1 + 3 h2 + 2 h3 désormais).

### 🟡 Mineurs — done

14. **Boutons sans nom accessible** — `aria-label` ajouté sur `#burger-menu`, `#prevSite`, `#nextSite` via i18n (`t.a11y.*`).
15. **`<a class="dark-light-toggle">`** — converti en `<button type="button">` avec `aria-label` i18n. JS handler intact (sélection par classe). CSS reset pour préserver le visuel (`border:0; padding:0; color:inherit`). `aria-expanded` synchronisé sur le burger menu.
16. **GitHub icon** — `aria-label` + `rel="noopener"` ajoutés.
17. **Range slider** — `<label class="hide" for="sizeRange">` + `aria-label` ajoutés sur l'input range.

---

## 🔧 Détails techniques

### Fichiers ajoutés
- `assets/favicon.svg` — favicon SVG inline-friendly (taille minimale, brand colors)
- `site.webmanifest` — PWA manifest avec icônes
- `scripts/seo-patch.js` — one-shot idempotent qui patche les 13 templates `src/*.html` (head meta, body a11y, `<main>` wrapping)
- `scripts/seo-patch-fixup.js` — cleanup d'indentation après seo-patch
- `scripts/seo-jsonld.js` — injection `BreadcrumbList` sur 12 sous-pages

### Fichiers modifiés
- `i18n/en.json`, `i18n/fr.json` — clés ajoutées : `a11y.*`, et `meta.ogTitle`/`meta.ogDescription` sur 7 sous-pages, titres rallongés
- `scripts/build-i18n.js` — génération auto du `sitemap.xml` à chaque build, avec `xhtml:link` alternates
- `src/*.html` (13 fichiers) — meta SEO/social, favicons, JSON-LD, `<main>` landmark, `<button>` au lieu de `<a>` pour le toggle theme, aria-label partout
- `app.js` — `aria-expanded` synchronisé sur le burger menu, refactor cosmétique du handler
- `styles/custom/_components.scss` — reset `border:0; padding:0; color:inherit` sur `.dark-light-toggle` (compatible `<button>`)

### À refaire si on régénère
1. `npm run build-css` — recompile main.css
2. `node scripts/build-i18n.js` (ou `npm run build-i18n`) — régénère HTML + sitemap
3. `npm run purge` — purge CSS en prod

### À vérifier après déploiement
- Lighthouse mobile : a11y devrait remonter de 71 → ~95+ (landmark-one-main, button-name, link-name, label, color-contrast restant le seul potentiellement non-trivial)
- Google Rich Results Test : `BreadcrumbList` + `WebSite` sur la home + `SoftwareApplication`
- Twitter Card Validator : carte `summary_large_image` avec image
- Facebook Sharing Debugger : og:* complets

---

## ⏭️ Reste à faire

### Assets bitmap — outil dispo : `asset-generator.html`

`/asset-generator.html` (à la racine, accessible en local ou via le site déployé) génère tous les PNG ci-dessous en 1 clic depuis le logo Blob et le titre EVA CSS existants. Ouvre-le, ajuste les variations (hue, theme, layout, gradient angle), puis clique « Export all PNG ».

| Asset | Dimensions | Usage / cible meta |
|-------|-----------|---------------------|
| `og-image.png`          | 1200×630  | `<meta property="og:image">` (Twitter / FB / LinkedIn) |
| `og-image-square.png`   | 1200×1200 | Carré fallback / Instagram |
| `twitter-large.png`     | 1200×675  | Twitter `summary_large_image` (optionnel, override d'`og:image`) |
| `linkedin-banner.png`   | 1200×627  | LinkedIn (préfère 1.91:1) |
| `github-social.png`     | 1280×640  | Repo GitHub (Settings → Social preview) |
| `apple-touch-icon.png`  | 180×180   | `<link rel="apple-touch-icon">` iOS |
| `favicon-32.png`        | 32×32     | Browser tab fallback non-SVG |
| `favicon-512.png`       | 512×512   | PWA fallback hi-res |
| `android-chrome-192.png`| 192×192   | Android `manifest.icons` |
| `android-chrome-512.png`| 512×512   | Android PWA hi-res |

**Workflow recommandé** :
1. Lancer un serveur local : `npx http-server` ou ouvrir `file:///dev/eva/eva/asset-generator.html` direct.
2. Régler le brand hue + theme + bg (le défaut `gradient` + light convient pour la home).
3. Cliquer **Export all PNG (1×)** → 10 PNG téléchargés.
4. Déposer dans `assets/imgs/` (ou `assets/` pour les favicons).
5. Mettre à jour les 13 `src/*.html` :
   - `<meta property="og:image" content="https://eva-css.xyz/assets/imgs/og-image.png">`
   - `<meta property="og:image:width" content="1200">` / `og:image:height: 630`
   - `<link rel="apple-touch-icon" href="...assets/imgs/apple-touch-icon.png">`
   - Optionnel : `<link rel="icon" sizes="32x32" type="image/png" href="...favicon-32.png">` en complément du SVG existant.
6. Mettre à jour `site.webmanifest` pour pointer sur les `android-chrome-*.png`.
7. Régénérer : `node scripts/build-i18n.js`.

⚠️ Si l'export montre les balls séparées (pas fusionnées en blob), activer la case **"Use SVG blob"** dans la toolbar — html2canvas peine sur les `filter: url(#fancy-goo)` posés sur du HTML, mais rasterise sans souci les SVG inline avec filtre interne.

### Hors assets

- **Color contrast** — non auditée ici, peut représenter le delta restant en a11y selon Lighthouse. À vérifier sur les classes `_c-brand_` (65% opacity) sur fonds clairs.
- **Lighthouse Agentic** — score 67 = 33% de marge. Probablement lié à des éléments structurels (manque de `<article>`/`<aside>`/landmarks supplémentaires) ou semantic HTML. À auditer après déploiement.
