# Changelog - SIPp Web Scenario Designer

All notable changes to the SIPp Web Scenario Designer will be documented in this file.

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
