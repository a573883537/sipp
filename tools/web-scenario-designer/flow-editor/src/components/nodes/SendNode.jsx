import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const SendNode = ({ data, selected }) => {
  const node = data.node;
  const method = node.content.trim().split(' ')[0] || 'SEND';

  return (
    <div className={`custom-node send-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-icon">📤</div>
      <div className="node-label">
        <strong>{method}</strong>
        {node.retrans && <span className="node-badge">retrans: {node.retrans}</span>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(SendNode);
