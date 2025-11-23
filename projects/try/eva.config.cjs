// ===========================================
// TRY PROJECT - EVA CSS Configuration
// ===========================================

module.exports = {
  // Sizes extracted from design
  sizes: [16, 35, 64, 128, 141],

  // Font sizes
  fontSizes: [128],

  // Build Configuration
  buildClass: false,       // Variables only mode (semantic CSS)
  pxRemSuffix: false,
  nameBySize: true,
  customClass: false,

  // Theme Configuration
  theme: {
    name: 'try',
    colors: {
      // Colors from Figma (HEX format - auto-converted to OKLCH)
      brand: { lightness: 62.7, chroma: 0.257, hue: 29.23 },
      accent: { lightness: 96.4, chroma: 0.209, hue: 104.6 },
      extra: { lightness: 56.6, chroma: 0.278, hue: 282.6 }
    },
    lightMode: {
      lightness: 96.4,
      darkness: 6.4
    },
    darkMode: {
      lightness: 5,
      darkness: 95
    },
    autoSwitch: false
  }
};
