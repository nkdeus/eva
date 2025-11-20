# Processus de création d'un projet EVAcss depuis Figma

Ce document détaille le workflow complet pour transformer un design Figma en projet EVAcss fonctionnel.

## 🎯 Vue d'ensemble

Le processus permet de :
1. Analyser automatiquement un design Figma via MCP
2. Extraire les tailles, polices et couleurs
3. **Choisir le mode d'utilisation** : classes utilitaires ou variables CSS uniquement
4. Configurer EVAcss avec ces paramètres
5. Générer un projet autonome et intégré

## 📖 Guide de Lecture des Fichiers Figma pour EVA CSS

### 🔍 Identification des Groupes et Nommages

Dans Figma, les designers utilisent des conventions de nommage spécifiques que nous devons respecter à la lettre :

**Exemples de nommages Figma :**
- `g-16` = Gap de 16px → Utiliser `var(--16)`
- `g-32` = Gap de 32px → Utiliser `var(--32_)` (adaptation automatique)
- `w-64` = Width de 64px → Utiliser `var(--64_)`
- `p-24` = Padding de 24px → Utiliser `var(--24)`

### ⚡ Règle de Correspondance Exacte

**🔥 RÈGLE D'OR :** Le chiffre dans le nommage Figma doit correspondre exactement à la variable CSS.

```scss
// ✅ CORRECT
// Figma: g-16 → CSS: var(--16)
gap: var(--16); // correspond au nommage Figma g-16

// ❌ INCORRECT  
// Figma: g-16 → CSS: var(--4)
gap: var(--4); // ❌ ERREUR : ne correspond pas au g-16 du Figma
```

### 📏 Extraction des Tailles depuis Figma

**1. Dimensions des éléments :**
- Largeur/hauteur affichées dans l'inspecteur Figma
- Extraire TOUTES les valeurs uniques utilisées

**2. Espacements (gaps, padding, margin) :**
- Regarder les nommages des groupes : `g-16`, `g-32`, etc.
- Mesurer les distances entre éléments
- Noter les espacements intérieurs des conteneurs

**3. Typographie :**
- Font-size affiché pour chaque élément de texte
- Identifier les tailles récurrentes (H1, H2, paragraphes, etc.)

### 🟢 Exemple Concret : Palette de Couleurs Ulysse

| Élément Figma                  | Nommage/Taille Figma | Variable EVA CSS | Modificateur |
|--------------------------------|----------------------|------------------|--------------|
| Cercle principal (hero)        | 141px                | `var(--141_)`    | `_` (>30)    |
| Cercle palette (color-list)    | 64px                 | `var(--64_)`     | `_` (>30)    |
| Gap entre groups               | g-32                 | `var(--32_)`     | `_` (>30)    |
| Gap label/cercles              | g-16                 | `var(--16)`      | stable (<30) |
| Gap entre cercles              | g-8                  | `var(--8)`       | stable (<30) |
| Gap cercle/label sous          | g-4                  | `var(--4)`       | stable (<30) |

### 🎨 Lecture des Couleurs Figma

**Couleurs principales :**
- Identifier chaque couleur avec son nom : `brand`, `accent`, `extra`, `light`, `dark`
- Noter les valeurs HEX exactes
- Convertir en OKLCH avec `scripts/hex-to-oklch.js`

**Variables de couleur générées automatiquement :**
```scss
// Pour chaque couleur, EVA CSS génère 8 variations :
var(--brand)     // Couleur de base
var(--brand_)    // 65% opacité  
var(--brand__)   // 35% opacité
var(--brand___)  // 5% opacité
var(--brand-d)   // Plus sombre
var(--brand-d_)  // Beaucoup plus sombre
var(--brand-b)   // Plus brillant
var(--brand-b_)  // Beaucoup plus brillant
```

### 🔧 Workflow d'Intégration

#### 1. **Analyse du Figma**
```bash
# Utiliser l'outil MCP Figma pour extraction automatique
mcp_Figma_get_code(nodeId: "1:2")
mcp_Figma_get_variable_defs(nodeId: "1:2")
```

