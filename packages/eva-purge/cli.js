#!/usr/bin/env node

/**
 * EVA Purge CLI
 * Intelligent CSS purging for EVA CSS projects
 */

const fs = require('fs');
const path = require('path');
const CSSPurger = require('./src/purge.js');

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
EVA Purge - Intelligent CSS Optimization

Usage:
  eva-purge [options]

Options:
  --content <pattern>    Content files to scan (default: **/*.{html,js,vue,jsx,tsx})
  --css <file>           CSS file to purge (required)
  --output <file>        Output file path (default: [css]-purged.css)
  --config <file>        Config file path (eva.config.js)
  --safelist <classes>   Comma-separated list of classes to keep
  --help                 Show this help

Examples:
  # Basic usage
  eva-purge --css dist/style.css --content "src/**/*.html"

  # With safelist
  eva-purge --css dist/style.css --safelist "theme-,current-,all-grads"

  # Using config file
  eva-purge --config eva.config.js

Config file example (eva.config.js):
  module.exports = {
    purge: {
      content: ['src/**/*.html', 'src/**/*.js'],
      css: 'dist/style.css',
      output: 'dist/style-purged.css',
      safelist: {
        standard: ['current-theme', 'all-grads'],
        deep: [/^theme-/],
        greedy: [/^brand-/, /^accent-/]
      }
    }
  };
  `);
}

// Parse CLI arguments
function parseArgs() {
  const config = {
    content: [],
    css: null,
    output: null,
    safelist: []
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--content':
        config.content.push(args[++i]);
        break;
      case '--css':
        config.css = args[++i];
        break;
      case '--output':
        config.output = args[++i];
        break;
      case '--safelist':
        config.safelist = args[++i].split(',').map(s => s.trim());
        break;
      case '--config':
        const configPath = path.resolve(process.cwd(), args[++i]);
        if (fs.existsSync(configPath)) {
          const fileConfig = require(configPath);
          return fileConfig.purge || fileConfig;
        } else {
          console.error(`❌ Config file not found: ${configPath}`);
          process.exit(1);
        }
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
    }
  }

  // Set defaults
  if (config.content.length === 0) {
    config.content = ['**/*.{html,js,vue,jsx,tsx}'];
  }

  if (!config.output && config.css) {
    const parsed = path.parse(config.css);
    config.output = path.join(parsed.dir, `${parsed.name}-purged${parsed.ext}`);
  }

  return config;
}

async function main() {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const config = parseArgs();

  if (!config.css) {
    console.error('❌ Error: --css parameter is required');
    console.log('Run eva-purge --help for usage information');
    process.exit(1);
  }

  if (!fs.existsSync(config.css)) {
    console.error(`❌ Error: CSS file not found: ${config.css}`);
    process.exit(1);
  }

  console.log('🚀 EVA Purge - Starting CSS optimization...\n');
  console.log('📋 Configuration:');
  console.log(`   CSS Input:  ${config.css}`);
  console.log(`   CSS Output: ${config.output}`);
  console.log(`   Content:    ${config.content.join(', ')}`);
  if (config.safelist && config.safelist.length > 0) {
    console.log(`   Safelist:   ${config.safelist.join(', ')}`);
  }
  console.log('');

  const purger = new CSSPurger(config);
  await purger.purge();
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
