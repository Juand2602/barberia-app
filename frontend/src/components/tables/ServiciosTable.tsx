import React from 'react';
import { Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { Servicio } from '@/types/servicio.types';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

interface ServiciosTableProps {
  servicios: Servicio[];
  onEdit: (servicio: Servicio) => void;
  onDelete: (servicio: Servicio) => void;
}

export const ServiciosTable: React.FC<ServiciosTableProps> = ({
  servicios,
  onEdit,
  onDelete,
}) => {
  if (servicios.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron servicios</p>
        <p className="text-gray-400 text-sm mt-2">
          Crea tu primer servicio haciendo clic en "Nuevo Servicio"
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Servicio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duración
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ventas
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
          {servicios.map((servicio) => (
            <tr key={servicio.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">{servicio.nombre}</div>
                  {servicio.descripcion && (
                    <div className="text-sm text-gray-500 mt-1">
                      {servicio.descripcion}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-gray-900 font-semibold">
                  <DollarSign size={16} className="mr-1 text-green-600" />
                  {formatPrice(servicio.precio)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-1" />
                  {servicio.duracionMinutos} min
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {servicio._count?.items || 0} veces
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={servicio.activo ? 'success' : 'danger'}>
                  {servicio.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(servicio)}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(servicio)}
                    title="Eliminar"
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