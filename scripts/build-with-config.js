#!/usr/bin/env node

/**
 * EVA CSS Build Script with JSON Config Support
 *
 * This script:
 * 1. Loads eva.config.cjs
 * 2. Generates a temporary SCSS file with the config
 * 3. Compiles SCSS using the generated config
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Load eva.config.cjs from current directory
 */
function loadConfig() {
  const configPath = path.join(process.cwd(), 'eva.config.cjs');

  if (!fs.existsSync(configPath)) {
    log('⚠️  No eva.config.cjs found, using SCSS defaults', 'yellow');
    return null;
  }

  try {
    // Clear require cache
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    log('✅ Loaded eva.config.cjs', 'green');
    return config;
  } catch (error) {
    log(`❌ Error loading config: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Generate SCSS variables for @use with () syntax
 */
function generateScssWithParams(config) {
  if (!config) return '';

  const params = [];

  // Sizes
  if (config.sizes && Array.isArray(config.sizes)) {
    const sizesList = config.sizes.join(', ');
    params.push(`$sizes: (${sizesList})`);
  }

  // Font sizes
  if (config.fontSizes && Array.isArray(config.fontSizes)) {
    const fontSizesList = config.fontSizes.join(', ');
    params.push(`$font-sizes: (${fontSizesList})`);
  }

  // Build flags
  if (typeof config.buildClass === 'boolean') {
    params.push(`$build-class: ${config.buildClass}`);
  }
  if (typeof config.pxRemSuffix === 'boolean') {
    params.push(`$px-rem-suffix: ${config.pxRemSuffix}`);
  }
  if (typeof config.nameBySize === 'boolean') {
    params.push(`$name-by-size: ${config.nameBySize}`);
  }
  if (typeof config.customClass === 'boolean') {
    params.push(`$custom-class: ${config.customClass}`);
  }
  if (typeof config.debug === 'boolean') {
    params.push(`$debug: ${config.debug}`);
  }

  return params.join(',\n  ');
}

/**
 * Build CSS from SCSS with config
 */
function buildCss(inputScss, outputCss, config) {
  // Create temp file in same directory as input to preserve relative paths
  const inputDir = path.dirname(inputScss);
  const inputBase = path.basename(inputScss, '.scss');
  const tempMainPath = path.join(inputDir, `.${inputBase}-temp.scss`);

  try {
    // Read original SCSS file
    const originalContent = fs.readFileSync(inputScss, 'utf8');

    // Generate wrapper with config
    let wrapperContent;

    if (config) {
      const scssParams = generateScssWithParams(config);
      log('📝 Injecting config into SCSS', 'blue');

      // Create wrapper that imports eva-css-fluid with config
      wrapperContent = `// Temporary file with JSON config injected
${originalContent.replace(
  /@use ['"]eva-css-fluid['"];?/,
  `@use 'eva-css-fluid' with (\n  ${scssParams}\n);`
)}`;
    } else {
      wrapperContent = originalContent;
    }

    fs.writeFileSync(tempMainPath, wrapperContent);

    // Compile SCSS
    log('🔨 Compiling SCSS...', 'blue');
    const sassCommand = `npx sass --load-path=node_modules ${tempMainPath}:${outputCss} --style expanded`;
    execSync(sassCommand, { stdio: 'inherit' });

    log('✅ CSS compiled successfully', 'green');

  } catch (error) {
    log(`❌ Build failed: ${error.message}`, 'red');
    throw error;
  } finally {
    // Clean up temp files
    if (fs.existsSync(tempMainPath)) {
      fs.unlinkSync(tempMainPath);
    }
  }
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node build-with-config.js <input.scss> <output.css>');
    console.log('Example: node build-with-config.js styles/main.scss styles/main.css');
    process.exit(1);
  }

  const [inputScss, outputCss] = args;

  log('\n🚀 EVA CSS Build with JSON Config\n', 'blue');

  const config = loadConfig();

  if (config) {
    log(`   Sizes: ${config.sizes?.length || 0} values`, 'blue');
    log(`   Font sizes: ${config.fontSizes?.length || 0} values`, 'blue');
    log(`   Build mode: ${config.buildClass ? 'utility classes' : 'variables only'}\n`, 'blue');
  }

  buildCss(inputScss, outputCss, config);

  log(`\n✨ Build complete: ${outputCss}\n`, 'green');
}

main();
