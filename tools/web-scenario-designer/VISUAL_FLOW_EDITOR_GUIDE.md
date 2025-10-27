# SIPp Visual Flow Editor - Complete Guide

## Introduction

The SIPp Visual Flow Editor is a modern, React-based tool for creating and editing SIP test scenarios through an intuitive drag-and-drop interface. This guide explains the complete implementation and how to use it.

## Two Designer Options

The web-scenario-designer toolkit now includes two complementary tools:

### 1. Configuration Designer (`index.html`)
- **Type**: Static HTML/JS (no build required)
- **Focus**: Quick scenario generation with templates
- **Best For**: Beginners, quick testing, CLI configuration
- **Usage**: Open `index.html` directly in browser

### 2. Visual Flow Editor (`flow-editor/`)
- **Type**: React application (requires npm)
- **Focus**: Visual graph-based scenario building
- **Best For**: Complex scenarios, visual learners, advanced flows
- **Usage**: `npm run dev` to start

## Architecture

### Technology Stack

```
React Flow Editor Stack:
├── React 18.2          → UI framework
├── React Flow 11.10    → Visual graph library
├── Zustand 4.4         → State management
├── Vite 5.0            → Build tool
└── ESLint 8.56         → Code quality
```

### Component Hierarchy

```
App
├── Header
│   ├── Title
│   ├── Scenario Name Input
│   └── Toggle Inspector Button
└── Content
    ├── Toolbar (Sidebar Left)
    │   ├── Add Nodes Section
    │   │   ├── Send Button
    │   │   ├── Recv Button
    │   │   ├── Pause Button
    │   │   ├── NOP Button
    │   │   ├── Label Button
    │   │   └── Timewait Button
    │   └── Actions Section
    │       ├── Load Template
    │       ├── Validate
    │       ├── Export XML
    │       ├── Copy XML
    │       └── Clear
    ├── FlowEditor (Main Canvas)
    │   ├── React Flow Canvas
    │   ├── Custom Node Components
    │   ├── Background Grid
    │   ├── Controls (zoom, fit)
    │   └── MiniMap
    └── NodeInspector (Sidebar Right)
        ├── Node Type Header
        ├── Property Forms
        ├── Advanced Options
        └── Action Buttons
```

### Data Flow

```
User Action
    ↓
React Component Event
    ↓
Zustand Store Action
    ↓
State Update
    ↓
React Re-render
    ↓
UI Update
```

## Core Models

### Scenario Node Classes

All nodes inherit from `ScenarioNode` base class:

```javascript
class ScenarioNode {
  id: string              // Unique identifier
  type: string            // Node type (send, recv, etc.)
  position: {x, y}        // Canvas position
  
  toXML(): string         // Export to XML
  static fromXML(el)      // Import from XML (future)
}
```

#### SendNode
```javascript
{
  type: 'send',
  content: string,         // SIP message content
  retrans: number,         // Retransmission timer (ms)
  lost: number,            // Packet loss probability
  start_txn: string,       // Start transaction
  ack_txn: string,         // ACK transaction
  crlf: boolean,           // Add CRLF
  actions: Action[]        // Nested actions
  // Common attributes...
}
```

#### RecvNode
```javascript
{
  type: 'recv',
  response: string,        // Response code (100, 180, 200)
  request: string,         // Request method (INVITE, BYE)
  optional: boolean,       // Optional message
  timeout: number,         // Timeout in ms
  ontimeout: string,       // Label to jump on timeout
  auth: boolean,           // Authenticate
  rrs: boolean,            // Record route set
  actions: Action[]
  // Common attributes...
}
```

#### PauseNode
```javascript
{
  type: 'pause',
  milliseconds: number,    // Pause duration
  variable: string,        // Variable for dynamic pause
  distribution: string,    // Statistical distribution
  sanity_check: boolean    // Validation flag
  // Common attributes...
}
```

#### NopNode
```javascript
{
  type: 'nop',
  display: string,         // Display text
  actions: Action[]
  // Common attributes...
}
```

#### LabelNode
```javascript
{
  type: 'label',
  labelId: string          // Label identifier for jumps
}
```

#### TimewaitNode
```javascript
{
  type: 'timewait',
  milliseconds: number     // Wait duration (typically 4000)
}
```

### Common Attributes

