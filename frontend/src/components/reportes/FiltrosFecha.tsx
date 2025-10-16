// src/components/reportes/FiltrosFecha.tsx

import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfYear, endOfYear } from 'date-fns';
import { Calendar } from 'lucide-react';
import {Button} from '../ui/Button';
import {Input} from '../ui/Input';

interface FiltrosFechaProps {
  fechaInicio: Date;
  fechaFin: Date;
  onFechaInicioChange: (fecha: Date) => void;
  onFechaFinChange: (fecha: Date) => void;
  onAplicar: () => void;
}

const FiltrosFecha: React.FC<FiltrosFechaProps> = ({
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  onAplicar
}) => {
  const aplicarPreset = (preset: string) => {
    const hoy = new Date();
    let inicio: Date;
    let fin: Date;

    switch (preset) {
      case 'hoy':
        inicio = new Date(hoy.setHours(0, 0, 0, 0));
        fin = new Date(hoy.setHours(23, 59, 59, 999));
        break;
      case 'semana':
        inicio = startOfWeek(hoy, { weekStartsOn: 1 });
        fin = endOfWeek(hoy, { weekStartsOn: 1 });
        break;
      case 'mes':
        inicio = startOfMonth(hoy);
        fin = endOfMonth(hoy);
        break;
      case 'mes-anterior':
        const mesAnterior = subMonths(hoy, 1);
        inicio = startOfMonth(mesAnterior);
        fin = endOfMonth(mesAnterior);
        break;
      case 'año':
        inicio = startOfYear(hoy);
        fin = endOfYear(hoy);
        break;
      default:
        return;
    }

    onFechaInicioChange(inicio);
    onFechaFinChange(fin);
    setTimeout(onAplicar, 100);
  };

  const formatFechaInput = (fecha: Date) => {
    return fecha.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Filtros de Fecha</h3>
      </div>

      {/* Presets rápidos */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => aplicarPreset('hoy')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Hoy
        </button>
        <button
          onClick={() => aplicarPreset('semana')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Esta Semana
        </button>
        <button
          onClick={() => aplicarPreset('mes')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Este Mes
        </button>
        <button
          onClick={() => aplicarPreset('mes-anterior')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Mes Anterior
        </button>
        <button
          onClick={() => aplicarPreset('año')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Este Año
        </button>
      </div>

      {/* Selectores de fecha personalizados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <Input
            type="date"
            value={formatFechaInput(fechaInicio)}
            onChange={(e) => onFechaInicioChange(new Date(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin
          </label>
          <Input
            type="date"
            value={formatFechaInput(fechaFin)}
            onChange={(e) => onFechaFinChange(new Date(e.target.value))}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={onAplicar} className="w-full">
            Generar Reporte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltrosFecha;