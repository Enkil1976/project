import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatusPanel } from './components/StatusPanel';
import ChartsPanel from './components/ChartsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { StatsPanel } from './components/StatsPanel';

function App() {
  const [activeSection, setActiveSection] = useState('status');

  useEffect(() => {
    console.log('App montada');
    return () => {
      console.log('App desmontada');
    };
  }, []);

  useEffect(() => {
    console.log('activeSection cambiada:', activeSection);
  }, [activeSection]);

  const renderContent = () => {
    console.log('Renderizando contenido para la sección:', activeSection);
    switch (activeSection) {
      case 'status':
        return <StatusPanel />;
      case 'charts':
        return <ChartsPanel />;
      case 'history':
        return <HistoryPanel />;
      case 'stats':
        return <StatsPanel />;
      default:
        return <StatusPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;