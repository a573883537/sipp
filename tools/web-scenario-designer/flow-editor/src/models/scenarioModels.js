/**
 * Typed models for SIP scenario elements based on sipp.dtd and scenario.cpp
 */

export const MessageType = {
  SEND: 'send',
  RECV: 'recv',
  PAUSE: 'pause',
  NOP: 'nop',
  SENDCMD: 'sendCmd',
  RECVCMD: 'recvCmd',
  LABEL: 'label',
  TIMEWAIT: 'timewait'
};

export const ActionType = {
  EREG: 'ereg',
  LOG: 'log',
  WARNING: 'warning',
  ERROR: 'error',
  EXEC: 'exec',
  RTP_ECHO: 'rtp_echo',
  STRCMP: 'strcmp',
  TEST: 'test',
  ASSIGN: 'assign',
  ASSIGNSTR: 'assignstr',
  ADD: 'add',
  SUBTRACT: 'subtract',
  MULTIPLY: 'multiply',
  DIVIDE: 'divide',
  JUMP: 'jump',
  PAUSE_RESTORE: 'pauserestore',
  LOOKUP: 'lookup',
  INSERT: 'insert',
  REPLACE: 'replace',
  SET_DEST: 'setdest',
  CLOSE_CON: 'closecon',
  VERIFY_AUTH: 'verifyauth',
  GET_TIME_OF_DAY: 'gettimeofday',
  INDEX: 'index',
  URLDECODE: 'urldecode',
  URLENCODE: 'urlencode',
  TRIM: 'trim',
  SAMPLE: 'sample',
  TO_DOUBLE: 'todouble'
};

export class ScenarioNode {
  constructor(type, id = null) {
    this.id = id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.position = { x: 0, y: 0 };
  }

  toXML() {
    throw new Error('toXML must be implemented by subclass');
  }

  static fromXML(element) {
    throw new Error('fromXML must be implemented by subclass');
  }
}

export class SendNode extends ScenarioNode {
  constructor(id = null) {
    super(MessageType.SEND, id);
    this.content = '';
    this.retrans = null;
    this.lost = null;
    this.start_txn = null;
    this.ack_txn = null;
    this.start_rtd = null;
    this.rtd = null;
    this.repeat_rtd = false;
    this.crlf = false;
    this.next = null;
    this.test = null;
    this.chance = null;
    this.condexec = null;
    this.condexec_inverse = false;
    this.counter = null;
    this.actions = [];
  }

  toXML() {
    const attrs = [];
    if (this.retrans) attrs.push(`retrans="${this.retrans}"`);
    if (this.lost) attrs.push(`lost="${this.lost}"`);
    if (this.start_txn) attrs.push(`start_txn="${this.start_txn}"`);
    if (this.ack_txn) attrs.push(`ack_txn="${this.ack_txn}"`);
    if (this.start_rtd) attrs.push(`start_rtd="${this.start_rtd}"`);
    if (this.rtd) attrs.push(`rtd="${this.rtd}"`);
    if (this.repeat_rtd) attrs.push(`repeat_rtd="true"`);
    if (this.crlf) attrs.push(`crlf="true"`);
    if (this.next) attrs.push(`next="${this.next}"`);
    if (this.test) attrs.push(`test="${this.test}"`);
    if (this.chance) attrs.push(`chance="${this.chance}"`);
    if (this.condexec) attrs.push(`condexec="${this.condexec}"`);
    if (this.condexec_inverse) attrs.push(`condexec_inverse="true"`);
    if (this.counter) attrs.push(`counter="${this.counter}"`);

    const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    const actionsXML = this.actions.map(a => a.toXML()).join('\n      ');
    const actionsBlock = actionsXML ? `\n    <action>\n      ${actionsXML}\n    </action>\n    ` : '';

    return `  <send${attrsStr}>
    <![CDATA[${this.content}]]>${actionsBlock}</send>`;
  }
}

export class RecvNode extends ScenarioNode {
  constructor(id = null) {
    super(MessageType.RECV, id);
    this.response = null;
    this.request = null;
    this.optional = false;
    this.rrs = false;
    this.auth = false;
    this.lost = null;
    this.timeout = null;
    this.ontimeout = null;
    this.regexp_match = false;
    this.response_txn = null;
    this.start_rtd = null;
    this.rtd = null;
    this.repeat_rtd = false;
    this.crlf = false;
    this.next = null;
    this.test = null;
    this.chance = null;
    this.condexec = null;
    this.condexec_inverse = false;
    this.counter = null;
    this.actions = [];
  }

