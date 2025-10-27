import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

import useScenarioStore from '../store/scenarioStore';
import SendNode from './nodes/SendNode';
import RecvNode from './nodes/RecvNode';
import PauseNode from './nodes/PauseNode';
import NopNode from './nodes/NopNode';
import LabelNode from './nodes/LabelNode';
import TimewaitNode from './nodes/TimewaitNode';

const nodeTypes = {
  send: SendNode,
  recv: RecvNode,
  pause: PauseNode,
  nop: NopNode,
  label: LabelNode,
  timewait: TimewaitNode
};

const FlowEditor = () => {
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect: storeOnConnect,
    setSelectedNode 
  } = useScenarioStore();

  const [nodes, setNodes, handleNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(storeEdges);

  const onNodesChangeWrapper = useCallback((changes) => {
    handleNodesChange(changes);
    onNodesChange(changes);
  }, [handleNodesChange, onNodesChange]);

  const onEdgesChangeWrapper = useCallback((changes) => {
    handleEdgesChange(changes);
    onEdgesChange(changes);
  }, [handleEdgesChange, onEdgesChange]);

  const onConnectWrapper = useCallback((connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed }
    }, eds));
    storeOnConnect(connection);
  }, [setEdges, storeOnConnect]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="flow-editor">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeWrapper}
        onEdgesChange={onEdgesChangeWrapper}
        onConnect={onConnectWrapper}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'send': return '#4CAF50';
              case 'recv': return '#2196F3';
              case 'pause': return '#FF9800';
              case 'nop': return '#9E9E9E';
              case 'label': return '#9C27B0';
              case 'timewait': return '#FF5722';
              default: return '#999';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default FlowEditor;
