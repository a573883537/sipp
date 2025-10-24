# SIPp Scenario Designer

A lightweight, browser-based visual editor for creating and editing SIPp XML scenarios. This tool provides pre-built templates for common SIP testing patterns and an intuitive interface for both beginners and advanced users.

![SIPp Scenario Designer](screenshots/main-view.png)

## Features

- 📋 **Pre-built Templates**: UAC, UAS, 3PCC, RTP playback, and SRTP scenarios
- 🎨 **Dual View Modes**: Visual flow diagram and XML editor
- ✅ **XML Validation**: Built-in validation to ensure well-formed scenarios
- 💾 **Export**: Download scenarios as XML files ready for SIPp
- 🚀 **No Installation**: Pure HTML/CSS/JS - works in any modern browser
- 📖 **Integrated Help**: SIPp CLI usage examples and configuration tips

## Quick Start

### Using the Tool

1. **Open in Browser**: Simply open `index.html` in any modern web browser
2. **Select a Template**: Click on one of the scenario templates (UAC, UAS, etc.)
3. **Edit if Needed**: Switch between Visual and XML views to customize
4. **Download**: Click "Download XML" to save your scenario
5. **Run with SIPp**: Use the generated CLI command shown in the sidebar

### Example Workflow

```bash
# Open the tool (from project root)
cd tools/web-scenario-designer
open index.html  # macOS
# or
xdg-open index.html  # Linux
# or double-click index.html in Windows Explorer

# After creating your scenario and downloading as 'my_scenario.xml'

# Run UAC scenario
sipp -sf my_scenario.xml -s service 192.168.1.100:5060

# Run UAS scenario (listens for incoming calls)
sipp -sf my_scenario.xml

# Run with custom call rate and duration
sipp -sf my_scenario.xml -r 10 -d 5000 192.168.1.100:5060
```

## Available Templates

### 1. UAC (User Agent Client)

**Use Case**: Initiating outbound SIP calls

**Call Flow**:
- Sends INVITE with SDP offer
- Receives 100 Trying, 180 Ringing (optional)
- Receives 200 OK with SDP answer
- Sends ACK
- Holds call (configurable duration)
- Sends BYE
- Receives 200 OK

**CLI Example**:
```bash
sipp -sf uac.xml -s destination_number 192.168.1.100:5060 -r 1 -d 10000
```

![UAC Template](screenshots/template-uac.png)

### 2. UAS (User Agent Server)

**Use Case**: Receiving and answering inbound SIP calls

**Call Flow**:
- Receives INVITE with SDP offer
- Sends 180 Ringing
- Sends 200 OK with SDP answer
- Receives ACK
- Receives BYE
- Sends 200 OK
- Time wait for retransmissions

**CLI Example**:
```bash
# Terminal 1: Start UAS (listens on port 5060)
sipp -sf uas.xml -p 5060

# Terminal 2: Test with UAC
sipp -sn uac 127.0.0.1:5060
```

![UAS Template](screenshots/template-uas.png)

### 3. 3PCC (Third Party Call Control)

**Use Case**: Controlling calls between two endpoints (A and B) from a third-party controller

**Call Flow**:
- Controller sends INVITE to A without SDP
- A sends 200 OK with SDP offer
- Controller forwards offer to B
- B sends 200 OK with SDP answer
- Controller sends ACK with B's answer to A
- RTP flows directly between A and B
- Controller terminates call with BYE

**CLI Example**:
```bash
# This represents the A-side endpoint
sipp -sf 3pcc-A.xml -p 5060

# Run the B-side in another terminal with 3pcc-B.xml
# The controller would use -3pcc option
```

![3PCC Template](screenshots/template-3pcc.png)

### 4. RTP Playback

**Use Case**: Testing audio/media streaming with PCAP file playback

**Features**:
- Basic UAC call flow
- Plays pre-recorded PCAP audio file (G.711A)
- Supports DTMF (RFC 2833) playback
- Requires PCAP files in `pcap/` directory

**CLI Example**:
```bash
# Requires g711a.pcap and dtmf_2833_1.pcap in pcap/ directory
sipp -sf rtp_playback.xml -s service 192.168.1.100:5060 -mi 192.168.1.10
```

**PCAP Requirements**:
- Place PCAP files in SIPp's `pcap/` directory
- Use `g711a.pcap` for audio
- Use `dtmf_2833_*.pcap` for DTMF tones

![RTP Template](screenshots/template-rtp.png)

### 5. SRTP (Secure RTP)

**Use Case**: Testing secure media with SRTP encryption

**Features**:
- SDP crypto negotiation
- Supports AES-CM-128 with HMAC-SHA1-80 and HMAC-SHA1-32
- Encrypted RTP stream generation
- Compatible with SRTP-enabled endpoints

**CLI Example**:
```bash
# Requires SIPp built with SRTP support
sipp -sf srtp.xml -s service 192.168.1.100:5060
```

**Notes**:
- Requires SIPp compiled with `--with-openssl` or `--with-wolfssl`
- Crypto keys are embedded in SDP a=crypto lines
- Real keys should be properly generated in production

![SRTP Template](screenshots/template-srtp.png)

## Static Hosting

The scenario designer is a fully static web application that can be hosted anywhere:

### Local Development Server

```bash
# Python 3
cd tools/web-scenario-designer
python3 -m http.server 8080
# Open http://localhost:8080

# Node.js (using npx)
npx serve .
# Open http://localhost:3000
```

### Building for Production

No build step required! Simply copy the entire `web-scenario-designer` directory to your web server:

