import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit, Trash2, Phone, Calendar } from 'lucide-react';
import { Empleado } from '@/types/empleado.types';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

interface EmpleadosTableProps {
  empleados: Empleado[];
  onEdit: (empleado: Empleado) => void;
  onDelete: (empleado: Empleado) => void;
}

export const EmpleadosTable: React.FC<EmpleadosTableProps> = ({
  empleados,
  onEdit,
  onDelete,
}) => {
  if (empleados.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron empleados</p>
        <p className="text-gray-400 text-sm mt-2">
          Crea tu primer empleado haciendo clic en "Nuevo Empleado"
        </p>
      </div>
    );
  }

  const getDiasLaborales = (empleado: Empleado): string[] => {
    const dias = [];
    if (empleado.horarioLunes) dias.push('L');
    if (empleado.horarioMartes) dias.push('M');
    if (empleado.horarioMiercoles) dias.push('X');
    if (empleado.horarioJueves) dias.push('J');
    if (empleado.horarioViernes) dias.push('V');
    if (empleado.horarioSabado) dias.push('S');
    if (empleado.horarioDomingo) dias.push('D');
    return dias;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Empleado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Especialidades
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Días Laborales
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Citas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {empleados.map((empleado) => (
            <tr key={empleado.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900">{empleado.nombre}</div>
                  <div className="text-sm text-gray-500">
                    Desde {format(new Date(empleado.fechaIngreso), 'MMM yyyy', { locale: es })}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={14} className="mr-1" />
                  {empleado.telefono}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {empleado.especialidades.map((esp, idx) => (
                    <Badge key={idx} variant="info" className="text-xs">
                      {esp}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-1">
                  {getDiasLaborales(empleado).map((dia, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-green-100 text-green-800 rounded"
                    >
                      {dia}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {empleado._count?.citas || 0} citas
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={empleado.activo ? 'success' : 'danger'}>
                  {empleado.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(empleado)}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(empleado)}
                    title="Desactivar"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};