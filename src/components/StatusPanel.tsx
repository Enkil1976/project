import React, { useEffect, useState } from 'react';
import { Thermometer, Droplets, CloudRain, FlaskConical, Zap, Beaker } from 'lucide-react';
import { StatusCard } from './StatusCard';
import { ApiService } from '../services/api';
import { TemHumData, CalidadAguaData } from '../types';
import { ALERT_RANGES, formatDateTime } from '../utils/validation';

export function StatusPanel() {
  const [temhum1Data, setTemhum1Data] = useState<TemHumData | null>(null);
  const [temhum2Data, setTemhum2Data] = useState<TemHumData | null>(null);
  const [calidadAguaData, setCalidadAguaData] = useState<CalidadAguaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [temhum1, temhum2, calidadAgua] = await Promise.all([
          ApiService.getLatestData('temhum1'),
          ApiService.getLatestData('temhum2'),
          ApiService.getLatestData('calidad_agua')
        ]);

        setTemhum1Data(temhum1);
        setTemhum2Data(temhum2);
        setCalidadAguaData(calidadAgua);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching latest data:', error);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Estado Actual de Sensores</h2>
        <div className="text-sm text-gray-500">
          Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
        </div>
      </div>

      {/* Sensor Temperatura/Humedad 1 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          Sensor Ambiental 1
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard
            title="Temperatura"
            value={temhum1Data?.temperatura || 0}
            unit="°C"
            icon={Thermometer}
            range={ALERT_RANGES.temperatura}
            timestamp={temhum1Data ? formatDateTime(temhum1Data.received_at) : undefined}
          />
          <StatusCard
            title="Humedad"
            value={temhum1Data?.humedad || 0}
            unit="%"
            icon={Droplets}
            range={ALERT_RANGES.humedad}
            timestamp={temhum1Data ? formatDateTime(temhum1Data.received_at) : undefined}
          />
          <StatusCard
            title="Punto de Rocío"
            value={temhum1Data?.dew_point || 0}
            unit="°C"
            icon={CloudRain}
            timestamp={temhum1Data ? formatDateTime(temhum1Data.received_at) : undefined}
          />
        </div>
      </div>

      {/* Sensor Temperatura/Humedad 2 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          Sensor Ambiental 2
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard
            title="Temperatura"
            value={temhum2Data?.temperatura || 0}
            unit="°C"
            icon={Thermometer}
            range={ALERT_RANGES.temperatura}
            timestamp={temhum2Data ? formatDateTime(temhum2Data.received_at) : undefined}
          />
          <StatusCard
            title="Humedad"
            value={temhum2Data?.humedad || 0}
            unit="%"
            icon={Droplets}
            range={ALERT_RANGES.humedad}
            timestamp={temhum2Data ? formatDateTime(temhum2Data.received_at) : undefined}
          />
          <StatusCard
            title="Punto de Rocío"
            value={temhum2Data?.dew_point || 0}
            unit="°C"
            icon={CloudRain}
            timestamp={temhum2Data ? formatDateTime(temhum2Data.received_at) : undefined}
          />
        </div>
      </div>

      {/* Sensor Calidad del Agua */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></div>
          Calidad del Agua
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard
            title="pH"
            value={calidadAguaData?.ph || 0}
            unit="pH"
            icon={FlaskConical}
            range={ALERT_RANGES.ph}
            timestamp={calidadAguaData ? formatDateTime(calidadAguaData.received_at) : undefined}
          />
          <StatusCard
            title="Conductividad"
            value={calidadAguaData?.ec || 0}
            unit="µS/cm"
            icon={Zap}
            range={ALERT_RANGES.ec}
            timestamp={calidadAguaData ? formatDateTime(calidadAguaData.received_at) : undefined}
          />
          <StatusCard
            title="PPM"
            value={calidadAguaData?.ppm || 0}
            unit="ppm"
            icon={Beaker}
            range={ALERT_RANGES.ppm}
            timestamp={calidadAguaData ? formatDateTime(calidadAguaData.received_at) : undefined}
          />
        </div>
      </div>
    </div>
  );
}