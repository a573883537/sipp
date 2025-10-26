import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const NopNode = ({ data, selected }) => {
  const node = data.node;

  return (
    <div className={`custom-node nop-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-icon">⭕</div>
      <div className="node-label">
        <strong>NOP</strong>
        {node.display && <span className="node-badge">{node.display}</span>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(NopNode);
