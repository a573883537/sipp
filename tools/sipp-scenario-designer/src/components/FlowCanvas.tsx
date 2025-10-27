import { useScenarioStore } from '../store/scenarioStore'

export function FlowCanvas() {
  const nodes = useScenarioStore(state => state.nodes)
  const addNode = useScenarioStore(state => state.addNode)

  const handleAddSampleNode = () => {
    addNode({
      id: `node-${Date.now()}`,
      type: 'send',
      label: 'Sample Send Node',
      data: {},
    })
  }

  return (
    <div style={styles.canvas}>
      <div style={styles.canvasHeader}>
        <h2 style={styles.title}>Flow Canvas</h2>
        <button style={styles.addButton} onClick={handleAddSampleNode}>
          + Add Sample Node
        </button>
      </div>
      <div style={styles.canvasContent}>
        {nodes.length === 0 ? (
          <div style={styles.emptyState}>
            <svg
              style={styles.emptyIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 style={styles.emptyTitle}>No Scenario Elements</h3>
            <p style={styles.emptyDescription}>
              Start building your SIP scenario by adding nodes from the sidebar or clicking the
              button above.
            </p>
          </div>
        ) : (
          <div style={styles.flowPlaceholder}>
            <p style={styles.placeholderTitle}>Visual Flow Editor Placeholder</p>
            <p style={styles.placeholderText}>
              This area will contain the interactive flow diagram with drag-and-drop functionality.
            </p>
            <div style={styles.nodePreview}>
              <p style={styles.previewLabel}>Current nodes:</p>
              {nodes.map(node => (
                <div key={node.id} style={styles.previewNode}>
                  <span style={styles.previewNodeType}>{node.type}</span>
                  <span style={styles.previewNodeLabel}>{node.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  canvas: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#fff',
  },
  canvasHeader: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  canvasContent: {
    flex: 1,
    position: 'relative' as const,
    overflow: 'auto',
  },
  emptyState: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
    maxWidth: '400px',
  },
  emptyIcon: {
    width: '4rem',
    height: '4rem',
    margin: '0 auto 1rem',
    color: '#cbd5e1',
  },
  emptyTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#475569',
  },
  emptyDescription: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  flowPlaceholder: {
    padding: '2rem',
    margin: '2rem',
    backgroundColor: '#f8fafc',
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  placeholderTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#475569',
  },
  placeholderText: {
    margin: '0 0 1.5rem 0',
    color: '#64748b',
    fontSize: '0.875rem',
  },
  nodePreview: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '4px',
    textAlign: 'left' as const,
  },
  previewLabel: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  previewNode: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
  },
  previewNodeType: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#3b82f6',
    textTransform: 'uppercase' as const,
  },
  previewNodeLabel: {
    fontSize: '0.875rem',
    color: '#1e293b',
  },
}
