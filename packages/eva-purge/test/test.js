/**
 * Test script for @eva/purge
 */

const fs = require('fs');
const path = require('path');
const CSSPurger = require('../src/purge.js');

async function runTest() {
    console.log('🧪 EVA Purge - Running Tests\n');

    const testDir = __dirname;
    const sampleCSS = path.join(testDir, 'sample.css');
    const sampleHTML = path.join(testDir, 'sample.html');
    const outputCSS = path.join(testDir, 'sample-purged.css');

    // Verify test files exist
    if (!fs.existsSync(sampleCSS)) {
        console.error('❌ sample.css not found');
        process.exit(1);
    }

    if (!fs.existsSync(sampleHTML)) {
        console.error('❌ sample.html not found');
        process.exit(1);
    }

    console.log('📋 Test Configuration:');
    console.log(`   CSS Input:  ${sampleCSS}`);
    console.log(`   HTML Input: ${sampleHTML}`);
    console.log(`   CSS Output: ${outputCSS}\n`);

    // Run purger
    const config = {
        content: [path.join(testDir, '*.html')],
        css: sampleCSS,
        output: outputCSS
    };

    const purger = new CSSPurger(config);

    try {
        await purger.purge();

        // Verify output
        if (fs.existsSync(outputCSS)) {
            const outputContent = fs.readFileSync(outputCSS, 'utf8');

            console.log('\n🔍 Verification:');

            // Check that used classes are present
            const shouldInclude = [
                'current-theme',
                'theme-test',
                'container',
                'fs-16',
                'fs-32',
                'w-64',
                'p-16',
                '_c-brand',
                '_c-accent',
                '_c-light',
                '_c-dark',
                '_bg-accent',
                'active', // Dynamic class from JS
                'body',
                'h1',
                'p',
                'button'
            ];

            // Check that unused classes are removed
            const shouldExclude = [
                'unused-class',
                'another-unused',
                'w-128'
            ];

            let passed = 0;
            let failed = 0;

            console.log('\n✅ Classes that should be present:');
            shouldInclude.forEach(cls => {
                const present = outputContent.includes(cls);
                if (present) {
                    console.log(`   ✓ ${cls}`);
                    passed++;
                } else {
                    console.log(`   ✗ ${cls} - MISSING!`);
                    failed++;
                }
            });

            console.log('\n❌ Classes that should be removed:');
            shouldExclude.forEach(cls => {
                const present = outputContent.includes(cls);
                if (!present) {
                    console.log(`   ✓ ${cls} - correctly removed`);
                    passed++;
                } else {
                    console.log(`   ✗ ${cls} - STILL PRESENT!`);
                    failed++;
                }
            });

            // Check variables
            console.log('\n🎨 CSS Variables:');
            const hasVar16 = outputContent.includes('--16:');
            const hasVar32 = outputContent.includes('--32:');
            const hasVar64 = outputContent.includes('--64:');
            const hasUnusedVar = outputContent.includes('--unused-var:');

            console.log(`   ${hasVar16 ? '✓' : '✗'} --16 (used)`);
            console.log(`   ${hasVar32 ? '✓' : '✗'} --32 (used)`);
            console.log(`   ${hasVar64 ? '✓' : '✗'} --64 (used)`);
            console.log(`   ${!hasUnusedVar ? '✓' : '✗'} --unused-var (should be kept in :root)`);

            if (hasVar16) passed++;
            else failed++;
            if (hasVar32) passed++;
            else failed++;
            if (hasVar64) passed++;
            else failed++;

            // Final stats
            console.log(`\n📊 Test Results:`);
            console.log(`   Passed: ${passed}`);
            console.log(`   Failed: ${failed}`);

            if (failed === 0) {
                console.log('\n✅ All tests passed!');
                process.exit(0);
            } else {
                console.log('\n❌ Some tests failed!');
                process.exit(1);
            }
        } else {
            console.error('❌ Output file was not created');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        process.exit(1);
    }
}

runTest();
