<img src="https://eva-css.xyz/assets/imgs/eva.jpg" width="200" style="margin-bottom: 60px;" />

# EVA CSS - The Fluid SCSS Framework

**Converting static UI designs into a truly scalable and responsive system**

## 🚀 Key Features

- **Fluid scaling** - Eliminates traditional breakpoints in favor of fluid scaling that adapts seamlessly across all devices
- **Proportional design** - Prioritizes proportional relationships over absolute sizes, maintaining visual hierarchy
- **clamp() revolution** - Uses modern CSS clamp() functions for truly fluid, accessible design
- **Designer-friendly** - Built around a 1440px design system, perfect for Figma workflows
- **Universal compatibility** - Works with any project type and technology stack

## 🎯 Core Benefits

- **No more breakpoints** - By 2029, breakpoints will be a thing of the past
- **Immediate feedback** - Test responsive behavior in seconds with smooth resize transitions
- **Design intent preservation** - Transform Figma values into fluid elements while maintaining design coherence
- **Accessibility first** - Users can zoom without breaking layouts while maintaining optimal readability

## 📐 Design System

Built around a **1440px** design system with carefully crafted spacing scales:

- **Micro Spacing**: 4px, 8px, 12px (fine adjustments)
- **Component Spacing**: 20px, 32px, 52px (component padding/margins)
- **Section Spacing**: 84px, 136px, 220px (section gaps)
- **Layout Spacing**: 356px, 576px, 712px (container widths)

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nkdeus/eva.git
   cd eva
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run watch
   ```

4. **Open in browser**
   - Open `index.html` in your browser
   - Or use a local server: `python -m http.server 8000`

### Using EVA CSS in your project

1. **Include the CSS file**
   ```html
   <link rel="stylesheet" href="styles/main.css">
   ```

2. **Start using fluid classes**
   ```html
   <div class="px-220__ py-136">
     <h1 class="fs-36_">Your fluid title</h1>
     <p class="fs-16">Your fluid content</p>
   </div>
   ```

## ⚙️ Configuration

### SCSS Variables

```scss
// Core configuration
$px-rem-suffix: true;                  // false pour la production
$build-class: true;               // false pour utiliser seulement les CSS variables
$custom-class: false;
$name-by-size: true;              // true = utilise les valeurs de taille, false = utilise les index

$sizes: 4, 8, 12, 20, 32, 34, 52, 84, 136, 220, 356, 576, 712;
$font-sizes: 12, 16, 18, 24, 36, 52, 72;
```

### Custom Configuration

La configuration se fait directement dans le fichier `main.scss` principal ou dans des fichiers de projet spécifiques :

**Configuration principale (`styles/main.scss`) :**
```scss
$px-rem-suffix: true;                  // false pour la production
$build-class: true;               // false pour utiliser seulement les CSS variables
$custom-class: false;
$name-by-size: true;              // true = utilise les valeurs de taille, false = utilise les index

$sizes: 4, 8, 12, 20, 32, 34, 52, 84, 136, 220, 356, 576, 712;
$font-sizes: 12, 16, 18, 24, 36, 52, 72;
```

**Configuration de projet (ex: `styles/projets/lili.scss`) :**
```scss
$px-rem-suffix: false;                 // Production mode
$build-class: true;
$custom-class: true;
$name-by-size: true;

$sizes: 24, 50;                   // Tailles personnalisées pour ce projet
$font-sizes: 14, 16, 18, 24, 32, 48, 60, 120;

$class-config: (
  w: (50),                        // width: seulement pour la taille 50
  h: (),                          // height: pour les tailles 24 et 50
  p: (),                          // padding: seulement pour la taille 50
  px: (24),                       // padding-inline: seulement pour la taille 24
  pr: (),                         // padding-right: aucune classe générée
  py: (),                         // padding-block: pour les tailles 24 et 50
  br: (),                         // border-radius: seulement pour la taille 50
  mb: (),                         // margin-bottom: pour les tailles 24 et 50
  g: (),                          // gap: pour les tailles 24 et 50
);
```

## 🎨 Usage Examples

```html
<!-- Responsive spacing -->
<div class="px-220__ py-136">     <!-- Fluid horizontal/vertical padding -->
<div class="g-20">                <!-- Fluid gap -->
<div class="w-356">               <!-- Fluid width -->

<!-- Typography -->
<h1 class="fs-36_">               <!-- Fluid font size -->
<p class="fs-16">                 <!-- Base font size -->
```

## 🔧 Responsive Modifiers

EVA CSS utilise un **système de modificateurs responsifs intelligent** basé sur les valeurs numériques pour une adaptation progressive et cohérente.

### 📐 Logique des Modificateurs

Le système applique automatiquement des modificateurs selon la valeur numérique :

| Plage de valeurs | Modificateur | Adaptation | Cas d'usage |
|------------------|--------------|------------|-------------|
| **< 30** | *(aucun)* | Stable | Micro espacements (4px, 8px, 16px) |
| **30-80** | `_` | Légère | Espacements moyens, font-sizes standards |
| **> 80** (font-sizes) | `__` | Forte | Grands titres uniquement |

### 🎯 Exemples Pratiques

```scss
// Tailles stables (< 30) - restent fixes
gap: var(--4);           // 4px reste 4px sur mobile
padding: var(--16);      // 16px reste 16px sur mobile
margin: var(--8);        // 8px reste 8px sur mobile

// Adaptation légère (30-80) - réduction modérée
gap: var(--32_);         // 32px → ~24px sur mobile
padding: var(--64_);     // 64px → ~48px sur mobile
width: var(--54_);       // 54px → ~40px sur mobile

