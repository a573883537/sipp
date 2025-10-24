/**
 * Scenario Manager - Browser-compatible module for XML import/export
 * This file can be loaded directly in the browser
 */

class XMLSerializerBrowser {
  constructor() {
    this.indentLevel = 0;
    this.indentChar = '  ';
  }

  indent() {
    return this.indentChar.repeat(this.indentLevel);
  }

  escapeXML(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  serializeAttributes(attrs) {
    if (!attrs || Object.keys(attrs).length === 0) return '';
    return Object.entries(attrs)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => ` ${key}="${this.escapeXML(String(value))}"`)
      .join('');
  }

  serializeScenario(scenario) {
    const lines = [];
    lines.push('<?xml version="1.0" encoding="ISO-8859-1" ?>');
    lines.push('<!DOCTYPE scenario SYSTEM "sipp.dtd">');
    lines.push('');
    
    const scenarioAttrs = scenario.name ? { name: scenario.name } : {};
    lines.push(`<scenario${this.serializeAttributes(scenarioAttrs)}>`);
    this.indentLevel++;

    if (scenario.steps && scenario.steps.length > 0) {
      for (const step of scenario.steps) {
        lines.push(this.serializeStep(step));
      }
    }

    if (scenario.responseTimeRepartition) {
      lines.push(this.indent() + `<ResponseTimeRepartition value="${scenario.responseTimeRepartition}"/>`);
    }

    if (scenario.callLengthRepartition) {
      lines.push(this.indent() + `<CallLengthRepartition value="${scenario.callLengthRepartition}"/>`);
    }

    if (scenario.references && scenario.references.length > 0) {
      for (const ref of scenario.references) {
        lines.push(this.indent() + `<Reference variables="${ref}"/>`);
      }
    }

    this.indentLevel--;
    lines.push('</scenario>');
    lines.push('');

    return lines.join('\n');
  }

  serializeStep(step) {
    const lines = [];
    
    switch (step.type) {
      case 'send':
        lines.push(...this.serializeSend(step));
        break;
      case 'recv':
        lines.push(...this.serializeRecv(step));
        break;
      case 'pause':
        lines.push(this.serializePause(step));
        break;
      case 'nop':
        lines.push(this.serializeNop(step));
        break;
      case 'label':
        lines.push(this.serializeLabel(step));
        break;
      case 'timewait':
        lines.push(this.serializeTimewait(step));
        break;
      case 'sendCmd':
        lines.push(...this.serializeSendCmd(step));
        break;
      case 'recvCmd':
        lines.push(...this.serializeRecvCmd(step));
        break;
      default:
        console.warn(`Unknown step type: ${step.type}`);
    }

    return lines.join('\n');
  }

  serializeSend(step) {
    const lines = [];
    const attrs = { ...step.attributes };
    
    lines.push(this.indent() + `<send${this.serializeAttributes(attrs)}>`);
    
    if (step.content) {
      this.indentLevel++;
      lines.push(this.indent() + '<![CDATA[');
      lines.push('');
      
      const contentLines = step.content.split('\n');
      contentLines.forEach(line => {
        lines.push(this.indent() + line);
      });
      
      lines.push(this.indent() + ']]>');
      this.indentLevel--;
    }

    if (step.actions && step.actions.length > 0) {
      this.indentLevel++;
      lines.push(this.indent() + '<action>');
      this.indentLevel++;
      step.actions.forEach(action => {
        lines.push(this.serializeAction(action));
      });
      this.indentLevel--;
      lines.push(this.indent() + '</action>');
      this.indentLevel--;
    }

    lines.push(this.indent() + '</send>');
    lines.push('');
    
    return lines;
  }

  serializeRecv(step) {
    const lines = [];
    const attrs = { ...step.attributes };
    
    if (step.actions && step.actions.length > 0) {
      lines.push(this.indent() + `<recv${this.serializeAttributes(attrs)}>`);
      this.indentLevel++;
      lines.push(this.indent() + '<action>');
      this.indentLevel++;
      step.actions.forEach(action => {
        lines.push(this.serializeAction(action));
      });
      this.indentLevel--;
      lines.push(this.indent() + '</action>');
      this.indentLevel--;
      lines.push(this.indent() + '</recv>');
    } else {
      lines.push(this.indent() + `<recv${this.serializeAttributes(attrs)}>`);
      lines.push(this.indent() + '</recv>');
    }
    
    lines.push('');
    return lines;
  }