#### 2. **Extraction manuelle des données**
- **Sizes** : `4, 8, 16, 32, 54, 64, 120, 141`
- **Font-sizes** : `10, 16, 36, 120`
- **Couleurs** : `#00d4ff, #5f6769, #e5ff00, #232526, #f4f5eb`

#### 3. **Configuration SCSS**
```scss
// Correspondance exacte avec les valeurs Figma
$sizes: 4, 8, 16, 32, 54, 64, 120, 141;
$font-sizes: 10, 16, 36, 120;
```

#### 4. **Application dans le CSS**
```scss
// Utiliser les nommages Figma comme référence
.palette-item {
  gap: var(--16); // Figma: g-16 ✅
}

.palette-circles {
  gap: var(--32_); // Figma: g-32 ✅ (avec adaptif)
}
```

### 🚫 Erreurs Courantes à Éviter

❌ **Mauvaise interprétation du nommage**
```scss
// Figma: g-16 mais utilisation incorrecte
gap: var(--4); // ❌ Ne correspond pas
```

❌ **Oublier les modificateurs automatiques**
```scss
// Valeur 32 sans modificateur adaptatif
gap: var(--32); // ❌ Devrait être var(--32_)
```

❌ **Valeurs approximatives**
```scss
// Figma: 64px mais approximation
width: var(--60); // ❌ Utiliser la valeur exacte var(--64_)
```

### ✅ Règles de Validation

1. **🎯 Correspondance exacte** : Nommage Figma = Variable CSS
2. **🔢 Tailles complètes** : Toutes les valeurs Figma dans `$sizes`
3. **🎨 Couleurs exactes** : Valeurs HEX converties en OKLCH
4. **📱 Modificateurs appropriés** : Système automatique selon valeurs
5. **🚫 Zéro CSS inline** : Tout via variables et classes

Perfect pour une fidélité design parfaite ! 🎨

## 🔧 Choix du Mode d'Utilisation

### Mode Classes Utilitaires (`$build-class: true`)
**Idéal pour :**
- Développement rapide/prototypage
- Projets avec beaucoup de composants similaires
- Équipes préférant les classes utilitaires (style Tailwind)
- Besoin de réutiliser des styles communs rapidement

**Utilisation :**
```html
<!-- Classes EVAcss générées automatiquement -->
<div class="_bg-brand w-64 p-16">Contenu avec classes utilitaires</div>
<p class="_c-dark fs-16">Texte avec classe de couleur</p>
<button class="_bg-accent_ hover:_bg-accent">Bouton avec opacité</button>
```

### Mode Variables CSS (`$build-class: false`)
**Idéal pour :**
- Design très spécifique/unique
- Préférence pour les classes sémantiques
- Optimisation du CSS final (moins de classes générées)
- Contrôle total sur le CSS généré

**Utilisation :**
```html
<!-- Classes sémantiques uniquement -->
<div class="hero-section">Contenu sémantique</div>
<p class="subtitle">Texte sémantique</p>
<button class="primary-button">Bouton sémantique</button>
```

```scss
// SCSS avec variables EVAcss
.hero-section {
  background-color: var(--brand);
  width: var(--64);
  padding: var(--16);
}
```

## 📋 Étapes du processus

### 1. Analyse du Figma via MCP
**Entrée :** Lien vers la frame Figma (ex: `https://www.figma.com/design/fileId/fileName?node-id=1-2`)

**Actions automatiques :**
```bash
# Extraction du code et des variables
mcp_Figma_get_code(nodeId: "1:2")
mcp_Figma_get_variable_defs(nodeId: "1:2")
```

**Données extraites :**
- **Sizes** : Dimensions récurrentes (padding, margin, width, height)
- **Font-sizes** : Tailles de police utilisées (H1, p, etc.)
- **Couleurs** : Palette de couleurs du design (brand, accent, extra, light, dark)

