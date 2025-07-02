<img src="https://eva-css.netlify.app/assets/imgs/eva.jpg" width="200" style="margin-bottom: 60px;" />

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

## ⚙️ Configuration

```scss
// Core configuration
$screen: 1440;                    // Base screen width
$sizes: 4, 8, 12, 20, 32, 52, 84, 136, 220, 356, 576, 712;
$name-by-size: true;              // Use actual pixel values as variable names
$dev-mode: true;                  // Development mode with debugging
$build-class: true;               // Generate utility classes
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

- **`_`** (underscore) - Stronger responsive scaling for mobile/tablet
- **`-`** (dash) - Minimal responsive scaling  
- **`px/rem`** - Traditional unit suffixes for clarity

## 🌐 Ecosystem

Beyond EVA CSS, the fluid design ecosystem includes:
- **Lumos** - Fluid responsive design for Webflow
- **fluid.tw** - Tailwind CSS extension for fluid scaling
- Specialized calculators for complex projects

## 🎯 Why EVA CSS?

With 20 years of experience as both UI designer and front-end developer, I created EVA CSS to bridge **design intent** and **technical implementation**. The framework transforms every fixed value from Figma designs into fluid, responsive elements with immediate feedback.

## 📚 Documentation

- [Live Demo](https://eva-css.netlify.app)
- [Documentation](https://eva-css.netlify.app/doc.html)
- [GitHub Repository](https://github.com/nkdeus/eva)

---

**© 2024 Tati Michaël** - [LinkedIn](https://www.linkedin.com/in/tati-michael/) | [ulysse-2029.com](https://ulysse-2029.com/)
