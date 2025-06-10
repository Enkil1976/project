import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { getAlertLevel, isValueInRange } from '../utils/validation';

interface StatusCardProps {
  title: string;
  value: number;
  unit: string;
  icon: typeof LucideIcon;
  range?: { min: number; max: number };
  timestamp?: Date;
  className?: string;
}

export function StatusCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  range, 
  timestamp,
  className = ''
}: StatusCardProps) {
  const alertLevel = range ? getAlertLevel(value, range) : 'normal';
  
  const alertColors = {
    normal: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800'
  };

  const iconColors = {
    normal: 'text-green-600',
    warning: 'text-yellow-600', 
    danger: 'text-red-600'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border transition-all hover:shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-sky-50`}>
            <Icon className={`w-6 h-6 ${iconColors[alertLevel]}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {range && (
          <div className={`px-3 py-1 rounded-full border text-xs font-medium ${alertColors[alertLevel]}`}>
            {alertLevel === 'normal' ? 'Normal' : alertLevel === 'warning' ? 'Advertencia' : 'Crítico'}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toFixed(1) : '--'}
          </span>
          <span className="text-lg text-gray-500">{unit}</span>
        </div>
        
        {range && (
          <div className="text-sm text-gray-500">
            Rango ideal: {range.min} - {range.max} {unit}
          </div>
        )}
        
        {timestamp && (
          <div className="text-xs text-gray-400 mt-2">
            Última actualización: {timestamp ? timestamp.toLocaleString('es-CL') : 'N/A'}
          </div>
        )}
      </div>
    </div>
  );
}
