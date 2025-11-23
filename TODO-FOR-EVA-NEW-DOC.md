# TODO: Améliorer la documentation EVA CSS v2

Ce document liste les améliorations à apporter à la documentation officielle d'EVA CSS pour clarifier l'utilisation de la configuration JSON.

## 🔴 Problèmes identifiés

### 1. Confusion entre "builder le framework" et "utiliser le framework"

**Problème actuel:**
- La doc dit "Configuration is automatically loaded from eva.config.cjs"
- Mais cela ne fonctionne que pour builder EVA CSS lui-même (le package)
- Les utilisateurs ne savent pas comment utiliser le JSON dans LEURS projets

**Impact:**
- Les utilisateurs pensent que `@use 'eva-css-fluid'` charge automatiquement `eva.config.cjs`
- Ils sont bloqués quand ça ne fonctionne pas
- Ils doivent revenir à la syntaxe `@use ... with ()` sans comprendre pourquoi

### 2. Manque de guide d'intégration pour projets utilisateurs

**Problème actuel:**
- Le script `scripts/build-with-config.cjs` existe mais est interne au package
- Aucune doc pour créer un script similaire dans son projet
- Aucun exemple de workflow complet

### 3. Documentation README.md imprécise

**Section problématique (ligne ~150):**
```markdown
Then simply import EVA CSS:

```scss
@use 'eva-css-fluid';
```

And build with the integrated script:

```bash
npm run build
# Configuration is automatically loaded from eva.config.cjs or package.json
```
```

**Pourquoi c'est trompeur:**
- `npm run build` fait référence au build du package EVA, pas au projet utilisateur
- Les utilisateurs n'ont pas ce script dans leur projet
- Aucune explication pour l'adapter

---

## ✅ Solutions proposées

### 1. Clarifier les deux workflows dans le README

Ajouter une section "Configuration Workflows" avec deux options claires:

