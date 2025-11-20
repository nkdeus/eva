# EVA Ecosystem - Plan d'implémentation

## 🎯 Objectif

Transformer EVA en écosystème npm modulaire et réutilisable, incluant :
- Framework SCSS fluid avec OKLCH
- Outil de purge CSS intelligent
- Utilitaires de gestion des couleurs
- Serveur MCP pour Figma → HTML
- CLI unifié

---

## 📦 Architecture Monorepo

### Structure des dossiers

```
eva/
├── packages/
│   ├── eva-css/              # @eva/css - Framework SCSS
│   ├── eva-purge/            # @eva/purge - CSS Purge Tool
│   ├── eva-colors/           # @eva/colors - Color Management
│   ├── eva-mcp-server/       # @eva/mcp-server - Figma MCP
│   └── eva-cli/              # eva-cli - CLI unifié (optionnel)
├── examples/
│   ├── vuepress/
│   ├── vite/
│   └── nextjs/
├── docs/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 📋 Checklist d'implémentation

### Phase 1 : Setup Monorepo

- [ ] **1.1** Créer une nouvelle branche `feat/npm-packages`
- [ ] **1.2** Initialiser le monorepo
  ```bash
  npm install -g pnpm
  pnpm init
  ```
- [ ] **1.3** Créer `pnpm-workspace.yaml`
  ```yaml
  packages:
    - 'packages/*'
    - 'examples/*'
  ```
- [ ] **1.4** Configurer le `package.json` root
  ```json
  {
    "name": "eva-monorepo",
    "private": true,
    "scripts": {
      "build": "pnpm -r build",
      "test": "pnpm -r test",
      "publish": "pnpm -r publish"
    }
  }
  ```

### Phase 2 : Package `@eva/css`

- [ ] **2.1** Créer la structure
  ```bash
  mkdir -p packages/eva-css/src
  cd packages/eva-css
  ```
- [ ] **2.2** Créer `package.json`
  ```json
  {
    "name": "@eva/css",
    "version": "1.0.0",
    "description": "Fluid design framework with OKLCH colors",
    "type": "module",
    "main": "src/index.scss",
    "sass": "src/index.scss",
    "style": "dist/eva.css",
    "exports": {
      ".": {
        "sass": "./src/index.scss",
        "style": "./dist/eva.css",
        "default": "./dist/eva.css"
      },
      "./src/*": "./src/*.scss"
    },
    "files": [
      "src/",
      "dist/",
      "README.md"
    ],
    "keywords": [
      "css",
      "scss",
      "sass",
      "framework",
      "fluid-design",
      "oklch",
      "utility-css",
      "design-system"
    ],
    "scripts": {
      "build": "sass src/index.scss dist/eva.css --style=expanded",
      "build:min": "sass src/index.scss dist/eva.min.css --style=compressed",
      "watch": "sass --watch src/index.scss dist/eva.css"
    },
    "devDependencies": {
      "sass": "^1.94.1"
    },
    "publishConfig": {
      "access": "public"
    }
  }
  ```
- [ ] **2.3** Migrer les fichiers SCSS
  - [ ] Copier `_eva.scss`
  - [ ] Copier `_colors.scss`
  - [ ] Copier `_gradients.scss`
  - [ ] Copier `_theme.scss`
  - [ ] Copier `_reset.scss`
  - [ ] Copier `_font.scss`
  - [ ] Copier `_utils.scss`
  - [ ] Copier `_flex.scss`
  - [ ] Copier `_grid.scss`
  - [ ] Copier `_components.scss`
- [ ] **2.4** Créer `src/index.scss`
  ```scss
  // EVA CSS Framework
  // Configuration avec valeurs par défaut
  $sizes: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 !default;
  $font-sizes: 12, 14, 16, 18, 20, 24, 32, 48 !default;
  $build-class: true !default;
  $px-rem-suffix: false !default;
  $name-by-size: true !default;
  $custom-class: false !default;

  // Import des modules
  @forward '_eva';
  @forward '_colors';
  @forward '_gradients';
  @forward '_theme';
  @forward '_reset';
  @forward '_font';
  @forward '_utils';
  @forward '_flex';
  @forward '_grid';
  @forward '_components';
  ```
- [ ] **2.5** Créer `README.md` avec documentation et exemples
- [ ] **2.6** Tester le build
  ```bash
  pnpm build
  ```

### Phase 3 : Package `@eva/colors`

- [ ] **3.1** Créer la structure
  ```bash
  mkdir -p packages/eva-colors/src
  cd packages/eva-colors
  ```
- [ ] **3.2** Créer `package.json`
  ```json
  {
    "name": "@eva/colors",
    "version": "1.0.0",
    "description": "OKLCH color utilities for EVA",
    "type": "module",
    "main": "src/index.js",
    "exports": {
      ".": "./src/index.js"
    },
    "bin": {
      "eva-color": "./cli.js"
    },
    "files": [
      "src/",
      "cli.js",
      "README.md"
    ],
    "dependencies": {
      "culori": "^4.0.2"
    },
    "publishConfig": {
      "access": "public"
    }
  }
  ```
- [ ] **3.3** Migrer et améliorer `hex-to-oklch.cjs` → `src/index.js`
  ```javascript
  import { parse, oklch, formatHex } from 'culori';

  export function hexToOklch(hex) {
    const color = parse(hex);
    if (!color) return null;
    const oklchColor = oklch(color);
    if (!oklchColor) return null;
    const { l, c, h } = oklchColor;
    return {
      l: Math.round(l * 1000) / 10, // Percentage
      c: Math.round(c * 1000) / 1000,
      h: h !== undefined ? Math.round(h * 100) / 100 : 0,
      css: `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h !== undefined ? h.toFixed(2) : '0'})`
    };
  }

  export function oklchToHex({ l, c, h }) {
    return formatHex({ mode: 'oklch', l: l / 100, c, h });
  }

  export function generatePalette(baseColor, steps = 5) {
    // Génère une palette de couleurs
    // Implementation...
  }

  export function generateTheme(config) {
    // Génère un thème CSS à partir d'une config
    // Implementation...
  }
  ```
- [ ] **3.4** Créer `cli.js`
  ```javascript
  #!/usr/bin/env node
  import { hexToOklch, generatePalette } from './src/index.js';

  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'convert') {
    const hex = args[1];
    console.log(JSON.stringify(hexToOklch(hex), null, 2));
  } else if (command === 'palette') {
    const base = args[1];
    const steps = parseInt(args[2]) || 5;
    console.log(JSON.stringify(generatePalette(base, steps), null, 2));
  }
  ```
- [ ] **3.5** Créer `README.md` avec exemples CLI et programmatiques
- [ ] **3.6** Tester les fonctionnalités

### Phase 4 : Package `@eva/purge`

- [ ] **4.1** Créer la structure
  ```bash
  mkdir -p packages/eva-purge/src
  cd packages/eva-purge
  ```
- [ ] **4.2** Créer `package.json`
  ```json
  {
    "name": "@eva/purge",
    "version": "1.0.0",
    "description": "Intelligent CSS purging for EVA projects",
    "type": "commonjs",
    "main": "src/purge.js",
    "bin": {
      "eva-purge": "./cli.js"
    },
    "files": [
      "src/",
      "cli.js",
      "README.md"
    ],
    "dependencies": {
      "glob": "^12.0.0"
    },
    "publishConfig": {
      "access": "public"
    }
  }
  ```
- [ ] **4.3** Migrer et refactoriser `purge-css.cjs` → `src/purge.js`
  - [ ] Extraire la classe `CSSPurger` dans un module réutilisable
  - [ ] Ajouter support pour configuration externe
  - [ ] Améliorer les options de safelist
- [ ] **4.4** Créer système de configuration `eva.config.js`
  ```javascript
  // Exemple de config
  export default {
    purge: {
      content: ['docs/**/*.html', 'docs/**/*.vue', 'docs/**/*.md'],
      css: 'docs/.vuepress/styles/main.css',
      output: 'docs/.vuepress/styles/main-compressed.css',
      safelist: {
        standard: ['current-theme', 'all-grads'],
        deep: [/^theme-/],
        greedy: [/^brand-/, /^accent-/]
      }
    }
  };
  ```
- [ ] **4.5** Créer `cli.js`
  ```javascript
  #!/usr/bin/env node
  const { CSSPurger } = require('./src/purge.js');
  const fs = require('fs');
  const path = require('path');

  // Load config
  const configPath = path.join(process.cwd(), 'eva.config.js');
  let config = {};
  if (fs.existsSync(configPath)) {
    config = require(configPath).default || require(configPath);
  }

  const purger = new CSSPurger(config.purge);
  purger.purge();
  ```
- [ ] **4.6** Créer `README.md` avec documentation complète
- [ ] **4.7** Tester le purge sur différents projets

### Phase 5 : Package `@eva/mcp-server`

- [ ] **5.1** Créer la structure
  ```bash
  mkdir -p packages/eva-mcp-server/src
  cd packages/eva-mcp-server
  ```
- [ ] **5.2** Créer `package.json`
  ```json
  {
    "name": "@eva/mcp-server",
    "version": "1.0.0",
    "description": "MCP server for Figma to HTML with EVA CSS",
    "type": "module",
    "main": "src/server.js",
    "bin": {
      "eva-mcp": "./bin/start.js"
    },
    "files": [
      "src/",
      "bin/",
      "README.md"
    ],
    "dependencies": {
      "@modelcontextprotocol/sdk": "^0.5.0"
    },
    "publishConfig": {
      "access": "public"
    }
  }
  ```
- [ ] **5.3** Implémenter le serveur MCP
  - [ ] `src/server.js` - Serveur MCP principal
  - [ ] `src/figma-connector.js` - Connexion à l'API Figma
  - [ ] `src/html-generator.js` - Génération HTML avec classes EVA
  - [ ] `src/eva-mapper.js` - Mapping design tokens → EVA variables
- [ ] **5.4** Créer `bin/start.js`
  ```javascript
  #!/usr/bin/env node
  import { startServer } from '../src/server.js';
  startServer();
  ```
- [ ] **5.5** Créer documentation pour configuration Claude Desktop
- [ ] **5.6** Créer `README.md` avec guide complet

### Phase 6 : Package `eva-cli` (Optionnel)

- [ ] **6.1** Créer la structure
  ```bash
  mkdir -p packages/eva-cli/src
  cd packages/eva-cli
  ```
- [ ] **6.2** Créer CLI unifié qui orchestre tous les packages
  ```javascript
  // eva init, eva color, eva purge, eva figma, eva build
  ```
- [ ] **6.3** Ajouter interface interactive (inquirer.js)
- [ ] **6.4** Créer templates de projets
- [ ] **6.5** Documenter toutes les commandes

### Phase 7 : Exemples d'intégration

- [ ] **7.1** Créer exemple VuePress
  ```bash
  mkdir -p examples/vuepress
  ```
  - [ ] Setup complet avec `@eva/css`, `@eva/purge`, `@eva/colors`
  - [ ] Configuration optimale
  - [ ] README avec instructions
- [ ] **7.2** Créer exemple Vite
  ```bash
  mkdir -p examples/vite
  ```
  - [ ] Intégration avec Vite
  - [ ] Hot reload SCSS
- [ ] **7.3** Créer exemple Next.js
  ```bash
  mkdir -p examples/nextjs
  ```
  - [ ] Intégration avec Next.js App Router
  - [ ] Configuration CSS Modules

### Phase 8 : Documentation

- [ ] **8.1** Créer site de documentation (VitePress ou VuePress)
  ```bash
  mkdir -p docs
  ```
- [ ] **8.2** Pages principales
  - [ ] `index.md` - Landing page avec hero
  - [ ] `guide/getting-started.md`
  - [ ] `guide/installation.md`
  - [ ] `guide/css-framework.md`
  - [ ] `guide/color-system.md`
  - [ ] `guide/purge-optimization.md`
  - [ ] `guide/figma-workflow.md`
- [ ] **8.3** Documentation API
  - [ ] `api/css.md` - Toutes les variables et classes
  - [ ] `api/colors.md` - Fonctions et CLI
  - [ ] `api/purge.md` - Configuration et options
  - [ ] `api/mcp.md` - Endpoints et tools MCP
- [ ] **8.4** Exemples et tutoriels
  - [ ] Créer un thème custom
  - [ ] Intégrer EVA dans un projet existant
  - [ ] Workflow Figma → Production
- [ ] **8.5** Déployer la documentation (Netlify/Vercel)

### Phase 9 : Tests et Qualité

- [ ] **9.1** Setup testing
  - [ ] Vitest pour les tests unitaires
  - [ ] Tests pour `@eva/colors`
  - [ ] Tests pour `@eva/purge`
- [ ] **9.2** Linting et formatting
  - [ ] ESLint
  - [ ] Prettier
  - [ ] Stylelint pour SCSS
- [ ] **9.3** CI/CD
  - [ ] GitHub Actions pour tests
  - [ ] GitHub Actions pour publish npm
  - [ ] Versioning automatique (changeset)

### Phase 10 : Publication

- [ ] **10.1** Créer comptes npm si nécessaire
- [ ] **10.2** Configurer scope `@eva` sur npm
- [ ] **10.3** Tester la publication en mode dry-run
  ```bash
  pnpm -r publish --dry-run
  ```
- [ ] **10.4** Publier les packages
  ```bash
  pnpm -r publish
  ```
- [ ] **10.5** Créer releases GitHub avec changelogs
- [ ] **10.6** Annoncer la sortie
  - [ ] Twitter/X
  - [ ] Reddit (r/webdev, r/css)
  - [ ] Dev.to article

### Phase 11 : Migration du projet actuel

- [ ] **11.1** Dans le projet sandbox, installer les packages
  ```bash
  npm install @eva/css @eva/purge @eva/colors -D
  ```
- [ ] **11.2** Remplacer les imports locaux
  ```scss
  // Avant
  @import "framework/eva";

  // Après
  @use '@eva/css' with (
    $sizes: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128,
    $font-sizes: 12, 14, 16, 18, 20, 24, 32, 48,
    $build-class: true
  );
  ```
- [ ] **11.3** Mettre à jour les scripts
  ```json
  {
    "scripts": {
      "purge": "eva-purge",
      "color": "eva-color convert"
    }
  }
  ```
- [ ] **11.4** Supprimer les fichiers locaux du framework
- [ ] **11.5** Tester que tout fonctionne
- [ ] **11.6** Mettre à jour `CLAUDE.md`

---

## 🚀 Commandes rapides

```bash
# Setup initial du monorepo
git checkout -b feat/npm-packages
pnpm init
echo 'packages:\n  - "packages/*"\n  - "examples/*"' > pnpm-workspace.yaml

