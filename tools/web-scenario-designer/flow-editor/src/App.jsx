import { useState } from 'react';
import FlowEditor from './components/FlowEditor';
import Toolbar from './components/Toolbar';
import NodeInspector from './components/NodeInspector';
import useScenarioStore from './store/scenarioStore';
import './App.css';

function App() {
  const { scenario, setScenarioName } = useScenarioStore();
  const [showInspector, setShowInspector] = useState(true);

  return (
    <div className="app">
      <header className="app-header">
        <h1>SIPp Visual Flow Editor</h1>
        <div className="scenario-name-input">
          <label>Scenario Name:</label>
          <input
            type="text"
            value={scenario.name}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="Enter scenario name"
          />
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowInspector(!showInspector)}
        >
          {showInspector ? '◀ Hide' : '▶ Show'} Inspector
        </button>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <Toolbar />
        </aside>

        <main className="main-editor">
          <FlowEditor />
        </main>

        {showInspector && (
          <aside className="inspector-sidebar">
            <NodeInspector />
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