**Exemple d'extraction :**
```json
{
  "dark": "#252525",
  "H1": "120",
  "p": "16", 
  "brand": "#ff0000",
  "extra": "#ffe500",
  "accent": "#7300ff",
  "light": "#f3f3f3"
}
```

### 2. Conversion des couleurs en OKLCH
**Pourquoi OKLCH ?** Format colorimétrique moderne pour une cohérence optimale

**Outil disponible :** `scripts/hex-to-oklch.js`
```bash
# Installation de la dépendance si nécessaire
npm install culori --save-dev

# Conversion des couleurs
node scripts/hex-to-oklch.js #ff0000 #ffe500 #7300ff #f3f3f3 #252525
```

**Sortie :**
```
oklch(62.8% 0.258 29.23)  // brand
oklch(91.5% 0.191 101.03) // extra
oklch(51.7% 0.293 289.66) // accent
oklch(96.4% 0.000 0)      // light
oklch(26.4% 0.000 0)      // dark
```

### 3. Création de la structure projet

**Architecture générée :**
```
projects/
└── nom-du-projet/
    ├── index.html
    ├── styles/
    │   └── nom-du-projet.scss
    └── render/
        └── nom-du-projet.css (généré)
```

### 4. Configuration SCSS Complète

**Template de configuration :**
```scss
// ===========================================
// CONFIGURATION EVAcss
// ===========================================

// Choix du mode d'utilisation
$build-class: true;        // true = classes utilitaires / false = variables CSS uniquement
$custom-class: false;      // Réservé pour usages avancés
$px-rem-suffix: false;   // false = tailles fluides / true = tailles fixes
$name-by-size: true;       // true = variables nommées par taille (--16) / false = par index (--1)

// ===========================================
// TAILLES EXTRAITES DU FIGMA
// ===========================================

// OBLIGATOIRE : Toutes les tailles utilisées dans le design
$sizes: 4, 8, 16, 32, 64, 120, 141; 
// 4px (gap content), 8px (gap colors), 16px (padding), 
// 32px (gap colors réel), 64px (gap hero), 120px (H1), 141px (circles)

// OBLIGATOIRE : Toutes les tailles de police utilisées
$font-sizes: 16, 120; // 16px (paragraphe), 120px (titre H1)

// ===========================================
// CONFIGURATION DES CLASSES UTILITAIRES
// ===========================================

// Configuration des classes générées (si $build-class: true)
$class-config: (
  w: (),          // Classes width: w-16, w-32, etc.
  h: (),          // Classes height: h-16, h-32, etc.
  p: (),          // Classes padding: p-16, p-32, etc.
  px: (),         // Classes padding-inline: px-16, px-32, etc.
  py: (),         // Classes padding-block: py-16, py-32, etc.
  br: (),         // Classes border-radius: br-16, br-32, etc.
  mb: (),         // Classes margin-bottom: mb-16, mb-32, etc.
  g: (),          // Classes gap: g-16, g-32, etc.
);

// ===========================================
// IMPORTS EVAcss (ORDRE OBLIGATOIRE)
// ===========================================

@import "../../../styles/framework/eva";      // Core EVAcss + variables de tailles
@import "../../../styles/framework/colors";   // Système de couleurs OKLCH
@import "../../../styles/framework/theme";    // Variables de thème

// ===========================================
// THÈME SPÉCIFIQUE AU PROJET
// ===========================================

.theme-nom-projet {
  // Couleurs principales (extraites du Figma + converties OKLCH)
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;

  --accent-lightness: 51.7%;
  --accent-chroma: 0.293;
  --accent-hue: 289.66;

  --extra-lightness: 91.5%;
  --extra-chroma: 0.191;
  --extra-hue: 101.03;

  // Configuration hybride des current-* (AUTO-LIÉES)
  --current-lightness: 96.4%;  // Lightness de light depuis Figma
  --current-darkness: 26.4%;   // Lightness de dark depuis Figma

  // Configuration dark/light (composants C/H extraits du Figma)
  --dark-lightness: var(--current-darkness);  // ✨ Auto-lié
  --dark-chroma: 0.000;     // Chroma de dark depuis Figma
  --dark-hue: 0;           // Hue de dark depuis Figma

  --light-lightness: var(--current-lightness); // ✨ Auto-lié
  --light-chroma: 0.000;    // Chroma de light depuis Figma
  --light-hue: 0;          // Hue de light depuis Figma
}

// ===========================================
// STYLES SPÉCIFIQUES AU PROJET
// ===========================================

// Mode $build-class: true → Styles minimaux
.ma-classe-specifique {
  // Utiliser UNIQUEMENT les variables pour les propriétés non-couvertes
  border: 1px solid var(--brand);
  transform: rotate(45deg);
}

// Mode $build-class: false → Styles complets
.hero-section {
  background-color: var(--brand);
  width: var(--64);
  padding: var(--16);
  font-size: var(--fs-120);
}

.subtitle {
  color: var(--dark);
  font-size: var(--fs-16);
}

.primary-button {
  background-color: var(--accent);
  padding: var(--16);
  
  &:hover {
    background-color: var(--accent-d);  // Plus sombre
  }
}
```

