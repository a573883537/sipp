/**
 * DTD Validator for SIPp XML scenarios
 * Integrates with xmllint for DTD validation
 */

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export class DTDValidator {
  constructor(dtdPath = '../../sipp.dtd') {
    this.dtdPath = dtdPath;
  }

  async validateWithXmllint(xmlContent) {
    return new Promise((resolve) => {
      const tmpFile = join(tmpdir(), `sipp-scenario-${Date.now()}.xml`);
      
      try {
        writeFileSync(tmpFile, xmlContent);

        const xmllint = spawn('xmllint', [
          '--dtdvalid', this.dtdPath,
          '--noout',
          tmpFile
        ]);

        let stderr = '';
        
        xmllint.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        xmllint.on('close', (code) => {
          try {
            unlinkSync(tmpFile);
          } catch (e) {
            console.warn('Failed to clean up temp file:', e);
          }

          if (code === 0) {
            resolve({ valid: true, errors: [] });
          } else {
            const errors = this.parseXmllintErrors(stderr);
            resolve({ valid: false, errors });
          }
        });

        xmllint.on('error', (err) => {
          try {
            unlinkSync(tmpFile);
          } catch (e) {
            // Ignore cleanup errors
          }
          
          if (err.code === 'ENOENT') {
            resolve({
              valid: false,
              errors: [{
                message: 'xmllint not found. Please install libxml2-utils (Debian/Ubuntu) or libxml2 (macOS/others)',
                type: 'system'
              }]
            });
          } else {
            resolve({
              valid: false,
              errors: [{
                message: `Validation error: ${err.message}`,
                type: 'system'
              }]
            });
          }
        });
      } catch (err) {
        resolve({
          valid: false,
          errors: [{
            message: `Failed to validate: ${err.message}`,
            type: 'system'
          }]
        });
      }
    });
  }

  parseXmllintErrors(stderr) {
    const errors = [];
    const lines = stderr.split('\n');
    
    for (const line of lines) {
      if (line.trim() && !line.includes('validates')) {
        const lineMatch = line.match(/line (\d+):/);
        const lineNum = lineMatch ? parseInt(lineMatch[1]) : null;
        
        errors.push({
          message: line.trim(),
          line: lineNum,
          type: 'dtd'
        });
      }
    }
    
    return errors.length > 0 ? errors : [{ message: stderr.trim(), type: 'dtd' }];
  }

  async isXmllintAvailable() {
    return new Promise((resolve) => {
      const xmllint = spawn('which', ['xmllint']);
      xmllint.on('close', (code) => {
        resolve(code === 0);
      });
      xmllint.on('error', () => {
        resolve(false);
      });
    });
  }
}

export async function validateWithDTD(xmlContent, dtdPath) {
  const validator = new DTDValidator(dtdPath);
  
  const available = await validator.isXmllintAvailable();
  if (!available) {
    return {
      valid: null,
      errors: [{
        message: 'xmllint is not available. DTD validation skipped.',
        type: 'warning'
      }]
    };
  }
  
  return await validator.validateWithXmllint(xmlContent);
}
