import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { FlowCanvas } from './components/FlowCanvas'
import { XmlPreview } from './components/XmlPreview'

function App() {
  return (
    <div style={styles.app}>
      <Header />
      <div style={styles.mainContent}>
        <Sidebar />
        <FlowCanvas />
        <XmlPreview />
      </div>
    </div>
  )
}

const styles = {
  app: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
}

export default App