### 5. Compilation automatique
**Commande :** `npm run watch-projects`
- Surveille les fichiers SCSS dans `projects/`
- Compile automatiquement vers `render/`
- Génère les variables CSS et classes utilitaires

**Compilation manuelle :**
```bash
npx sass projects/nom-projet/styles/nom-projet.scss:projects/nom-projet/render/nom-projet.css
```

### 6. Intégration HTML selon le mode

#### Mode Classes Utilitaires (`$build-class: true`)
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Nom du Projet</title>
  <link rel="stylesheet" href="render/nom-du-projet.css">
</head>
<body class="current-theme theme-nom-projet">
  <!-- Utilisation des classes utilitaires EVAcss -->
  <div class="hero _bg-brand _c-light p-64">
    <h1 class="fs-120">Titre Principal</h1>
    <p class="fs-16 _c-light_">Sous-titre avec opacité</p>
  </div>
  
  <div class="content p-16">
    <div class="colors g-32">
      <div class="color-circle _bg-accent w-141 h-141"></div>
      <div class="color-circle _bg-extra w-141 h-141"></div>
    </div>
  </div>
</body>
</html>
```

#### Mode Variables CSS (`$build-class: false`)
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Nom du Projet</title>
  <link rel="stylesheet" href="render/nom-du-projet.css">
</head>
<body class="current-theme theme-nom-projet">
  <!-- Utilisation des classes sémantiques -->
  <div class="hero">
    <h1 class="main-title">Titre Principal</h1>
    <p class="subtitle">Sous-titre</p>
  </div>
  
  <div class="content">
    <div class="colors">
      <div class="color-circle accent"></div>
      <div class="color-circle extra"></div>
    </div>
  </div>
</body>
</html>
```

## 🎨 Système de Couleurs EVAcss

### Variables de base
```css
var(--brand)   /* Couleur principale */
var(--accent)  /* Couleur d'accent */
var(--extra)   /* Couleur supplémentaire */
var(--light)   /* Couleur claire */
var(--dark)    /* Couleur sombre */
var(--white)   /* Blanc pur */
```

### Modificateurs d'opacité
```css
var(--brand_)   /* 65% opacité */
var(--brand__)  /* 35% opacité */
var(--brand___) /* 5% opacité */
```

### Modificateurs de luminosité
```css
var(--brand-d)   /* Plus sombre (-5%) */
var(--brand-b)   /* Plus brillant (+10%) */
var(--brand-d_)  /* Beaucoup plus sombre (-15%) */
var(--brand-b_)  /* Beaucoup plus brillant (+30%) */
```

