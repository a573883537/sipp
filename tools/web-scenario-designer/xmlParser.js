/**
 * SIPp XML Scenario Parser
 * Parses sipp.dtd-compliant XML back into internal scenario graph representation
 * Uses DOMParser for both browser and Node.js environments
 */

import { XMLValidator } from 'fast-xml-parser';

let DOMParserClass;
if (typeof DOMParser !== 'undefined') {
  DOMParserClass = DOMParser;
} else {
  const { DOMParser: NodeDOMParser } = await import('@xmldom/xmldom');
  DOMParserClass = NodeDOMParser;
}

export class ScenarioParser {
  parseXML(xmlString) {
    const parser = new DOMParserClass();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error(`XML parsing failed: ${parseError[0].textContent}`);
    }

    const scenarioElement = xmlDoc.getElementsByTagName('scenario')[0];
    if (!scenarioElement) {
      throw new Error('No scenario element found in XML');
    }

    return this.parseScenario(scenarioElement);
  }

  parseScenario(scenarioElement) {
    const scenario = {
      name: scenarioElement.getAttribute('name') || 'Unnamed Scenario',
      steps: [],
      responseTimeRepartition: null,
      callLengthRepartition: null,
      references: [],
    };

    const childNodes = Array.from(scenarioElement.childNodes);
    
    for (const node of childNodes) {
      if (node.nodeType !== 1) continue; // Element nodes only

      const tagName = node.tagName.toLowerCase();

      if (['send', 'recv', 'pause', 'nop', 'sendcmd', 'recvcmd', 'label', 'timewait'].includes(tagName)) {
        scenario.steps.push(this.parseStep(tagName, node));
      } else if (tagName === 'responsetimerepartition') {
        scenario.responseTimeRepartition = node.getAttribute('value') || '';
      } else if (tagName === 'calllengthrepartition') {
        scenario.callLengthRepartition = node.getAttribute('value') || '';
      } else if (tagName === 'reference') {
        scenario.references.push(node.getAttribute('variables') || '');
      }
    }

    return scenario;
  }

  parseStep(type, element) {
    const step = {
      type,
      attributes: this.extractAttributes(element),
      actions: [],
    };

    const cdataContent = this.getCDATAContent(element);
    if (cdataContent) {
      step.content = cdataContent;
    } else {
      const hasChildElements = Array.from(element.childNodes).some(
        node => node.nodeType === 1
      );
      if (!hasChildElements && element.textContent && element.textContent.trim()) {
        step.content = element.textContent;
      }
    }

    const actionElements = element.getElementsByTagName('action');
    if (actionElements.length > 0) {
      step.actions = this.parseActions(actionElements[0]);
    }

    return step;
  }

  getCDATAContent(element) {
    const childNodes = Array.from(element.childNodes);
    const cdataNodes = childNodes.filter(node => node.nodeType === 4); // CDATA_SECTION_NODE
    
    if (cdataNodes.length > 0) {
      return cdataNodes.map(node => node.textContent).join('');
    }
    
    return null;
  }

  extractAttributes(element) {
    const attrs = {};
    if (element.hasAttributes()) {
      Array.from(element.attributes).forEach(attr => {
        attrs[attr.name] = attr.value;
      });
    }
    return attrs;
  }

  parseActions(actionElement) {
    const actions = [];
    const childNodes = Array.from(actionElement.childNodes);
    const childElements = childNodes.filter(node => node.nodeType === 1); // Element nodes only

    for (const element of childElements) {
      actions.push({
        type: element.tagName.toLowerCase(),
        attributes: this.extractAttributes(element),
      });
    }

    return actions;
  }
}

export function parseScenarioFromXML(xmlString) {
  const parser = new ScenarioParser();
  return parser.parseXML(xmlString);
}

export function validateXML(xmlString) {
  const result = XMLValidator.validate(xmlString, {
    allowBooleanAttributes: true,
  });

  if (result === true) {
    return { valid: true, errors: [] };
  } else {
    return {
      valid: false,
      errors: [{
        message: result.err.msg,
        line: result.err.line,
        code: result.err.code,
      }],
    };
  }
}