# Développement
pnpm -r build          # Build tous les packages
pnpm -r test           # Run tous les tests
pnpm -r dev            # Watch mode pour dev

# Publication
pnpm -r publish --dry-run   # Test
pnpm -r publish             # Publish réel
```

---

## 📚 Ressources utiles

- [pnpm workspaces](https://pnpm.io/workspaces)
- [Sass @use and @forward](https://sass-lang.com/documentation/at-rules/use)
- [npm scoped packages](https://docs.npmjs.com/cli/v9/using-npm/scope)
- [MCP SDK Documentation](https://modelcontextprotocol.io)
- [Changesets for versioning](https://github.com/changesets/changesets)

---

## 🎯 Ordre recommandé d'implémentation

1. **Phase 1** (Setup Monorepo) - 1h
2. **Phase 2** (`@eva/css`) - 4h
3. **Phase 3** (`@eva/colors`) - 2h
4. **Phase 4** (`@eva/purge`) - 3h
5. **Phase 7** (Exemples) - 2h
6. **Phase 8** (Documentation de base) - 4h
7. **Phase 10** (Publication) - 1h
8. **Phase 11** (Migration) - 1h
9. **Phase 5** (`@eva/mcp-server`) - 8h (plus complexe)
10. **Phase 6** (`eva-cli`) - 4h (optionnel)
11. **Phase 8** (Documentation complète) - 8h
12. **Phase 9** (Tests et CI/CD) - 4h

**Total estimé : 40-45 heures**

---

## 💡 Notes importantes

- Utiliser **pnpm** pour meilleure gestion du monorepo
- Préfixer tous les packages avec `@eva/` sauf le CLI
- Publier en `public` access pour packages scoped
- Garder une compatibilité ESM/CommonJS selon les packages
- Versionner de manière indépendante chaque package
- Utiliser changesets pour gérer les versions et changelogs

---

## ✅ Success Criteria

Le projet sera considéré comme réussi quand :

- [ ] Tous les packages sont publiés sur npm
- [ ] Documentation complète et déployée
- [ ] Au moins 2 exemples fonctionnels
- [ ] Le projet sandbox utilise les packages npm
- [ ] Tests passent en CI/CD
- [ ] README principal avec badges et démo

---

**Bonne chance pour l'implémentation ! 🚀**