### Classes utilitaires couleurs (`$build-class: true`)
```html
<!-- Couleurs de base -->
<div class="_bg-brand">Background brand</div>
<p class="_c-dark">Couleur dark</p>
<div class="_bc-accent">Border accent</div>

<!-- Avec opacité -->
<div class="_bg-brand_">Background brand 65%</div>
<div class="_bg-brand__">Background brand 35%</div>
<div class="_bg-brand___">Background brand 5%</div>

<!-- Avec luminosité -->
<div class="_bg-brand-d">Background brand plus sombre</div>
<div class="_bg-brand-b">Background brand plus brillant</div>
<div class="_bg-brand-d_">Background brand beaucoup plus sombre</div>
<div class="_bg-brand-b_">Background brand beaucoup plus brillant</div>
```

## 🛠 Variables de Tailles EVAcss avec Modificateurs Responsifs Intelligents

### 🧠 Système de Modificateurs Automatiques

EVA CSS applique automatiquement des modificateurs selon la valeur numérique :

| Plage de valeurs | Modificateur | Adaptation | Application |
|------------------|--------------|------------|-------------|
| **< 30** | *(aucun)* | Stable | Micro espacements restent fixes |
| **30-80** | `_` | Légère | Réduction modérée sur mobile |
| **> 80** (font-sizes) | `__` | Forte | Réduction agressive pour grands titres |

### 🎯 Exemples selon les Valeurs

#### Tailles Stables (< 30)
```css
var(--4)     /* 4px - reste fixe sur mobile */
var(--8)     /* 8px - reste fixe sur mobile */
var(--16)    /* 16px - reste fixe sur mobile */
```

#### Adaptation Légère (30-80)
```css
var(--32_)   /* 32px → ~24px sur mobile */
var(--54_)   /* 54px → ~40px sur mobile */ 
var(--64_)   /* 64px → ~48px sur mobile */
```

#### Variables de Typographie

**Font-sizes Stables (< 30)**
```css
var(--fs-10)  /* 10px - reste fixe */
var(--fs-16)  /* 16px - reste fixe */
```

**Font-sizes avec Adaptation Légère (30-80)**
```css
var(--fs-36_) /* 36px → ~28px sur mobile */
var(--fs-48_) /* 48px → ~36px sur mobile */
```

**Font-sizes avec Adaptation Forte (> 80)**
```css
var(--fs-120__) /* 120px → ~60px sur mobile */
var(--fs-100__) /* 100px → ~50px sur mobile */
```

### Classes Utilitaires avec Modificateurs Automatiques (`$build-class: true`)

#### Classes Stables (< 30)
```html
<!-- Tailles qui restent fixes sur mobile -->
<div class="w-16">Width 16px (stable)</div>
<div class="p-8">Padding 8px (stable)</div>
<div class="g-4">Gap 4px (stable)</div>
<div class="fs-16">Font-size 16px (stable)</div>
```

#### Classes avec Adaptation Légère (30-80)
```html
<!-- Tailles qui s'adaptent légèrement sur mobile -->
<div class="w-64_">Width 64px → ~48px mobile</div>
<div class="p-32_">Padding 32px → ~24px mobile</div>
<div class="g-54_">Gap 54px → ~40px mobile</div>
<div class="fs-36_">Font-size 36px → ~28px mobile</div>
```

#### Classes avec Adaptation Forte (> 80 pour font-sizes)
```html
<!-- Font-sizes qui s'adaptent fortement sur mobile -->
<div class="fs-120__">Font-size 120px → ~60px mobile</div>
<div class="fs-100__">Font-size 100px → ~50px mobile</div>
```

#### 🔄 Override Manuel (si nécessaire)
```html
<!-- Forcer adaptation sur petite valeur -->
<div class="p-16_">Force adaptation sur 16px</div>

<!-- Forcer stabilité sur grande valeur -->
<div class="w-64">Force 64px à rester fixe</div>
```

## 🎯 Gestion des Thèmes

### Configuration du thème
```scss
// Configuration manuel du toggle (recommandé)
$auto-theme-switch: false;

// Configuration automatique basée sur prefers-color-scheme
$auto-theme-switch: true;
```