All message nodes (send, recv, pause, nop) support:
- `next`: Jump to label
- `test`: Variable to test
- `chance`: Execution probability (0-100)
- `condexec`: Conditional execution variable
- `condexec_inverse`: Invert condition
- `start_rtd`: Start response time
- `rtd`: End response time

## State Management

### Zustand Store

The store manages all scenario state:

```javascript
{
  // State
  scenario: Scenario,
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
  selectedNode: Node | null,
  validationErrors: string[],
  
  // Actions
  setScenarioName(name),
  addNode(type, position),
  removeNode(nodeId),
  updateNode(nodeId, updates),
  onNodesChange(changes),
  onEdgesChange(changes),
  onConnect(connection),
  setSelectedNode(node),
  validateScenario(),
  exportToXML(),
  loadTemplate(name),
  clearScenario()
}
```

### State Synchronization

The store maintains bidirectional sync between:
1. **Scenario Model** (business logic)
2. **React Flow State** (visual representation)

When updating a node:
1. User edits in inspector
2. `updateNode()` called on store
3. Scenario model updated
4. React Flow nodes array updated
5. UI re-renders with new data

## User Interface

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header (Purple Gradient)                                 │
│ [SIPp Visual Flow Editor] [Scenario: ____] [Hide ▶]     │
├───────────┬───────────────────────────────────┬─────────┤
│           │                                   │         │
│ Toolbar   │     Flow Editor Canvas            │Inspector│
│ 280px     │     (Flexible Width)              │ 350px   │
│           │                                   │         │
│ Add Nodes │  ┌─────────────────────────────┐ │ Node    │
│ [📤 Send] │  │  React Flow                 │ │ Props   │
│ [📥 Recv] │  │  • Nodes                    │ │         │
│ [⏸️ Pause]│  │  • Edges                    │ │ [Edit]  │
│ [⭕ NOP]  │  │  • Grid                     │ │ [Save]  │
│ [🏷️ Label]│  │  • MiniMap                  │ │         │
│ [⏱️ Wait] │  │                             │ │         │
│           │  └─────────────────────────────┘ │         │
│ Actions   │                                   │         │
│ [Template]│                                   │         │
│ [Validate]│                                   │         │
│ [Export]  │                                   │         │
│           │                                   │         │
└───────────┴───────────────────────────────────┴─────────┘
```

### Color Scheme

- **Send**: Green (#4CAF50) - Outgoing messages
- **Recv**: Blue (#2196F3) - Incoming messages
- **Pause**: Orange (#FF9800) - Time delays
- **NOP**: Gray (#9E9E9E) - Placeholders
- **Label**: Purple (#9C27B0) - Jump targets
- **Timewait**: Red (#FF5722) - Wait for retransmissions

### Visual Feedback

- **Selected Node**: Scale 1.05, enhanced shadow
- **Hover**: Border color change
- **Edges**: Animated flow, smooth step transitions
- **Handles**: Visible connection points
- **Badges**: Inline attribute display

## Workflows

### Creating a Basic UAC Scenario

1. **Start Fresh**
   ```
   Click "Clear" to start from scratch
   ```

2. **Add INVITE**
   ```
   Click "📤 Send"
   Click the new node
   Set Content to INVITE message
   Set Retrans to 500
   Click "Apply Changes"
   ```

3. **Add 100 Trying**
   ```
   Click "📥 Recv"
   Set Response Code to "100"
   Check "Optional"
   Click "Apply Changes"
   ```

4. **Connect Nodes**
   ```
   Drag from INVITE bottom handle to 100 top handle
   ```

5. **Repeat for 180, 200, ACK, Pause, BYE**

6. **Validate**
   ```
   Click "✅ Validate"
   Fix any errors shown
   ```

7. **Export**
   ```
   Click "💾 Export XML"
   Download scenario.xml
   ```

8. **Test**
   ```bash
   sipp -sf scenario.xml -s service 192.168.1.100:5060
   ```

### Using Templates

1. **Load Template**
   ```
   Click "📋 Load Template"
   Confirm clear current scenario
   UAC template loads automatically
   ```

2. **Customize**
   ```
   Click any node to edit
   Modify properties as needed
   Click "Apply Changes"
   ```

3. **Export**
   ```
   Click "💾 Export XML"
   ```

### Advanced: Loops and Branches

1. **Add Label**
   ```
   Click "🏷️ Label"
   Set Label ID to "loop_start"
   ```

2. **Add Send/Recv Nodes**
   ```
   Create your loop body
   ```

3. **Configure Next**
   ```
   Click last node in loop
   Expand "Advanced Options"
   Set Next to "loop_start"
   Set Chance to 80 (80% probability to loop)
   ```

4. **Result**
   ```
   80% of time: Jumps back to loop_start
   20% of time: Continues to next node
   ```

## XML Generation

### Process

```
Scenario Object
    ↓
