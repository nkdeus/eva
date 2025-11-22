# Migration vers les Packages npm EVA CSS

Ce projet utilise maintenant les packages npm officiels EVA CSS.

## ⚠️ Changements importants

### Scripts obsolètes

Les anciens scripts internes ont été remplacés :

**❌ Ancien (obsolète):**
```bash
node scripts/hex-to-oklch.js #ff0000
node scripts/purge-css.js
```

**✅ Nouveau (à utiliser):**
```bash
npx eva-color convert "#ff0000"
npm run purge
```

### Imports SCSS obsolètes

Les anciens imports du framework interne ne fonctionnent plus :

**❌ Ancien (obsolète):**
```scss
@import "../../../styles/framework/eva";
@import "../../../styles/framework/colors";
@import "../../../styles/framework/theme";
```

**✅ Nouveau (à utiliser):**
```scss
@use 'eva-css-fluid/src' as * with (
  $sizes: (4, 8, 16, 32, 64),
  $font-sizes: (16, 24, 36),
  $build-class: true,
  $px-rem-suffix: false,
  $name-by-size: true,
  $custom-class: false
);
```

## 📦 Packages utilisés

- **eva-css-fluid@1.0.4** - Framework SCSS principal
- **eva-css-purge@1.0.4** - Optimisation CSS
- **eva-colors@1.0.4** - Conversion de couleurs OKLCH

## 🔧 Nouvelles commandes

### Conversion de couleurs
```bash
# Convertir hex → OKLCH
npx eva-color convert "#ff0000"

# Générer palette
npx eva-color palette "#ff0000" 7

# Générer thème complet
npx eva-color theme theme-config.json

# Vérifier contraste
npx eva-color contrast "#ffffff" "#000000"
```

### Optimisation CSS
```bash
# Purger CSS
npm run purge

# Build complet (compile + purge)
npm run build
```

## 📚 Documentation complète

Voir **CLAUDE.md** pour la documentation complète mise à jour.

**Note:** Le fichier README.md dans ce dossier contient d'anciennes références et sera mis à jour prochainement.