  toXML() {
    const attrs = [];
    if (this.response) attrs.push(`response="${this.response}"`);
    if (this.request) attrs.push(`request="${this.request}"`);
    if (this.optional) attrs.push(`optional="true"`);
    if (this.rrs) attrs.push(`rrs="true"`);
    if (this.auth) attrs.push(`auth="true"`);
    if (this.lost) attrs.push(`lost="${this.lost}"`);
    if (this.timeout) attrs.push(`timeout="${this.timeout}"`);
    if (this.ontimeout) attrs.push(`ontimeout="${this.ontimeout}"`);
    if (this.regexp_match) attrs.push(`regexp_match="true"`);
    if (this.response_txn) attrs.push(`response_txn="${this.response_txn}"`);
    if (this.start_rtd) attrs.push(`start_rtd="${this.start_rtd}"`);
    if (this.rtd) attrs.push(`rtd="${this.rtd}"`);
    if (this.repeat_rtd) attrs.push(`repeat_rtd="true"`);
    if (this.crlf) attrs.push(`crlf="true"`);
    if (this.next) attrs.push(`next="${this.next}"`);
    if (this.test) attrs.push(`test="${this.test}"`);
    if (this.chance) attrs.push(`chance="${this.chance}"`);
    if (this.condexec) attrs.push(`condexec="${this.condexec}"`);
    if (this.condexec_inverse) attrs.push(`condexec_inverse="true"`);
    if (this.counter) attrs.push(`counter="${this.counter}"`);

    const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    const actionsXML = this.actions.map(a => a.toXML()).join('\n      ');
    const actionsBlock = actionsXML ? `\n    <action>\n      ${actionsXML}\n    </action>\n  ` : ' /';

    return `  <recv${attrsStr}${actionsBlock}>`;
  }
}

export class PauseNode extends ScenarioNode {
  constructor(id = null) {
    super(MessageType.PAUSE, id);
    this.milliseconds = 1000;
    this.variable = null;
    this.distribution = null;
    this.sanity_check = true;
    this.start_rtd = null;
    this.rtd = null;
    this.next = null;
    this.test = null;
    this.chance = null;
    this.condexec = null;
    this.condexec_inverse = false;
  }

  toXML() {
    const attrs = [];
    if (this.milliseconds) attrs.push(`milliseconds="${this.milliseconds}"`);
    if (this.variable) attrs.push(`variable="${this.variable}"`);
    if (this.distribution) attrs.push(`distribution="${this.distribution}"`);
    if (!this.sanity_check) attrs.push(`sanity_check="false"`);
    if (this.start_rtd) attrs.push(`start_rtd="${this.start_rtd}"`);
    if (this.rtd) attrs.push(`rtd="${this.rtd}"`);
    if (this.next) attrs.push(`next="${this.next}"`);
    if (this.test) attrs.push(`test="${this.test}"`);
    if (this.chance) attrs.push(`chance="${this.chance}"`);
    if (this.condexec) attrs.push(`condexec="${this.condexec}"`);
    if (this.condexec_inverse) attrs.push(`condexec_inverse="true"`);

    const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    return `  <pause${attrsStr} />`;
  }
}

export class NopNode extends ScenarioNode {
  constructor(id = null) {
    super(MessageType.NOP, id);
    this.display = null;
    this.actions = [];
    this.start_rtd = null;
    this.rtd = null;
    this.next = null;
    this.test = null;
    this.chance = null;
    this.condexec = null;
    this.condexec_inverse = false;
  }

  toXML() {
    const attrs = [];
    if (this.display) attrs.push(`display="${this.display}"`);
    if (this.start_rtd) attrs.push(`start_rtd="${this.start_rtd}"`);
    if (this.rtd) attrs.push(`rtd="${this.rtd}"`);
    if (this.next) attrs.push(`next="${this.next}"`);
    if (this.test) attrs.push(`test="${this.test}"`);
    if (this.chance) attrs.push(`chance="${this.chance}"`);
    if (this.condexec) attrs.push(`condexec="${this.condexec}"`);
    if (this.condexec_inverse) attrs.push(`condexec_inverse="true"`);

    const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    const actionsXML = this.actions.map(a => a.toXML()).join('\n      ');
    const actionsBlock = actionsXML ? `\n    <action>\n      ${actionsXML}\n    </action>\n  ` : ' /';

    return `  <nop${attrsStr}${actionsBlock}>`;
  }
}

export class LabelNode extends ScenarioNode {
  constructor(id = null) {
    super(MessageType.LABEL, id);
    this.labelId = '';
  }

  toXML() {
    return `  <label id="${this.labelId}" />`;
  }
}

export class TimewaitNode extends ScenarioNode {
  constructor(id = null) {
    super(MessageType.TIMEWAIT, id);
    this.milliseconds = 4000;
  }

  toXML() {
    return `  <timewait milliseconds="${this.milliseconds}" />`;
  }
}

export class Action {
  constructor(type) {
    this.type = type;
  }

  toXML() {
    throw new Error('toXML must be implemented by subclass');
  }
}

