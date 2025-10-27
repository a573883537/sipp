import { useScenarioStore } from '../store/scenarioStore'

export function Sidebar() {
  const nodes = useScenarioStore(state => state.nodes)
  const selectedNodeId = useScenarioStore(state => state.selectedNodeId)
  const setSelectedNode = useScenarioStore(state => state.setSelectedNode)

  return (
    <aside style={styles.sidebar}>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Configuration</h2>
        <div style={styles.placeholder}>
          <p>Scenario configuration panel placeholder</p>
          <ul style={styles.list}>
            <li>Call rate settings</li>
            <li>Transport options</li>
            <li>Timeout values</li>
            <li>Variable definitions</li>
          </ul>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Node List ({nodes.length})</h2>
        <div style={styles.nodeList}>
          {nodes.length === 0 ? (
            <p style={styles.emptyState}>No nodes yet</p>
          ) : (
            nodes.map(node => (
              <div
                key={node.id}
                style={{
                  ...styles.nodeItem,
                  ...(selectedNodeId === node.id ? styles.nodeItemSelected : {}),
                }}
                onClick={() => setSelectedNode(node.id)}
              >
                <div style={styles.nodeType}>{node.type}</div>
                <div style={styles.nodeLabel}>{node.label}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Actions</h2>
        <div style={styles.placeholder}>
          <button style={styles.button}>Add Send</button>
          <button style={styles.button}>Add Receive</button>
          <button style={styles.button}>Add Pause</button>
        </div>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: '280px',
    backgroundColor: '#f8fafc',
    borderRight: '1px solid #e2e8f0',
    padding: '1.5rem',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  placeholder: {
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px dashed #cbd5e1',
    borderRadius: '4px',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  list: {
    margin: '0.5rem 0 0 0',
    paddingLeft: '1.5rem',
    fontSize: '0.8125rem',
  },
  nodeList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  emptyState: {
    padding: '1rem',
    textAlign: 'center' as const,
    color: '#94a3b8',
    fontSize: '0.875rem',
    backgroundColor: '#fff',
    border: '1px dashed #cbd5e1',
    borderRadius: '4px',
  },
  nodeItem: {
    padding: '0.75rem',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  nodeItemSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  nodeType: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    marginBottom: '0.25rem',
  },
  nodeLabel: {
    fontSize: '0.875rem',
    color: '#1e293b',
  },
  button: {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
}