// Font-sizes standards (30-80) - adaptation légère
font-size: var(--fs-36_); // 36px → ~28px sur mobile

// Grands titres (> 80) - adaptation forte
font-size: var(--fs-120__); // 120px → ~60px sur mobile
```

### ⚙️ Configuration Projet

Dans votre SCSS, définissez quelles valeurs ont besoin d'adaptation :

```scss
// Tailles extraites du design
$sizes: 4, 8, 16, 32, 54, 64, 120, 141;
// Automatiquement :
// - 4, 8, 16 restent stables
// - 32, 54, 64 utilisent le modificateur _ 
// - 120, 141 utilisent le modificateur _

$font-sizes: 10, 16, 36, 120;
// Automatiquement :
// - 10, 16 restent stables
// - 36 utilise le modificateur _
// - 120 utilise le modificateur __ (adaptation forte)
```

### 🔄 Modificateurs Manuels

Si nécessaire, forcez un comportement spécifique :

```scss
// Forcer une adaptation légère sur une petite valeur
padding: var(--16_);     // 16px avec adaptation légère

// Forcer la stabilité sur une grande valeur  
width: var(--64);        // 64px reste fixe (rare)

// Adaptation extra-forte (manuel)
font-size: var(--fs-60__); // Adaptation forte sur font-size 60px
```

### 🎨 Avantages du Système

- **🤖 Automatique** : Pas besoin de définir manuellement les breakpoints
- **🎯 Intelligent** : Adaptation proportionnelle à l'importance visuelle
- **📱 Progressif** : Transition fluide entre toutes les tailles d'écran
- **⚡ Cohérent** : Même logique pour tous les projets EVA CSS
- **🛠️ Flexible** : Possibilité de surcharger si nécessaire

### 💡 Bonnes Pratiques

```html
<!-- Utilisez les modificateurs générés automatiquement -->
<div class="hero" style="
  gap: var(--64_);           /* Adaptation légère automatique */
  padding: var(--16);        /* Stable automatiquement */
  font-size: var(--fs-120__); /* Adaptation forte automatique */
">

<!-- Classes utilitaires avec modificateurs (si $build-class: true) -->
<div class="g-64_ p-16 fs-120__">
  <h1 class="fs-36_">Titre adaptatif</h1>
  <p class="fs-16">Texte stable</p>
</div>
```

## 📋 Common Use Cases

### Layout Components

```html
<!-- Hero Section -->
<section class="px-220__ py-136">
  <div class="w-712">
    <h1 class="fs-52__ mb-32">Hero Title</h1>
    <p class="fs-18 mb-52">Hero description</p>
    <button class="h-52 px-32">Call to Action</button>
  </div>
</section>

<!-- Card Grid -->
<div class="px-220__ py-84">
  <div class="flex x g-32">
    <div class="w-356 p-32 br-12">
      <h3 class="fs-24 mb-20">Card Title</h3>
      <p class="fs-16">Card content</p>
    </div>
    <div class="w-356 p-32 br-12">
      <h3 class="fs-24 mb-20">Card Title</h3>
      <p class="fs-16">Card content</p>
    </div>
  </div>
</div>

<!-- Navigation -->
<nav class="px-220__ py-20">
  <div class="flex x space center">
    <a href="#" class="h-52 px-20">Home</a>
    <a href="#" class="h-52 px-20">About</a>
    <a href="#" class="h-52 px-20">Contact</a>
  </div>
</nav>
```

### Typography Scale

```html
<!-- Headings -->
<h1 class="fs-52__">Main Heading (52px → 32px)</h1>
<h2 class="fs-36_">Secondary Heading (36px → 24px)</h2>
<h3 class="fs-24">Tertiary Heading (24px → 20px)</h3>

<!-- Body Text -->
<p class="fs-18">Large body text (18px → 16px)</p>
<p class="fs-16">Standard body text (16px)</p>
<p class="fs-14">Small text (14px → 12px)</p>
```

## 🌐 Ecosystem

Beyond EVA CSS, the fluid design ecosystem includes:
- **Lumos** - Fluid responsive design for Webflow
- **fluid.tw** - Tailwind CSS extension for fluid scaling
- Specialized calculators for complex projects

## 🎯 Why EVA CSS?

With 20 years of experience as both UI designer and front-end developer, I created EVA CSS to bridge **design intent** and **technical implementation**. The framework transforms every fixed value from Figma designs into fluid, responsive elements with immediate feedback.

## 🛠️ Troubleshooting

### Common Issues

**CSS not compiling?**
```bash
# Make sure Sass is installed
npm install sass

# Check if the watch command is running
npm run watch
```

**Classes not working?**
- Ensure `main.css` is properly linked in your HTML
- Check browser console for any errors
- Verify that `$build-class: true` is set in your SCSS config

**Responsive behavior not smooth?**
- Make sure you're using the correct modifiers (`_`, `-`, `__`)
- Check that your viewport meta tag is present: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

### Browser Support

EVA CSS uses modern CSS features including:
- ✅ **clamp()** - Chrome 79+, Firefox 75+, Safari 13.1+
- ✅ **CSS Grid** - Chrome 57+, Firefox 52+, Safari 10.1+
- ✅ **CSS Custom Properties** - Chrome 49+, Firefox 31+, Safari 9.1+

For older browsers, consider using a polyfill or fallback approach.

## 📚 Documentation

- [Live Demo](https://eva-css.xyz)
- [Documentation](https://eva-css.xyz/doc.html)
- [GitHub Repository](https://github.com/nkdeus/eva)

---



---

**© 2024 Tati Michaël** - [LinkedIn](https://www.linkedin.com/in/mtati/) | [ulysse-2029.com](https://ulysse-2029.com/)
