import { create } from 'zustand';
import { 
  Scenario, 
  SendNode, 
  RecvNode, 
  PauseNode, 
  NopNode, 
  LabelNode, 
  TimewaitNode 
} from '../models/scenarioModels';

const useScenarioStore = create((set, get) => ({
  scenario: new Scenario(),
  nodes: [],
  edges: [],
  selectedNode: null,
  validationErrors: [],

  setScenarioName: (name) => {
    set((state) => {
      const newScenario = { ...state.scenario };
      newScenario.name = name;
      return { scenario: newScenario };
    });
  },

  addNode: (type, position) => {
    const nodeMap = {
      send: SendNode,
      recv: RecvNode,
      pause: PauseNode,
      nop: NopNode,
      label: LabelNode,
      timewait: TimewaitNode
    };

    const NodeClass = nodeMap[type];
    if (!NodeClass) {
      console.error(`Unknown node type: ${type}`);
      return;
    }

    const newNode = new NodeClass();
    newNode.position = position;

    set((state) => {
      const reactFlowNode = {
        id: newNode.id,
        type: newNode.type,
        position: position,
        data: { node: newNode }
      };

      const newScenario = { ...state.scenario };
      newScenario.addNode(newNode);

      return {
        scenario: newScenario,
        nodes: [...state.nodes, reactFlowNode]
      };
    });
  },

  removeNode: (nodeId) => {
    set((state) => {
      const newScenario = { ...state.scenario };
      newScenario.removeNode(nodeId);

      return {
        scenario: newScenario,
        nodes: state.nodes.filter((n) => n.id !== nodeId),
        edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode
      };
    });
  },

  updateNode: (nodeId, updates) => {
    set((state) => {
      const nodeIndex = state.scenario.nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) return state;

      const newScenario = { ...state.scenario };
      const updatedNode = { ...newScenario.nodes[nodeIndex], ...updates };
      newScenario.nodes[nodeIndex] = updatedNode;

      const newNodes = state.nodes.map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, node: updatedNode } };
        }
        return n;
      });

      return {
        scenario: newScenario,
        nodes: newNodes
      };
    });
  },

  onNodesChange: (changes) => {
    set((state) => {
      let newNodes = [...state.nodes];
      
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const nodeIndex = newNodes.findIndex((n) => n.id === change.id);
          if (nodeIndex !== -1) {
            newNodes[nodeIndex] = {
              ...newNodes[nodeIndex],
              position: change.position
            };
            
            const scenarioNode = state.scenario.nodes.find((n) => n.id === change.id);
            if (scenarioNode) {
              scenarioNode.position = change.position;
            }
          }
        } else if (change.type === 'remove') {
          newNodes = newNodes.filter((n) => n.id !== change.id);
        }
      });

      return { nodes: newNodes };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      let newEdges = [...state.edges];
      
      changes.forEach((change) => {
        if (change.type === 'remove') {
          newEdges = newEdges.filter((e) => e.id !== change.id);
        }
      });

      return { edges: newEdges };
    });
  },

  onConnect: (connection) => {
    set((state) => {
      const newEdge = {
        id: `${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        type: 'smoothstep',
        animated: true
      };

      return {
        edges: [...state.edges, newEdge]
      };
    });
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },

  reorderNodes: (startIndex, endIndex) => {
    set((state) => {
      const newScenario = { ...state.scenario };
      const [removed] = newScenario.nodes.splice(startIndex, 1);
      newScenario.nodes.splice(endIndex, 0, removed);

      return { scenario: newScenario };
    });
  },

  validateScenario: () => {
    const errors = [];
    const { scenario, edges } = get();

    if (!scenario.name || scenario.name.trim() === '') {
      errors.push('Scenario name is required');
    }

    if (scenario.nodes.length === 0) {
      errors.push('Scenario must have at least one node');
    }

    const nodeIds = new Set(scenario.nodes.map((n) => n.id));
    edges.forEach((edge) => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references non-existent source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references non-existent target node: ${edge.target}`);
      }
    });

    const hasRecv = scenario.nodes.some((n) => n.type === 'recv');
    const hasSend = scenario.nodes.some((n) => n.type === 'send');
    if (!hasRecv && !hasSend) {
      errors.push('Scenario should have at least one send or recv node');
    }

    set({ validationErrors: errors });
    return errors.length === 0;
  },

  exportToXML: () => {
    const { scenario } = get();
    return scenario.toXML();
  },

  importFromXML: (xmlString) => {
    console.warn('XML import not yet implemented');
  },

  loadTemplate: (templateName) => {
    const templates = {
      uac: () => {
        const scenario = new Scenario();
        scenario.name = 'Basic UAC';
        
        const invite = new SendNode();
        invite.position = { x: 250, y: 50 };
        invite.retrans = 500;
        invite.content = `
    INVITE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
    Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
    From: <sip:[local_ip]:[local_port]>;tag=[call_number]
    To: <sip:[service]@[remote_ip]:[remote_port]>
    Call-ID: [call_id]
    CSeq: 1 INVITE
    Contact: <sip:[local_ip]:[local_port];transport=[transport]>
    Max-Forwards: 70
    Content-Type: application/sdp
    Content-Length: [len]

    v=0
    o=user1 53655765 2353687637 IN IP[local_ip_type] [local_ip]
    s=-
    c=IN IP[local_ip_type] [local_ip]
    t=0 0
    m=audio [media_port] RTP/AVP 0
    a=rtpmap:0 PCMU/8000`;
        
        const recv100 = new RecvNode();
        recv100.position = { x: 250, y: 150 };
        recv100.response = '100';
        recv100.optional = true;

        const recv180 = new RecvNode();
        recv180.position = { x: 250, y: 230 };
        recv180.response = '180';
        recv180.optional = true;

        const recv200 = new RecvNode();
        recv200.position = { x: 250, y: 310 };
        recv200.response = '200';

        const ack = new SendNode();
        ack.position = { x: 250, y: 410 };
        ack.content = `
    ACK sip:[service]@[remote_ip]:[remote_port] SIP/2.0
    Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
    From: <sip:[local_ip]:[local_port]>;tag=[call_number]
    To: <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
    Call-ID: [call_id]
    CSeq: 1 ACK
    Max-Forwards: 70
    Content-Length: 0`;

        const pause = new PauseNode();
        pause.position = { x: 250, y: 510 };
        pause.milliseconds = 5000;

        const bye = new SendNode();
        bye.position = { x: 250, y: 590 };
        bye.retrans = 500;
        bye.content = `
    BYE sip:[service]@[remote_ip]:[remote_port] SIP/2.0
    Via: SIP/2.0/[transport] [local_ip]:[local_port];branch=[branch]
    From: <sip:[local_ip]:[local_port]>;tag=[call_number]
    To: <sip:[service]@[remote_ip]:[remote_port]>[peer_tag_param]
    Call-ID: [call_id]
    CSeq: 2 BYE
    Max-Forwards: 70
    Content-Length: 0`;

        const recv200bye = new RecvNode();
        recv200bye.position = { x: 250, y: 690 };
        recv200bye.response = '200';

        scenario.addNode(invite);
        scenario.addNode(recv100);
        scenario.addNode(recv180);
        scenario.addNode(recv200);
        scenario.addNode(ack);
        scenario.addNode(pause);
        scenario.addNode(bye);
        scenario.addNode(recv200bye);

        const nodes = scenario.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: { node }
        }));

        const edges = [
          { id: 'e1', source: invite.id, target: recv100.id, type: 'smoothstep', animated: true },
          { id: 'e2', source: recv100.id, target: recv180.id, type: 'smoothstep', animated: true },
          { id: 'e3', source: recv180.id, target: recv200.id, type: 'smoothstep', animated: true },
          { id: 'e4', source: recv200.id, target: ack.id, type: 'smoothstep', animated: true },
          { id: 'e5', source: ack.id, target: pause.id, type: 'smoothstep', animated: true },
          { id: 'e6', source: pause.id, target: bye.id, type: 'smoothstep', animated: true },
          { id: 'e7', source: bye.id, target: recv200bye.id, type: 'smoothstep', animated: true }
        ];

        return { scenario, nodes, edges };
      }
    };

    const template = templates[templateName];
    if (template) {
      const { scenario, nodes, edges } = template();
      set({ scenario, nodes, edges, selectedNode: null, validationErrors: [] });
    }
  },

  clearScenario: () => {
    set({
      scenario: new Scenario(),
      nodes: [],
      edges: [],
      selectedNode: null,
      validationErrors: []
    });
  }
}));

export default useScenarioStore;
