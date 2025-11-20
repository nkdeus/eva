#!/usr/bin/env node

// ===========================================
// EVA Colors CLI
// ===========================================

import { hexToOklch, oklchToHex, generatePalette, generateTheme, checkAccessibility } from './src/index.js';

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
EVA Colors CLI - OKLCH Color Utilities

Usage:
  eva-color <command> [options]

Commands:
  convert <hex>              Convert hex to OKLCH
  to-hex <l> <c> <h>        Convert OKLCH to hex
  palette <hex> [steps]      Generate color palette (default 5 steps)
  theme <config.json>        Generate theme from JSON config
  contrast <hex1> <hex2>     Check color contrast
  help                       Show this help message

Examples:
  eva-color convert #ff0000
  eva-color to-hex 62.8 0.258 29.23
  eva-color palette #ff0000 7
  eva-color contrast #ffffff #000000

Theme config example (theme.json):
{
  "name": "my-theme",
  "brand": "#ff0000",
  "accent": "#7300ff",
  "extra": "#ffe500",
  "light": "#f3f3f3",
  "dark": "#252525"
}
  `);
}

// Command handlers
switch (command) {
  case 'convert': {
    const hex = args[1];
    if (!hex) {
      console.error('❌ Error: Hex color required');
      console.log('Usage: eva-color convert #ff0000');
      process.exit(1);
    }

    const result = hexToOklch(hex);
    if (!result) {
      console.error(`❌ Error: Invalid hex color "${hex}"`);
      process.exit(1);
    }

    console.log(`\n🎨 Conversion: ${hex} → OKLCH\n`);
    console.log(`CSS:  ${result.css}`);
    console.log(`\nSCSS Variables:`);
    console.log(`  --lightness: ${result.scss.lightness};`);
    console.log(`  --chroma: ${result.scss.chroma};`);
    console.log(`  --hue: ${result.scss.hue};`);
    console.log();
    break;
  }

  case 'to-hex': {
    const l = parseFloat(args[1]);
    const c = parseFloat(args[2]);
    const h = parseFloat(args[3]);

    if (isNaN(l) || isNaN(c) || isNaN(h)) {
      console.error('❌ Error: Invalid OKLCH values');
      console.log('Usage: eva-color to-hex 62.8 0.258 29.23');
      process.exit(1);
    }

    const hex = oklchToHex({ l, c, h });
    if (!hex) {
      console.error('❌ Error: Conversion failed');
      process.exit(1);
    }

    console.log(`\n🎨 Conversion: OKLCH → ${hex}\n`);
    break;
  }

  case 'palette': {
    const hex = args[1];
    const steps = parseInt(args[2]) || 5;

    if (!hex) {
      console.error('❌ Error: Base hex color required');
      console.log('Usage: eva-color palette #ff0000 [steps]');
      process.exit(1);
    }

    const palette = generatePalette(hex, steps);
    if (palette.length === 0) {
      console.error(`❌ Error: Invalid hex color "${hex}"`);
      process.exit(1);
    }

    console.log(`\n🎨 Generated ${steps}-step palette from ${hex}\n`);
    palette.forEach((color, i) => {
      console.log(`${i + 1}. ${color.hex} → ${color.oklch.css}`);
    });
    console.log();
    break;
  }

  case 'theme': {
    const configPath = args[1];
    if (!configPath) {
      console.error('❌ Error: Config file required');
      console.log('Usage: eva-color theme config.json');
      process.exit(1);
    }

    try {
      const fs = await import('fs');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const css = generateTheme(config);

      console.log(`\n🎨 Generated theme: ${config.name}\n`);
      console.log(css);
      console.log();
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
    break;
  }

  case 'contrast': {
    const hex1 = args[1];
    const hex2 = args[2];

    if (!hex1 || !hex2) {
      console.error('❌ Error: Two hex colors required');
      console.log('Usage: eva-color contrast #ffffff #000000');
      process.exit(1);
    }

    const resultAA = checkAccessibility(hex1, hex2, 'AA');
    const resultAAA = checkAccessibility(hex1, hex2, 'AAA');

    console.log(`\n🎨 Contrast Check: ${hex1} vs ${hex2}\n`);
    console.log(`Contrast Value: ${resultAA.contrast}`);
    console.log(`WCAG AA:  ${resultAA.pass ? '✅ Pass' : '❌ Fail'}`);
    console.log(`WCAG AAA: ${resultAAA.pass ? '✅ Pass' : '❌ Fail'}`);
    console.log();
    break;
  }

  case 'help':
  case undefined:
    printHelp();
    break;

  default:
    console.error(`❌ Error: Unknown command "${command}"`);
    printHelp();
    process.exit(1);
}
