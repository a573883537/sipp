import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const TimewaitNode = ({ data, selected }) => {
  const node = data.node;

  return (
    <div className={`custom-node timewait-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-icon">⏱️</div>
      <div className="node-label">
        <strong>Timewait</strong>
        <span className="node-badge">{node.milliseconds}ms</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(TimewaitNode);
