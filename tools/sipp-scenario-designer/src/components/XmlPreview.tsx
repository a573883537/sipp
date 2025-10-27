import { useScenarioStore } from '../store/scenarioStore'

export function XmlPreview() {
  const xmlPreview = useScenarioStore(state => state.xmlPreview)
  const nodes = useScenarioStore(state => state.nodes)

  const generatePlaceholderXml = () => {
    if (nodes.length === 0) {
      return '<!-- No nodes to generate XML -->'
    }

    return `<?xml version="1.0" encoding="UTF-8" ?>
<scenario name="Sample Scenario">
  <!-- Generated from ${nodes.length} node(s) -->
${nodes
  .map(
    node => `  <!-- ${node.type}: ${node.label} -->
  <${node.type}>
    <!-- Node configuration will be generated here -->
  </${node.type}>`
  )
  .join('\n')}
</scenario>`
  }

  const displayXml = xmlPreview || generatePlaceholderXml()

  return (
    <div style={styles.preview}>
      <div style={styles.header}>
        <h2 style={styles.title}>XML Preview</h2>
        <div style={styles.actions}>
          <button style={styles.button} disabled>
            Copy
          </button>
          <button style={styles.button} disabled>
            Export
          </button>
        </div>
      </div>
      <div style={styles.content}>
        <pre style={styles.codeBlock}>
          <code style={styles.code}>{displayXml}</code>
        </pre>
      </div>
    </div>
  )
}

const styles = {
  preview: {
    width: '350px',
    backgroundColor: '#1e293b',
    borderLeft: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#f1f5f9',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  button: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#475569',
    color: '#f1f5f9',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '1rem',
  },
  codeBlock: {
    margin: 0,
    padding: '1rem',
    backgroundColor: '#0f172a',
    borderRadius: '4px',
    overflow: 'auto',
  },
  code: {
    color: '#e2e8f0',
    fontSize: '0.8125rem',
    fontFamily: "'Courier New', monospace",
    lineHeight: 1.6,
  },
}
