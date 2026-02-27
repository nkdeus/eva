# EVA CSS - Auto Theme Generator

Ce document explique le fonctionnement du générateur automatique de thèmes EVA CSS à partir d'une image.

## Vue d'ensemble

L'Auto Theme Generator permet de :
1. **Extraire les couleurs dominantes** d'une image uploadée
2. **Convertir ces couleurs en OKLCH** (espace colorimétrique moderne)
3. **Assigner automatiquement** les couleurs aux variables du thème EVA CSS
4. **Générer du CSS** prêt à être copié pour override le thème de la page

---

## Dépendances

### Color Thief
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js"></script>
```

**Color Thief** est une bibliothèque JavaScript qui extrait les couleurs dominantes d'une image via le canvas HTML5. Elle analyse les pixels et retourne une palette de couleurs triées par dominance.

---

## Processus d'extraction des couleurs

### 1. Upload de l'image

L'utilisateur peut :
- **Glisser-déposer** une image sur la zone de drop
- **Cliquer** pour sélectionner un fichier

Formats supportés : JPG, PNG, GIF, WebP

### 2. Extraction via Color Thief

```javascript
const colorThief = new ColorThief();
const palette = colorThief.getPalette(previewImage, 8); // 8 couleurs extraites
```

La méthode `getPalette()` retourne un tableau de couleurs RGB `[r, g, b]` triées par dominance dans l'image.

### 3. Conversion en format exploitable

Chaque couleur extraite est convertie :
```javascript
extractedColors = palette.map(color => ({
  rgb: color,                                    // [r, g, b]
  hex: rgbToHex(color[0], color[1], color[2])   // "#rrggbb"
}));
```

---

## Conversion RGB vers OKLCH

EVA CSS utilise l'espace colorimétrique **OKLCH** (Lightness, Chroma, Hue) pour une meilleure perception des couleurs et des manipulations plus intuitives.

### Algorithme de conversion

```javascript
function rgbToOklch(r, g, b) {
  // 1. Normalisation RGB (0-255 → 0-1)
  r = r / 255;
  g = g / 255;
  b = b / 255;

  // 2. Conversion sRGB → Linear RGB
  const toLinear = (c) => c > 0.04045
    ? Math.pow((c + 0.055) / 1.055, 2.4)
    : c / 12.92;
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  // 3. Conversion Linear RGB → OKLab (matrices de transformation)
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // 4. Conversion OKLab → OKLCH
  const lightness = L;
  const chroma = Math.sqrt(a * a + b_ * b_);
  let hue = Math.atan2(b_, a) * 180 / Math.PI;
  if (hue < 0) hue += 360;

  return {
    l: Math.round(lightness * 100 * 100) / 100,  // Lightness (0-100%)
    c: Math.round(chroma * 1000) / 1000,         // Chroma (0-0.4+)
    h: Math.round(hue * 100) / 100               // Hue (0-360°)
  };
}
```

### Composantes OKLCH

| Composante | Plage | Description |
|------------|-------|-------------|
| **Lightness (L)** | 0-100% | Luminosité perceptuelle |
| **Chroma (C)** | 0-0.4+ | Saturation/vivacité de la couleur |
| **Hue (H)** | 0-360° | Teinte sur le cercle chromatique |

---

## Algorithme d'auto-assignation des couleurs

L'Auto Theme assigne intelligemment les couleurs extraites aux 5 variables du thème EVA CSS.

### Logique d'assignation

```javascript
function autoAssignThemeColors() {
  // Conversion de toutes les couleurs en OKLCH
  const colorsWithOklch = extractedColors.map((color, index) => ({
    ...color,
    oklch: hexToOklchWrapper(color.hex),
    dominance: index  // Index = dominance (0 = plus dominant)
  }));

  // BRAND: couleur avec le chroma le plus élevé (plus vibrante)
  const brandColor = colorsWithOklch
    .sort((a, b) => b.oklch.c - a.oklch.c)[0];

  // ACCENT: deuxième chroma le plus élevé
  const accentColor = colorsWithOklch
    .filter(c => c !== brandColor)
    .sort((a, b) => b.oklch.c - a.oklch.c)[0];

  // EXTRA: meilleur équilibre entre dominance et contraste de teinte
  const extraColor = colorsWithOklch
    .filter(c => c !== brandColor && c !== accentColor)
    .sort((a, b) => {
      // Score = dominance - (différence de teinte / 20)
      const aScore = a.dominance - (Math.abs(a.oklch.h - brandColor.oklch.h) / 20);
      const bScore = b.dominance - (Math.abs(b.oklch.h - brandColor.oklch.h) / 20);
      return aScore - bScore;
    })[0];

  // DARK & LIGHT: générés automatiquement avec la teinte de brand
  setupSmartDarkLight(colorsWithOklch, brandColor);
}
```

### Critères de sélection

| Variable | Critère de sélection |
|----------|---------------------|
| **brand** | Chroma le plus élevé (couleur la plus vibrante) |
| **accent** | Deuxième chroma le plus élevé |
| **extra** | Équilibre dominance + contraste de teinte avec brand |
| **dark** | Généré avec teinte de brand, lightness faible (15%) |
| **light** | Généré avec teinte de brand, lightness élevé (90%) |

### Génération intelligente de dark/light

```javascript
function setupSmartDarkLight(colorsWithOklch, brandColor) {
  // DARK: utilise la teinte de brand avec faible luminosité
  document.body.style.setProperty('--dark-lightness', 'var(--current-darkness)');
  document.body.style.setProperty('--dark-chroma', '0.05');
  document.body.style.setProperty('--dark-hue', 'var(--brand-hue)');

  // LIGHT: utilise la teinte de brand avec haute luminosité
  document.body.style.setProperty('--light-lightness', 'var(--current-lightness)');
  document.body.style.setProperty('--light-chroma', '0.01');
  document.body.style.setProperty('--light-hue', 'var(--brand-hue)');
}
```

Cette approche garantit une cohérence chromatique : dark et light héritent de la teinte de brand, créant un thème harmonieux.

---

## Override du thème de la page

### Application en temps réel

Quand une couleur est assignée, elle est immédiatement appliquée via CSS custom properties :

```javascript
function applyColorToTheme(varName, colorData) {
  const oklch = colorData.oklch;

  // Définition des composantes individuelles
  document.body.style.setProperty(`--${varName}-hue`, oklch.h);
  document.body.style.setProperty(`--${varName}-chroma`, oklch.c);
  document.body.style.setProperty(`--${varName}-lightness`, `${oklch.l}%`);

  // Reconstruction de la variable racine
  const rootColor = `var(--${varName}-lightness) var(--${varName}-chroma) var(--${varName}-hue)`;
  document.body.style.setProperty(`--root-${varName}`, rootColor);
}
```

### Variables CSS modifiées

Pour chaque couleur (brand, accent, extra, dark, light), 4 variables sont créées :

```css
--brand-lightness: 62.8%;
--brand-chroma: 0.258;
--brand-hue: 29.23;
--root-brand: var(--brand-lightness) var(--brand-chroma) var(--brand-hue);
```

Ces variables sont utilisées par EVA CSS pour recalculer automatiquement :
- La couleur de base : `--brand`
- Les variantes d'opacité : `--brand_`, `--brand__`, `--brand___`
- Les variantes de luminosité : `--brand-d`, `--brand-b`

---

## CSS généré

### Format de sortie

```css
.theme-auto {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;

  --accent-lightness: 54.5%;
  --accent-chroma: 0.181;
  --accent-hue: 10;

  --extra-lightness: 78%;
  --extra-chroma: 0.108;
  --extra-hue: 200;

  --dark-lightness: var(--current-darkness);
  --dark-chroma: 0.05;
  --dark-hue: var(--brand-hue);

  --light-lightness: var(--current-lightness);
  --light-chroma: 0.01;
  --light-hue: var(--brand-hue);
}
```

### Utilisation du thème généré

1. **Copier le CSS** généré via le bouton "Copy CSS"
2. **Ajouter à votre fichier SCSS/CSS** ou dans eva.config.cjs
3. **Appliquer la classe** sur le body :

```html
<body class="current-theme theme-auto all-grads">
```

---

## Contrôles d'ajustement

### Sliders de modification

Après l'auto-assignation, l'utilisateur peut ajuster chaque couleur via des sliders :

| Slider | Fonction | Plage |
|--------|----------|-------|
| **L (Lightness)** | Luminosité | 0-100% |
| **C (Chroma)** | Saturation | 0-0.4 |

```javascript
function updateColorLive(varName, property, value) {
  if (property === 'lightness') {
    document.body.style.setProperty(`--${varName}-lightness`, `${value}%`);
  } else if (property === 'chroma') {
    document.body.style.setProperty(`--${varName}-chroma`, value / 100);
  }

  // Mise à jour immédiate de l'interface
  generateTheme();
}
```

### Réassignation manuelle

Cliquer sur une couleur du thème ouvre une modal permettant de sélectionner une autre couleur de la palette extraite.

---

## Workflow complet

```
┌─────────────────────────────────────────────────────────────┐
│  1. UPLOAD IMAGE                                            │
│     └─> FileReader lit l'image en base64                    │
├─────────────────────────────────────────────────────────────┤
│  2. EXTRACTION COULEURS                                     │
│     └─> Color Thief extrait 8 couleurs dominantes           │
│     └─> Conversion RGB → HEX pour chaque couleur            │
├─────────────────────────────────────────────────────────────┤
│  3. CONVERSION OKLCH                                        │
│     └─> HEX → RGB → Linear RGB → OKLab → OKLCH              │
│     └─> Calcul L (lightness), C (chroma), H (hue)           │
├─────────────────────────────────────────────────────────────┤
│  4. AUTO-ASSIGNATION                                        │
│     └─> brand  = chroma max                                 │
│     └─> accent = 2ème chroma max                            │
│     └─> extra  = équilibre dominance/contraste              │
│     └─> dark   = teinte brand + L faible                    │
│     └─> light  = teinte brand + L élevé                     │
├─────────────────────────────────────────────────────────────┤
│  5. APPLICATION LIVE                                        │
│     └─> CSS custom properties sur document.body             │
│     └─> Override immédiat du thème actuel                   │
├─────────────────────────────────────────────────────────────┤
│  6. GÉNÉRATION CSS                                          │
│     └─> Classe .theme-auto avec toutes les variables        │
│     └─> Copie dans le presse-papier                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Intégration dans un projet EVA CSS

