import useScenarioStore from '../store/scenarioStore';

const Toolbar = () => {
  const { 
    addNode, 
    validateScenario, 
    exportToXML, 
    loadTemplate, 
    clearScenario,
    validationErrors 
  } = useScenarioStore();

  const nodeTypes = [
    { type: 'send', icon: '📤', label: 'Send' },
    { type: 'recv', icon: '📥', label: 'Recv' },
    { type: 'pause', icon: '⏸️', label: 'Pause' },
    { type: 'nop', icon: '⭕', label: 'NOP' },
    { type: 'label', icon: '🏷️', label: 'Label' },
    { type: 'timewait', icon: '⏱️', label: 'Timewait' }
  ];

  const handleAddNode = (type) => {
    const randomX = 250 + Math.random() * 200;
    const randomY = 100 + Math.random() * 200;
    addNode(type, { x: randomX, y: randomY });
  };

  const handleValidate = () => {
    const isValid = validateScenario();
    if (isValid) {
      alert('Scenario is valid! ✅');
    } else {
      alert('Validation failed:\n\n' + validationErrors.join('\n'));
    }
  };

  const handleExport = () => {
    const xml = exportToXML();
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scenario.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyXML = () => {
    const xml = exportToXML();
    navigator.clipboard.writeText(xml);
    alert('XML copied to clipboard! 📋');
  };

  const handleLoadTemplate = () => {
    if (window.confirm('Load UAC template? This will clear the current scenario.')) {
      loadTemplate('uac');
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear scenario? This cannot be undone.')) {
      clearScenario();
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Add Nodes</h3>
        <div className="node-buttons">
          {nodeTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              className="node-btn"
              onClick={() => handleAddNode(type)}
              title={`Add ${label} node`}
            >
              <span className="node-icon">{icon}</span>
              <span className="node-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Actions</h3>
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={handleLoadTemplate}>
            📋 Load Template
          </button>
          <button className="btn btn-secondary" onClick={handleValidate}>
            ✅ Validate
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            💾 Export XML
          </button>
          <button className="btn btn-secondary" onClick={handleCopyXML}>
            📄 Copy XML
          </button>
          <button className="btn btn-danger" onClick={handleClear}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="toolbar-section validation-errors">
          <h3>Validation Errors</h3>
          <ul>
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
