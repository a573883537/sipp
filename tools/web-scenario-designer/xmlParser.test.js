import { describe, it, expect } from 'vitest';
import { ScenarioParser, parseScenarioFromXML, validateXML } from './xmlParser.js';

describe('ScenarioParser', () => {
  describe('Basic XML Parsing', () => {
    it('should parse a minimal scenario', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test Scenario">
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.name).toBe('Test Scenario');
      expect(scenario.steps).toEqual([]);
    });

    it('should handle scenario without name attribute', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.name).toBe('Unnamed Scenario');
    });

    it('should throw error for invalid XML', () => {
      const xml = '<scenario><invalid';

      expect(() => parseScenarioFromXML(xml)).toThrow();
    });

    it('should throw error when no scenario element', () => {
      const xml = '<?xml version="1.0"?><root></root>';

      expect(() => parseScenarioFromXML(xml)).toThrow('No scenario element found');
    });
  });

  describe('Send Step Parsing', () => {
    it('should parse a send step with CDATA content', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <send retrans="500">
    <![CDATA[
INVITE sip:test@example.com SIP/2.0
Via: SIP/2.0/UDP [local_ip]:[local_port]
    ]]>
  </send>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.steps).toHaveLength(1);
      expect(scenario.steps[0].type).toBe('send');
      expect(scenario.steps[0].attributes.retrans).toBe('500');
      expect(scenario.steps[0].content).toContain('INVITE sip:test@example.com');
    });

    it('should parse send step with actions', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <send>
    <![CDATA[ACK]]>
    <action>
      <log message="Sending ACK"/>
    </action>
  </send>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.steps[0].actions).toHaveLength(1);
      expect(scenario.steps[0].actions[0].type).toBe('log');
      expect(scenario.steps[0].actions[0].attributes.message).toBe('Sending ACK');
    });
  });

  describe('Recv Step Parsing', () => {
    it('should parse a recv step', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <recv response="200" optional="true">
  </recv>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.steps).toHaveLength(1);
      expect(scenario.steps[0].type).toBe('recv');
      expect(scenario.steps[0].attributes.response).toBe('200');
      expect(scenario.steps[0].attributes.optional).toBe('true');
    });

    it('should parse recv step with ereg action', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <recv response="200">
    <action>
      <ereg regexp=".*" search_in="hdr" header="CSeq:" assign_to="1"/>
    </action>
  </recv>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.steps[0].actions).toHaveLength(1);
      expect(scenario.steps[0].actions[0].type).toBe('ereg');
      expect(scenario.steps[0].actions[0].attributes.regexp).toBe('.*');
      expect(scenario.steps[0].actions[0].attributes.header).toBe('CSeq:');
    });
  });

  describe('Pause Step Parsing', () => {
    it('should parse a pause step', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <pause milliseconds="5000"/>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.steps).toHaveLength(1);
      expect(scenario.steps[0].type).toBe('pause');
      expect(scenario.steps[0].attributes.milliseconds).toBe('5000');
    });

    it('should parse a pause without attributes', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <pause/>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.steps[0].type).toBe('pause');
      expect(Object.keys(scenario.steps[0].attributes)).toHaveLength(0);
    });
  });

  describe('Label and Control Steps', () => {
    it('should parse a label step', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <label id="1"/>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.steps[0].type).toBe('label');
      expect(scenario.steps[0].attributes.id).toBe('1');
    });

    it('should parse a timewait step', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <timewait milliseconds="4000"/>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.steps[0].type).toBe('timewait');
      expect(scenario.steps[0].attributes.milliseconds).toBe('4000');
    });

    it('should parse a nop step', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <nop display="Test display"/>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.steps[0].type).toBe('nop');
      expect(scenario.steps[0].attributes.display).toBe('Test display');
    });
  });

  describe('Repartition and Reference Parsing', () => {
    it('should parse ResponseTimeRepartition', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <ResponseTimeRepartition value="10, 20, 30, 40, 50"/>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.responseTimeRepartition).toBe('10, 20, 30, 40, 50');
    });

    it('should parse CallLengthRepartition', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <CallLengthRepartition value="100, 500, 1000"/>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.callLengthRepartition).toBe('100, 500, 1000');
    });

    it('should parse Reference elements', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <Reference variables="1"/>
  <Reference variables="2"/>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.references).toEqual(['1', '2']);
    });
  });

  describe('Multiple Actions Parsing', () => {
    it('should parse multiple actions in one action element', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test">
  <recv response="200">
    <action>
      <ereg regexp=".*" assign_to="1"/>
      <log message="Received"/>
      <assign assign_to="2" variable="1"/>
    </action>
  </recv>
</scenario>`;

      const scenario = parseScenarioFromXML(xml);

      expect(scenario.steps[0].actions).toHaveLength(3);
      expect(scenario.steps[0].actions[0].type).toBe('ereg');
      expect(scenario.steps[0].actions[1].type).toBe('log');
      expect(scenario.steps[0].actions[2].type).toBe('assign');
    });
  });

  describe('XML Validation', () => {
    it('should validate correct XML', () => {
      const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<scenario name="Test">
  <send retrans="500">
    <![CDATA[INVITE]]>
  </send>
</scenario>`;

      const result = validateXML(xml);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid XML', () => {
      const xml = '<scenario><invalid';

      const result = validateXML(xml);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
