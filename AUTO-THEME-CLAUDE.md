# AUTO-THEME-CLAUDE.md

## Vue d'ensemble

Ce document détaille le développement de l'**Auto Theme Generator** pour EVA CSS, un outil permettant de générer automatiquement des thèmes complets à partir d'images uploadées.

## Fonctionnalités principales

### 1. Upload et analyse d'images
- **Drag & Drop interface** avec zone de dépôt intuitive
- **Support multi-formats** : JPG, PNG, GIF, WebP
- **Extraction automatique** de 8 couleurs dominantes via ColorThief
- **Prévisualisation** immédiate de l'image

### 2. Génération automatique de thème
- **Algorithme intelligent** pour l'assignation des couleurs :
  - **BRAND** : Couleur avec la chroma la plus élevée (plus vibrante)
  - **ACCENT** : Deuxième couleur la plus vibrante
  - **EXTRA** : Équilibre entre dominance et contraste de teinte
  - **DARK/LIGHT** : Basés sur la teinte de la brand avec valeurs EVA CSS par défaut

### 3. Conversion OKLCH scientifique
- **Conversion embarquée** RGB → OKLCH (sans dépendance externe)
- **Précision scientifique** avec matrices de transformation sRGB → OKLab → OKLCH
- **Gestion des espaces colorimétriques** pour une fidélité maximale

### 4. Interface de personnalisation
- **Sliders en temps réel** pour ajuster Lightness et Chroma
- **Sélection manuelle** des couleurs via modal
- **Zones de couleur agrandies** (64x64px) pour une meilleure visibilité
- **Espacement optimisé** (gaps de 4px) pour une interface compacte

### 5. Génération CSS
- **Export CSS** prêt pour EVA CSS
- **Variables CSS** directement injectées dans le document
- **Copie en un clic** du thème généré
- **Reset** facile vers les valeurs par défaut

## Architecture technique

### Structure du fichier
```
auto-theme.html
├── Conversion OKLCH embarquée (script head)
├── Interface HTML (drop zone, preview, controls)
├── Logique JavaScript (extraction, assignation, UI)
└── Styles CSS (sliders, modal, responsive)
```

### Algorithme d'assignation automatique

```javascript
// 1. Conversion de toutes les couleurs en OKLCH
const colorsWithOklch = extractedColors.map(color => ({
  ...color,
  oklch: hexToOklchWrapper(color.hex),
  dominance: index
}));

// 2. BRAND : Chroma maximale
const brandColor = colorsWithOklch
  .sort((a, b) => b.oklch.c - a.oklch.c)[0];

// 3. ACCENT : Deuxième chroma maximale
const accentColor = colorsWithOklch
  .filter(c => c !== brandColor)
  .sort((a, b) => b.oklch.c - a.oklch.c)[0];

// 4. EXTRA : Équilibre dominance/contraste
const extraColor = colorsWithOklch
  .filter(c => c !== brandColor && c !== accentColor)
  .sort((a, b) => {
    const aScore = a.dominance - (Math.abs(a.oklch.h - brandColor.oklch.h) / 20);
    const bScore = b.dominance - (Math.abs(b.oklch.h - brandColor.oklch.h) / 20);
    return aScore - bScore;
  })[0];
```

### Gestion des couleurs dark/light

```javascript
// Utilisation des variables EVA CSS natives
document.body.style.setProperty('--dark-lightness', 'var(--current-darkness)');
document.body.style.setProperty('--dark-hue', 'var(--brand-hue)');
document.body.style.setProperty('--light-lightness', 'var(--current-lightness)');
document.body.style.setProperty('--light-hue', 'var(--brand-hue)');
```

## Optimisations de performance

### 1. Séquencement des tâches
```javascript
// Éviter les blocages UI
setTimeout(() => {
  extractColors();
}, 100);

setTimeout(() => {
  autoAssignThemeColors();
}, 200);
```

### 2. Suppression des console.log
- Tous les logs remplacés par des commentaires
- Amélioration significative des performances d'upload

### 3. Manipulation directe du DOM
```javascript
// Injection directe des variables CSS
document.body.style.setProperty(`--${varName}-hue`, oklch.h);
document.body.style.setProperty(`--${varName}-chroma`, oklch.c);
document.body.style.setProperty(`--${varName}-lightness`, `${oklch.l}%`);
```

## Interface utilisateur

### Sliders personnalisés
- **Apparence native supprimée** avec `-webkit-appearance: none`
- **Barre fine** (4px) avec gradient `light → dark`
- **Boutons larges** (32px) pour une manipulation facile
- **Effets hover** avec scale et couleurs inversées

### Modal de sélection
- **Overlay avec blur** pour un effet moderne
- **Bouton de fermeture** stylisé en haut à droite
- **Responsive** avec scroll vertical si nécessaire

### Zones de couleur
- **Taille agrandie** (64x64px) pour une meilleure visibilité
- **Bordures et transitions** pour un feedback visuel
- **Cursor pointer** pour indiquer l'interactivité

## Workflow d'utilisation

1. **Upload** : Glisser-déposer ou cliquer pour sélectionner une image
2. **Analyse** : Extraction automatique des couleurs dominantes
3. **Assignation** : Génération automatique du thème EVA CSS
4. **Personnalisation** : Ajustement via sliders ou sélection manuelle
5. **Export** : Copie du CSS généré pour utilisation dans EVA CSS

## Compatibilité

### Navigateurs supportés
- Chrome/Edge (webkit sliders)
- Firefox (moz sliders)
- Safari (webkit sliders)

### Formats d'images
- JPG/JPEG
- PNG
- GIF
- WebP

## Intégration EVA CSS

### Variables générées
```css
.theme-auto {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;
  
  --accent-lightness: 51.7%;
  --accent-chroma: 0.293;
  --accent-hue: 289.66;
  
  --extra-lightness: 91.5%;
  --extra-chroma: 0.191;
  --extra-hue: 101.03;
  
  --dark-lightness: var(--current-darkness);
  --dark-chroma: 0.05;
  --dark-hue: var(--brand-hue);
  
  --light-lightness: var(--current-lightness);
  --light-chroma: 0.01;
  --light-hue: var(--brand-hue);
}
```

### Préservation du theme toggle
- Les variables `--current-darkness` et `--current-lightness` ne sont pas modifiées
- Garantit le bon fonctionnement du toggle dark/light mode
- Utilise l'approche EVA CSS native pour la gestion des thèmes

## Améliorations futures possibles

1. **Analyse avancée** : Détection automatique du type d'image (sombre/claire)
2. **Présets** : Sauvegarde et chargement de thèmes favoris
3. **Export formats** : SCSS, JSON, CSS custom properties
4. **Accessibilité** : Vérification automatique des contrastes
5. **Batch processing** : Traitement de plusieurs images simultanément

## Conclusion

L'Auto Theme Generator représente une solution complète pour la génération automatique de thèmes EVA CSS. Il combine une analyse colorimétrique précise, une interface utilisateur intuitive et une intégration parfaite avec le framework EVA CSS, permettant aux utilisateurs de créer des thèmes cohérents et professionnels en quelques clics.