```bash
# Copy to web server
cp -r tools/web-scenario-designer /var/www/html/sipp-designer

# Or serve with Nginx
# Add to nginx.conf:
location /sipp-designer {
    alias /path/to/tools/web-scenario-designer;
    index index.html;
}
```

### Hosting with SIPp Binaries

Bundle the designer with SIPp releases:

```bash
# In your SIPp release package structure:
sipp-release/
  ├── bin/
  │   └── sipp
  ├── scenarios/
  │   └── *.xml
  ├── designer/
  │   └── [web-scenario-designer files]
  └── README.md

# Users can then access:
cd sipp-release/designer
python3 -m http.server 8080
```

## Configuration & Customization

### SIPp Variables Reference

The templates use SIPp's built-in variables that are automatically replaced at runtime:

| Variable | Description | Example |
|----------|-------------|---------|
| `[service]` | Called service/number | `1000` |
| `[remote_ip]` | Destination IP | `192.168.1.100` |
| `[remote_port]` | Destination port | `5060` |
| `[local_ip]` | Local IP address | `192.168.1.10` |
| `[local_port]` | Local port | `5061` |
| `[call_id]` | Unique Call-ID | Generated |
| `[call_number]` | Sequential call number | `1`, `2`, `3`... |
| `[branch]` | Via branch parameter | Generated |
| `[pid]` | SIPp process ID | System PID |
| `[transport]` | Transport protocol | `UDP`, `TCP` |
| `[media_port]` | RTP port | `6000` |
| `[media_ip]` | Media IP address | Same as local_ip |

### Common SIPp CLI Options

```bash
# Basic options
-sf <file>              # Scenario file
-s <service>           # Service/destination number
-d <duration>          # Call duration in milliseconds
-r <rate>              # Call rate (calls per second)
-m <max_calls>         # Maximum simultaneous calls
-l <max_total>         # Maximum total calls

# Transport
-t u1                  # UDP (default)
-t t1                  # TCP
-t l1                  # TLS

# Network
-i <local_ip>          # Local IP address
-p <local_port>        # Local port
-mi <media_ip>         # Media IP address

# Behavior
-timeout <seconds>     # Global timeout
-recv_timeout <ms>     # Receive timeout
-aa                    # Enable automatic answer (for UAS)

# Statistics
-trace_err             # Trace errors to file
-trace_msg             # Trace all messages
-trace_screen          # Real-time statistics

# Examples
sipp -sf uac.xml -s 1000 192.168.1.100 -r 10 -d 5000
sipp -sf uas.xml -p 5060 -aa
sipp -sf scenario.xml -t t1 -i 192.168.1.10 -trace_err
```

## Tips for Aligning with SIPp

### Testing Your Scenarios

1. **Start Simple**: Begin with UAC or UAS template and test basic flow
2. **Validate XML**: Always use the "Validate" button before running
3. **Check DTD**: Ensure your scenario follows the `sipp.dtd` schema
4. **Test Locally**: Use loopback testing with UAS + UAC

```bash
# Terminal 1: UAS
sipp -sf uas.xml -p 5060

# Terminal 2: UAC
sipp -sf uac.xml -s test 127.0.0.1:5060 -m 1
```

### Debugging

```bash
# Enable message tracing
sipp -sf scenario.xml -trace_msg -message_file messages.log

# Enable error tracing
sipp -sf scenario.xml -trace_err -error_file errors.log

# Use screen trace for real-time debugging
sipp -sf scenario.xml -trace_screen
```

### Advanced Features

- **CSV Data Injection**: Use `[field0]`, `[field1]` with `-inf users.csv`
- **Regular Expressions**: Extract values from responses with `<ereg>`
- **Conditional Actions**: Use `<test>` elements for logic
- **Retransmissions**: Configure with `retrans="500"` attribute
- **Optional Messages**: Mark with `optional="true"`

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## Architecture

Pure client-side application:
- **index.html**: Main UI structure
- **style.css**: Responsive styling
- **templates.js**: Scenario templates library
- **app.js**: Application logic and interactions

No backend required. All processing happens in the browser.

## Contributing

To add new templates:

1. Edit `templates.js`
2. Add new template object with `name`, `description`, `xml`, and `steps`
3. Update the template picker in `index.html` if needed

Example:
```javascript
newtemplate: {
    name: "My Template",
    description: "Description here",
    xml: `<?xml version="1.0"...`,
    steps: [
        { type: 'send', icon: '📤', title: 'Send MESSAGE', details: 'Details' }
    ]
}
```

## Screenshots

### Main Interface
![Main Interface](screenshots/main-view.png)

### Visual View with Template
![Visual View](screenshots/visual-view.png)

### XML Editor
![XML Editor](screenshots/xml-editor.png)

### Help Modal
![Help Modal](screenshots/help-modal.png)

## License

This tool is part of the SIPp project and follows the same license (GPL v2).

## Resources

- [SIPp Official Documentation](https://sipp.readthedocs.io)
- [SIPp GitHub Repository](https://github.com/SIPp/sipp)
- [SIPp XML Reference](https://sipp.readthedocs.io/en/latest/reference.html)
- [SIP Protocol (RFC 3261)](https://tools.ietf.org/html/rfc3261)

## Support

For issues related to:
- **The Designer Tool**: Report on SIPp GitHub issues
- **SIPp Scenarios**: Check SIPp documentation
- **SIP Protocol**: Refer to RFC 3261 and related RFCs

---

**Happy Testing!** 🎉
