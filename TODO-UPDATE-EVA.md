# TODO — Déprécier le workflow JSON dans les packages EVA CSS

> À exécuter dans le repo qui gère les packages npm (`eva-css-fluid`, `eva-colors`, `eva-css-purge`).

## Contexte

Le site **eva-css.xyz** (`github.com/nkdeus/eva`) bascule en **SCSS-only** : config via `@use 'eva-css-fluid' with (...)`, plus de `eva.config.cjs`. Raisons :

- Le CSS généré est strictement identique entre les deux workflows.
- Le workflow JSON impose un script de build maison (`build-with-config.js`) et duplique la config.
- En pratique, personne n'utilise les commandes `eva-css init/setup/validate/generate`.
- La validation Sass remplace `eva-css validate` (compile = valide).

**Objectif** : déprécier le workflow JSON dans les packages, sans le supprimer brutalement (utilisateurs externes potentiels).

## Packages concernés

- `eva-css-fluid` (principal — contient le CLI `eva-css` et le loader JSON)
- `eva-colors` (à conserver tel quel, indépendant)
- `eva-css-purge` (à conserver tel quel, indépendant)

## Actions — `eva-css-fluid`

### 1. Marquer le CLI JSON comme déprécié (sans le casser)

Au lancement de `npx eva-css init|setup|validate|generate`, afficher en tête du stdout :

```
⚠️  DEPRECATED: Le workflow JSON sera retiré en v3.0.
   Migrez vers la config SCSS directe :
     @use 'eva-css-fluid' with ($sizes: (...), $font-sizes: (...));
   Voir : https://eva-css.xyz/doc/index.html
```

Pas d'`exit 1`, juste le warning. Les commandes continuent de fonctionner.

### 2. README du package

- Encart "Deprecation notice" en haut du README, avant tout exemple.
- La section "JSON Configuration" passe sous un titre `## JSON Configuration [DEPRECATED]`.
- Le workflow SCSS (`@use ... with (...)`) devient le **seul** présenté en intro / quick-start.

### 3. Préparer la suppression v3.0

Créer une issue de tracking "v3.0 — Remove JSON workflow" listant :

À retirer en v3.0.0 :
- Commandes CLI : `init`, `setup`, `validate`, `generate`.
- Loader `eva.config.cjs` côté package.
- Schéma de validation JSON associé.
- Toute la doc JSON dans le README.
- `build-with-config.js` exemple (s'il est packagé).

Ce qui reste en v3.0 :
- `@use 'eva-css-fluid' with (...)` (workflow unique).
- Variables SCSS : `$sizes`, `$font-sizes`, `$build-class`, `$px-rem-suffix`, `$name-by-size`, `$custom-class`.
- Système de thèmes via classes CSS (`.theme-NAME`).

### 4. Versions

- **v2.x** (prochaine release) : ajouter le warning de dépréciation + entrée CHANGELOG `Deprecated`.
- **v3.0.0** : suppression effective + entrée CHANGELOG `Breaking changes` + section migration.

### 5. CHANGELOG

Ajouter sous `[Unreleased]` ou la prochaine 2.x :

```
### Deprecated
- JSON config workflow (`eva.config.cjs`, CLI commands `init|setup|validate|generate`,
  custom build script). Will be removed in v3.0.0.
  Migrate to direct SCSS config: `@use 'eva-css-fluid' with (...)`.
  See https://eva-css.xyz/doc/index.html for the SCSS-only reference.
```

## Actions — `eva-colors` et `eva-css-purge`

Aucune. Ces packages sont indépendants du workflow de config et restent inchangés.

## Actions — `eva-css.xyz` (site)

Déjà fait dans `nkdeus/eva` (commit dédié). Sert de **référence** pour la migration utilisateur.

## Vérification

- [ ] `npx eva-css init` affiche le warning de dépréciation.
- [ ] `npx eva-css setup` idem.
- [ ] `npx eva-css validate` idem.
- [ ] `npx eva-css generate` idem.
- [ ] README du package montre le warning et le chemin de migration en tête.
- [ ] CHANGELOG mentionne la dépréciation.
- [ ] Issue v3.0 ouverte avec checklist de suppression.
- [ ] Tests existants passent (le warning n'affecte pas la sortie machine-readable).