#### Option A: SCSS Variables (Simple, Recommandé pour débuter)

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 32, 64, 128),
  $font-sizes: (14, 16, 20, 24, 32),
  $build-class: true
);
```

**Avantages:**
- ✅ Fonctionne immédiatement avec `npx sass`
- ✅ Pas de script additionnel nécessaire
- ✅ Compatible watch mode natif

**Inconvénients:**
- ⚠️ Configuration dupliquée si plusieurs fichiers SCSS
- ⚠️ SCSS plus verbeux

#### Option B: JSON Config (Avancé, Nécessite un script)

```javascript
// eva.config.cjs
module.exports = {
  sizes: [4, 8, 16, 32, 64, 128],
  fontSizes: [14, 16, 20, 24, 32],
  buildClass: true
};
```

```scss
// styles/main.scss
@use 'eva-css-fluid';
```

**Avantages:**
- ✅ Configuration centralisée et réutilisable
- ✅ SCSS plus propre
- ✅ Validation avec `npx eva-css validate`

**Nécessite:**
- 📝 Script de build personnalisé (voir exemple ci-dessous)
- 📝 Adapter vos npm scripts

### 2. Fournir un template de script build

Créer un fichier `examples/build-with-config.js` dans le repo EVA avec:

```javascript
#!/usr/bin/env node
/**
 * EVA CSS Build Script - User Project Template
 *
 * Copy this file to your project's scripts/ folder
 * and adapt the paths to your needs.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function loadConfig() {
  const configPath = path.join(process.cwd(), 'eva.config.cjs');
  if (!fs.existsSync(configPath)) {
    console.log('⚠️  No eva.config.cjs found');
    return null;
  }
  delete require.cache[require.resolve(configPath)];
  return require(configPath);
}

function generateScssWithParams(config) {
  const params = [];
  if (config.sizes) params.push(`$sizes: (${config.sizes.join(', ')})`);
  if (config.fontSizes) params.push(`$font-sizes: (${config.fontSizes.join(', ')})`);
  if (typeof config.buildClass === 'boolean') params.push(`$build-class: ${config.buildClass}`);
  if (typeof config.pxRemSuffix === 'boolean') params.push(`$px-rem-suffix: ${config.pxRemSuffix}`);
  return params.join(',\n  ');
}

function buildCss(inputScss, outputCss, config) {
  const inputDir = path.dirname(inputScss);
  const inputBase = path.basename(inputScss, '.scss');
  const tempPath = path.join(inputDir, `.${inputBase}-temp.scss`);

  try {
    const content = fs.readFileSync(inputScss, 'utf8');
    let output = content;

    if (config) {
      const params = generateScssWithParams(config);
      output = content.replace(
        /@use ['"]eva-css-fluid['"];?/,
        `@use 'eva-css-fluid' with (\n  ${params}\n);`
      );
      console.log('✅ Config injected from eva.config.cjs');
    }

    fs.writeFileSync(tempPath, output);
    execSync(`npx sass --load-path=node_modules ${tempPath}:${outputCss}`, { stdio: 'inherit' });
    console.log('✅ CSS compiled');
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

// Usage: node build-with-config.js <input.scss> <output.css>
const [,, input, output] = process.argv;
if (!input || !output) {
  console.log('Usage: node build-with-config.js <input.scss> <output.css>');
  process.exit(1);
}

const config = loadConfig();
buildCss(input, output, config);
```

**Documentation associée:**

```markdown
### Using JSON Config in Your Project

1. **Copy the build script template:**
   ```bash
   curl -o scripts/build-with-config.js https://raw.githubusercontent.com/nkdeus/eva/main/examples/build-with-config.js
   chmod +x scripts/build-with-config.js
   ```

2. **Add npm script to your package.json:**
   ```json
   {
     "scripts": {
       "build-css": "node scripts/build-with-config.js styles/main.scss styles/main.css"
     }
   }
   ```

3. **Create eva.config.cjs:**
   ```javascript
   module.exports = {
     sizes: [4, 8, 16, 32, 64],
     fontSizes: [16, 24, 32],
     buildClass: true
   };
   ```

4. **Simplify your SCSS:**
   ```scss
   @use 'eva-css-fluid';
   ```

5. **Build:**
   ```bash
   npm run build-css
   ```
```

### 3. Ajouter une section "FAQ" au README

```markdown
## FAQ - Configuration

### Q: Pourquoi @use 'eva-css-fluid' ne charge pas automatiquement eva.config.cjs?

**A:** SCSS ne peut pas exécuter JavaScript pendant la compilation. Le fichier `eva.config.cjs`
doit être lu AVANT la compilation SCSS et transformé en variables SCSS.

**Solutions:**
- **Simple:** Utilisez `@use ... with ()` directement dans votre SCSS
- **Avancé:** Créez un script de build qui injecte la config (voir exemples ci-dessus)

### Q: Quelle différence entre "JSON config" et "SCSS variables"?

**A:** Le CSS généré est identique. C'est uniquement une question d'organisation:

| Méthode | Configuration | Compilation |
|---------|--------------|-------------|
| SCSS Variables | Dans le fichier SCSS | `npx sass styles.scss` |
| JSON Config | Dans eva.config.cjs | Script personnalisé requis |

Choisissez selon votre workflow:
- **Projets simples:** SCSS variables
- **Projets complexes avec multiples builds:** JSON config

### Q: Puis-je utiliser le script scripts/build-with-config.cjs du package?

**A:** Ce script est conçu pour builder EVA CSS lui-même (le framework), pas votre projet.
Vous devez créer votre propre script en vous inspirant de l'exemple fourni.
```

### 4. Mettre à jour la section "Quick Start"

**Actuel (trompeur):**
```markdown
Then simply import EVA CSS:

```scss
@use 'eva-css-fluid';
```

And build with the integrated script:

```bash
npm run build
# Configuration is automatically loaded from eva.config.cjs or package.json
```
```

**Proposé (clair):**
```markdown
### Import EVA CSS in your SCSS

**Option 1: With inline configuration (recommended for beginners)**

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 32, 64, 128),
  $font-sizes: (14, 16, 20, 24, 32),
  $build-class: true
);
```

Compile with:
```bash
npx sass --load-path=node_modules styles/main.scss:styles/main.css
```

**Option 2: With JSON config file (advanced)**

Create `eva.config.cjs`:
```javascript
module.exports = {
  sizes: [4, 8, 16, 32, 64, 128],
  fontSizes: [14, 16, 20, 24, 32],
  buildClass: true
};
```

Then in your SCSS:
```scss
@use 'eva-css-fluid';
```

⚠️ **Important:** This requires a custom build script. See [JSON Config Setup](#json-config-setup) for details.

Validate your config:
```bash
npx eva-css validate
```
```

### 5. Créer une page de documentation dédiée

Créer `docs/JSON-CONFIG.md` avec:

- ✅ Explication du système de config loader
- ✅ Pourquoi SCSS ne peut pas charger le JSON directement
- ✅ Template de script complet et commenté
- ✅ Exemples pour différents cas d'usage:
  - Projet simple (un seul fichier SCSS)
  - Projet avec multiples fichiers SCSS
  - Mono-repo avec plusieurs sous-projets
- ✅ Intégration avec les bundlers (Vite, Webpack, etc.)
- ✅ Troubleshooting courant

### 6. Améliorer le README principal

**Section à ajouter après "Installation":**

```markdown
## 🚦 Which Configuration Method Should I Use?

### For Quick Start / Learning
👉 **Use SCSS Variables** - Everything in one file, works immediately

### For Production Projects
Choose based on your needs:

| You want... | Use... |
|-------------|--------|
| Simplicity, no build scripts | SCSS Variables |
| Centralized config, multiple SCSS files | JSON Config (requires script) |
| Watch mode without complexity | SCSS Variables |
| Config validation, better DX | JSON Config (requires script) |

💡 **You can start with SCSS variables and migrate to JSON later - the generated CSS is identical!**
```

---

## 📋 Checklist de modifications

### README.md principal

- [ ] Remplacer la section "Using SCSS with Custom Configuration"
- [ ] Ajouter la section "Which Configuration Method Should I Use?"
- [ ] Clarifier que `npm run build` = build du package, pas du projet utilisateur
- [ ] Ajouter FAQ sur la config
- [ ] Ajouter note importante sur Option 2 (JSON nécessite script)

### Nouveaux fichiers à créer

- [ ] `examples/build-with-config.js` - Template de script utilisateur
- [ ] `docs/JSON-CONFIG.md` - Guide détaillé JSON config
- [ ] `docs/WORKFLOWS.md` - Comparaison des workflows
- [ ] `examples/projects/` - Exemples de projets complets
  - [ ] `simple/` - Avec SCSS variables
  - [ ] `json-config/` - Avec JSON config
  - [ ] `monorepo/` - Multi-projets

### Package.json

- [ ] Ajouter dans `"scripts"` un exemple pour les utilisateurs:
  ```json
  "scripts": {
    "example:simple": "sass examples/simple/styles.scss examples/simple/output.css",
    "example:json": "node examples/build-with-config.js examples/json-config/styles.scss examples/json-config/output.css"
  }
  ```

### Tests

- [ ] Ajouter tests pour le template build script
- [ ] Vérifier que les exemples compilent correctement
- [ ] Tester avec différentes versions de Sass

---

## 🎯 Priorités

### Critique (P0) - À faire immédiatement

1. ✅ Clarifier dans README que JSON config nécessite un script
2. ✅ Ajouter warning dans section "JSON Configuration"
3. ✅ Fournir template de script fonctionnel

### Important (P1) - Pour prochaine release

1. ✅ Créer documentation dédiée JSON-CONFIG.md
2. ✅ Ajouter exemples de projets complets
3. ✅ FAQ sur les différentes méthodes

### Nice to have (P2) - Améliorations futures

1. ⭐ CLI tool: `npx eva-css init` qui génère le setup complet
2. ⭐ Plugins pour bundlers (Vite, Webpack)
3. ⭐ Templates interactifs avec choix du workflow

---

## 💡 Suggestions supplémentaires

### 1. CLI amélioré

Créer `npx eva-css setup` qui demande:
```
? How do you want to configure EVA CSS?
  ❯ SCSS Variables (simple, recommended for beginners)
    JSON Config (advanced, requires build script)

? Generate build script template? (Y/n)

✅ Created eva.config.cjs
✅ Created scripts/build-with-config.js
✅ Updated package.json scripts

Next steps:
  1. Edit eva.config.cjs with your design sizes
  2. Run: npm run build-css
```

### 2. VSCode Extension

Créer extension qui:
- Valide `eva.config.cjs` en temps réel
- Auto-complete pour les options
- Preview des tailles générées
- Quick actions pour générer le build script

### 3. Documentation interactive

Site avec:
- Comparateur side-by-side des deux méthodes
- Playground pour tester la config
- Générateur de script personnalisé
- Vidéos de setup

---

## 📝 Notes pour la migration

Pour les utilisateurs existants qui ont suivi la doc v2 actuelle:

```markdown
## Migration Notice - v2.0.x to v2.1.0

If you followed the v2.0.x documentation expecting JSON config to work automatically:

### What changed
- **v2.0.x docs** implied JSON config worked out of the box
- **v2.1.0 docs** clarify you need a build script for JSON config

### Your options

**Option 1: Keep using SCSS variables (recommended for simplicity)**
- No changes needed
- Add config directly in your SCSS with `@use ... with ()`

**Option 2: Use JSON config (requires one-time setup)**
- Copy the build script template
- Update your npm scripts
- Keep your eva.config.cjs

Both generate identical CSS. Choose based on your workflow preference.
```

---

## ✅ Résumé des actions

| Action | Fichier | Impact |
|--------|---------|--------|
| Clarifier README | `README.md` | Évite confusion utilisateurs |
| Template script | `examples/build-with-config.js` | Solution ready-to-use |
| Doc détaillée | `docs/JSON-CONFIG.md` | Guide complet |
| FAQ | `README.md` | Répond aux questions courantes |
| Exemples | `examples/projects/` | Cas d'usage concrets |

**Temps estimé:** 4-6 heures pour tout implémenter
**Bénéfice:** Réduction drastique de la confusion et des questions récurrentes

---

*Document créé suite à l'expérience utilisateur avec EVA CSS v2.0.0*
*Basé sur les difficultés rencontrées lors de l'intégration de la config JSON*
