# SIPp Scenario Designer

A standalone web-based visual scenario designer for SIPp, built with Vite, React, TypeScript, and Zustand.

## Overview

This tool provides a graphical interface for designing SIPp scenarios with:
- Visual flow canvas for building scenario graphs
- Configuration panels for scenario and node settings
- Real-time XML preview of the generated scenario
- Shared state management using Zustand

## Tech Stack

- **Build Tool**: Vite 5.0
- **Framework**: React 18.2
- **Language**: TypeScript 5.2
- **State Management**: Zustand 4.4
- **Code Quality**: ESLint + Prettier

## Prerequisites

- Node.js 18+ or 20+
- npm 9+ (or pnpm 8+)

## Installation

Install dependencies using npm:

```bash
cd tools/sipp-scenario-designer
npm install
```

Or using pnpm:

```bash
cd tools/sipp-scenario-designer
pnpm install
```

## Development

Start the development server:

```bash
npm run dev
```

This will start the Vite dev server at `http://localhost:3000` and automatically open your browser.

## Building

Build for production:

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

Preview the production build:

```bash
npm run preview
```

## Code Quality

Lint the code:

```bash
npm run lint
```

Format code with Prettier:

```bash
npm run format
```

Check formatting without modifying files:

```bash
npm run format:check
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx       # Top navigation bar
│   ├── Sidebar.tsx      # Left sidebar with configuration
│   ├── FlowCanvas.tsx   # Main flow editor canvas
│   └── XmlPreview.tsx   # Right panel for XML preview
├── store/               # Zustand state management
│   └── scenarioStore.ts # Shared scenario state
├── App.tsx              # Root application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Architecture

### State Management

The application uses Zustand for lightweight state management. The `scenarioStore` maintains:

- **nodes**: Array of scenario nodes (send, receive, pause, etc.)
- **config**: Scenario-level configuration
- **xmlPreview**: Generated XML output
- **selectedNodeId**: Currently selected node for editing

### Components

- **Header**: Displays application title and current scenario name
- **Sidebar**: Contains configuration panels and node list
- **FlowCanvas**: Main working area for the visual flow diagram (placeholder)
- **XmlPreview**: Real-time XML preview of the scenario being built

## Future Development

This scaffold establishes the foundation for subsequent features:

1. Interactive flow diagram with drag-and-drop
2. Node property editors for send/receive/pause actions
3. SIPp scenario XML import/export
4. Validation against SIPp DTD
5. Sample scenario templates
6. Call flow visualization

## Integration with SIPp

This tool is independent of the SIPp C++ build system. It generates XML files that can be used with the main SIPp executable:

```bash
# Build and use scenario with SIPp
cd tools/sipp-scenario-designer
npm run build

# Use generated XML with SIPp
../../sipp -sf scenario.xml [other-sipp-options]
```

## License

This tool is part of the SIPp project and follows the same license terms.
