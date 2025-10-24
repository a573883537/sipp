/**
 * SIPp XML Scenario Serializer
 * Converts internal scenario graph representation to sipp.dtd-compliant XML
 */

export class XMLSerializer {
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

export function serializeScenarioToXML(scenario) {
  const serializer = new XMLSerializer();
  return serializer.serializeScenario(scenario);
}
