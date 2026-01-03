import React, { useEffect, useState, useRef } from 'react';
import MapleLeaf from './components/MapleLeaf';
import LobeControls from './components/LobeControls';
import ScaleSelector from './components/ScaleSelector';
import GlobalControls from './components/GlobalControls';

function App() {
  const [pulseData, setPulseData] = useState(null);
  const [stemPulse, setStemPulse] = useState(0);
  const [connected, setConnected] = useState(false);
  const [lobes, setLobes] = useState([]);
  const [globalState, setGlobalState] = useState(null);
  const [ports, setPorts] = useState([]);
  const [selectedLobeId, setSelectedLobeId] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket('ws://localhost:8000/ws');

      ws.current.onopen = () => {
        console.log('Connected to Maple Backend');
        setConnected(true);
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'pulse') {
          setPulseData(data);
        } else if (data.type === 'stem_pulse') {
          setStemPulse(prev => prev + 1);
        } else if (data.type === 'init') {
          setLobes(data.state.lobes);
          setGlobalState(data.state);
          setPorts(data.ports);
        } else if (data.type === 'state_update') {
          setLobes(prev => prev.map(l => l.id === data.lobe.id ? { ...l, ...data.lobe } : l));
        } else if (data.type === 'global_update') {
          setGlobalState(prev => ({ ...prev, ...data.updates }));
        }
      };

      ws.current.onclose = () => {
        console.log('Disconnected');
        setConnected(false);
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => ws.current?.close();
  }, []);

  const handleLobeUpdate = (updatedLobe) => {
    // Optimistic update
    setLobes(prev => prev.map(l => l.id === updatedLobe.id ? updatedLobe : l));

    // Send to backend
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'update_lobe',
        lobe: updatedLobe
      }));
    }
  };

  const handleGlobalUpdate = (updates) => {
    setGlobalState(prev => ({ ...prev, ...updates }));
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'update_global',
        updates: updates
      }));
    }
  };

  const handleLobeClick = (lobeId) => {
    setSelectedLobeId(prev => prev === lobeId ? null : lobeId);
  };

  return (
    <div className="w-full h-screen bg-maple-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-maple-leaf/20 via-transparent to-transparent"></div>

      <header className="absolute top-4 z-20 flex flex-col items-center gap-4 w-full pointer-events-none">
        <div className="flex flex-col items-center pointer-events-auto">
          <h1 className="text-2xl font-thin text-maple-leaf tracking-widest uppercase opacity-80">Maple</h1>
          <div className={`text-xs ${connected ? 'text-green-500' : 'text-red-500'} transition-colors duration-500`}>
            {connected ? 'Sync Active' : 'Connecting...'}
          </div>
        </div>

        <div className="pointer-events-auto">
          <ScaleSelector
            selectedNotes={globalState?.selected_notes}
            onUpdate={(notes) => handleGlobalUpdate({ selected_notes: notes })}
          />
        </div>
      </header>

      {/* HUD / Left Panel */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30">
        <GlobalControls
          state={globalState}
          ports={ports}
          onUpdate={handleGlobalUpdate}
        />
      </div>

      {/* Main Visualization */}
      <div className="relative w-[85vmin] h-[85vmin] flex items-center justify-center">
        <MapleLeaf
          pulse={pulseData}
          stemPulseCount={stemPulse}
          selectedLobeId={selectedLobeId}
          onLobeClick={handleLobeClick}
        />
      </div>

      {/* Contextual Right Panel */}
      <div className={`absolute right-0 top-0 h-full w-80 bg-maple-dark/40 border-l border-maple-leaf/20 backdrop-blur-xl transition-transform duration-500 z-40 flex flex-col p-8 pt-24 ${selectedLobeId !== null ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedLobeId !== null && (
          <LobeControls
            lobe={lobes.find(l => l.id === selectedLobeId)}
            onUpdate={handleLobeUpdate}
            onClose={() => setSelectedLobeId(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
