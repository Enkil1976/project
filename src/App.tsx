import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatusPanel } from './components/StatusPanel';
import ChartsPanel from './components/ChartsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { StatsPanel } from './components/StatsPanel';
import { Menu } from 'lucide-react';

function App() {
  const [activeSection, setActiveSection] = useState('status');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Efecto para manejar el cierre automático en móviles
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Establecer el estado inicial
    handleResize();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Barra lateral */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 z-30 transition-transform duration-300 ease-in-out w-64`}
      >
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={(section) => {
            setActiveSection(section);
            if (window.innerWidth < 1024) {
              setSidebarOpen(false);
            }
          }} 
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">
                {getPageTitle(activeSection)}
              </h1>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

  // Función auxiliar para obtener el título de la página según la sección activa
  function getPageTitle(section: string): string {
    switch (section) {
      case 'status':
        return 'Estado Actual';
      case 'charts':
        return 'Gráficos';
      case 'history':
        return 'Historial';
      case 'stats':
        return 'Estadísticas';
      default:
        return 'Dashboard';
    }
  }

export default App;