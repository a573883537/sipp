import { create } from 'zustand'

export interface ScenarioNode {
  id: string
  type: string
  label: string
  data: Record<string, unknown>
}

export interface ScenarioConfig {
  name: string
  description: string
  [key: string]: unknown
}

interface ScenarioState {
  nodes: ScenarioNode[]
  config: ScenarioConfig
  xmlPreview: string
  selectedNodeId: string | null
  addNode: (node: ScenarioNode) => void
  updateNode: (id: string, updates: Partial<ScenarioNode>) => void
  removeNode: (id: string) => void
  setConfig: (config: Partial<ScenarioConfig>) => void
  setXmlPreview: (xml: string) => void
  setSelectedNode: (id: string | null) => void
}

export const useScenarioStore = create<ScenarioState>(set => ({
  nodes: [],
  config: {
    name: 'New Scenario',
    description: '',
  },
  xmlPreview: '',
  selectedNodeId: null,
  addNode: node =>
    set(state => ({
      nodes: [...state.nodes, node],
    })),
  updateNode: (id, updates) =>
    set(state => ({
      nodes: state.nodes.map(node => (node.id === id ? { ...node, ...updates } : node)),
    })),
  removeNode: id =>
    set(state => ({
      nodes: state.nodes.filter(node => node.id !== id),
    })),
  setConfig: config =>
    set(state => ({
      config: { ...state.config, ...config },
    })),
  setXmlPreview: xmlPreview => set({ xmlPreview }),
  setSelectedNode: selectedNodeId => set({ selectedNodeId }),
}))