### HTML pour le thème
```html
<!-- Classes obligatoires -->
<body class="current-theme theme-nom-projet">
  <!-- Bouton pour basculer le thème (si $auto-theme-switch: false) -->
  <button onclick="document.body.classList.toggle('toggle-theme')">
    Toggle Dark Mode
  </button>
</body>
```

### JavaScript pour le thème
```javascript
// Sauvegarde du thème dans localStorage
function toggleTheme() {
  document.body.classList.toggle('toggle-theme');
  localStorage.setItem('theme', document.body.classList.contains('toggle-theme') ? 'dark' : 'light');
}

// Restauration du thème au chargement
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('toggle-theme');
  }
});
```

## 🔍 Validation et Debug

### Vérifications obligatoires

#### 1. Configuration SCSS
```scss
// ✅ Vérifier que toutes les tailles sont déclarées
$sizes: 4, 8, 16, 32, 64, 120, 141; // Toutes les tailles du design

// ✅ Vérifier que toutes les font-sizes sont déclarées
$font-sizes: 16, 120; // Toutes les tailles de police

// ✅ Vérifier la cohérence du mode
$build-class: true; // Ou false selon le choix
```

#### 2. HTML selon le mode
```html
<!-- ✅ Classes obligatoires -->
<body class="current-theme theme-nom-projet">

<!-- ✅ Si $build-class: true → Classes utilitaires -->
<div class="_bg-brand w-64 p-16">Contenu</div>

<!-- ✅ Si $build-class: false → Classes sémantiques -->
<div class="hero-section">Contenu</div>
```

#### 3. Compilation sans erreurs
```bash
# Vérifier la compilation
npx sass projects/nom-projet/styles/nom-projet.scss:projects/nom-projet/render/nom-projet.css

# Surveiller les erreurs
npm run watch-projects
```

### Erreurs courantes à éviter

#### ❌ Valeurs fixes interdites
```scss
// INTERDIT
.ma-classe {
  width: 64px;               // Valeur fixe
  padding: 1rem;             // Valeur fixe
  color: #ff0000;            // Couleur hard-codée
}
```

#### ❌ Mélange des modes
```html
<!-- INTERDIT avec $build-class: false -->
<div class="hero-section w-64 p-16">Mélange interdit</div>
```

#### ❌ Classes sans configuration
```html
<!-- INTERDIT si la taille n'est pas dans $sizes -->
<div class="w-999">Taille non configurée</div>
```

### ✅ Bonnes pratiques

#### Variables toujours utilisées
```scss
// TOUJOURS utiliser les variables EVAcss
.ma-classe {
  width: var(--64);           // Variable EVAcss
  padding: var(--16);         // Variable EVAcss
  font-size: var(--fs-24);   // Variable de font-size
  background-color: var(--brand); // Variable de couleur
}
```

#### Optimisation des $sizes
```scss
// Déclarer SEULEMENT les tailles réellement utilisées
$sizes: 4, 8, 16, 32, 64, 120, 141; // Uniquement les tailles du design

// Éviter les tailles inutiles
$sizes: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20; // ❌ Trop de tailles
```

## 🎨 Exemple concret : Projet Ulysse

### Input Figma
Lien : `https://www.figma.com/design/91DhBPs6br8UVhxEdiuJFd/Ulysse?node-id=1-2`

### Extraction automatique
```json
{
  "H1": "120",
  "p": "16",
  "brand": "#ff0000",
  "extra": "#ffe500", 
  "accent": "#7300ff",
  "light": "#f3f3f3",
  "dark": "#252525"
}
```

