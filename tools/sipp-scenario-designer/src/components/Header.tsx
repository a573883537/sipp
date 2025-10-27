import { useScenarioStore } from '../store/scenarioStore'

export function Header() {
  const config = useScenarioStore(state => state.config)

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <h1 style={styles.title}>SIPp Scenario Designer</h1>
        <div style={styles.scenarioName}>
          <span style={styles.label}>Scenario:</span>
          <span style={styles.value}>{config.name}</span>
        </div>
      </div>
    </header>
  )
}

const styles = {
  header: {
    backgroundColor: '#1e293b',
    color: '#f1f5f9',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  scenarioName: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  label: {
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
  value: {
    fontSize: '1rem',
    fontWeight: 500,
  },
}
