// ===========================================
// EVA CSS - Main Site Configuration
// ===========================================

module.exports = {
  // Sizes extracted from design (gaps, paddings, widths, heights)
  // Note: 220 is used extensively in px-220__, py-220-, h-220, etc.
  sizes: [4, 8, 12, 16, 20, 32, 34, 52, 84, 136, 156, 220, 356, 576, 712],

  // Font sizes used across the site
  fontSizes: [10, 12, 16, 18, 24, 36, 52, 72],

  // Build Configuration
  buildClass: true,        // Generate utility classes
  pxRemSuffix: true,       // Add px/rem values for debugging
  nameBySize: true,        // Use size values in variable names
  customClass: false,      // Disable custom class filtering

  // Debug mode (show configuration summary during compilation)
  debug: false,

  // Theme Configuration
  theme: {
    name: 'eva',
    colors: {
      // Define your theme colors here (HEX or OKLCH)
      // brand: '#ff5733',
      // accent: '#7300ff',
      // extra: '#ffe500',
      // light: '#f3f3f3',
      // dark: '#252525'
    },
    lightMode: {
      lightness: 96.4,   // Light background
      darkness: 6.4      // Dark text
    },
    darkMode: {
      lightness: 5,      // Dark background
      darkness: 95       // Light text
    },
    autoSwitch: false    // Manual toggle with .toggle-theme class
  },

  // CSS Purge Configuration (production optimization)
  purge: {
    enabled: false,      // Enable for production builds
    content: ['**/*.html', '**/*.js'],
    css: 'styles/main.css',
    output: 'styles/main-compressed.css',
    safelist: ['current-theme', 'toggle-theme', 'all-grads', 'theme-']
  }
};
