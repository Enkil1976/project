import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  History, 
  Gauge,
  Leaf,
  Droplets
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'status', label: 'Estado Actual', icon: Gauge },
  { id: 'charts', label: 'Gráficas', icon: TrendingUp },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'stats', label: 'Estadísticas', icon: BarChart3 }
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-sky-500 rounded-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Invernadero</h1>
            <p className="text-sm text-gray-500">IoT Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-sky-50 text-sky-700 border-r-2 border-sky-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Droplets className="w-4 h-4 text-sky-500" />
          <span>Actualización cada 30s</span>
        </div>
      </div>
    </div>
  );
}