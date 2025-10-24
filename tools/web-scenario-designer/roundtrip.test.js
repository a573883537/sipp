import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parseScenarioFromXML } from './xmlParser.js';
import { serializeScenarioToXML } from './xmlSerializer.js';

describe('Round-trip Tests', () => {
  describe('Simple Scenarios', () => {
    it('should round-trip a basic UAC scenario', () => {
      const originalXml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Basic UAC">
  <send retrans="500">
    <![CDATA[

INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
From: sipp <sip:sipp@[local_ip]>;tag=[call_number]
To: [service] <sip:[service]@[remote_ip]>
Call-ID: [call_id]
CSeq: 1 INVITE
Content-Length: 0

    ]]>
  </send>

  <recv response="100" optional="true">
  </recv>

  <recv response="200">
  </recv>

  <send>
    <![CDATA[

ACK sip:[service]@[remote_ip]:[remote_port] SIP/2.0
Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
Call-ID: [call_id]
CSeq: 1 ACK
Content-Length: 0

    ]]>
  </send>

  <pause milliseconds="5000"/>

  <send retrans="500">
    <![CDATA[

BYE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
Call-ID: [call_id]
CSeq: 2 BYE
Content-Length: 0

    ]]>
  </send>

  <recv response="200">
  </recv>

  <ResponseTimeRepartition value="10, 20, 30, 40, 50, 100, 150, 200"/>
  <CallLengthRepartition value="10, 50, 100, 500, 1000, 5000, 10000"/>
</scenario>`;

      const parsed = parseScenarioFromXML(originalXml);
      const serialized = serializeScenarioToXML(parsed);
      const reparsed = parseScenarioFromXML(serialized);

      expect(reparsed.name).toBe(parsed.name);
      expect(reparsed.steps.length).toBe(parsed.steps.length);
      expect(reparsed.responseTimeRepartition).toBe(parsed.responseTimeRepartition);
      expect(reparsed.callLengthRepartition).toBe(parsed.callLengthRepartition);
    });

    it('should round-trip a UAS scenario', () => {
      const originalXml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Basic UAS">
  <recv request="INVITE">
  </recv>

  <send>
    <![CDATA[

SIP/2.0 180 Ringing
[last_Via:]
[last_From:]
[last_To:];tag=[call_number]
[last_Call-ID:]
[last_CSeq:]
Contact: <sip:[local_ip]:[local_port];transport=[transport]>
Content-Length: 0

    ]]>
  </send>

  <send retrans="500">
    <![CDATA[

SIP/2.0 200 OK
[last_Via:]
[last_From:]
[last_To:];tag=[call_number]
[last_Call-ID:]
[last_CSeq:]
Contact: <sip:[local_ip]:[local_port];transport=[transport]>
Content-Length: 0

    ]]>
  </send>

  <recv request="ACK">
  </recv>

  <recv request="BYE">
  </recv>

  <send>
    <![CDATA[

SIP/2.0 200 OK
[last_Via:]
[last_From:]
[last_To:]
[last_Call-ID:]
[last_CSeq:]
Content-Length: 0

    ]]>
  </send>

  <timewait milliseconds="4000"/>
</scenario>`;

      const parsed = parseScenarioFromXML(originalXml);
      const serialized = serializeScenarioToXML(parsed);
      const reparsed = parseScenarioFromXML(serialized);

      expect(reparsed.name).toBe(parsed.name);
      expect(reparsed.steps.length).toBe(parsed.steps.length);
      
      expect(reparsed.steps[0].type).toBe('recv');
      expect(reparsed.steps[0].attributes.request).toBe('INVITE');
      
      expect(reparsed.steps[reparsed.steps.length - 1].type).toBe('timewait');
    });
  });

  describe('Scenarios with Actions', () => {
    it('should round-trip scenario with ereg actions', () => {
      const originalXml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Test with Actions">
  <recv response="180">
    <action>
      <ereg regexp=".*" search_in="hdr" header="CSeq:" check_it="true" assign_to="1"/>
      <ereg regexp=".*" search_in="hdr" header="RSeq:" check_it="true" assign_to="2"/>
    </action>
  </recv>

  <send retrans="500">
    <![CDATA[

PRACK sip:[service]@[remote_ip]:[remote_port] SIP/2.0
RAck: [$2][$1]
Content-Length: 0

    ]]>
  </send>
</scenario>`;

      const parsed = parseScenarioFromXML(originalXml);
      const serialized = serializeScenarioToXML(parsed);
      const reparsed = parseScenarioFromXML(serialized);

      expect(reparsed.steps[0].actions.length).toBe(2);
      expect(reparsed.steps[0].actions[0].type).toBe('ereg');
      expect(reparsed.steps[0].actions[0].attributes.header).toBe('CSeq:');
      expect(reparsed.steps[0].actions[1].attributes.header).toBe('RSeq:');
    });

    it('should round-trip scenario with exec action', () => {
      const originalXml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="RTP Stream Test">
  <recv response="200">
    <action>
      <exec rtp_stream="pcap/audio.wav,-1,0,PCMU/8000"/>
    </action>
  </recv>
</scenario>`;

      const parsed = parseScenarioFromXML(originalXml);
      const serialized = serializeScenarioToXML(parsed);
      const reparsed = parseScenarioFromXML(serialized);

      expect(reparsed.steps[0].actions.length).toBe(1);
      expect(reparsed.steps[0].actions[0].type).toBe('exec');
      expect(reparsed.steps[0].actions[0].attributes.rtp_stream).toContain('audio.wav');
    });

    it('should round-trip scenario with log and warning actions', () => {
      const originalXml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Logging Test">
  <nop>
    <action>
      <log message="Test log message"/>
      <warning message="Test warning message"/>
    </action>
  </nop>
</scenario>`;

      const parsed = parseScenarioFromXML(originalXml);
      const serialized = serializeScenarioToXML(parsed);
      const reparsed = parseScenarioFromXML(serialized);

      expect(reparsed.steps[0].actions.length).toBe(2);
      expect(reparsed.steps[0].actions[0].type).toBe('log');
      expect(reparsed.steps[0].actions[0].attributes.message).toBe('Test log message');
      expect(reparsed.steps[0].actions[1].type).toBe('warning');
    });
  });

  describe('Complex Scenarios', () => {
    it('should round-trip a 3PCC scenario', () => {
      const originalXml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="3PCC Controller">
  <send retrans="500">
    <![CDATA[

INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
From: controller <sip:controller@[local_ip]>;tag=[call_number]
To: <sip:[service]@[remote_ip]>
Call-ID: [call_id]
CSeq: 1 INVITE
Content-Length: 0

    ]]>
  </send>

  <recv response="100" optional="true">
  </recv>

  <recv response="200" rtd="true">
    <action>
      <ereg regexp="Content-Length:.*" search_in="msg" assign_to="1"/>
    </action>
  </recv>

  <send>
    <![CDATA[

ACK sip:[service]@[remote_ip]:[remote_port] SIP/2.0
Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
From: controller <sip:controller@[local_ip]>;tag=[call_number]
To: <sip:[service]@[remote_ip]>[peer_tag_param]
Call-ID: [call_id]
CSeq: 1 ACK
Content-Length: 0

    ]]>
  </send>

  <label id="1"/>

  <pause milliseconds="1000"/>

  <send retrans="500">
    <![CDATA[

BYE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
From: controller <sip:controller@[local_ip]>;tag=[call_number]
To: <sip:[service]@[remote_ip]>[peer_tag_param]
Call-ID: [call_id]
CSeq: 2 BYE
Content-Length: 0

    ]]>
  </send>

  <recv response="200">
  </recv>
</scenario>`;

      const parsed = parseScenarioFromXML(originalXml);
      const serialized = serializeScenarioToXML(parsed);
      const reparsed = parseScenarioFromXML(serialized);

      expect(reparsed.name).toBe(parsed.name);
      expect(reparsed.steps.length).toBe(parsed.steps.length);

      const labelStep = reparsed.steps.find(s => s.type === 'label');
      expect(labelStep).toBeDefined();
      expect(labelStep.attributes.id).toBe('1');
    });
  });

  describe('Attribute Preservation', () => {
    it('should preserve all send attributes', () => {
      const originalXml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Attribute Test">
  <send retrans="500" lost="10" start_txn="invite" next="label1" test="$1">
    <![CDATA[INVITE]]>
  </send>
</scenario>`;

      const parsed = parseScenarioFromXML(originalXml);
      const serialized = serializeScenarioToXML(parsed);
      const reparsed = parseScenarioFromXML(serialized);

      expect(reparsed.steps[0].attributes.retrans).toBe('500');
      expect(reparsed.steps[0].attributes.lost).toBe('10');
      expect(reparsed.steps[0].attributes.start_txn).toBe('invite');
      expect(reparsed.steps[0].attributes.next).toBe('label1');
      expect(reparsed.steps[0].attributes.test).toBe('$1');
    });

    it('should preserve all recv attributes', () => {
      const originalXml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Attribute Test">
  <recv response="200" optional="true" rtd="true" timeout="5000" ontimeout="error">
  </recv>
</scenario>`;

      const parsed = parseScenarioFromXML(originalXml);
      const serialized = serializeScenarioToXML(parsed);
      const reparsed = parseScenarioFromXML(serialized);

      expect(reparsed.steps[0].attributes.response).toBe('200');
      expect(reparsed.steps[0].attributes.optional).toBe('true');
      expect(reparsed.steps[0].attributes.rtd).toBe('true');
      expect(reparsed.steps[0].attributes.timeout).toBe('5000');
      expect(reparsed.steps[0].attributes.ontimeout).toBe('error');
    });
  });

  describe('Content Preservation', () => {
    it('should preserve CDATA content exactly', () => {
      const sipMessage = `
INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
From: sipp <sip:sipp@[local_ip]>;tag=[call_number]
To: [service] <sip:[service]@[remote_ip]>
Call-ID: [call_id]
CSeq: 1 INVITE
Content-Type: application/sdp
Content-Length: [len]

v=0
o=user1 53655765 2353687637 IN IP[local_ip_type] [local_ip]
s=-
c=IN IP[media_ip_type] [media_ip]
t=0 0
m=audio [media_port] RTP/AVP 0
a=rtpmap:0 PCMU/8000
`;

      const originalXml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Content Test">
  <send>
    <![CDATA[${sipMessage}]]>
  </send>
</scenario>`;

      const parsed = parseScenarioFromXML(originalXml);
      
      expect(parsed.steps[0].content).toContain('INVITE sip:[service]@[remote_ip]');
      expect(parsed.steps[0].content).toContain('v=0');
      expect(parsed.steps[0].content).toContain('a=rtpmap:0 PCMU/8000');
    });
  });
});