export class EregAction extends Action {
  constructor() {
    super(ActionType.EREG);
    this.regexp = '';
    this.search_in = 'msg';
    this.header = null;
    this.assign_to = '';
    this.check_it = false;
    this.start_line = false;
  }

  toXML() {
    const attrs = [`regexp="${this.regexp}"`, `assign_to="${this.assign_to}"`];
    if (this.search_in !== 'msg') attrs.push(`search_in="${this.search_in}"`);
    if (this.header) attrs.push(`header="${this.header}"`);
    if (this.check_it) attrs.push(`check_it="true"`);
    if (this.start_line) attrs.push(`start_line="true"`);
    return `<ereg ${attrs.join(' ')} />`;
  }
}

export class LogAction extends Action {
  constructor() {
    super(ActionType.LOG);
    this.message = '';
  }

  toXML() {
    return `<log message="${this.message}" />`;
  }
}

export class ExecAction extends Action {
  constructor() {
    super(ActionType.EXEC);
    this.command = null;
    this.int_cmd = null;
    this.play_pcap = null;
    this.play_pcap_audio = null;
    this.rtp_stream = null;
    this.rtp_echo = null;
  }

  toXML() {
    const attrs = [];
    if (this.command) attrs.push(`command="${this.command}"`);
    if (this.int_cmd) attrs.push(`int_cmd="${this.int_cmd}"`);
    if (this.play_pcap) attrs.push(`play_pcap="${this.play_pcap}"`);
    if (this.play_pcap_audio) attrs.push(`play_pcap_audio="${this.play_pcap_audio}"`);
    if (this.rtp_stream) attrs.push(`rtp_stream="${this.rtp_stream}"`);
    if (this.rtp_echo) attrs.push(`rtp_echo="${this.rtp_echo}"`);
    return `<exec ${attrs.join(' ')} />`;
  }
}

export class AssignAction extends Action {
  constructor() {
    super(ActionType.ASSIGN);
    this.assign_to = '';
    this.variable = '';
  }

  toXML() {
    return `<assign assign_to="${this.assign_to}" variable="${this.variable}" />`;
  }
}

export class TestAction extends Action {
  constructor() {
    super(ActionType.TEST);
    this.assign_to = '';
    this.variable = '';
    this.compare = '';
    this.value = '';
  }

  toXML() {
    return `<test assign_to="${this.assign_to}" variable="${this.variable}" compare="${this.compare}" value="${this.value}" />`;
  }
}

export class JumpAction extends Action {
  constructor() {
    super(ActionType.JUMP);
    this.value = '';
  }

  toXML() {
    return `<jump value="${this.value}" />`;
  }
}

export class Scenario {
  constructor() {
    this.name = 'New Scenario';
    this.nodes = [];
    this.edges = [];
  }

  addNode(node) {
    this.nodes.push(node);
  }

  removeNode(nodeId) {
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.edges = this.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
  }

  addEdge(source, target) {
    this.edges.push({ id: `${source}-${target}`, source, target });
  }

  toXML() {
    const nodesXML = this.nodes.map(n => n.toXML()).join('\n');
    return `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="${this.name}">
${nodesXML}
</scenario>`;
  }
}

export function createDefaultSendInvite() {
  const node = new SendNode();
  node.retrans = 500;
  node.content = `
    INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
    Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
    From: <sip:[local_ip]:[local_port]>;tag=[call_number]
    To: <sip:[service]@[remote_ip]:[remote_port]>
    Call-ID: [call_id]
    CSeq: 1 INVITE
    Contact: <sip:[local_ip]:[local_port];transport=[transport]>
    Max-Forwards: 70
    Content-Type: application/sdp
    Content-Length: [len]

    v=0
    o=user1 53655765 2353687637 IN IP[local_ip_type] [local_ip]
    s=-
    c=IN IP[local_ip_type] [local_ip]
    t=0 0
    m=audio [media_port] RTP/AVP 0
    a=rtpmap:0 PCMU/8000
  `;
  return node;
}

export function createDefaultRecvResponse(code) {
  const node = new RecvNode();
  node.response = code.toString();
  return node;
}

export function createDefaultSendAck() {
  const node = new SendNode();
  node.content = `
    ACK sip:[service]@[remote_ip]:[remote_port] SIP/2.0
    Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
    From: <sip:[local_ip]:[local_port]>;tag=[call_number]
    To: <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
    Call-ID: [call_id]
    CSeq: 1 ACK
    Max-Forwards: 70
    Content-Length: 0
  `;
  return node;
}

export function createDefaultSendBye() {
  const node = new SendNode();
  node.retrans = 500;
  node.content = `
    BYE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
    Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
    From: <sip:[local_ip]:[local_port]>;tag=[call_number]
    To: <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
    Call-ID: [call_id]
    CSeq: 2 BYE
    Max-Forwards: 70
    Content-Length: 0
  `;
  return node;
}