### Configuration générée
```scss
// Mode choisi : Classes utilitaires
$build-class: true;
$name-by-size: true;

// Tailles extraites du Figma Ulysse (analyse complète)
$sizes: 4, 8, 16, 32, 64, 120, 141; 
// 4px (gap content), 8px (gap colors), 16px (padding), 
// 32px (gap colors réel), 64px (gap hero), 120px (H1), 141px (circles)

$font-sizes: 16, 120; // 16px (p), 120px (H1)

// Classes utilitaires à générer
$class-config: (
  w: (),    // width classes
  h: (),    // height classes
  p: (),    // padding classes
  g: (),    // gap classes
);

@import "../../../styles/framework/eva";
@import "../../../styles/framework/colors";
@import "../../../styles/framework/theme";

.theme-ulysse {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;

  --accent-lightness: 51.7%;
  --accent-chroma: 0.293;
  --accent-hue: 289.66;

  --extra-lightness: 91.5%;
  --extra-chroma: 0.191;
  --extra-hue: 101.03;

  --current-lightness: 96.4%;
  --current-darkness: 26.4%;

  --dark-lightness: var(--current-darkness);
  --dark-chroma: 0.000;
  --dark-hue: 0;

  --light-lightness: var(--current-lightness);
  --light-chroma: 0.000;
  --light-hue: 0;
}
```

### Utilisation avec classes utilitaires
```html
<body class="current-theme theme-ulysse">
  <div class="hero _bg-brand _c-light p-64">
    <div class="content g-4">
      <h1 class="fs-120">Ulysse2029</h1>
      <p class="fs-16 _c-light_">FIGMA - CLAUDE - EVACSS</p>
    </div>
    <div class="colors g-32">
      <div class="color-circle _bg-accent w-141 h-141"></div>
      <div class="color-circle _bg-extra w-141 h-141"></div>
    </div>
  </div>
</body>
```

## ⚡ Commandes utiles

```bash
# Surveiller les projets (compilation automatique)
npm run watch-projects

# Compiler un projet spécifique
npx sass projects/nom-projet/styles/nom-projet.scss:projects/nom-projet/render/nom-projet.css

# Convertir couleurs hex en OKLCH
node scripts/hex-to-oklch.js #ff0000 #ffe500 #7300ff

# Installer dépendance pour conversion couleurs
npm install culori --save-dev

# Valider la compilation sans erreurs
npx sass projects/nom-projet/styles/nom-projet.scss:projects/nom-projet/render/nom-projet.css --no-source-map
```

## 🔄 Workflow complet

1. **Fournir le lien Figma** → Claude utilise MCP pour extraire
2. **Choisir le mode** → `$build-class: true` (classes utilitaires) ou `false` (variables CSS)
3. **Extraction automatique** → Variables JSON (sizes, fonts, couleurs)
4. **Conversion OKLCH** → Script hex-to-oklch.js
5. **Analyse complète des tailles** → Extraction de TOUTES les tailles utilisées
6. **Configuration SCSS** → Variables $sizes, $font-sizes, $class-config, thème
7. **Compilation** → `npm run watch-projects`
8. **Intégration HTML** → Classes theme + utilisation selon le mode choisi
9. **Validation** → Vérification cohérence mode + compilation + fonctionnalités
10. **Optimisation** → Ajustement des tailles déclarées + test responsive

## 📏 Extraction complète des tailles

**Étape cruciale :** Analyser le code généré par Figma pour identifier **toutes les tailles** utilisées dans le design.

### Méthode d'extraction
1. **Analyser le code Figma** → Identifier tous les `gap-X`, `w-[X]`, `h-[X]`, `text-[X]`, `size-[X]`, `p-[X]`, etc.
2. **Lister les tailles** → Créer une liste complète de toutes les valeurs numériques
3. **Catégoriser les usages** → Identifier l'usage de chaque taille (gap, width, height, padding, etc.)
4. **Vérifier visuellement** → Comparer avec le design pour les écarts Figma/code

### Exemple concret : Code Figma analysé
```jsx
<div className="flex flex-col gap-64">        // 64px gap hero 
  <div className="flex flex-col gap-4">       // 4px gap content
    <p className="text-[120px]">Ulysse2029</p>  // 120px font-size
    <p className="text-[16px]">FIGMA - CLAUDE - EVACSS</p>  // 16px font-size
  </div>
  <div className="flex flex-row gap-32">       // 32px gap colors 
    <div className="size-[141px] rounded-full bg-[#7300ff]"></div>  // 141px cercles
    <div className="size-[141px] rounded-full bg-[#ffe500]"></div>  // 141px cercles
  </div>
</div>
```

