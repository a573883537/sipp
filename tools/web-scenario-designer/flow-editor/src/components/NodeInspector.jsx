import { useState, useEffect } from 'react';
import useScenarioStore from '../store/scenarioStore';

const NodeInspector = () => {
  const { selectedNode, updateNode, removeNode } = useScenarioStore();
  const [localData, setLocalData] = useState(null);

  useEffect(() => {
    if (selectedNode) {
      setLocalData({ ...selectedNode.data.node });
    } else {
      setLocalData(null);
    }
  }, [selectedNode]);

  if (!selectedNode || !localData) {
    return (
      <div className="node-inspector empty">
        <p>Select a node to edit its properties</p>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateNode(selectedNode.id, localData);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this node?')) {
      removeNode(selectedNode.id);
    }
  };

  const renderSendInspector = () => (
    <>
      <div className="form-group">
        <label>SIP Message Content</label>
        <textarea
          value={localData.content || ''}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={15}
          className="code-input"
        />
      </div>
      <div className="form-group">
        <label>Retransmission Timer (ms)</label>
        <input
          type="number"
          value={localData.retrans || ''}
          onChange={(e) => handleChange('retrans', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="e.g., 500"
        />
      </div>
      <div className="form-group">
        <label>Packet Loss Probability (%)</label>
        <input
          type="number"
          value={localData.lost || ''}
          onChange={(e) => handleChange('lost', e.target.value ? parseFloat(e.target.value) : null)}
          placeholder="0-100"
          min="0"
          max="100"
          step="0.1"
        />
      </div>
      <div className="form-group">
        <label>Start Transaction</label>
        <input
          type="text"
          value={localData.start_txn || ''}
          onChange={(e) => handleChange('start_txn', e.target.value)}
          placeholder="transaction name"
        />
      </div>
      <div className="form-group">
        <label>ACK Transaction</label>
        <input
          type="text"
          value={localData.ack_txn || ''}
          onChange={(e) => handleChange('ack_txn', e.target.value)}
          placeholder="transaction name"
        />
      </div>
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={localData.crlf || false}
            onChange={(e) => handleChange('crlf', e.target.checked)}
          />
          Add CRLF
        </label>
      </div>
    </>
  );

  const renderRecvInspector = () => (
    <>
      <div className="form-group">
        <label>Response Code</label>
        <input
          type="text"
          value={localData.response || ''}
          onChange={(e) => handleChange('response', e.target.value)}
          placeholder="e.g., 100, 180, 200"
        />
        <small>Leave empty if receiving a request</small>
      </div>
      <div className="form-group">
        <label>Request Method</label>
        <input
          type="text"
          value={localData.request || ''}
          onChange={(e) => handleChange('request', e.target.value)}
          placeholder="e.g., INVITE, BYE"
        />
        <small>Leave empty if receiving a response</small>
      </div>
      <div className="form-group">
        <label>Timeout (ms)</label>
        <input
          type="number"
          value={localData.timeout || ''}
          onChange={(e) => handleChange('timeout', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="e.g., 5000"
        />
      </div>
      <div className="form-group">
        <label>On Timeout Jump To</label>
        <input
          type="text"
          value={localData.ontimeout || ''}
          onChange={(e) => handleChange('ontimeout', e.target.value)}
          placeholder="label name"
        />
      </div>
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={localData.optional || false}
            onChange={(e) => handleChange('optional', e.target.checked)}
          />
          Optional (don't fail scenario if not received)
        </label>
      </div>
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={localData.rrs || false}
            onChange={(e) => handleChange('rrs', e.target.checked)}
          />
          Record Route Set
        </label>
      </div>
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={localData.auth || false}
            onChange={(e) => handleChange('auth', e.target.checked)}
          />
          Authenticate
        </label>
      </div>
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={localData.regexp_match || false}
            onChange={(e) => handleChange('regexp_match', e.target.checked)}
          />
          Enable Regexp Matching
        </label>
      </div>
    </>
  );

  const renderPauseInspector = () => (
    <>
      <div className="form-group">
        <label>Duration (milliseconds)</label>
        <input
          type="number"
          value={localData.milliseconds || ''}
          onChange={(e) => handleChange('milliseconds', e.target.value ? parseInt(e.target.value) : 1000)}
          min="0"
          step="100"
        />
      </div>
      <div className="form-group">
        <label>Variable (optional)</label>
        <input
          type="text"
          value={localData.variable || ''}
          onChange={(e) => handleChange('variable', e.target.value)}
          placeholder="variable name"
        />
        <small>Use a variable for dynamic pause duration</small>
      </div>
      <div className="form-group">
        <label>Distribution (optional)</label>
        <select
          value={localData.distribution || ''}
          onChange={(e) => handleChange('distribution', e.target.value)}
        >
          <option value="">None</option>
          <option value="fixed">Fixed</option>
          <option value="uniform">Uniform</option>
          <option value="normal">Normal</option>
          <option value="exponential">Exponential</option>
        </select>
      </div>
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={localData.sanity_check !== false}
            onChange={(e) => handleChange('sanity_check', e.target.checked)}
          />
          Sanity Check
        </label>
      </div>
    </>
  );

  const renderNopInspector = () => (
    <>
      <div className="form-group">
        <label>Display Text</label>
        <input
          type="text"
          value={localData.display || ''}
          onChange={(e) => handleChange('display', e.target.value)}
          placeholder="Optional display text"
        />
      </div>
    </>
  );

  const renderLabelInspector = () => (
    <>
      <div className="form-group">
        <label>Label ID</label>
        <input
          type="text"
          value={localData.labelId || ''}
          onChange={(e) => handleChange('labelId', e.target.value)}
          placeholder="e.g., start, error_handler"
        />
        <small>Used for jump targets</small>
      </div>
    </>
  );

  const renderTimewaitInspector = () => (
    <>
      <div className="form-group">
        <label>Duration (milliseconds)</label>
        <input
          type="number"
          value={localData.milliseconds || ''}
          onChange={(e) => handleChange('milliseconds', e.target.value ? parseInt(e.target.value) : 4000)}
          min="0"
          step="100"
        />
        <small>Time to wait for retransmissions</small>
      </div>
    </>
  );

  const renderCommonFields = () => (
    <>
      <div className="form-group">
        <label>Next Label</label>
        <input
          type="text"
          value={localData.next || ''}
          onChange={(e) => handleChange('next', e.target.value)}
          placeholder="label to jump to"
        />
      </div>
      <div className="form-group">
        <label>Test Variable</label>
        <input
          type="text"
          value={localData.test || ''}
          onChange={(e) => handleChange('test', e.target.value)}
          placeholder="variable to test"
        />
      </div>
      <div className="form-group">
        <label>Execution Chance (0-100)</label>
        <input
          type="number"
          value={localData.chance || ''}
          onChange={(e) => handleChange('chance', e.target.value ? parseInt(e.target.value) : null)}
          min="0"
          max="100"
          placeholder="100 = always execute"
        />
      </div>
    </>
  );

  const renderInspector = () => {
    switch (localData.type) {
      case 'send':
        return renderSendInspector();
      case 'recv':
        return renderRecvInspector();
      case 'pause':
        return renderPauseInspector();
      case 'nop':
        return renderNopInspector();
      case 'label':
        return renderLabelInspector();
      case 'timewait':
        return renderTimewaitInspector();
      default:
        return <p>Unknown node type</p>;
    }
  };

  const showCommonFields = ['send', 'recv', 'pause', 'nop'].includes(localData.type);

  return (
    <div className="node-inspector">
      <div className="inspector-header">
        <h3>
          {localData.type.charAt(0).toUpperCase() + localData.type.slice(1)} Node
        </h3>
        <button className="btn-icon" onClick={handleDelete} title="Delete node">
          🗑️
        </button>
      </div>

      <div className="inspector-content">
        {renderInspector()}
        
        {showCommonFields && (
          <details className="advanced-options">
            <summary>Advanced Options</summary>
            {renderCommonFields()}
          </details>
        )}
      </div>

      <div className="inspector-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default NodeInspector;
