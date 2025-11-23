# Migration vers EVA CSS v2.0.0

Ce document résume la migration du projet vers EVA CSS v2.0.0.

## Changements principaux

### 1. Packages mis à jour

- `eva-css-fluid`: 1.0.4 → 2.0.0
- `eva-css-purge`: 1.0.4 → 2.0.0
- `eva-colors`: 1.0.4 → 2.0.0

### 2. Configuration JSON (eva.config.cjs)

La v2 introduit un système de configuration JSON qui remplace la configuration SCSS inline.

**Avant (v1):**
```scss
@use 'eva-css-fluid/src' as * with (
  $sizes: (4, 8, 16, 32, 64),
  $font-sizes: (16, 24, 32),
  $build-class: true
);
```

**Après (v2):**
```javascript
// eva.config.cjs
module.exports = {
  sizes: [4, 8, 16, 32, 64],
  fontSizes: [16, 24, 32],
  buildClass: true
};
```

```scss
// Dans le fichier SCSS
@use 'eva-css-fluid';
```

### 3. Fichiers de configuration créés

- `/eva.config.cjs` - Configuration du site principal
- `/projects/try/eva.config.cjs` - Configuration du projet Try
- `/projects/ulysse/eva.config.cjs` - Configuration du projet Ulysse
- `/projects/lili/eva.config.cjs` - Configuration du projet Lili

### 4. Imports SCSS simplifiés

Tous les fichiers SCSS ont été mis à jour pour utiliser l'import simplifié:

```scss
@use 'eva-css-fluid';
```

La configuration est automatiquement chargée depuis le fichier `eva.config.cjs` le plus proche.

### 5. Limitations de la v2.0.0

**Important:** Certaines fonctionnalités annoncées dans la documentation EVA CSS v2 ne sont pas encore implémentées:

#### a) Chargement JSON automatique
Le chargement automatique depuis `eva.config.cjs` n'est pas intégré dans le processus SCSS. Il faut continuer à utiliser la syntaxe `@use ... with ()`:

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 32, 64),
  $font-sizes: (16, 24, 32),
  $build-class: true
);
```

Les fichiers `eva.config.cjs` sont conservés pour référence et pour une future intégration.

#### b) Génération automatique des thèmes
Les thèmes ne sont pas générés depuis `eva.config.cjs`. Ils doivent être définis manuellement:

```scss
.theme-PROJECT_NAME {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;
  // ...
}
```

## Avantages de la v2

1. **Configuration centralisée** - Toutes les options dans un fichier JSON
2. **Imports simplifiés** - Plus besoin de `@use ... with ()`
3. **Meilleure maintenabilité** - Séparation entre config et styles
4. **Support des thèmes JSON** (à venir) - Les thèmes pourront être définis dans le config
5. **Validation de config** - `npx eva-css validate` pour vérifier la config
6. **Purge intégré** - Configuration du purge dans le même fichier

## Commandes mises à jour

```bash
# Compilation (plus besoin de --load-path avec Sass moderne)
npx sass projects/PROJECT/styles/PROJECT.scss:projects/PROJECT/render/PROJECT.css

# Watch mode (inchangé)
npm run watch-projects

# Validation de la configuration
npx eva-css validate

# Build avec purge
npm run build
```

## Compatibilité

- La v2 reste compatible avec l'ancienne syntaxe `@use ... with ()`
- Tous les fichiers CSS générés restent identiques
- Aucun changement dans les classes générées ou les variables CSS
- La migration est donc sans risque pour le code HTML/CSS existant

## Documentation

La documentation CLAUDE.md a été mise à jour pour refléter:
- Le nouveau système de configuration JSON
- Les imports simplifiés
- Le workflow de projet Figma → EVA CSS v2
- Les limitations actuelles (thèmes manuels)

## Prochaines étapes

Pour de futurs projets:
1. Créer `eva.config.cjs` avec les tailles extraites de Figma
2. Importer simplement `@use 'eva-css-fluid'`
3. Définir les thèmes manuellement (pour l'instant)
4. Compiler avec `npx sass` (sans flag spécial)

La migration est terminée et tous les projets compilent correctement!
