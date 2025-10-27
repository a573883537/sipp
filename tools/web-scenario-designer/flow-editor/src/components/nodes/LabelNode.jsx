import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const LabelNode = ({ data, selected }) => {
  const node = data.node;

  return (
    <div className={`custom-node label-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-icon">🏷️</div>
      <div className="node-label">
        <strong>Label</strong>
        <span className="node-badge">{node.labelId || 'unnamed'}</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(LabelNode);
