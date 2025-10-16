import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Edit, Trash2, Phone, Mail } from 'lucide-react';
import { Cliente } from '@/types/cliente.types';

import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

interface ClientesTableProps {
  clientes: Cliente[];
  onView: (cliente: Cliente) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
}

export const ClientesTable: React.FC<ClientesTableProps> = ({
  clientes,
  onView,
  onEdit,
  onDelete,
}) => {
  if (clientes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron clientes</p>
        <p className="text-gray-400 text-sm mt-2">
          Crea tu primer cliente haciendo clic en "Nuevo Cliente"
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registro
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
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{cliente.nombre}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={14} className="mr-1" />
                    {cliente.telefono}
                  </div>
                  {cliente.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={14} className="mr-1" />
                      {cliente.email}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {format(new Date(cliente.fechaRegistro), 'dd/MM/yyyy', { locale: es })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {cliente._count?.citas || 0} citas
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={cliente.activo ? 'success' : 'danger'}>
                  {cliente.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(cliente)}
                    title="Ver detalle"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(cliente)}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(cliente)}
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