import React from 'react';
import { Input } from '@components/ui/Input';
import { Horario } from '@/types/empleado.types';

interface HorarioSelectorProps {
  dia: string;
  value: Horario | null;
  onChange: (horario: Horario | null) => void;
  error?: string;
}

export const HorarioSelector: React.FC<HorarioSelectorProps> = ({
  dia,
  value,
  onChange,
  error,
}) => {
  const [activo, setActivo] = React.useState(!!value);

  const handleToggle = (checked: boolean) => {
    setActivo(checked);
    if (!checked) {
      onChange(null);
    } else {
      onChange({ inicio: '09:00', fin: '18:00' });
    }
  };

  const handleChange = (field: 'inicio' | 'fin', newValue: string) => {
    if (value) {
      onChange({ ...value, [field]: newValue });
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center w-32">
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => handleToggle(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label className="ml-2 text-sm font-medium text-gray-700">
          {dia}
        </label>
      </div>

      {activo && (
        <>
          <div className="flex-1">
            <Input
              type="time"
              value={value?.inicio || '09:00'}
              onChange={(e) => handleChange('inicio', e.target.value)}
              placeholder="Inicio"
            />
          </div>
          <span className="text-gray-500">-</span>
          <div className="flex-1">
            <Input
              type="time"
              value={value?.fin || '18:00'}
              onChange={(e) => handleChange('fin', e.target.value)}
              placeholder="Fin"
            />
          </div>
        </>
      )}

      {!activo && (
        <div className="flex-1 text-sm text-gray-500 italic">
          No trabaja este día
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};