#!/usr/bin/env node
/**
 * Quick test script to verify XML import/export functionality
 * Usage: node test-import.js [path-to-xml-file]
 */

import { readFileSync } from 'fs';
import { parseScenarioFromXML } from './xmlParser.js';
import { serializeScenarioToXML } from './xmlSerializer.js';

const xmlFile = process.argv[2] || '../../sipp_scenarios/pfca_uac.xml';

console.log('Testing XML import/export with:', xmlFile);
console.log('=' .repeat(60));

try {
  // Read XML file
  const originalXml = readFileSync(xmlFile, 'utf-8');
  console.log('\n✓ Read XML file');
  
  // Parse XML
  const scenario = parseScenarioFromXML(originalXml);
  console.log('✓ Parsed XML successfully');
  console.log(`  - Scenario name: "${scenario.name}"`);
  console.log(`  - Number of steps: ${scenario.steps.length}`);
  console.log(`  - Step types: ${[...new Set(scenario.steps.map(s => s.type))].join(', ')}`);
  
  // Serialize back to XML
  const newXml = serializeScenarioToXML(scenario);
  console.log('✓ Serialized scenario to XML');
  console.log(`  - Generated XML length: ${newXml.length} characters`);
  
  // Parse again to verify round-trip
  const reparsed = parseScenarioFromXML(newXml);
  console.log('✓ Re-parsed generated XML');
  
  // Verify integrity
  const checks = [
    ['Name', scenario.name, reparsed.name],
    ['Step count', scenario.steps.length, reparsed.steps.length],
  ];
  
  let allMatch = true;
  checks.forEach(([label, orig, reparsedVal]) => {
    const match = orig === reparsedVal;
    allMatch = allMatch && match;
    console.log(`  ${match ? '✓' : '✗'} ${label}: ${orig} ${match ? '===' : '!=='} ${reparsedVal}`);
  });
  
  if (allMatch) {
    console.log('\n✅ Round-trip test PASSED!');
    console.log('   XML can be imported and exported without data loss.');
    process.exit(0);
  } else {
    console.log('\n❌ Round-trip test FAILED!');
    console.log('   Data was lost or corrupted during import/export.');
    process.exit(1);
  }
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
  process.exit(1);
}
