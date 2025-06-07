import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ApiService } from '../services/api';
import { StatsData } from '../types';

export function StatsPanel() {
  const [temhum1Stats, setTemhum1Stats] = useState<StatsData[]>([]);
  const [temhum2Stats, setTemhum2Stats] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<'temhum1' | 'temhum2'>('temhum1');

  useEffect(() => {
    const fetchStatsData = async () => {
      setLoading(true);
      try {
        const [stats1, stats2] = await Promise.all([
          ApiService.getStats('temhum1'),
          ApiService.getStats('temhum2')
        ]);

        // La API devuelve { days: number, stats: Array }
        setTemhum1Stats(Array.isArray(stats1?.stats) ? stats1.stats : []);
        setTemhum2Stats(Array.isArray(stats2?.stats) ? stats2.stats : []);
      } catch (error) {
        console.error('Error fetching stats data:', error);
      }
      setLoading(false);
    };

    fetchStatsData();
  }, []);

  const currentStats = activeTable === 'temhum1' ? temhum1Stats : temhum2Stats;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Estadísticas Diarias</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTable('temhum1')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTable === 'temhum1'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sensor Ambiental 1
          </button>
          <button
            onClick={() => setActiveTable('temhum2')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTable === 'temhum2'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sensor Ambiental 2
          </button>
        </div>
      </div>

      {/* Tabla de estadísticas */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registros</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={3}>Temperatura (°C)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Humedad (%)</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2"></th>
                <th className="px-2 py-2 text-xs text-gray-500">Prom</th>
                <th className="px-2 py-2 text-xs text-gray-500">Min</th>
                <th className="px-2 py-2 text-xs text-gray-500">Max</th>
                <th className="px-2 py-2 text-xs text-gray-500">Prom</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentStats.length > 0 ? (
                currentStats.map((stat, index) => (
                  <tr key={stat.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(stat.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.records}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{stat.avg_temperatura?.toFixed(1) || '--'}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-blue-600 text-center">{stat.min_temperatura?.toFixed(1) || '--'}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-red-600 text-center">{stat.max_temperatura?.toFixed(1) || '--'}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{stat.avg_humedad?.toFixed(1) || '--'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hay datos estadísticos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico de estadísticas */}
      {currentStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Temperatura - Promedios Diarios</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                />
                <Legend />
                <Bar dataKey="avg_temperatura" fill="#3B82F6" name="Promedio °C" />
                <Bar dataKey="min_temperatura" fill="#93C5FD" name="Mínimo °C" />
                <Bar dataKey="max_temperatura" fill="#1E40AF" name="Máximo °C" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Humedad - Promedios Diarios</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                />
                <Legend />
                <Bar dataKey="avg_humedad" fill="#10B981" name="Promedio %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}