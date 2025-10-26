# Quick Start Guide - SIPp Visual Flow Editor

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm

### Install Dependencies

```bash
cd tools/web-scenario-designer/flow-editor
npm install
```

This will install:
- React & React DOM
- React Flow (visual graph library)
- Zustand (state management)
- Vite (build tool)
- ESLint (code quality)

## Running the Editor

### Development Mode

```bash
npm run dev
```

This starts the Vite development server on http://localhost:3000 with:
- Hot module replacement (HMR)
- Fast refresh
- Source maps

### Production Build

```bash
npm run build
```

Output goes to `dist/` directory. Serve with any static file server:

```bash
# Using Python
cd dist
python3 -m http.server 8080

# Using Node.js
npx serve dist

# Using nginx (copy dist/ to web root)
```

## Creating Your First Scenario

### 1. Load a Template

Click **"📋 Load Template"** in the left sidebar to load the UAC template. This creates a basic call flow:

```
INVITE → 100 → 180 → 200 → ACK → Pause → BYE → 200
```

### 2. Add Nodes Manually

Alternatively, build from scratch:

1. Click **"📤 Send"** to add a send node
2. Click **"📥 Recv"** to add a receive node
3. Drag nodes to position them
4. Connect nodes by dragging from the bottom handle (●) of one node to the top handle (●) of another

### 3. Edit Node Properties

1. **Click a node** to select it
2. The right inspector panel opens
3. Edit properties (message content, timeouts, etc.)
4. Click **"Apply Changes"** to save

#### Example: Editing a Send Node

For an INVITE:
```
Message Content:
  INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
  Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
  From: <sip:user@domain>;tag=[call_number]
  To: <sip:[service]@[remote_ip]:[remote_port]>
  Call-ID: [call_id]
  CSeq: 1 INVITE
  Content-Type: application/sdp
  Content-Length: [len]
  
  v=0
  o=user 0 0 IN IP4 [local_ip]
  s=-
  c=IN IP4 [local_ip]
  t=0 0
  m=audio [media_port] RTP/AVP 0
  a=rtpmap:0 PCMU/8000

Retransmission: 500
```

#### Example: Editing a Recv Node

For receiving 200 OK:
```
Response Code: 200
Timeout: 5000
Optional: ☐ (unchecked - required)
```

### 4. Export Scenario

1. Click **"💾 Export XML"**
2. File downloads as `scenario.xml`
3. Or click **"📄 Copy XML"** to copy to clipboard

### 5. Run with SIPp

```bash
# UAC scenario
sipp -sf scenario.xml -s service 192.168.1.100:5060

# With options
sipp -sf scenario.xml -s service 192.168.1.100:5060 -r 10 -d 5000
```

## Node Types Explained

### 📤 Send Node
**Purpose**: Send SIP messages (INVITE, ACK, BYE, etc.)

**Common Settings**:
- Message Content: Full SIP message
- Retransmission: Timer in ms (e.g., 500)
- Transaction: start_txn, ack_txn for transaction tracking

**Example Use**: Send INVITE, ACK, BYE, REGISTER, etc.

### 📥 Recv Node
**Purpose**: Receive and match SIP messages

**Common Settings**:
- Response Code: Match response (100, 180, 200, etc.)
- OR Request Method: Match request (INVITE, BYE, etc.)
- Optional: Check if message is optional
- Timeout: Max wait time in ms

**Example Use**: Receive 100 Trying, 180 Ringing, 200 OK, etc.

### ⏸️ Pause Node
**Purpose**: Add delay between messages

**Common Settings**:
- Duration: Milliseconds to pause
- Variable: Use dynamic pause from variable
- Distribution: Random pause distribution

**Example Use**: Hold call for 5 seconds, simulate think time

### ⭕ NOP Node
**Purpose**: No-operation placeholder

**Common Settings**:
- Display: Text to display (for debugging)

**Example Use**: Placeholder for actions, debugging points

