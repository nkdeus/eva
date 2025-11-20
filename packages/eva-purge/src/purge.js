
/**
 * CSS Purge Script for EvaCSS
 * 
 * This script analyzes HTML and JavaScript files to extract used CSS classes and variables,
 * then creates a compressed CSS file with only the used styles.
 * 
 * Usage: npm run purge
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class CSSPurger {
    constructor(config = {}) {
        this.config = {
            content: config.content || ['**/*.{html,js}'],
            css: config.css || 'styles/main.css',
            output: config.output || 'styles/main-compressed.css',
            safelist: config.safelist || [],
            ...config
        };
        this.usedClasses = new Set();
        this.usedVariables = new Set();
        this.usedIds = new Set();
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
            
            // Step 2: Analyze JavaScript files
            await this.analyzeJavaScriptFiles();
            
            // Step 3: Read compiled CSS
            await this.readCompiledCSS();
            
            // Step 4: Extract used styles
            await this.extractUsedStyles();
            
            // Step 5: Compress and optimize
            await this.compressCSS();
            
            // Step 6: Write output
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
            
            // Extract IDs from id attributes
            const idMatches = content.match(/id=["']([^"']+)["']/g);
            if (idMatches) {
                idMatches.forEach(match => {
                    const id = match.replace(/id=["']([^"']+)["']/, '$1').trim();
                    if (id) {
                        this.usedIds.add(id);
                    }
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
        
        console.log(`📊 Found ${this.usedClasses.size} unique classes in HTML`);
        console.log(`📊 Found ${this.usedIds.size} unique IDs in HTML`);
        console.log(`📊 Found ${this.usedVariables.size} CSS variables in HTML`);
    }

    /**
     * Analyze JavaScript files to extract dynamically used classes and IDs
     */
    async analyzeJavaScriptFiles() {
        console.log('📄 Analyzing JavaScript files...');
        
        const jsFiles = glob.sync('**/*.js', { 
            ignore: ['node_modules/**', 'dist/**', 'build/**', 'scripts/purge-css.js'] 
        });
        
        let jsClassCount = 0;
        let jsIdCount = 0;
        let jsVarCount = 0;
        
        for (const file of jsFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Extract classes from classList methods
            const classListMatches = content.match(/classList\.(add|remove|toggle|contains)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
            if (classListMatches) {
                classListMatches.forEach(match => {
                    const className = match.replace(/.*['"`]([^'"`]+)['"`].*/, '$1');
                    if (className) {
                        this.usedClasses.add(className);
                        jsClassCount++;
                    }
                });
            }
            
            // Extract classes from className assignments
            const classNameMatches = content.match(/\.className\s*=\s*['"`]([^'"`]+)['"`]/g);
            if (classNameMatches) {
                classNameMatches.forEach(match => {
                    const classes = match.replace(/.*['"`]([^'"`]+)['"`].*/, '$1').split(/\s+/);
                    classes.forEach(cls => {
                        if (cls.trim()) {
                            this.usedClasses.add(cls.trim());
                            jsClassCount++;
                        }
                    });
                });
            }
            
            // Extract classes from querySelector and querySelectorAll
            const querySelectorMatches = content.match(/querySelector(?:All)?\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
            if (querySelectorMatches) {
                querySelectorMatches.forEach(match => {
                    const selector = match.replace(/.*['"`]([^'"`]+)['"`].*/, '$1');
                    
                    // Extract class names (starts with .)
                    const classMatches = selector.match(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g);
                    if (classMatches) {
                        classMatches.forEach(cls => {
                            const className = cls.substring(1); // Remove the dot
                            this.usedClasses.add(className);
                            jsClassCount++;
                        });
                    }
                    
                    // Extract IDs (starts with #)
                    const idMatches = selector.match(/#([a-zA-Z][a-zA-Z0-9_-]*)/g);
                    if (idMatches) {
                        idMatches.forEach(id => {
                            const idName = id.substring(1); // Remove the hash
                            this.usedIds.add(idName);
                            jsIdCount++;
                        });
                    }
                });
            }
            
            // Extract IDs from getElementById
            const getElementByIdMatches = content.match(/getElementById\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
            if (getElementByIdMatches) {
                getElementByIdMatches.forEach(match => {
                    const id = match.replace(/.*['"`]([^'"`]+)['"`].*/, '$1');
                    if (id) {
                        this.usedIds.add(id);
                        jsIdCount++;
                    }
                });
            }
            
            // Extract CSS variables from JavaScript
            const jsVarMatches = content.match(/['"`]--[a-zA-Z][a-zA-Z0-9_-]*['"`]/g);
            if (jsVarMatches) {
                jsVarMatches.forEach(match => {
                    const varName = match.replace(/['"`]/g, '');
                    this.usedVariables.add(varName);
                    jsVarCount++;
                });
            }
            
            // Extract CSS variables from setProperty calls
            const setPropMatches = content.match(/setProperty\s*\(\s*['"`](--[^'"`]+)['"`]/g);
            if (setPropMatches) {
                setPropMatches.forEach(match => {
                    const varName = match.replace(/.*['"`](--[^'"`]+)['"`].*/, '$1');
                    this.usedVariables.add(varName);
                    jsVarCount++;
                });
            }
            
            // Extract CSS variables from getPropertyValue calls
            const getPropMatches = content.match(/getPropertyValue\s*\(\s*['"`](--[^'"`]+)['"`]/g);
            if (getPropMatches) {
                getPropMatches.forEach(match => {
                    const varName = match.replace(/.*['"`](--[^'"`]+)['"`].*/, '$1');
                    this.usedVariables.add(varName);
                    jsVarCount++;
                });
            }
        }
        
        console.log(`📊 Found ${jsClassCount} class references in JavaScript`);
        console.log(`📊 Found ${jsIdCount} ID references in JavaScript`);
        console.log(`📊 Found ${jsVarCount} CSS variable references in JavaScript`);
        console.log(`📊 Total unique classes: ${this.usedClasses.size}`);
        console.log(`📊 Total unique IDs: ${this.usedIds.size}`);
        console.log(`📊 Total unique CSS variables: ${this.usedVariables.size}`);
    }

    /**
     * Read the compiled CSS file
     */
    async readCompiledCSS() {
        console.log('📖 Reading compiled CSS...');

        const cssPath = path.resolve(process.cwd(), this.config.css);

        if (!fs.existsSync(cssPath)) {
            throw new Error(`CSS file not found: ${cssPath}`);
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
        let currentRuleContent = '';
        let inRule = false;
        let inRootRule = false; // Special flag for :root blocks
        let inMediaQuery = false; // Special flag for @media blocks
        let braceCount = 0;
        let ruleLines = [];
        let processedRules = 0;
        let mediaQueryCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Progress indicator
            if (i % 1000 === 0) {
                console.log(`📊 Processing line ${i}/${lines.length} (${Math.round(i/lines.length*100)}%)`);
            }
            
            // Skip empty lines and comments at the root level
            if (!trimmedLine || (trimmedLine.startsWith('/*') && !inRule)) {
                continue;
            }
            
            // If we're not in a rule but this line looks like a selector (no { yet), accumulate it for multi-line selectors
            if (!inRule && !trimmedLine.includes('{') && !trimmedLine.includes('}') && 
                (trimmedLine.includes(',') || /^[a-zA-Z*#.\[]/.test(trimmedLine) || trimmedLine.includes('::') || trimmedLine.includes(':'))) {
                // This might be part of a multi-line selector
                if (!currentRule) {
                    currentRule = trimmedLine;
                    ruleLines = [line];
                } else {
                    // Append to existing selector
                    currentRule += ',' + trimmedLine;
                    ruleLines.push(line);
                }
                continue;
            }
            
            // Handle opening braces
            if (trimmedLine.includes('{')) {
                braceCount++;
                if (!inRule && braceCount === 1) {
                    // Complete the selector if it wasn't already accumulated
                    if (!currentRule) {
                        currentRule = trimmedLine.replace(/\s*\{.*/, '');
                        ruleLines = [line];
                    } else {
                        // Use accumulated selector and add the line with the opening brace
                        currentRule += trimmedLine.replace(/\s*\{.*/, '');
                        ruleLines.push(line);
                    }
                    currentRuleContent = '';
                    inRule = true;
                    
                    // Check if this is a media query (always keep these completely)
                    if (currentRule.includes('@media')) {
                        inMediaQuery = true;
                        mediaQueryCount++;
                        console.log(`📱 Found media query: ${currentRule.trim()} - keeping completely`);
                    }
                    // Check if this is a :root or .all-grads rule (always keep these completely)
                    else if (currentRule.includes(':root') || currentRule.includes('.all-grads')) {
                        inRootRule = true;
                        console.log(`📋 Found ${currentRule.trim()} block - keeping all variables`);
                    }
                } else if (inRule) {
                    ruleLines.push(line);
                }
            }
            // Handle closing braces
            else if (trimmedLine.includes('}')) {
                braceCount--;
                if (inRule) {
                    ruleLines.push(line);
                    
                    // Check if rule should be kept when we close the main rule
                    if (braceCount === 0) {
                        processedRules++;
                        
                        // Always keep media queries, :root and .all-grads blocks completely
                        const shouldKeep = inMediaQuery || 
                                          inRootRule || 
                                          this.isUsedSelector(currentRule) || 
                                          this.hasCurrentVariables(currentRuleContent);
                        
                        if (shouldKeep) {
                            usedLines.push(...ruleLines);
                            if (inRootRule) {
                                // Count variables in this :root block
                                const varCount = ruleLines.join('').match(/--[a-zA-Z][a-zA-Z0-9_-]*:/g)?.length || 0;
                                console.log(`📋 Kept ${varCount} CSS variables from ${currentRule.trim()}`);
                            }
                        }
                        
                        // Reset for next rule
                        inRule = false;
                        inRootRule = false;
                        inMediaQuery = false;
                        currentRule = '';
                        currentRuleContent = '';
                        ruleLines = [];
                    }
                }
            }
            // Handle properties within rules
            else if (inRule) {
                ruleLines.push(line);
                currentRuleContent += ' ' + trimmedLine;
            }
        }
        
        console.log(`📊 Processed ${processedRules} CSS rules`);
        console.log(`📱 Kept ${mediaQueryCount} media queries`);
        this.compressedCSS = usedLines.join('\n');
        console.log(`📊 Extracted CSS size: ${(this.compressedCSS.length / 1024).toFixed(2)} KB`);
    }

    /**
     * Check if a CSS rule uses --current- variables and should be kept
     */
    hasCurrentVariables(ruleContent) {
        return /var\(--current-/.test(ruleContent);
    }

    /**
     * Check if a CSS selector is an HTML element or reset selector that should be kept
     */
    isElementOrResetSelector(selector) {
        const cleanSelector = selector.replace(/\s*\{.*/, '').trim();
        
        // Always keep universal selectors and reset selectors (complete groups)
        if (cleanSelector.includes('*') || 
            cleanSelector.includes('::before') || 
            cleanSelector.includes('::after') ||
            cleanSelector.includes(':target') ||
            /^body[,\s]|^html[,\s]/.test(cleanSelector)) {
            return true;
        }
        
        // Handle multiple selectors separated by commas - if ANY selector in the group is an element/reset, keep the whole group
        const selectors = cleanSelector.split(',');
        
        const htmlElements = [
            'html', 'body', 'head', 'title', 'meta', 'link', 'script', 'style',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
            'a', 'img', 'figure', 'figcaption', 'picture', 'source',
            'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
            'form', 'input', 'button', 'textarea', 'select', 'option', 'label', 'fieldset', 'legend',
            'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main',
            'blockquote', 'cite', 'q', 'pre', 'code', 'kbd', 'samp', 'var',
            'em', 'strong', 'b', 'i', 'u', 's', 'small', 'mark', 'del', 'ins', 'sub', 'sup',
            'video', 'audio', 'canvas', 'svg', 'iframe', 'embed', 'object', 'param'
        ];
        
        for (const sel of selectors) {
            const trimmedSel = sel.trim();
            
            // Check if it's a pure element selector
            const baseElement = trimmedSel.replace(/::[^,\s]+|:[^,\s(]+(\([^)]*\))?/g, '').trim();
            if (htmlElements.includes(baseElement)) {
                return true;
            }
            
            // Check for element selectors with pseudo-classes/elements (like a:hover, input:focus)
            if (htmlElements.some(element => trimmedSel.startsWith(element + ':') || trimmedSel.startsWith(element + '::') || trimmedSel === element)) {
                return true;
            }
            
            // Check for attribute selectors on elements (like input[type="text"])
            if (htmlElements.some(element => trimmedSel.startsWith(element + '[') && trimmedSel.includes(']'))) {
                return true;
            }
            
            // Check for selectors starting with element but containing other selectors
            // e.g., "ul[role=list]", "a:not([class])", etc.
            const match = trimmedSel.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
            if (match && htmlElements.includes(match[1])) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if a CSS selector is used in the HTML or JavaScript
     */
    isUsedSelector(selector) {
        // Clean the selector
        const cleanSelector = selector.replace(/\s*\{.*/, '').trim();
        
        // Always keep element and reset selectors
        if (this.isElementOrResetSelector(selector)) {
            return true;
        }
        
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
            
            // Handle ID selectors
            if (trimmedSel.startsWith('#')) {
                const idName = trimmedSel.substring(1).replace(/[^\w-_]/g, '');
                if (this.usedIds.has(idName)) {
                    return true;
                }
            }
            
            // Handle class selectors
            if (trimmedSel.startsWith('.')) {
                const className = trimmedSel.substring(1).replace(/[^\w-_]/g, '');
                if (this.usedClasses.has(className)) {
                    return true;
                }
            }
            
            // Handle compound selectors (e.g., .class1.class2, #id.class)
            const classes = trimmedSel.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g);
            const ids = trimmedSel.match(/#[a-zA-Z][a-zA-Z0-9_-]*/g);
            
            if (classes || ids) {
                let allSelectorsUsed = true;
                
                // Check all classes in compound selector
                if (classes) {
                    allSelectorsUsed = allSelectorsUsed && classes.every(cls => {
                        const className = cls.substring(1);
                        return this.usedClasses.has(className);
                    });
                }
                
                // Check all IDs in compound selector
                if (ids) {
                    allSelectorsUsed = allSelectorsUsed && ids.every(id => {
                        const idName = id.substring(1);
                        return this.usedIds.has(idName);
                    });
                }
                
                if (allSelectorsUsed && (classes?.length > 0 || ids?.length > 0)) {
                    return true;
                }
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
        
        // Remove unnecessary whitespace but preserve selector grouping structure
        compressed = compressed.replace(/\s+/g, ' ');
        
        // Remove whitespace around braces and semicolons - but preserve commas in selectors
        compressed = compressed.replace(/\s*{\s*/g, '{');
        compressed = compressed.replace(/\s*}\s*/g, '}');
        compressed = compressed.replace(/\s*;\s*/g, ';');
        compressed = compressed.replace(/\s*:\s*/g, ':');
        
        // CAREFULLY handle comma spacing - preserve commas in selectors but remove extra spaces
        // Only remove spaces around commas that are NOT inside function calls or @media queries
        compressed = compressed.replace(/(\w|[)\]])\s*,\s*(\w|[.#*:])/g, '$1,$2');
        
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

        const outputPath = path.resolve(process.cwd(), this.config.output);

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Add a header comment
        const header = `/* EVA CSS Purged - Generated on ${new Date().toISOString()} */\n`;
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
        console.log(`   Used IDs: ${this.usedIds.size}`);
    }
}

// Run the purger
if (require.main === module) {
    const purger = new CSSPurger();
    purger.purge();
}

module.exports = CSSPurger;