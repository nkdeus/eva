// ===========================================
// ULYSSE PROJECT - EVA CSS Configuration
// ===========================================

module.exports = {
  // Sizes extracted from Figma design 2025
  sizes: [4, 8, 16, 32, 54, 64, 120, 141],

  // Font sizes
  fontSizes: [10, 16, 36, 120],

  // Build Configuration
  buildClass: false,       // Variables only mode (semantic CSS)
  pxRemSuffix: false,
  nameBySize: true,
  customClass: false,

  // Theme Configuration
  theme: {
    name: 'ulysse',
    colors: {
      // Colors from Figma 2025 (OKLCH format)
      brand: { lightness: 84.1, chroma: 0.155, hue: 200.4 },    // #00d4ff
      accent: { lightness: 93.6, chroma: 0.202, hue: 101.8 },   // #e5ff00
      extra: { lightness: 42.8, chroma: 0.008, hue: 220.3 },    // #5f6769
      dark: { lightness: 15.2, chroma: 0.005, hue: 220.3 },     // #232526
      light: { lightness: 95.8, chroma: 0.018, hue: 84.6 }      // #f4f5eb
    },
    lightMode: {
      lightness: 95.8,   // #f4f5eb
      darkness: 15.2     // #232526
    },
    darkMode: {
      lightness: 15.2,   // #232526
      darkness: 95.8     // #f4f5eb
    },
    autoSwitch: false
  }
};
