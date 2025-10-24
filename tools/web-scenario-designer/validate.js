#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating SIPp Scenario Designer...\n');

const requiredFiles = [
    'index.html',
    'style.css',
    'app.js',
    'templates.js',
    'README.md',
    'package.json'
];

let allValid = true;

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${file} (${stats.size} bytes)`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allValid = false;
    }
});

console.log('\n📋 Checking templates.js...');
const templatesContent = fs.readFileSync(path.join(__dirname, 'templates.js'), 'utf8');
const templateKeys = ['blank', 'uac', 'uas', '3pcc', 'rtp', 'srtp'];
templateKeys.forEach(key => {
    const searchPattern = key === '3pcc' ? `'3pcc':` : `${key}:`;
    if (templatesContent.includes(searchPattern)) {
        console.log(`✅ Template '${key}' found`);
    } else {
        console.log(`❌ Template '${key}' - MISSING`);
        allValid = false;
    }
});

console.log('\n📋 Checking HTML structure...');
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const htmlChecks = [
    { pattern: /<title>.*SIPp.*Scenario.*Designer.*<\/title>/, desc: 'Page title' },
    { pattern: /data-template="uac"/, desc: 'UAC template button' },
    { pattern: /data-template="uas"/, desc: 'UAS template button' },
    { pattern: /data-template="3pcc"/, desc: '3PCC template button' },
    { pattern: /data-template="rtp"/, desc: 'RTP template button' },
    { pattern: /data-template="srtp"/, desc: 'SRTP template button' },
    { pattern: /id="help-modal"/, desc: 'Help modal' }
];

htmlChecks.forEach(check => {
    if (check.pattern.test(htmlContent)) {
        console.log(`✅ ${check.desc}`);
    } else {
        console.log(`❌ ${check.desc} - MISSING`);
        allValid = false;
    }
});

console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('✅ All validation checks passed!');
    console.log('\nTo start the designer:');
    console.log('  npm start');
    console.log('or');
    console.log('  open index.html in your browser');
    process.exit(0);
} else {
    console.log('❌ Some validation checks failed!');
    process.exit(1);
}
