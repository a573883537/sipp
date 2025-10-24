# SIPp Tools

This directory contains supplementary tools for working with SIPp.

## Web Scenario Designer

A browser-based visual editor for creating and editing SIPp XML scenarios.

**Location:** `web-scenario-designer/`

**Quick Start:**
```bash
cd web-scenario-designer
./serve.sh
# or open index.html in your browser
```

**Features:**
- Pre-built templates (UAC, UAS, 3PCC, RTP, SRTP)
- Visual flow and XML editor views
- XML validation
- Export scenarios
- SIPp CLI integration examples

**Documentation:** See [web-scenario-designer/README.md](web-scenario-designer/README.md)

## Contributing

To add new tools:

1. Create a new subdirectory in `tools/`
2. Include a README.md with:
   - Purpose and features
   - Installation/setup instructions
   - Usage examples
   - Dependencies (if any)
3. Update this file with a brief description and link

## Tool Guidelines

Tools in this directory should:
- Be self-contained in their own subdirectory
- Include comprehensive documentation
- Have minimal dependencies when possible
- Be licensed compatibly with SIPp (GPL v2)
- Include examples and usage instructions
