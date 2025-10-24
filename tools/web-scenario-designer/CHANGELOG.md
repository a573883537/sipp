# Changelog - SIPp Web Scenario Designer

All notable changes to the SIPp Web Scenario Designer will be documented in this file.

## [1.1.0] - 2025-01-24

### Added

#### XML Import/Export System
- **XML Import Functionality**: Upload and parse existing SIPp XML scenarios
  - New "Import XML" button in the Actions panel
  - File upload dialog for selecting XML files
  - Automatic parsing and visualization of imported scenarios
  - Error handling for malformed XML
  
- **XML Serialization Engine**: Convert internal scenario representation to sipp.dtd-compliant XML
  - Support for all SIPp elements (send, recv, pause, nop, label, timewait, sendCmd, recvCmd)
  - Proper CDATA handling for SIP message content
  - Action element serialization (ereg, log, exec, assign, test, and 20+ more)
  - Attribute preservation and XML escaping
  - ResponseTimeRepartition and CallLengthRepartition support
  
- **XML Parser**: Parse sipp.dtd-compliant XML back into internal representation
  - DOM-based parsing for browser and Node.js compatibility
  - Order-preserving step parsing
  - CDATA content extraction
  - Comprehensive action parsing
  - Full attribute support

- **Copy to Clipboard**: New "Copy XML" button for quick sharing
  - Fallback support for older browsers
  - Success notifications

#### Testing Infrastructure
- **Comprehensive Test Suite**: 55+ unit tests using Vitest
  - XML serialization tests (`xmlSerializer.test.js`)
  - XML parsing tests (`xmlParser.test.js`)
  - Round-trip conversion tests (`roundtrip.test.js`)
  - Real SIPp scenario tests (`sipp-scenarios.test.js`)
  - 100% test pass rate

- **DTD Validation Integration**: Server-side validation with xmllint
  - `dtdValidator.js` module for Node.js environments
  - Integration with existing `dtd_check.sh`
  - Detailed error reporting

#### Visual Enhancements
- **Visual Rendering for Imported Scenarios**: 
  - Automatic generation of visual flow diagrams for imported XML
  - Step-by-step representation with icons and details
  - Support for all scenario element types

### Enhanced
- **Validation**: Improved XML validation with better error messages
- **Documentation**: 
  - New `XML_IMPORT_EXPORT.md` comprehensive guide
  - Updated README with import/export features
  - Enhanced inline code documentation

### Technical Changes
- Added dependencies: `fast-xml-parser`, `vitest`, `jsdom`, `@xmldom/xmldom`
- New modules: `xmlSerializer.js`, `xmlParser.js`, `scenarioManager.js`, `dtdValidator.js`
- Updated `package.json` with test scripts and module type
- Created `vitest.config.js` for test configuration

### Files Added
- `scenarioManager.js` - Browser-compatible XML import/export
- `xmlSerializer.js` - Node.js XML serialization module
- `xmlParser.js` - Node.js XML parsing module
- `dtdValidator.js` - DTD validation with xmllint
- `xmlSerializer.test.js` - Serialization unit tests
- `xmlParser.test.js` - Parser unit tests
- `roundtrip.test.js` - Round-trip conversion tests
- `sipp-scenarios.test.js` - Real scenario tests
- `vitest.config.js` - Vitest configuration
- `XML_IMPORT_EXPORT.md` - Comprehensive documentation

### Browser Compatibility
- Maintained compatibility with Chrome/Edge 90+, Firefox 88+, Safari 14+, Opera 76+
- All new features work in modern browsers without build step

## [1.0.0] - 2024-10-24

### Added

#### Core Features
- Browser-based visual editor for SIPp XML scenarios
- Dual view modes: Visual flow diagram and XML editor
- Real-time scenario editing and validation
- XML download functionality
- Integrated help system with SIPp usage examples

#### Templates
- **UAC (User Agent Client)**: Basic call initiator with INVITE/ACK/BYE flow
- **UAS (User Agent Server)**: Call responder with 180/200 responses
- **3PCC (Third Party Call Control)**: Late offer/answer pattern
- **RTP Playback**: UAC with PCAP audio playback and DTMF support
- **SRTP**: Secure RTP with crypto negotiation (AES-CM-128-HMAC-SHA1)
- **Blank**: Empty scenario template for custom scenarios

#### Documentation
- Comprehensive README with usage examples and templates guide
- Integration guide for SIPp CLI alignment
- Static hosting instructions (Python, Node.js, Nginx)
- Screenshot guidelines
- Implementation summary document

#### Development Tools
- `serve.sh`: Multi-backend HTTP server launcher
- `validate.js`: Template and structure validation script
- `package.json`: NPM scripts for development
- `.gitignore`: Clean repository configuration

#### Integration
- Added "SIPp Scenario Designer" section to `docs/tools.rst`
- Created `tools/README.md` for tools directory overview

### Technical Details
- Pure client-side application (no backend required)
- Responsive design with mobile support
- CSS variables for easy theming
- Modern ES6+ JavaScript
- Zero build dependencies

### File Structure
```
tools/web-scenario-designer/
├── index.html          (7.6 KB) - Main application
├── style.css           (8.1 KB) - Responsive styling
├── app.js              (6.8 KB) - Application logic
├── templates.js       (16.6 KB) - Template library
├── README.md          (10.2 KB) - User documentation
├── IMPLEMENTATION.md   (12.0 KB) - Technical documentation
├── CHANGELOG.md             (this file)
├── package.json              - NPM configuration
├── serve.sh                  - Server script
├── validate.js               - Validation script
├── .gitignore                - Git configuration
└── screenshots/              - Documentation screenshots
    └── README.md
```

### Compliance
- Follows SIPp XML scenario DTD
- Compatible with SIPp 3.x+
- Generates valid SIPp scenarios
- Uses standard SIPp variables and conventions

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

---

## Future Roadmap (Not Implemented)

Potential future enhancements:
- [ ] Drag-and-drop visual flow builder
- [ ] CodeMirror integration for advanced XML editing
- [ ] Real-time SIPp DTD validation
- [ ] Template import/export
- [ ] Direct SIPp execution integration
- [ ] Call flow diagram export (SVG/PNG)
- [ ] Multi-scenario project support
- [ ] Collaborative editing features
