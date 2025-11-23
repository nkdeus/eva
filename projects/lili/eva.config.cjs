// ===========================================
// LILI PROJECT - EVA CSS Configuration
// ===========================================

module.exports = {
  // Sizes extracted from design
  sizes: [24, 50, 100],

  // Font sizes
  fontSizes: [14, 16, 18, 24, 32, 48, 60, 80, 120],

  // Build Configuration
  buildClass: true,        // Utility classes mode
  pxRemSuffix: false,
  nameBySize: true,
  customClass: false,

  // Theme Configuration
  theme: {
    name: 'lili',
    colors: {
      // Define your theme colors here
      // brand: '#ff5733',
      // accent: '#7300ff',
      // extra: '#ffe500'
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
