# Guide: Build EVA CSS avec configuration JSON

Ce guide explique comment utiliser le système de configuration JSON pour EVA CSS v2.

## Vue d'ensemble

Bien que EVA CSS v2.0.0 ne charge pas automatiquement les fichiers `eva.config.cjs` pendant la compilation SCSS, nous avons créé un **script de build personnalisé** qui :

1. ✅ Charge `eva.config.cjs`
2. ✅ Injecte la config dans le SCSS
3. ✅ Compile le CSS avec toutes les tailles configurées

## Configuration

### Fichier: `eva.config.cjs`

```javascript
module.exports = {
  // Tailles extraites de votre design
  sizes: [4, 8, 12, 16, 20, 32, 34, 52, 84, 136, 156, 220, 356, 576, 712],

  // Tailles de police
  fontSizes: [10, 12, 16, 18, 24, 36, 52, 72],

  // Mode de build
  buildClass: true,        // true = classes utilitaires, false = variables seulement
  pxRemSuffix: true,       // Ajouter les valeurs px/rem pour debug
  nameBySize: true,        // Utiliser les valeurs de taille dans les noms
  customClass: false       // Mode classe personnalisée

  // Note: theme, purge non encore supportés par le script
};
```

### Fichier SCSS simplifié

```scss
// styles/main.scss
@use 'eva-css-fluid';

// La configuration est injectée automatiquement par le script!
```

## Commandes de build

### Avec JSON config (Recommandé)

```bash
# Build unique avec config JSON
npm run build-css-json

# Build + Purge
npm run build-json
```

### Sans JSON config (Traditionnel)

```bash
# Utilise la syntaxe @use ... with () dans le SCSS
npm run build-css

# Build + Purge
npm run build
```

## Comment ça marche

Le script `scripts/build-with-config.js` :

1. Charge `eva.config.cjs` depuis le répertoire courant
2. Lit votre fichier SCSS principal
3. Remplace `@use 'eva-css-fluid';` par :
   ```scss
   @use 'eva-css-fluid' with (
     $sizes: (4, 8, 12, 16, ...),
     $font-sizes: (10, 12, 16, ...),
     $build-class: true,
     ...
   );
   ```
4. Crée un fichier temporaire avec la config injectée
5. Compile le SCSS
6. Nettoie les fichiers temporaires

## Avantages du système JSON

### ✅ Avant (SCSS)
```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 12, 16, 20, 32, 34, 52, 84, 136, 156, 220, 356, 576, 712),
  $font-sizes: (10, 12, 16, 18, 24, 36, 52, 72),
  $build-class: true,
  $px-rem-suffix: true,
  $name-by-size: true,
  $custom-class: false
);
```

### ✅ Maintenant (JSON + SCSS simplifié)

**eva.config.cjs:**
```javascript
module.exports = {
  sizes: [4, 8, 12, 16, 20, 32, 34, 52, 84, 136, 156, 220, 356, 576, 712],
  fontSizes: [10, 12, 16, 18, 24, 36, 52, 72],
  buildClass: true,
  pxRemSuffix: true
};
```

**styles/main.scss:**
```scss
@use 'eva-css-fluid';
```

## Validation de la config

```bash
# Vérifier que votre config est valide
npx eva-css validate

# Affiche:
# ✅ Configuration is valid!
# Configuration summary:
#   Source: eva.config.cjs
#   Sizes: 15 values
#   Font sizes: 8 values
#   Build mode: utility classes
```

## Workflow complet

1. **Créer/Modifier** `eva.config.cjs` avec vos tailles
2. **Simplifier** le SCSS: `@use 'eva-css-fluid';`
3. **Build**: `npm run build-css-json`
4. **Vérifier**: Les classes sont générées avec vos tailles!

## Projets multiples

Pour les sous-projets (ex: `projects/mon-projet/`):

1. Créer `projects/mon-projet/eva.config.cjs`
2. Build: `node scripts/build-with-config.js projects/mon-projet/styles/mon-projet.scss projects/mon-projet/render/mon-projet.css`

Le script charge automatiquement le `eva.config.cjs` du répertoire courant.

## Limitations

- ⚠️ Le script ne supporte pas encore:
  - Génération automatique des thèmes depuis `theme.colors`
  - Configuration `purge` automatique
  - Watch mode avec reload auto de la config

- Pour le watch mode, utilisez toujours `npm run watch` qui utilise la syntaxe SCSS traditionnelle

## Comparaison des méthodes

| Méthode | Config | SCSS | Avantages |
|---------|--------|------|-----------|
| **Traditionnelle** | Dans SCSS | `@use ... with ()` | Watch mode natif |
| **JSON** | `eva.config.cjs` | `@use 'eva-css-fluid'` | Config centralisée, SCSS propre |

## Résultat

Avec les deux méthodes, le CSS généré est **identique**. Choisissez selon votre workflow :

- **JSON**: Pour une meilleure organisation et des SCSS plus propres
- **Traditionnel**: Pour le watch mode et la compatibilité maximale

---

🎉 **Félicitations!** Vous utilisez maintenant EVA CSS v2 avec configuration JSON!
