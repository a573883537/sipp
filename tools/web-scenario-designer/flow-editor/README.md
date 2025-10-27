# SIPp Visual Flow Editor

A React Flow-based visual editor for creating and editing SIPp XML scenarios with drag-and-drop functionality.

## Features

- 🎨 **Visual Flow Graph**: Drag-and-drop nodes to build SIP call flows
- 📝 **Node Types**: Send, Recv, Pause, NOP, Label, and Timewait nodes
- 🔍 **Property Inspector**: Edit node properties with form-based UI
- ✅ **Validation**: Real-time validation of scenario structure
- 💾 **XML Export**: Generate valid SIPp XML from visual flow
- 📋 **Templates**: Pre-built templates (UAC, UAS, etc.)
- 🔗 **Smart Connections**: Visual edges representing message flow

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Creating a Scenario

1. **Add Nodes**: Click buttons in the left toolbar to add nodes (Send, Recv, Pause, etc.)
2. **Connect Nodes**: Drag from one node's output handle to another's input handle
3. **Edit Properties**: Click a node to select it, then edit its properties in the right inspector
4. **Save Changes**: Click "Apply Changes" after editing node properties
5. **Export**: Click "Export XML" to download your scenario

### Node Types

#### Send Node 📤
- Sends SIP messages (INVITE, ACK, BYE, etc.)
- Configure retransmission timers
- Add SIP message content (headers and body)
- Support for transaction control

#### Recv Node 📥
- Receives SIP messages
- Match by response code or request method
- Optional messages (won't fail if not received)
- Timeout and authentication support

#### Pause Node ⏸️
- Add delays between messages
- Configure duration in milliseconds
- Support for variable pause times
- Statistical distributions (uniform, normal, exponential)

#### NOP Node ⭕
- No-operation placeholder
- Used for actions without sending/receiving
- Display custom text

#### Label Node 🏷️
- Jump targets for control flow
- Used with `next` attribute in other nodes
- Enable loops and branches

#### Timewait Node ⏱️
- Wait for retransmissions
- Typically used at scenario end
- Configure wait duration

### Property Inspector

Select any node to see its editable properties:

- **Send Node**: Message content, retransmission settings, transaction control
- **Recv Node**: Response/request matching, timeout, optional flag, authentication
- **Pause Node**: Duration, variable name, distribution type
- **Label Node**: Label ID for jumps
- **Advanced Options**: Available for most nodes (next label, test variable, execution chance)

### Validation

Click the "Validate" button to check:
- Scenario has a name
- At least one node exists
- All edges reference valid nodes
- Scenario has send or recv nodes

### Templates

Load pre-built templates to get started quickly:
- **UAC Template**: Basic User Agent Client (INVITE → 100/180 → 200 → ACK → Pause → BYE → 200)

## Architecture

### Technology Stack

- **React 18**: UI framework
- **React Flow**: Visual graph editor
- **Zustand**: State management
- **Vite**: Build tool

### Project Structure

```
flow-editor/
├── src/
│   ├── models/
│   │   └── scenarioModels.js      # Typed models for SIP elements
│   ├── store/
│   │   └── scenarioStore.js       # Zustand state management
│   ├── components/
│   │   ├── nodes/                 # Custom node components
│   │   │   ├── SendNode.jsx
│   │   │   ├── RecvNode.jsx
│   │   │   ├── PauseNode.jsx
│   │   │   ├── NopNode.jsx
│   │   │   ├── LabelNode.jsx
│   │   │   └── TimewaitNode.jsx
│   │   ├── FlowEditor.jsx         # Main React Flow canvas
│   │   ├── Toolbar.jsx            # Node toolbelt
│   │   └── NodeInspector.jsx      # Property editor
│   ├── App.jsx                    # Main application
│   ├── App.css                    # Styles
│   └── main.jsx                   # Entry point
├── index.html
├── vite.config.js
└── package.json
```

### Typed Models

All SIP scenario elements are modeled as JavaScript classes:

- `SendNode` - SIP send messages
- `RecvNode` - SIP receive messages
- `PauseNode` - Pause/delay
- `NopNode` - No-operation
- `LabelNode` - Jump labels
- `TimewaitNode` - Retransmission wait
- `Action` classes - `EregAction`, `LogAction`, `ExecAction`, etc.

Each model includes:
- Type-safe properties
- `toXML()` method for export
- Validation logic

### State Management

Zustand store (`scenarioStore.js`) manages:
- Current scenario and nodes
- Selected node
- Validation errors
- CRUD operations (add, remove, update nodes)
- Template loading
- XML export

## XML Export

The editor generates valid SIPp XML:

```xml
<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">

<scenario name="My Scenario">
  <send retrans="500">
    <![CDATA[
      INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
      ...
    ]]>
  </send>
  
  <recv response="100" optional="true" />
  
  <pause milliseconds="5000" />
  
  ...
</scenario>
```

## Future Enhancements

- XML Import (parse existing scenarios)
- Actions editor (ereg, log, exec, etc.)
- Conditional branches visualization
- Loop detection and rendering
- Undo/redo support
- Node grouping
- Zoom controls
- Export to other formats

## Contributing

To add new node types:

1. Create model class in `scenarioModels.js`
2. Create React component in `components/nodes/`
3. Add to `nodeTypes` in `FlowEditor.jsx`
4. Add inspector UI in `NodeInspector.jsx`
5. Register in toolbar

## License

GPL-2.0 (same as SIPp)

## Resources

- [SIPp Documentation](https://sipp.readthedocs.io)
- [React Flow Docs](https://reactflow.dev)
- [sipp.dtd Reference](../../sipp.dtd)