Iterate Nodes
    ↓
Call node.toXML()
    ↓
Generate Attributes
    ↓
Generate Content
    ↓
Wrap in XML Tags
    ↓
Add DOCTYPE
    ↓
Return Complete XML
```

### Example Output

```xml
<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="My Scenario">
  <send retrans="500">
    <![CDATA[
    INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
    Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
    From: <sip:[local_ip]:[local_port]>;tag=[call_number]
    To: <sip:[service]@[remote_ip]:[remote_port]>
    Call-ID: [call_id]
    CSeq: 1 INVITE
    Contact: <sip:[local_ip]:[local_port];transport=[transport]>
    Content-Type: application/sdp
    Content-Length: [len]
    
    v=0
    o=user 0 0 IN IP4 [local_ip]
    s=-
    c=IN IP4 [local_ip]
    t=0 0
    m=audio [media_port] RTP/AVP 0
    a=rtpmap:0 PCMU/8000
    ]]>
  </send>
  
  <recv response="100" optional="true" />
  
  <recv response="200" />
  
  <send>
    <![CDATA[
    ACK sip:[service]@[remote_ip]:[remote_port] SIP/2.0
    Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
    From: <sip:[local_ip]:[local_port]>;tag=[call_number]
    To: <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
    Call-ID: [call_id]
    CSeq: 1 ACK
    Content-Length: 0
    ]]>
  </send>
  
  <pause milliseconds="5000" />
  
  <send retrans="500">
    <![CDATA[
    BYE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
    Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
    From: <sip:[local_ip]:[local_port]>;tag=[call_number]
    To: <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
    Call-ID: [call_id]
    CSeq: 2 BYE
    Content-Length: 0
    ]]>
  </send>
  
  <recv response="200" />
</scenario>
```

## Validation

### Validation Rules

1. **Scenario name required**
   - Must not be empty
   - Used in XML `<scenario name="...">`

2. **At least one node**
   - Empty scenarios not allowed
   - Must have send or recv

3. **Valid connections**
   - All edge sources must exist
   - All edge targets must exist
   - No dangling edges

4. **Logical structure**
   - Should have send or recv nodes
   - Warnings for unusual patterns

### Error Display

Validation errors appear in toolbar:
```
┌─────────────────────────────────┐
│ Validation Errors               │
│ ⚠️ Scenario name is required    │
│ ⚠️ Must have at least one node  │
└─────────────────────────────────┘
```

## Keyboard Shortcuts

- **Delete**: Remove selected nodes/edges
- **Ctrl+Scroll**: Zoom in/out
- **Space+Drag**: Pan canvas
- **Escape**: Deselect all
- **Click**: Select node
- **Ctrl+Click**: Multi-select

## SIPp Integration

### Running Exported Scenarios

```bash
# Basic UAC
sipp -sf scenario.xml -s service 192.168.1.100:5060

# With call rate
sipp -sf scenario.xml -s service 192.168.1.100:5060 -r 10

# With duration
sipp -sf scenario.xml -s service 192.168.1.100:5060 -d 5000

# UAS mode
sipp -sf scenario.xml -p 5060

# With tracing
sipp -sf scenario.xml -trace_msg -message_file messages.log
```

### Validation with xmllint

```bash
xmllint --noout --dtdvalid sipp.dtd scenario.xml
```

## Development

### Setup

```bash
cd tools/web-scenario-designer/flow-editor
npm install
```

### Development Server

```bash
npm run dev
# Opens http://localhost:3000
```

### Production Build

```bash
npm run build
# Output in dist/

# Serve with any static server
cd dist
python3 -m http.server 8080
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

## Extending the Editor

### Adding a New Node Type

1. **Create Model Class**
   ```javascript
   // In src/models/scenarioModels.js
   export class CustomNode extends ScenarioNode {
     constructor(id = null) {
       super('custom', id);
       this.myProperty = '';
     }
     
     toXML() {
       return `  <custom myProperty="${this.myProperty}" />`;
     }
   }
   ```

