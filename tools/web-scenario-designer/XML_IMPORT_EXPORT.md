# XML Import/Export and Validation

This document describes the XML serialization, import, and validation features of the SIPp Scenario Designer.

## Features

### 1. XML Serialization

The designer includes a powerful XML serializer that converts the internal scenario representation into sipp.dtd-compliant XML.

**Module**: `xmlSerializer.js`

**Key Features**:
- Full support for all SIPp scenario elements (send, recv, pause, nop, label, timewait, etc.)
- Proper CDATA handling for SIP messages
- Action element serialization (ereg, log, exec, etc.)
- Attribute preservation
- Proper XML escaping and formatting
- ResponseTimeRepartition and CallLengthRepartition support
- Reference element support

**Usage**:
```javascript
import { serializeScenarioToXML } from './xmlSerializer.js';

const scenario = {
  name: 'My Scenario',
  steps: [
    {
      type: 'send',
      attributes: { retrans: '500' },
      content: 'INVITE sip:test@example.com SIP/2.0\n...'
    },
    {
      type: 'recv',
      attributes: { response: '200' }
    }
  ],
  responseTimeRepartition: '10, 20, 30, 40, 50',
  callLengthRepartition: '100, 500, 1000'
};

const xml = serializeScenarioToXML(scenario);
```

### 2. XML Import/Parsing

The designer can parse existing SIPp XML scenarios and convert them back into the internal representation.

**Module**: `xmlParser.js`

**Key Features**:
- DOM-based parsing (works in browser and Node.js)
- Full SIPp DTD element support
- CDATA content extraction
- Action parsing
- Attribute preservation
- Order-preserving parsing
- Error handling and validation

**Usage**:
```javascript
import { parseScenarioFromXML } from './xmlParser.js';

const xmlString = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<!DOCTYPE scenario SYSTEM "sipp.dtd">
<scenario name="Test">
  <send retrans="500">
    <![CDATA[INVITE...]]>
  </send>
</scenario>`;

const scenario = parseScenarioFromXML(xmlString);
// scenario.name === 'Test'
// scenario.steps[0].type === 'send'
```

### 3. Browser Integration

The browser version includes UI elements for import/export:

**New Buttons**:
- **Import XML**: Upload and parse existing SIPp scenarios
- **Copy XML**: Copy the current scenario to clipboard
- **Download XML**: Save scenario as .xml file (existing)
- **Validate**: Validate XML structure (enhanced)

**Import Workflow**:
1. Click "Import XML" button
2. Select an XML file from your filesystem
3. The scenario is parsed and loaded into the editor
4. Visual representation is automatically generated
5. Any parse errors are displayed to the user

**Module**: `scenarioManager.js` (browser-compatible version)

### 4. XML Validation

**Basic Validation**:
- Well-formedness check using DOMParser
- Scenario element presence verification
- Parse error detection

**DTD Validation** (Node.js only):
- Integration with xmllint
- Full DTD compliance checking
- Detailed error reporting

**Module**: `dtdValidator.js`

**Usage**:
```javascript
import { validateWithDTD } from './dtdValidator.js';

const result = await validateWithDTD(xmlContent, '../../sipp.dtd');
if (result.valid) {
  console.log('XML is valid!');
} else {
  result.errors.forEach(err => {
    console.error(`${err.type}: ${err.message}`);
  });
}
```

### 5. Round-trip Testing

Comprehensive test suite ensures fidelity between XML and internal representation:

**Test Files**:
- `xmlSerializer.test.js` - Serialization tests
- `xmlParser.test.js` - Parser tests
- `roundtrip.test.js` - Round-trip conversion tests
- `sipp-scenarios.test.js` - Tests with actual SIPp scenarios

**Running Tests**:
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

**Test Coverage**:
- All SIPp element types
- Attribute preservation
- CDATA content handling
- Action elements
- Multiple scenarios from sipp_scenarios/
- Edge cases and error handling

## Supported SIPp Elements

### Message Commands
- `<send>` - Send SIP message
  - Attributes: retrans, lost, start_txn, ack_txn, next, test, etc.
  - Supports CDATA content
  - Supports action sub-elements
  
- `<recv>` - Receive SIP message
  - Attributes: response, request, optional, timeout, rtd, etc.
  - Supports action sub-elements

- `<pause>` - Pause execution
  - Attributes: milliseconds, variable, distribution

- `<nop>` - No operation (can contain actions)
  - Attributes: display

- `<label>` - Define a label for jumps
  - Attributes: id

- `<timewait>` - Wait for message retransmissions
  - Attributes: milliseconds

### Action Elements
All action types within `<action>` blocks:
- `<ereg>` - Regular expression extraction
- `<log>` - Log message
- `<warning>` - Warning message
- `<exec>` - Execute command or RTP action
- `<assign>` - Variable assignment
- `<test>` - Conditional test
- `<strcmp>` - String comparison
- And 20+ more action types

### Scenario Metadata
- `<ResponseTimeRepartition>` - Response time statistics
- `<CallLengthRepartition>` - Call length statistics
- `<Reference>` - Variable references

## Example: Complete Round-trip

```javascript
// 1. Parse existing XML
const originalXml = readFileSync('scenario.xml', 'utf-8');
const parsed = parseScenarioFromXML(originalXml);

// 2. Modify scenario
parsed.name = 'Modified Scenario';
parsed.steps.push({
  type: 'pause',
  attributes: { milliseconds: '1000' }
});

// 3. Serialize back to XML
const newXml = serializeScenarioToXML(parsed);

// 4. Validate
const validation = await validateWithDTD(newXml, 'sipp.dtd');
if (validation.valid) {
  writeFileSync('modified_scenario.xml', newXml);
}
```

## DTD Compliance

The serializer generates XML that is fully compliant with `sipp.dtd`:
- Proper DOCTYPE declaration
- Correct element ordering
- Valid attribute names and values
- Proper CDATA sections
- Well-formed XML structure

## Browser Compatibility

The browser version (`scenarioManager.js`) uses:
- Native DOMParser for parsing
- Native DOM methods for serialization
- Clipboard API for copy functionality
- FileReader API for import

Compatible with:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Node.js Usage

The Node.js version uses:
- `@xmldom/xmldom` for DOM parsing
- `fast-xml-parser` for validation
- File system APIs for I/O

Compatible with Node.js 18+

## Error Handling

Both parser and serializer include comprehensive error handling:

**Parse Errors**:
- Malformed XML
- Missing scenario element
- Invalid element structure
- Attribute type mismatches

**Serialization Errors**:
- Invalid scenario structure
- Missing required fields
- Type mismatches

All errors include descriptive messages for debugging.

## Performance

- Parsing: O(n) where n is XML size
- Serialization: O(m) where m is number of steps
- Memory: Minimal overhead, streaming where possible
- Large scenarios (1000+ steps): Sub-second processing

## Future Enhancements

Potential improvements (not yet implemented):
- Real-time XML syntax highlighting
- Advanced DTD validation in browser
- XML diff/merge capabilities
- Export to other formats (JSON, YAML)
- Visual diff between imported scenarios
- Batch import/export
- Scenario templates with placeholders

## Contributing

To add support for new SIPp elements:

1. Update `xmlSerializer.js` to add serialization logic
2. Update `xmlParser.js` to add parsing logic
3. Add tests in `roundtrip.test.js`
4. Update this documentation

## License

Same as SIPp project (GPL v2)
