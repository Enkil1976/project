import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ApiService } from '../services/api';
import { TemHumData, CalidadAguaData, TableType } from '../types';
import { formatDateTime } from '../utils/validation';

export function HistoryPanel() {
  const [activeTable, setActiveTable] = useState<TableType>('temhum1');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchHistoryData = async () => {
      setLoading(true);
      try {
        const result = await ApiService.getHistoryData(activeTable);
        setData(result || []);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error fetching history data:', error);
      }
      setLoading(false);
    };

    fetchHistoryData();
  }, [activeTable]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const exportToCSV = () => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const csvContent = [
      headers,
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTable}_history.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderTableHeaders = () => {
    if (activeTable === 'calidad_agua') {
      return (
        <tr className="bg-gray-50">
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EC (µS/cm)</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PPM</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
        </tr>
      );
    } else {
      return (
        <tr className="bg-gray-50">
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperatura (°C)</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humedad (%)</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punto de Rocío (°C)</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
        </tr>
      );
    }
  };

  const renderTableRow = (item: any, index: number) => {
    if (activeTable === 'calidad_agua') {
      return (
        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ph?.toFixed(2) || '--'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ec?.toFixed(0) || '--'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ppm?.toFixed(0) || '--'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(item.received_at)}</td>
        </tr>
      );
    } else {
      return (
        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.temperatura?.toFixed(1) || '--'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.humedad?.toFixed(1) || '--'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.dew_point?.toFixed(1) || '--'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(item.received_at)}</td>
        </tr>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Historial de Datos</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </button>
      </div>

      {/* Selector de tabla */}
      <div className="flex space-x-2">
        {[
          { key: 'temhum1', label: 'Sensor Ambiental 1' },
          { key: 'temhum2', label: 'Sensor Ambiental 2' },
          { key: 'calidad_agua', label: 'Calidad del Agua' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTable(key as TableType)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTable === key
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  {renderTableHeaders()}
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => renderTableRow(item, index))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, data.length)}</span> de{' '}
                    <span className="font-medium">{data.length}</span> resultados
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </button>
                    <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}