### 🏷️ Label Node
**Purpose**: Jump target for control flow

**Common Settings**:
- Label ID: Unique identifier

**Example Use**: Loop back, error handlers, conditional branches

### ⏱️ Timewait Node
**Purpose**: Wait for retransmissions before ending

**Common Settings**:
- Duration: Milliseconds to wait (typically 4000)

**Example Use**: End of scenario, catch final retransmissions

## Tips & Tricks

### Connecting Nodes
- Drag from **bottom handle** (output) to **top handle** (input)
- Edges are directional (flow goes down)
- Delete edge: Select and press Delete key

### Selecting Nodes
- Click to select one node
- Ctrl+Click to select multiple
- Drag on canvas to select multiple
- Click empty canvas to deselect all

### Positioning Nodes
- Drag nodes to move
- Snap to grid (15x15)
- Use MiniMap (bottom right) for overview

### Validation
Before export, click **"✅ Validate"** to check:
- ✅ Scenario has a name
- ✅ At least one node exists
- ✅ All connections are valid
- ✅ Has send or recv nodes

### Keyboard Shortcuts
- **Delete**: Remove selected nodes/edges
- **Ctrl+Scroll**: Zoom in/out
- **Space+Drag**: Pan canvas
- **Escape**: Deselect all

### Common Patterns

#### Basic UAC
```
Send INVITE → Recv 100 (optional) → Recv 180 (optional) → Recv 200 → Send ACK → Pause → Send BYE → Recv 200
```

#### Basic UAS
```
Recv INVITE → Send 180 → Send 200 → Recv ACK → Recv BYE → Send 200 → Timewait
```

#### Error Handling
```
Recv INVITE → Send 180 → Send 200 → Recv ACK (timeout: 5000, ontimeout: error)
Label (id: error) → Send BYE
```

## Troubleshooting

### "Cannot find module"
Make sure dependencies are installed:
```bash
npm install
```

### Port 3000 already in use
Change port in package.json or use:
```bash
npx vite --port 3001
```

### Nodes not appearing
Check browser console (F12) for errors. Refresh page.

### XML export not working
Click "Validate" first to see errors. Ensure scenario has valid structure.

### Scenario name not set
Enter name in header input field before exporting.

## Advanced Features

### Custom SIP Headers
In Send node content, add any SIP headers:
```
INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
...
X-Custom-Header: my-value
P-Asserted-Identity: <sip:user@domain>
```

### SIPp Variables
Use SIPp's built-in variables:
- `[service]`: Destination number/service
- `[remote_ip]`: Destination IP
- `[local_ip]`: Local IP
- `[call_id]`: Unique call ID
- `[call_number]`: Sequential call number
- `[branch]`: Via branch parameter
- `[media_port]`: RTP media port
- `[$1]`, `[$2]`, etc.: Variables from actions

### Conditional Execution
In Advanced Options:
- **Next**: Jump to label unconditionally
- **Test**: Variable to test (jumps if true)
- **Chance**: Probability % (0-100)

### Transaction Control
For INVITE/CANCEL scenarios:
- Send INVITE: `start_txn="invite"`
- Send ACK: `ack_txn="invite"`
- Recv responses: `response_txn="invite"`

## Next Steps

1. Explore the example template
2. Create your own scenario
3. Export and test with SIPp
4. Add actions (ereg, log, exec) for advanced scenarios
5. Read main README for more details
6. Check `scenarioModels.js` for all available options

## Getting Help

- Check main README.md
- Review FLOW_EDITOR_IMPLEMENTATION.md for technical details
- Read SIPp documentation: https://sipp.readthedocs.io
- Check sipp.dtd for XML schema reference

## Contributing

To add new features:
1. Edit models in `src/models/scenarioModels.js`
2. Add UI in `src/components/NodeInspector.jsx`
3. Update node components in `src/components/nodes/`
4. Test thoroughly before submitting

Happy scenario building! 🎉
