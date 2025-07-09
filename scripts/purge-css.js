#!/usr/bin/env node

/**
 * CSS Purge Script for EvaCSS
 * 
 * This script analyzes HTML files to extract used CSS classes and variables,
 * then creates a compressed CSS file with only the used styles.
 * 
 * Usage: npm run purge
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class CSSPurger {
    constructor() {
        this.usedClasses = new Set();
        this.usedVariables = new Set();
        this.cssContent = '';
        this.compressedCSS = '';
    }

    /**
     * Main purge process
     */
    async purge() {
        console.log('🚀 Starting CSS purge process...');
        
        try {
            // Step 1: Analyze HTML files
            await this.analyzeHTMLFiles();
            
            // Step 2: Read compiled CSS
            await this.readCompiledCSS();
            
            // Step 3: Extract used styles
            await this.extractUsedStyles();
            
            // Step 4: Compress and optimize
            await this.compressCSS();
            
            // Step 5: Write output
            await this.writeCompressedCSS();
            
            console.log('✅ CSS purge completed successfully!');
            this.showStats();
            
        } catch (error) {
            console.error('❌ Error during CSS purge:', error);
            process.exit(1);
        }
    }

    /**
     * Analyze HTML files to extract used classes and CSS variables
     */
    async analyzeHTMLFiles() {
        console.log('📄 Analyzing HTML files...');
        
        const htmlFiles = glob.sync('**/*.html', { 
            ignore: ['node_modules/**', 'dist/**', 'build/**'] 
        });
        
        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Extract classes from class attributes
            const classMatches = content.match(/class=["']([^"']+)["']/g);
            if (classMatches) {
                classMatches.forEach(match => {
                    const classes = match.replace(/class=["']([^"']+)["']/, '$1').split(/\s+/);
                    classes.forEach(cls => {
                        if (cls.trim()) {
                            this.usedClasses.add(cls.trim());
                        }
                    });
                });
            }
            
            // Extract CSS variables from style attributes and content
            const varMatches = content.match(/var\(--[^)]+\)/g);
            if (varMatches) {
                varMatches.forEach(match => {
                    const varName = match.replace(/var\((--[^)]+)\)/, '$1');
                    this.usedVariables.add(varName);
                });
            }
        }
        
        console.log(`📊 Found ${this.usedClasses.size} unique classes`);
        console.log(`📊 Found ${this.usedVariables.size} CSS variables`);
    }

    /**
     * Read the compiled CSS file
     */
    async readCompiledCSS() {
        console.log('📖 Reading compiled CSS...');
        
        const cssPath = path.join(__dirname, '../styles/main.css');
        
        if (!fs.existsSync(cssPath)) {
            console.log('⚠️  main.css not found, compiling SCSS first...');
            const { execSync } = require('child_process');
            execSync('npm run build-css', { stdio: 'inherit' });
        }
        
        this.cssContent = fs.readFileSync(cssPath, 'utf8');
        console.log(`📊 Original CSS size: ${(this.cssContent.length / 1024).toFixed(2)} KB`);
    }

    /**
     * Extract only the used CSS rules and variables
     */
    async extractUsedStyles() {
        console.log('🔍 Extracting used styles...');
        
        const lines = this.cssContent.split('\n');
        const usedLines = [];
        let currentRule = '';
        let inRule = false;
        let braceCount = 0;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip empty lines and comments at the root level
            if (!trimmedLine || (trimmedLine.startsWith('/*') && !inRule)) {
                continue;
            }
            
            // Handle CSS variables (keep all in :root and .all-grads)
            if (trimmedLine.includes(':root') || trimmedLine.includes('.all-grads')) {
                inRule = true;
                currentRule = trimmedLine;
                usedLines.push(line);
                if (trimmedLine.includes('{')) braceCount++;
                continue;
            }
            
            // Handle opening braces
            if (trimmedLine.includes('{')) {
                braceCount++;
                if (!inRule) {
                    // Check if this rule contains any used classes
                    const selector = trimmedLine.replace(/\s*\{.*/, '');
                    if (this.isUsedSelector(selector)) {
                        inRule = true;
                        currentRule = selector;
                        usedLines.push(line);
                    }
                } else {
                    usedLines.push(line);
                }
            }
            // Handle closing braces
            else if (trimmedLine.includes('}')) {
                braceCount--;
                if (inRule) {
                    usedLines.push(line);
                }
                if (braceCount === 0) {
                    inRule = false;
                    currentRule = '';
                }
            }
            // Handle properties within rules
            else if (inRule) {
                usedLines.push(line);
            }
        }
        
        this.compressedCSS = usedLines.join('\n');
        console.log(`📊 Extracted CSS size: ${(this.compressedCSS.length / 1024).toFixed(2)} KB`);
    }

    /**
     * Check if a CSS selector is used in the HTML
     */
    isUsedSelector(selector) {
        // Clean the selector
        const cleanSelector = selector.replace(/\s*\{.*/, '').trim();
        
        // Handle multiple selectors separated by commas
        const selectors = cleanSelector.split(',');
        
        for (const sel of selectors) {
            const trimmedSel = sel.trim();
            
            // Skip pseudo-elements and pseudo-classes for now
            if (trimmedSel.includes('::') || trimmedSel.includes(':hover') || trimmedSel.includes(':before') || trimmedSel.includes(':after')) {
                // Check the base selector
                const baseSelector = trimmedSel.replace(/::[^,\s]+|:[^,\s]+/g, '').trim();
                if (this.isUsedSelector(baseSelector)) {
                    return true;
                }
                continue;
            }
            
            // Handle class selectors
            if (trimmedSel.startsWith('.')) {
                const className = trimmedSel.substring(1).replace(/[^\w-_]/g, '');
                if (this.usedClasses.has(className)) {
                    return true;
                }
            }
            
            // Handle compound selectors (e.g., .class1.class2)
            const classes = trimmedSel.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g);
            if (classes) {
                const allClassesUsed = classes.every(cls => {
                    const className = cls.substring(1);
                    return this.usedClasses.has(className);
                });
                if (allClassesUsed && classes.length > 0) {
                    return true;
                }
            }
            
            // Handle element selectors (always include)
            if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(trimmedSel)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Compress and optimize the CSS
     */
    async compressCSS() {
        console.log('🗜️  Compressing CSS...');
        
        let compressed = this.compressedCSS;
        
        // Remove comments
        compressed = compressed.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove unnecessary whitespace
        compressed = compressed.replace(/\s+/g, ' ');
        
        // Remove whitespace around braces and semicolons
        compressed = compressed.replace(/\s*{\s*/g, '{');
        compressed = compressed.replace(/\s*}\s*/g, '}');
        compressed = compressed.replace(/\s*;\s*/g, ';');
        compressed = compressed.replace(/\s*,\s*/g, ',');
        compressed = compressed.replace(/\s*:\s*/g, ':');
        
        // Remove trailing semicolons before }
        compressed = compressed.replace(/;}/g, '}');
        
        // Remove empty rules
        compressed = compressed.replace(/[^}]+{\s*}/g, '');
        
        // Final cleanup
        compressed = compressed.trim();
        
        this.compressedCSS = compressed;
        console.log(`📊 Compressed CSS size: ${(compressed.length / 1024).toFixed(2)} KB`);
    }

    /**
     * Write the compressed CSS to file
     */
    async writeCompressedCSS() {
        console.log('💾 Writing compressed CSS...');
        
        const outputPath = path.join(__dirname, '../styles/main-compressed.css');
        
        // Add a header comment
        const header = `/* EvaCSS Compressed - Generated on ${new Date().toISOString()} */\n`;
        const finalCSS = header + this.compressedCSS;
        
        fs.writeFileSync(outputPath, finalCSS);
        console.log(`📁 Compressed CSS saved to: ${outputPath}`);
    }

    /**
     * Show compression statistics
     */
    showStats() {
        const originalSize = this.cssContent.length;
        const compressedSize = this.compressedCSS.length;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
        
        console.log('\n📊 Compression Statistics:');
        console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`   Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);
        console.log(`   Space saved: ${savings}%`);
        console.log(`   Used classes: ${this.usedClasses.size}`);
        console.log(`   Used variables: ${this.usedVariables.size}`);
    }
}

// Run the purger
if (require.main === module) {
    const purger = new CSSPurger();
    purger.purge();
}

module.exports = CSSPurger;