### Option 1 : Via eva.config.cjs

Après avoir copié les valeurs générées :

```javascript
// eva.config.cjs
module.exports = {
  theme: {
    name: 'auto',
    colors: {
      brand: { lightness: 62.8, chroma: 0.258, hue: 29.23 },
      accent: { lightness: 54.5, chroma: 0.181, hue: 10 },
      extra: { lightness: 78, chroma: 0.108, hue: 200 },
      // dark et light utilisent brand-hue automatiquement
    }
  }
};
```

### Option 2 : CSS direct

Ajouter le CSS généré dans votre fichier de styles :

```scss
// styles/custom/_theme-auto.scss
.theme-auto {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;
  // ... autres variables
}
```

### Option 3 : Override inline

Pour un test rapide, appliquer directement sur le body :

```html
<body style="--brand-hue: 29.23; --brand-chroma: 0.258; --brand-lightness: 62.8%;">
```

---

## Compatibilité avec le toggle light/dark

Le thème généré reste compatible avec le toggle light/dark d'EVA CSS car :

1. **dark** et **light** utilisent `var(--current-darkness)` et `var(--current-lightness)`
2. Ces variables sont contrôlées par la classe `.toggle-theme`
3. Le toggle inverse les valeurs automatiquement

```css
/* Mode clair (défaut) */
.current-theme {
  --current-lightness: 96.4%;
  --current-darkness: 6.4%;
}

/* Mode sombre */
.toggle-theme {
  --current-lightness: 6.4%;
  --current-darkness: 96.4%;
}
```

---

## Ressources

- **Page Auto Theme** : `/framework/auto-theme.html`
- **Color Thief** : https://lokeshdhakar.com/projects/color-thief/
- **OKLCH** : https://oklch.com/
- **EVA CSS** : https://eva-css.xyz/