2. **Create React Component**
   ```javascript
   // In src/components/nodes/CustomNode.jsx
   import { memo } from 'react';
   import { Handle, Position } from 'reactflow';
   
   const CustomNode = ({ data, selected }) => {
     const node = data.node;
     return (
       <div className={`custom-node ${selected ? 'selected' : ''}`}>
         <Handle type="target" position={Position.Top} />
         <div className="node-icon">🔧</div>
         <div className="node-label">
           <strong>Custom</strong>
         </div>
         <Handle type="source" position={Position.Bottom} />
       </div>
     );
   };
   
   export default memo(CustomNode);
   ```

3. **Register in FlowEditor**
   ```javascript
   // In src/components/FlowEditor.jsx
   import CustomNode from './nodes/CustomNode';
   
   const nodeTypes = {
     // ... existing types
     custom: CustomNode
   };
   ```

4. **Add Inspector UI**
   ```javascript
   // In src/components/NodeInspector.jsx
   const renderCustomInspector = () => (
     <>
       <div className="form-group">
         <label>My Property</label>
         <input
           type="text"
           value={localData.myProperty || ''}
           onChange={(e) => handleChange('myProperty', e.target.value)}
         />
       </div>
     </>
   );
   
   // Add to renderInspector() switch
   case 'custom':
     return renderCustomInspector();
   ```

5. **Add to Toolbar**
   ```javascript
   // In src/components/Toolbar.jsx
   const nodeTypes = [
     // ... existing types
     { type: 'custom', icon: '🔧', label: 'Custom' }
   ];
   ```

6. **Update Store**
   ```javascript
   // In src/store/scenarioStore.js
   import { CustomNode } from '../models/scenarioModels';
   
   const nodeMap = {
     // ... existing types
     custom: CustomNode
   };
   ```

## Best Practices

### Scenario Design

1. **Start Simple**: Build basic flow first
2. **Test Incrementally**: Export and test after each major change
3. **Use Templates**: Start from templates when possible
4. **Name Clearly**: Use descriptive scenario names
5. **Document**: Use NOP nodes for comments

### Node Organization

1. **Vertical Flow**: Arrange nodes top to bottom
2. **Group Related**: Keep related messages together
3. **Clear Paths**: Avoid crossing edges
4. **Use Labels**: For complex flows and loops
5. **Spacing**: Leave room between nodes

### Performance

1. **Limit Nodes**: <100 nodes per scenario for best performance
2. **Simplify**: Break complex scenarios into multiple files
3. **Optimize**: Remove unused nodes

## Troubleshooting

### Common Issues

**Nodes not connecting**
- Make sure to drag from bottom handle to top handle
- Handles must be visible (hover to see)

**Inspector not showing**
- Click a node to select it
- Inspector only shows when node selected

**Export fails**
- Run validation first
- Check for error messages
- Ensure scenario has a name

**Build errors**
- Run `npm install` first
- Check Node.js version (16+)
- Clear node_modules and reinstall

**Scenario not running in SIPp**
- Validate XML with xmllint
- Check SIPp version compatibility
- Enable trace mode for debugging

## Resources

### Documentation
- `flow-editor/README.md` - Features and usage
- `flow-editor/QUICK_START.md` - Step-by-step guide
- `flow-editor/IMPLEMENTATION_SUMMARY.md` - Technical overview
- `FLOW_EDITOR_IMPLEMENTATION.md` - Detailed implementation

### External Resources
- [SIPp Documentation](https://sipp.readthedocs.io)
- [React Flow Documentation](https://reactflow.dev)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [sipp.dtd Reference](../../sipp.dtd)

## Summary

The SIPp Visual Flow Editor provides a modern, intuitive way to create and edit SIP test scenarios. With its drag-and-drop interface, property inspector, and comprehensive node types, it makes scenario creation accessible to both beginners and advanced users while maintaining full compatibility with SIPp's XML format.

**Key Benefits:**
- ✅ Visual understanding of call flows
- ✅ Intuitive drag-and-drop editing
- ✅ Form-based property configuration
- ✅ Real-time validation
- ✅ Professional UI/UX
- ✅ Full SIPp compatibility

Start building your scenarios today! 🎉
