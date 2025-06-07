import React, { useEffect, useState, useCallback } from 'react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Bar
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ApiService } from '../services/api';
import { ChartDataPoint } from '../types';

// Definir tipos para los datos de los gráficos
interface TemHumChartData extends ChartDataPoint {
  time: string;
  // Propiedades para compatibilidad con la API
  temperatura?: number;
  humedad?: number;
  // Propiedades para los sensores
  temp1?: number;
  hum1?: number;
  temp2?: number;
  hum2?: number;
  // Para identificar el sensor
  sensor?: 'temhum1' | 'temhum2';
}

interface AguaChartData extends ChartDataPoint {
  time: string;
  ph?: number;
  ec?: number;
  ppm?: number;
}

// Formatear fecha para el eje X
const formatXAxis = (tickItem: string) => {
  try {
    // Asegurarse de que la fecha tenga el formato correcto
    const date = new Date(tickItem);
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', tickItem);
      return '';
    }
    return format(date, 'HH:mm');
  } catch (error) {
    console.error('Error al formatear fecha:', tickItem, error);
    return '';
  }
};

// Formatear tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
        <p className="font-semibold">{format(parseISO(label), 'PPpp')}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartsPanel: React.FC = () => {
  const [temhumData, setTemhumData] = useState<TemHumChartData[]>([]);
  const [aguaData, setAguaData] = useState<AguaChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ambiente' | 'agua'>('ambiente');
  const [timeRange, setTimeRange] = useState<number>(24);

  // Función para cargar datos de gráficos
  const loadChartData = useCallback(async () => {
    console.log('Cargando datos de gráficos...');
    setLoading(true);
    try {
      console.log('Solicitando datos de gráficos...');
      const [temhum1, temhum2, calidad] = await Promise.all([
        ApiService.getChartData('temhum1'),
        ApiService.getChartData('temhum2'),
        ApiService.getChartData('calidad_agua')
      ]);

      console.log('Datos de gráficos recibidos:', { temhum1, temhum2, calidad });

      // Verificar si hay datos
      if (!temhum1 || !temhum2 || !calidad) {
        console.error('Faltan datos de la API');
        return;
      }

      // Procesar datos de sensores ambientales
      const temhum1Data = temhum1?.data || [];
      const temhum2Data = temhum2?.data || [];
      
      // Crear un mapa para combinar datos por timestamp
      const combinedMap = new Map<string, TemHumChartData>();
      
      // Procesar datos del primer sensor (temhum1)
      temhum1Data.forEach(item => {
        if (item.time) {
          combinedMap.set(item.time, {
            ...item,
            temp1: item.temperatura,
            hum1: item.humedad,
            sensor: 'temhum1' as const
          });
        }
      });
      
      // Combinar con datos del segundo sensor (temhum2)
      temhum2Data.forEach(item => {
        if (item.time) {
          const existing = combinedMap.get(item.time) || {};
          combinedMap.set(item.time, {
            ...existing,
            time: item.time,
            temp2: item.temperatura,
            hum2: item.humedad,
            sensor: 'temhum2' as const
          });
        }
      });

      // Convertir el mapa de vuelta a array
      const combinedData = Array.from(combinedMap.values());
      
      // Actualizar estado con los datos combinados
      setTemhumData(combinedData);
      setAguaData(calidad.data || []);
    } catch (error) {
      console.error('Error cargando datos de gráficos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadChartData();
    
    // Configurar intervalo para actualización periódica
    const intervalId = setInterval(() => {
      loadChartData();
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(intervalId);
  }, [loadChartData]);

  // Renderizar gráfico de temperatura y humedad
  const renderTemHumChart = (data: TemHumChartData[]) => {
    if (data.length === 0) {
      return <p className="text-center text-gray-500 mt-4">No hay datos disponibles</p>;
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatXAxis}
              minTickGap={50}
            />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temp1"
              name="Temperatura 1 (°C)"
              stroke="#8884d8"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="hum1"
              name="Humedad 1 (%)"
              stroke="#82ca9d"
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temp2"
              name="Temperatura 2 (°C)"
              stroke="#ff7300"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="hum2"
              name="Humedad 2 (%)"
              stroke="#ffc658"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Renderizar gráfico de calidad de agua
  const renderAguaChart = (data: AguaChartData[]) => {
    if (data.length === 0) {
      return <p className="text-center text-gray-500 mt-4">No hay datos de calidad de agua disponibles</p>;
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatXAxis}
              minTickGap={50}
            />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="ph"
              name="pH"
              fill="#8884d8"
            />
            <Bar
              yAxisId="left"
              dataKey="ec"
              name="CE (mS/cm)"
              fill="#82ca9d"
            />
            <Bar
              yAxisId="right"
              dataKey="ppm"
              name="PPM"
              fill="#ffc658"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('ambiente')}
            style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s',
              ...(activeTab === 'ambiente' ? {
                backgroundColor: '#0369a1',
                color: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #075985'
              } : {
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
              }) as React.CSSProperties
            }}
            className="flex items-center"
          >
            <i className="fas fa-thermometer-half mr-2"></i>
            Ambiente
          </button>
          <button
            onClick={() => setActiveTab('agua')}
            style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s',
              ...(activeTab === 'agua' ? {
                backgroundColor: '#0369a1',
                color: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #075985'
              } : {
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
              }) as React.CSSProperties
            }}
            className="flex items-center"
          >
            <i className="fas fa-tint mr-2"></i>
            Calidad de Agua
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Rango de tiempo:</span>
          <div className="flex space-x-2">
            {[12, 24, 48, 72].map((hours) => (
              <button
                key={hours}
                onClick={() => setTimeRange(hours)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  ...(timeRange === hours ? {
                    backgroundColor: '#0369a1',
                    color: 'white',
                    border: '1px solid #075985',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  } : {
                    backgroundColor: 'white',
                    color: '#4b5563',
                    border: '1px solid #e5e7eb',
                  }) as React.CSSProperties
                }}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {activeTab === 'ambiente' && renderTemHumChart(temhumData)}
          {activeTab === 'agua' && renderAguaChart(aguaData)}
        </>
      )}
    </div>
  );
};

export default ChartsPanel;