  serializePause(step) {
    const attrs = { ...step.attributes };
    return this.indent() + `<pause${this.serializeAttributes(attrs)}/>\n`;
  }

  serializeNop(step) {
    const lines = [];
    const attrs = { ...step.attributes };
    
    if (step.actions && step.actions.length > 0) {
      lines.push(this.indent() + `<nop${this.serializeAttributes(attrs)}>`);
      this.indentLevel++;
      lines.push(this.indent() + '<action>');
      this.indentLevel++;
      step.actions.forEach(action => {
        lines.push(this.serializeAction(action));
      });
      this.indentLevel--;
      lines.push(this.indent() + '</action>');
      this.indentLevel--;
      lines.push(this.indent() + '</nop>');
    } else {
      lines.push(this.indent() + `<nop${this.serializeAttributes(attrs)}/>`);
    }
    
    lines.push('');
    return lines.join('\n');
  }

  serializeLabel(step) {
    const attrs = step.attributes || {};
    return this.indent() + `<label${this.serializeAttributes(attrs)}>${this.escapeXML(step.content || '')}</label>\n`;
  }

  serializeTimewait(step) {
    const attrs = step.attributes || {};
    return this.indent() + `<timewait${this.serializeAttributes(attrs)}/>\n`;
  }

  serializeSendCmd(step) {
    const lines = [];
    const attrs = { ...step.attributes };
    
    lines.push(this.indent() + `<sendCmd${this.serializeAttributes(attrs)}>`);
    if (step.content) {
      this.indentLevel++;
      lines.push(this.indent() + this.escapeXML(step.content));
      this.indentLevel--;
    }
    lines.push(this.indent() + '</sendCmd>');
    lines.push('');
    
    return lines;
  }

  serializeRecvCmd(step) {
    const lines = [];
    const attrs = { ...step.attributes };
    
    if (step.actions && step.actions.length > 0) {
      lines.push(this.indent() + `<recvCmd${this.serializeAttributes(attrs)}>`);
      this.indentLevel++;
      lines.push(this.indent() + '<action>');
      this.indentLevel++;
      step.actions.forEach(action => {
        lines.push(this.serializeAction(action));
      });
      this.indentLevel--;
      lines.push(this.indent() + '</action>');
      this.indentLevel--;
      lines.push(this.indent() + '</recvCmd>');
    } else {
      lines.push(this.indent() + `<recvCmd${this.serializeAttributes(attrs)}>`);
      lines.push(this.indent() + '</recvCmd>');
    }
    
    lines.push('');
    return lines;
  }

  serializeAction(action) {
    const attrs = { ...action.attributes };
    return this.indent() + `<${action.type}${this.serializeAttributes(attrs)}/>`;
  }
}

class ScenarioParserBrowser {
  parseXML(xmlString) {
    const parser = new DOMParser();
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
      if (node.nodeType !== Node.ELEMENT_NODE) continue;

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

    const cdataNodes = this.getCDATAContent(element);
    if (cdataNodes) {
      step.content = cdataNodes;
    } else if (element.textContent && element.textContent.trim()) {
      const hasChildElements = Array.from(element.childNodes).some(
        node => node.nodeType === Node.ELEMENT_NODE
      );
      if (!hasChildElements) {
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
    const cdataNodes = childNodes.filter(node => node.nodeType === Node.CDATA_SECTION_NODE);
    
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
    const childElements = Array.from(actionElement.children);

    for (const element of childElements) {
      actions.push({
        type: element.tagName.toLowerCase(),
        attributes: this.extractAttributes(element),
      });
    }

    return actions;
  }
}

function serializeScenarioToXML(scenario) {
  const serializer = new XMLSerializerBrowser();
  return serializer.serializeScenario(scenario);
}

function parseScenarioFromXML(xmlString) {
  const parser = new ScenarioParserBrowser();
  return parser.parseXML(xmlString);
}

function validateXMLBasic(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const parseError = xmlDoc.getElementsByTagName('parsererror');

  if (parseError.length > 0) {
    return {
      valid: false,
      errors: [{
        message: parseError[0].textContent,
        type: 'parse'
      }]
    };
  }

  const scenario = xmlDoc.getElementsByTagName('scenario');
  if (scenario.length === 0) {
    return {
      valid: false,
      errors: [{
        message: 'No <scenario> element found in XML',
        type: 'structure'
      }]
    };
  }

  return { valid: true, errors: [] };
}
