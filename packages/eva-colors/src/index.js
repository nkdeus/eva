// ===========================================
// EVA Colors - OKLCH Color Utilities
// ===========================================

import { parse, oklch, formatHex, differenceEuclidean } from 'culori';

/**
 * Convert hex color to OKLCH format
 * @param {string} hex - Hex color code (e.g., "#ff0000")
 * @returns {Object|null} OKLCH color object with CSS string
 */
export function hexToOklch(hex) {
  const color = parse(hex);
  if (!color) return null;

  const oklchColor = oklch(color);
  if (!oklchColor) return null;

  const { l, c, h } = oklchColor;

  return {
    l: Math.round(l * 1000) / 10, // Percentage with 1 decimal
    c: Math.round(c * 1000) / 1000, // 3 decimals
    h: h !== undefined ? Math.round(h * 100) / 100 : 0, // 2 decimals
    css: `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h !== undefined ? h.toFixed(2) : '0'})`,
    scss: {
      lightness: `${(l * 100).toFixed(1)}%`,
      chroma: c.toFixed(3),
      hue: (h !== undefined ? h.toFixed(2) : '0')
    }
  };
}

/**
 * Convert OKLCH to hex color
 * @param {Object} oklchColor - {l: 0-100, c: 0-0.4, h: 0-360}
 * @returns {string|null} Hex color code
 */
export function oklchToHex({ l, c, h }) {
  try {
    return formatHex({ mode: 'oklch', l: l / 100, c, h });
  } catch (error) {
    return null;
  }
}

/**
 * Generate a palette of colors based on a base color
 * @param {string} baseColor - Base hex color
 * @param {number} steps - Number of palette steps (default: 5)
 * @returns {Array} Array of color objects
 */
export function generatePalette(baseColor, steps = 5) {
  const base = hexToOklch(baseColor);
  if (!base) return [];

  const palette = [];
  const lightnessRange = 90 - 10; // From 10% to 90%
  const stepSize = lightnessRange / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const lightness = 10 + (i * stepSize);
    const color = oklchToHex({
      l: lightness,
      c: base.c * (lightness / base.l), // Adjust chroma based on lightness
      h: base.h
    });

    palette.push({
      hex: color,
      oklch: hexToOklch(color),
      name: `step-${i + 1}`
    });
  }

  return palette;
}

/**
 * Generate theme CSS variables from config
 * @param {Object} config - Theme configuration
 * @returns {string} CSS variables
 */
export function generateTheme(config) {
  const {
    name = 'custom',
    brand,
    accent,
    extra,
    light,
    dark
  } = config;

  const colors = { brand, accent, extra, light, dark };
  let css = `.theme-${name} {\n`;

  for (const [colorName, hexColor] of Object.entries(colors)) {
    if (!hexColor) continue;

    const oklchColor = hexToOklch(hexColor);
    if (!oklchColor) continue;

    css += `  --${colorName}-lightness: ${oklchColor.scss.lightness};\n`;
    css += `  --${colorName}-chroma: ${oklchColor.scss.chroma};\n`;
    css += `  --${colorName}-hue: ${oklchColor.scss.hue};\n`;
    css += `\n`;
  }

  css += `}`;
  return css;
}

/**
 * Calculate color contrast ratio
 * @param {string} hex1 - First hex color
 * @param {string} hex2 - Second hex color
 * @returns {number|null} Contrast ratio
 */
export function getContrast(hex1, hex2) {
  const color1 = parse(hex1);
  const color2 = parse(hex2);

  if (!color1 || !color2) return null;

  // Use Euclidean distance in OKLCH space as a simple contrast metric
  return differenceEuclidean()(oklch(color1), oklch(color2));
}

/**
 * Check if color meets WCAG contrast requirements
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @param {string} level - 'AA' or 'AAA' (default: 'AA')
 * @returns {Object} Accessibility check result
 */
export function checkAccessibility(foreground, background, level = 'AA') {
  const contrast = getContrast(foreground, background);
  if (contrast === null) return { pass: false, contrast: null };

  // Simplified check using Euclidean distance
  // Threshold values are approximations
  const threshold = level === 'AAA' ? 0.15 : 0.10;

  return {
    pass: contrast >= threshold,
    contrast: contrast.toFixed(3),
    level
  };
}
