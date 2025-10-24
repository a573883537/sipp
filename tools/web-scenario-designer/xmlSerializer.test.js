import { describe, it, expect } from 'vitest';
import { XMLSerializer, serializeScenarioToXML } from './xmlSerializer.js';

describe('XMLSerializer', () => {
  describe('Basic Scenario Serialization', () => {
    it('should serialize a minimal scenario', () => {
      const scenario = {
        name: 'Test Scenario',
        steps: [],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<?xml version="1.0" encoding="ISO-8859-1" ?>');
      expect(xml).toContain('<!DOCTYPE scenario SYSTEM "sipp.dtd">');
      expect(xml).toContain('<scenario name="Test Scenario">');
      expect(xml).toContain('</scenario>');
    });

    it('should serialize scenario with ResponseTimeRepartition', () => {
      const scenario = {
        name: 'Test',
        steps: [],
        responseTimeRepartition: '10, 20, 30, 40, 50, 100, 150, 200',
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<ResponseTimeRepartition value="10, 20, 30, 40, 50, 100, 150, 200"/>');
    });

    it('should serialize scenario with CallLengthRepartition', () => {
      const scenario = {
        name: 'Test',
        steps: [],
        callLengthRepartition: '10, 50, 100, 500, 1000, 5000, 10000',
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<CallLengthRepartition value="10, 50, 100, 500, 1000, 5000, 10000"/>');
    });

    it('should serialize scenario with references', () => {
      const scenario = {
        name: 'Test',
        steps: [],
        references: ['1', '2'],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<Reference variables="1"/>');
      expect(xml).toContain('<Reference variables="2"/>');
    });
  });

  describe('Send Step Serialization', () => {
    it('should serialize a basic send step', () => {
      const scenario = {
        name: 'Test',
        steps: [
          {
            type: 'send',
            attributes: { retrans: '500' },
            content: 'INVITE sip:test@example.com SIP/2.0',
          },
        ],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<send retrans="500">');
      expect(xml).toContain('<![CDATA[');
      expect(xml).toContain('INVITE sip:test@example.com SIP/2.0');
      expect(xml).toContain(']]>');
      expect(xml).toContain('</send>');
    });

    it('should serialize send step with actions', () => {
      const scenario = {
        name: 'Test',
        steps: [
          {
            type: 'send',
            attributes: {},
            content: 'ACK',
            actions: [
              {
                type: 'log',
                attributes: { message: 'Sending ACK' },
              },
            ],
          },
        ],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<action>');
      expect(xml).toContain('<log message="Sending ACK"/>');
      expect(xml).toContain('</action>');
    });
  });

  describe('Recv Step Serialization', () => {
    it('should serialize a basic recv step', () => {
      const scenario = {
        name: 'Test',
        steps: [
          {
            type: 'recv',
            attributes: { response: '200', optional: 'true' },
          },
        ],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<recv response="200" optional="true">');
      expect(xml).toContain('</recv>');
    });

    it('should serialize recv step with actions', () => {
      const scenario = {
        name: 'Test',
        steps: [
          {
            type: 'recv',
            attributes: { response: '200' },
            actions: [
              {
                type: 'ereg',
                attributes: {
                  regexp: '.*',
                  search_in: 'hdr',
                  header: 'CSeq:',
                  assign_to: '1',
                },
              },
            ],
          },
        ],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<action>');
      expect(xml).toContain('<ereg');
      expect(xml).toContain('regexp=".*"');
      expect(xml).toContain('search_in="hdr"');
      expect(xml).toContain('header="CSeq:"');
      expect(xml).toContain('assign_to="1"');
      expect(xml).toContain('</action>');
    });
  });

  describe('Pause Step Serialization', () => {
    it('should serialize a pause step', () => {
      const scenario = {
        name: 'Test',
        steps: [
          {
            type: 'pause',
            attributes: { milliseconds: '5000' },
          },
        ],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<pause milliseconds="5000"/>');
    });

    it('should serialize a pause without attributes', () => {
      const scenario = {
        name: 'Test',
        steps: [
          {
            type: 'pause',
            attributes: {},
          },
        ],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<pause/>');
    });
  });

  describe('Label and Control Steps', () => {
    it('should serialize a label step', () => {
      const scenario = {
        name: 'Test',
        steps: [
          {
            type: 'label',
            attributes: { id: '1' },
            content: '',
          },
        ],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<label id="1"></label>');
    });

    it('should serialize a timewait step', () => {
      const scenario = {
        name: 'Test',
        steps: [
          {
            type: 'timewait',
            attributes: { milliseconds: '4000' },
          },
        ],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<timewait milliseconds="4000"/>');
    });

    it('should serialize a nop step', () => {
      const scenario = {
        name: 'Test',
        steps: [
          {
            type: 'nop',
            attributes: { display: 'Test display' },
          },
        ],
      };

      const xml = serializeScenarioToXML(scenario);

      expect(xml).toContain('<nop display="Test display"/>');
    });
  });

  describe('XML Escaping', () => {
    it('should escape special XML characters', () => {
      const serializer = new XMLSerializer();
      
      expect(serializer.escapeXML('<test>')).toBe('&lt;test&gt;');
      expect(serializer.escapeXML('a & b')).toBe('a &amp; b');
      expect(serializer.escapeXML('"quoted"')).toBe('&quot;quoted&quot;');
      expect(serializer.escapeXML("'quoted'")).toBe('&apos;quoted&apos;');
    });
  });

  describe('Attribute Serialization', () => {
    it('should filter out null and undefined attributes', () => {
      const serializer = new XMLSerializer();
      const attrs = {
        name: 'test',
        value: null,
        other: undefined,
        empty: '',
      };

      const result = serializer.serializeAttributes(attrs);
      
      expect(result).toContain('name="test"');
      expect(result).not.toContain('value');
      expect(result).not.toContain('other');
      expect(result).not.toContain('empty');
    });
  });
});
