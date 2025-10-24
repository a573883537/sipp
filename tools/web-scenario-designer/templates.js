const templates = {
    blank: {
        name: "Blank Scenario",
        description: "Empty scenario template",
        xml: `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="My Scenario">
  <!-- Add your scenario steps here -->
  
</scenario>`,
        steps: []
    },

    uac: {
        name: "UAC (User Agent Client)",
        description: "Basic SIP call initiator - sends INVITE, receives responses, sends BYE",
        xml: `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Basic Sipstone UAC">
  <send retrans="500">
    <![CDATA[

      INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
      From: sipp <sip:sipp@[local_ip]:[local_port]>;tag=[pid]SIPpTag00[call_number]
      To: [service] <sip:[service]@[remote_ip]:[remote_port]>
      Call-ID: [call_id]
      CSeq: 1 INVITE
      Contact: sip:sipp@[local_ip]:[local_port]
      Max-Forwards: 70
      Subject: Performance Test
      Content-Type: application/sdp
      Content-Length: [len]

      v=0
      o=user1 53655765 2353687637 IN IP[local_ip_type] [local_ip]
      s=-
      c=IN IP[media_ip_type] [media_ip]
      t=0 0
      m=audio [media_port] RTP/AVP 0
      a=rtpmap:0 PCMU/8000

    ]]>
  </send>

  <recv response="100" optional="true">
  </recv>

  <recv response="180" optional="true">
  </recv>

  <recv response="183" optional="true">
  </recv>

  <recv response="200" rtd="true">
  </recv>

  <send>
    <![CDATA[

      ACK sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
      From: sipp <sip:sipp@[local_ip]:[local_port]>;tag=[pid]SIPpTag00[call_number]
      To: [service] <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
      Call-ID: [call_id]
      CSeq: 1 ACK
      Contact: sip:sipp@[local_ip]:[local_port]
      Max-Forwards: 70
      Subject: Performance Test
      Content-Length: 0

    ]]>
  </send>

  <pause/>

  <send retrans="500">
    <![CDATA[

      BYE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
      From: sipp <sip:sipp@[local_ip]:[local_port]>;tag=[pid]SIPpTag00[call_number]
      To: [service] <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
      Call-ID: [call_id]
      CSeq: 2 BYE
      Contact: sip:sipp@[local_ip]:[local_port]
      Max-Forwards: 70
      Subject: Performance Test
      Content-Length: 0

    ]]>
  </send>

  <recv response="200" crlf="true">
  </recv>

  <ResponseTimeRepartition value="10, 20, 30, 40, 50, 100, 150, 200"/>
  <CallLengthRepartition value="10, 50, 100, 500, 1000, 5000, 10000"/>

</scenario>`,
        steps: [
            { type: 'send', icon: '📤', title: 'Send INVITE', details: 'Initiate SIP call with SDP offer' },
            { type: 'recv', icon: '📥', title: 'Receive 100 Trying', details: 'Optional provisional response' },
            { type: 'recv', icon: '📥', title: 'Receive 180 Ringing', details: 'Optional ringing indication' },
            { type: 'recv', icon: '📥', title: 'Receive 200 OK', details: 'Call accepted with SDP answer' },
            { type: 'send', icon: '📤', title: 'Send ACK', details: 'Acknowledge call setup' },
            { type: 'pause', icon: '⏸️', title: 'Pause', details: 'Call duration (customizable with -d)' },
            { type: 'send', icon: '📤', title: 'Send BYE', details: 'Terminate the call' },
            { type: 'recv', icon: '📥', title: 'Receive 200 OK', details: 'Call termination confirmed' }
        ]
    },

    uas: {
        name: "UAS (User Agent Server)",
        description: "Basic SIP call responder - receives INVITE, sends responses, waits for BYE",
        xml: `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="Basic UAS responder">
  <recv request="INVITE" crlf="true">
  </recv>

  <send>
    <![CDATA[

      SIP/2.0 180 Ringing
      [last_Via:]
      [last_From:]
      [last_To:];tag=[pid]SIPpTag01[call_number]
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
      [last_To:];tag=[pid]SIPpTag01[call_number]
      [last_Call-ID:]
      [last_CSeq:]
      Contact: <sip:[local_ip]:[local_port];transport=[transport]>
      Content-Type: application/sdp
      Content-Length: [len]

      v=0
      o=user1 53655765 2353687637 IN IP[local_ip_type] [local_ip]
      s=-
      c=IN IP[media_ip_type] [media_ip]
      t=0 0
      m=audio [media_port] RTP/AVP 0
      a=rtpmap:0 PCMU/8000

    ]]>
  </send>

  <recv request="ACK" optional="true" rtd="true" crlf="true">
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
      Contact: <sip:[local_ip]:[local_port];transport=[transport]>
      Content-Length: 0

    ]]>
  </send>

  <timewait milliseconds="4000"/>

  <ResponseTimeRepartition value="10, 20, 30, 40, 50, 100, 150, 200"/>
  <CallLengthRepartition value="10, 50, 100, 500, 1000, 5000, 10000"/>

</scenario>`,
        steps: [
            { type: 'recv', icon: '📥', title: 'Receive INVITE', details: 'Incoming call with SDP offer' },
            { type: 'send', icon: '📤', title: 'Send 180 Ringing', details: 'Indicate call is ringing' },
            { type: 'send', icon: '📤', title: 'Send 200 OK', details: 'Accept call with SDP answer' },
            { type: 'recv', icon: '📥', title: 'Receive ACK', details: 'Call setup acknowledged' },
            { type: 'recv', icon: '📥', title: 'Receive BYE', details: 'Call termination request' },
            { type: 'send', icon: '📤', title: 'Send 200 OK', details: 'Confirm call termination' },
            { type: 'pause', icon: '⏸️', title: 'Time Wait', details: '4s to handle retransmissions' }
        ]
    },

    '3pcc': {
        name: "3PCC (Third Party Call Control)",
        description: "Controller initiates call without SDP, receives offer, sends to B-side",
        xml: `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<!-- 3PCC - A side emulator                             -->
<!--             A              Controller               B              -->
<!--             |(1) INVITE no SDP  |                   |              -->
<!--             |<==================|                   |              -->
<!--             |(2) 200 offer1     |                   |              -->
<!--             |==================>|                   |              -->
<!--             |                   |(3) INVITE offer1  |              -->
<!--             |                   |==================>|              -->
<!--             |                   |(4) 200 OK answer1 |              -->
<!--             |                   |<==================|              -->
<!--             |                   |(5) ACK            |              -->
<!--             |                   |==================>|              -->
<!--             |(6) ACK answer1    |                   |              -->
<!--             |<==================|                   |              -->
<!--             |(7) RTP            |                   |              -->
<!--             |.......................................|              -->

<scenario name="3PCC A side">
  <recv request="INVITE" crlf="true">
  </recv>

  <send>
    <![CDATA[

      SIP/2.0 200 OK
      [last_Via:]
      [last_From:]
      [last_To:];tag=[pid]SIPpTag05[call_number]
      [last_Call-ID:]
      [last_CSeq:]
      Contact: <sip:[local_ip]:[local_port];transport=[transport]>
      Content-Type: application/sdp
      Content-Length: [len]

      v=0
      o=user1 53655765 2353687637 IN IP[local_ip_type] [local_ip]
      s=-
      c=IN IP[media_ip_type] [media_ip]
      t=0 0
      m=audio [media_port] RTP/AVP 0
      a=rtpmap:0 PCMU/8000

    ]]>
  </send>

  <recv request="ACK" rtd="true" crlf="true"> </recv>

  <!-- RTP flow starts from here! -->

  <recv request="BYE" crlf="true"> </recv>

  <send>
    <![CDATA[

      SIP/2.0 200 OK
      [last_Via:]
      [last_From:]
      [last_To:]
      [last_Call-ID:]
      [last_CSeq:]
      Contact: <sip:[local_ip]:[local_port];transport=[transport]>
      Content-Length: 0

    ]]>
  </send>

  <timewait milliseconds="2000"/>

</scenario>`,
        steps: [
            { type: 'recv', icon: '📥', title: 'Receive INVITE (no SDP)', details: 'Controller requests offer from A' },
            { type: 'send', icon: '📤', title: 'Send 200 OK + SDP offer', details: 'A provides media offer' },
            { type: 'recv', icon: '📥', title: 'Receive ACK + SDP answer', details: 'Controller sends B\'s answer to A' },
            { type: 'pause', icon: '🎵', title: 'RTP Media Flow', details: 'Audio stream between A and B' },
            { type: 'recv', icon: '📥', title: 'Receive BYE', details: 'Controller terminates call' },
            { type: 'send', icon: '📤', title: 'Send 200 OK', details: 'Confirm termination' },
            { type: 'pause', icon: '⏸️', title: 'Time Wait', details: '2s for retransmissions' }
        ]
    },

    rtp: {
        name: "RTP Playback",
        description: "UAC with PCAP audio playback and DTMF support",
        xml: `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="UAC with media">
  <send retrans="500">
    <![CDATA[

      INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
      From: sipp <sip:sipp@[local_ip]:[local_port]>;tag=[pid]SIPpTag09[call_number]
      To: [service] <sip:[service]@[remote_ip]:[remote_port]>
      Call-ID: [call_id]
      CSeq: 1 INVITE
      Contact: sip:sipp@[local_ip]:[local_port]
      Max-Forwards: 70
      Subject: Performance Test
      Content-Type: application/sdp
      Content-Length: [len]

      v=0
      o=user1 53655765 2353687637 IN IP[local_ip_type] [local_ip]
      s=-
      c=IN IP[local_ip_type] [local_ip]
      t=0 0
      m=audio [media_port] RTP/AVP 8 101
      a=rtpmap:8 PCMA/8000
      a=rtpmap:101 telephone-event/8000
      a=fmtp:101 0-11,16

    ]]>
  </send>

  <recv response="100" optional="true">
  </recv>

  <recv response="180" optional="true">
  </recv>

  <recv response="200" rtd="true" crlf="true">
  </recv>

  <send>
    <![CDATA[

      ACK sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
      From: sipp <sip:sipp@[local_ip]:[local_port]>;tag=[pid]SIPpTag09[call_number]
      To: [service] <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
      Call-ID: [call_id]
      CSeq: 1 ACK
      Contact: sip:sipp@[local_ip]:[local_port]
      Max-Forwards: 70
      Subject: Performance Test
      Content-Length: 0

    ]]>
  </send>

  <!-- Play a pre-recorded PCAP file (RTP stream) -->
  <nop>
    <action>
      <exec play_pcap_audio="pcap/g711a.pcap"/>
    </action>
  </nop>

  <!-- Pause 8 seconds, which is approximately the duration of the PCAP file -->
  <pause milliseconds="8000"/>

  <!-- Play an out of band DTMF '1' -->
  <nop>
    <action>
      <exec play_pcap_audio="pcap/dtmf_2833_1.pcap"/>
    </action>
  </nop>

  <pause milliseconds="1000"/>

  <send retrans="500">
    <![CDATA[

      BYE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
      From: sipp <sip:sipp@[local_ip]:[local_port]>;tag=[pid]SIPpTag09[call_number]
      To: [service] <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
      Call-ID: [call_id]
      CSeq: 2 BYE
      Contact: sip:sipp@[local_ip]:[local_port]
      Max-Forwards: 70
      Subject: Performance Test
      Content-Length: 0

    ]]>
  </send>

  <recv response="200" crlf="true">
  </recv>

  <ResponseTimeRepartition value="10, 20, 30, 40, 50, 100, 150, 200"/>
  <CallLengthRepartition value="10, 50, 100, 500, 1000, 5000, 10000"/>

</scenario>`,
        steps: [
            { type: 'send', icon: '📤', title: 'Send INVITE', details: 'With G.711A and DTMF (RFC 2833) codecs' },
            { type: 'recv', icon: '📥', title: 'Receive responses', details: '100 Trying, 180 Ringing, 200 OK' },
            { type: 'send', icon: '📤', title: 'Send ACK', details: 'Confirm call setup' },
            { type: 'pause', icon: '🎵', title: 'Play PCAP audio', details: 'G.711A audio file (~8 seconds)' },
            { type: 'pause', icon: '📱', title: 'Play DTMF', details: 'Out-of-band DTMF tone "1"' },
            { type: 'send', icon: '📤', title: 'Send BYE', details: 'Terminate call' },
            { type: 'recv', icon: '📥', title: 'Receive 200 OK', details: 'Termination confirmed' }
        ]
    },

    srtp: {
        name: "SRTP (Secure RTP)",
        description: "UAC with SRTP crypto negotiation and encrypted media stream",
        xml: `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="UAC with SRTP">

  <send retrans="500">
    <![CDATA[

      INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
      From: sipp <sip:sipp@[local_ip]:[local_port]>;tag=[call_number]
      To: <sip:[service]@[remote_ip]:[remote_port]>
      Call-ID: [call_id]
      CSeq: 10 INVITE
      Contact: <sip:sipp@[local_ip]:[local_port];transport=[transport]>
      Content-Type: application/sdp
      Max-Forwards: 70
      User-Agent: SIPp/SRTP
      Subject: SRTP Test
      Content-Length: [len]

      v=0
      o=sipp 0 0 IN IP[local_ip_type] [local_ip]
      s=-
      c=IN IP[media_ip_type] [media_ip]
      t=0 0
      m=audio [rtpstream_audio_port] RTP/AVP 0 8 101
      a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:d0RmdmcmVCspeEc3QGZiNWpVLFJhQX1cfHAwJSoj|2^20|1:32
      a=crypto:2 AES_CM_128_HMAC_SHA1_32 inline:NzB4d1BINUAvLEw6UzF3WSJ+PSdFcGdUJShISWt7|2^20
      a=rtcp:[rtpstream_audio_port+1]
      a=sendrecv
      a=rtpmap:0 PCMU/8000
      a=rtpmap:8 PCMA/8000
      a=rtpmap:101 telephone-event/8000
      a=fmtp:101 0-11,16

    ]]>
  </send>

  <recv response="100" optional="true">
  </recv>

  <recv response="180" optional="true">
  </recv>

  <recv response="200" rtd="true">
  </recv>

  <send>
    <![CDATA[

      ACK sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
      From: sipp <sip:sipp@[local_ip]:[local_port]>;tag=[call_number]
      To: <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
      Call-ID: [call_id]
      CSeq: 10 ACK
      Content-Length: 0

    ]]>
  </send>

  <!-- Play encrypted RTP stream -->
  <nop>
    <action>
      <exec rtp_stream="apattern,1,0,PCMU/8000" />
    </action>
  </nop>

  <pause milliseconds="5000" />

  <send retrans="500">
    <![CDATA[

      BYE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
      From: sipp <sip:sipp@[local_ip]:[local_port]>;tag=[call_number]
      To: <sip:[service]@[remote_ip]>[peer_tag_param]
      Call-ID: [call_id]
      CSeq: 11 BYE
      Contact: <sip:sipp@[local_ip]:[local_port];transport=[transport]>
      Max-Forwards: 70
      Content-Length: 0

    ]]>
  </send>

  <recv response="200">
  </recv>

  <ResponseTimeRepartition value="10, 20, 30, 40, 50, 100, 150, 200"/>
  <CallLengthRepartition value="10, 50, 100, 500, 1000, 5000, 10000"/>

</scenario>`,
        steps: [
            { type: 'send', icon: '📤', title: 'Send INVITE + crypto', details: 'Offer AES-CM-128 with SHA1-80 and SHA1-32' },
            { type: 'recv', icon: '📥', title: 'Receive responses', details: '100, 180, 200 with crypto answer' },
            { type: 'send', icon: '📤', title: 'Send ACK', details: 'Confirm crypto parameters' },
            { type: 'pause', icon: '🔐', title: 'Encrypted RTP stream', details: 'SRTP audio with negotiated keys (5s)' },
            { type: 'send', icon: '📤', title: 'Send BYE', details: 'Terminate secure call' },
            { type: 'recv', icon: '📥', title: 'Receive 200 OK', details: 'Termination confirmed' }
        ]
    }
};
