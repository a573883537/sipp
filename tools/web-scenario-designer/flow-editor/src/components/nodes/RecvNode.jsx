import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const RecvNode = ({ data, selected }) => {
  const node = data.node;
  const label = node.response 
    ? `${node.response} Response` 
    : node.request 
      ? `${node.request} Request` 
      : 'RECV';

  return (
    <div className={`custom-node recv-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-icon">📥</div>
      <div className="node-label">
        <strong>{label}</strong>
        {node.optional && <span className="node-badge optional">optional</span>}
        {node.timeout && <span className="node-badge">timeout: {node.timeout}</span>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(RecvNode);