### Extraction finale
```scss
// Toutes les tailles identifiées dans le design
$sizes: 4, 8, 16, 32, 64, 120, 141; 

// Explication des tailles
// 4px : gap entre titre et sous-titre
// 16px : font-size du sous-titre
// 32px : gap déclaré entre cercles
// 64px : gap déclaré entre sections 
// 120px : font-size du titre principal
// 141px : taille des cercles colorés
```

## 🎯 Configuration hybride des couleurs

Après conversion OKLCH, configuration hybride optimisée :

```scss
.theme-nom-projet {
  // === COULEURS PRINCIPALES ===
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;

  --accent-lightness: 51.7%;
  --accent-chroma: 0.293;
  --accent-hue: 289.66;

  --extra-lightness: 91.5%;
  --extra-chroma: 0.191;
  --extra-hue: 101.03;

  // === CONFIGURATION HYBRIDE ===
  // Lightness extraites du Figma pour liaison automatique
  --current-lightness: 96.4%;  // Lightness de light depuis Figma
  --current-darkness: 26.4%;   // Lightness de dark depuis Figma
  
  // Composants Chroma/Hue extraits du Figma
  --dark-lightness: var(--current-darkness);  // ✨ Auto-lié via EVAcss
  --dark-chroma: 0.000;     // Chroma de dark depuis Figma
  --dark-hue: 0;           // Hue de dark depuis Figma

  --light-lightness: var(--current-lightness); // ✨ Auto-lié via EVAcss
  --light-chroma: 0.000;    // Chroma de light depuis Figma
  --light-hue: 0;          // Hue de light depuis Figma
}
```

**Avantages :**
- ✅ Lightness automatiquement synchronisées entre `--current-*` et `--dark/light-*`
- ✅ Composants Chroma/Hue fidèles au design Figma
- ✅ Toggle theme fonctionnel automatiquement
- ✅ Cohérence parfaite des couleurs

## 🚀 Avantages du processus

### Automatisation complète
- **Extraction MCP** : Analyse directe depuis Figma
- **Conversion OKLCH** : Couleurs modernes et cohérentes
- **Compilation automatique** : Watch mode avec `npm run watch-projects`
- **Classes générées** : Utilitaires ou variables selon le mode choisi

### Flexibilité maximale
- **Deux modes** : Classes utilitaires ou variables CSS uniquement
- **Tailles fluides** : Responsive automatique avec modificateurs
- **Couleurs avancées** : Opacité et luminosité modifiables
- **Thèmes** : Dark/light mode avec toggle automatique

### Performance optimisée
- **Tailles ciblées** : Uniquement les tailles utilisées dans `$sizes`
- **CSS minimal** : Génération selon le mode choisi
- **Variables CSS** : Système centralisé et maintenable
- **Compilation rapide** : Watch mode avec Sass

### Maintenabilité
- **Structure claire** : Architecture de projet standardisée
- **Documentation** : Variables explicites et commentées
- **Validation** : Vérifications automatiques et debug
- **Évolutivité** : Ajout facile de nouvelles tailles/couleurs

## 🎯 Résultat final

Ce processus garantit une cohérence parfaite entre le design Figma et l'implémentation web :

✅ **Choix du mode** : Classes utilitaires ou variables CSS selon le projet  
✅ **Extraction complète** : Toutes les tailles identifiées et intégrées  
✅ **Variables fluides** : Responsive automatique avec modificateurs  
✅ **Couleurs avancées** : Système OKLCH avec opacité/luminosité  
✅ **Thèmes intelligents** : Dark/light mode avec configuration hybride  
✅ **Performance optimale** : Compilation ciblée et variables CSS  
✅ **Maintenabilité** : Système centralisé et évolutif  
✅ **Validation** : Debug et vérifications automatiques  

**Avec EVAcss, votre Figma devient un site web parfaitement responsive et maintenable en quelques étapes !** 🚀