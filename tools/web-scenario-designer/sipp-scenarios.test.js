import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseScenarioFromXML } from './xmlParser.js';
import { serializeScenarioToXML } from './xmlSerializer.js';

const SIPP_SCENARIOS_PATH = join(process.cwd(), '../../sipp_scenarios');

describe('SIPp Scenario Files Round-trip', () => {
  const testScenarios = [
    'pfca_uac.xml',
    'pfca_uas.xml',
    'mcd_register.xml',
  ];

  testScenarios.forEach(scenarioFile => {
    it(`should parse and round-trip ${scenarioFile}`, () => {
      const scenarioPath = join(SIPP_SCENARIOS_PATH, scenarioFile);
      
      if (!existsSync(scenarioPath)) {
        console.warn(`Skipping ${scenarioFile} - file not found`);
        return;
      }

      try {
        const originalXml = readFileSync(scenarioPath, 'utf-8');
        
        const parsed = parseScenarioFromXML(originalXml);
        
        expect(parsed).toBeDefined();
        expect(parsed.name).toBeDefined();
        expect(Array.isArray(parsed.steps)).toBe(true);
        
        const serialized = serializeScenarioToXML(parsed);
        
        expect(serialized).toContain('<?xml version="1.0" encoding="ISO-8859-1" ?>');
        expect(serialized).toContain('<!DOCTYPE scenario SYSTEM "sipp.dtd">');
        expect(serialized).toContain('<scenario');
        expect(serialized).toContain('</scenario>');
        
        const reparsed = parseScenarioFromXML(serialized);
        
        expect(reparsed.name).toBe(parsed.name);
        expect(reparsed.steps.length).toBe(parsed.steps.length);
        
        reparsed.steps.forEach((step, index) => {
          expect(step.type).toBe(parsed.steps[index].type);
          expect(Object.keys(step.attributes).length).toBeGreaterThanOrEqual(0);
        });
        
      } catch (error) {
        console.error(`Error processing ${scenarioFile}:`, error);
        throw error;
      }
    });
  });

  it('should handle scenarios with CDATA content', () => {
    const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="CDATA Test">
  <send retrans="500">
    <![CDATA[

      INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
      Content-Length: 0

    ]]>
  </send>
</scenario>`;

    const parsed = parseScenarioFromXML(xml);
    expect(parsed.steps[0].content).toContain('INVITE');
    
    const serialized = serializeScenarioToXML(parsed);
    expect(serialized).toContain('<![CDATA[');
    expect(serialized).toContain('INVITE');
  });

  it('should handle scenarios with multiple action types', () => {
    const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Actions Test">
  <recv response="200">
    <action>
      <ereg regexp=".*" search_in="hdr" header="Contact:" assign_to="contact"/>
      <log message="Contact extracted"/>
      <assign assign_to="var1" variable="contact"/>
    </action>
  </recv>
</scenario>`;

    const parsed = parseScenarioFromXML(xml);
    expect(parsed.steps[0].actions.length).toBe(3);
    expect(parsed.steps[0].actions[0].type).toBe('ereg');
    expect(parsed.steps[0].actions[1].type).toBe('log');
    expect(parsed.steps[0].actions[2].type).toBe('assign');
    
    const serialized = serializeScenarioToXML(parsed);
    const reparsed = parseScenarioFromXML(serialized);
    
    expect(reparsed.steps[0].actions.length).toBe(3);
    expect(reparsed.steps[0].actions[0].attributes.assign_to).toBe('contact');
    expect(reparsed.steps[0].actions[1].attributes.message).toBe('Contact extracted');
  });

  it('should handle optional recv messages', () => {
    const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Optional Test">
  <recv response="100" optional="true">
  </recv>
  <recv response="180" optional="true">
  </recv>
  <recv response="200">
  </recv>
</scenario>`;

    const parsed = parseScenarioFromXML(xml);
    expect(parsed.steps[0].attributes.optional).toBe('true');
    expect(parsed.steps[1].attributes.optional).toBe('true');
    expect(parsed.steps[2].attributes.optional).toBeUndefined();
    
    const serialized = serializeScenarioToXML(parsed);
    const reparsed = parseScenarioFromXML(serialized);
    
    expect(reparsed.steps[0].attributes.optional).toBe('true');
    expect(reparsed.steps[1].attributes.optional).toBe('true');
  });

  it('should preserve ResponseTimeRepartition and CallLengthRepartition', () => {
    const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Stats Test">
  <pause/>
  <ResponseTimeRepartition value="10, 20, 30, 40, 50, 100, 150, 200"/>
  <CallLengthRepartition value="10, 50, 100, 500, 1000, 5000, 10000"/>
</scenario>`;

    const parsed = parseScenarioFromXML(xml);
    expect(parsed.responseTimeRepartition).toBe('10, 20, 30, 40, 50, 100, 150, 200');
    expect(parsed.callLengthRepartition).toBe('10, 50, 100, 500, 1000, 5000, 10000');
    
    const serialized = serializeScenarioToXML(parsed);
    expect(serialized).toContain('ResponseTimeRepartition');
    expect(serialized).toContain('CallLengthRepartition');
    
    const reparsed = parseScenarioFromXML(serialized);
    expect(reparsed.responseTimeRepartition).toBe(parsed.responseTimeRepartition);
    expect(reparsed.callLengthRepartition).toBe(parsed.callLengthRepartition);
  });

  it('should handle exec actions with RTP streams', () => {
    const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="RTP Test">
  <recv response="200">
    <action>
      <exec rtp_stream="sipp_scenarios/coco_jamboo_ulaw.wav,-1,0,PCMU/8000"/>
    </action>
  </recv>
</scenario>`;

    const parsed = parseScenarioFromXML(xml);
    expect(parsed.steps[0].actions[0].type).toBe('exec');
    expect(parsed.steps[0].actions[0].attributes.rtp_stream).toContain('coco_jamboo_ulaw.wav');
    
    const serialized = serializeScenarioToXML(parsed);
    const reparsed = parseScenarioFromXML(serialized);
    
    expect(reparsed.steps[0].actions[0].attributes.rtp_stream).toBe(
      parsed.steps[0].actions[0].attributes.rtp_stream
    );
  });

  it('should handle request recv elements', () => {
    const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="UAS Test">
  <recv request="INVITE">
  </recv>
  <recv request="ACK">
  </recv>
  <recv request="BYE">
  </recv>
</scenario>`;

    const parsed = parseScenarioFromXML(xml);
    expect(parsed.steps[0].attributes.request).toBe('INVITE');
    expect(parsed.steps[1].attributes.request).toBe('ACK');
    expect(parsed.steps[2].attributes.request).toBe('BYE');
    
    const serialized = serializeScenarioToXML(parsed);
    const reparsed = parseScenarioFromXML(serialized);
    
    expect(reparsed.steps[0].attributes.request).toBe('INVITE');
    expect(reparsed.steps[1].attributes.request).toBe('ACK');
    expect(reparsed.steps[2].attributes.request).toBe('BYE');
  });

  it('should handle label and jump control flow', () => {
    const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Control Flow Test">
  <label id="start"/>
  <send>
    <![CDATA[MESSAGE]]>
  </send>
  <recv response="200">
  </recv>
  <label id="end"/>
</scenario>`;

    const parsed = parseScenarioFromXML(xml);
    expect(parsed.steps[0].type).toBe('label');
    expect(parsed.steps[0].attributes.id).toBe('start');
    expect(parsed.steps[3].type).toBe('label');
    expect(parsed.steps[3].attributes.id).toBe('end');
    
    const serialized = serializeScenarioToXML(parsed);
    const reparsed = parseScenarioFromXML(serialized);
    
    expect(reparsed.steps[0].attributes.id).toBe('start');
    expect(reparsed.steps[3].attributes.id).toBe('end');
  });

  it('should handle nop with actions', () => {
    const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="NOP Test">
  <nop display="Test point">
    <action>
      <log message="At test point"/>
    </action>
  </nop>
</scenario>`;

    const parsed = parseScenarioFromXML(xml);
    expect(parsed.steps[0].type).toBe('nop');
    expect(parsed.steps[0].attributes.display).toBe('Test point');
    expect(parsed.steps[0].actions.length).toBe(1);
    
    const serialized = serializeScenarioToXML(parsed);
    const reparsed = parseScenarioFromXML(serialized);
    
    expect(reparsed.steps[0].attributes.display).toBe('Test point');
    expect(reparsed.steps[0].actions[0].type).toBe('log');
  });

  it('should handle pause with different timing attributes', () => {
    const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Pause Test">
  <pause milliseconds="5000"/>
  <pause variable="pause_time"/>
  <pause distribution="uniform"/>
</scenario>`;

    const parsed = parseScenarioFromXML(xml);
    expect(parsed.steps[0].attributes.milliseconds).toBe('5000');
    expect(parsed.steps[1].attributes.variable).toBe('pause_time');
    expect(parsed.steps[2].attributes.distribution).toBe('uniform');
    
    const serialized = serializeScenarioToXML(parsed);
    const reparsed = parseScenarioFromXML(serialized);
    
    expect(reparsed.steps[0].attributes.milliseconds).toBe('5000');
    expect(reparsed.steps[1].attributes.variable).toBe('pause_time');
    expect(reparsed.steps[2].attributes.distribution).toBe('uniform');
  });
});
