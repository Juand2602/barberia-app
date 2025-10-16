import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  Phone,
  Mail,
} from 'lucide-react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Cita } from '@/types/cita.types';

interface CitaDetalleProps {
  cita: Cita;
  onEditar: () => void;
  onCambiarEstado: () => void;
  onCancelar: () => void;
  onEliminar: () => void;
  onCerrar: () => void;
}

export const CitaDetalle: React.FC<CitaDetalleProps> = ({
  cita,
  onEditar,
  onCambiarEstado,
  onCancelar,
  onEliminar,
  onCerrar,
}) => {
  const getEstadoBadge = (estado: string) => {
    const variants: any = {
      PENDIENTE: 'warning',
      CONFIRMADA: 'success',
      COMPLETADA: 'default',
      CANCELADA: 'danger',
    };
    return variants[estado] || 'default';
  };

  const getOrigenBadge = (origen: string) => {
    const colors: any = {
      WHATSAPP: 'bg-green-100 text-green-800',
      MANUAL: 'bg-blue-100 text-blue-800',
      TELEFONO: 'bg-purple-100 text-purple-800',
    };
    return colors[origen] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header con estado */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Detalle de Cita</h2>
          <div className="flex gap-2 mt-2">
            <Badge variant={getEstadoBadge(cita.estado)}>
              {cita.estado}
            </Badge>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrigenBadge(cita.origen)}`}>
              {cita.origen}
            </span>
          </div>
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cliente */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <User className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-900">Cliente</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900">{cita.cliente.nombre}</p>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={14} />
              {cita.cliente.telefono}
            </div>
            {cita.cliente.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} />
                {cita.cliente.email}
              </div>
            )}
          </div>
        </div>

        {/* Barbero */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Scissors className="text-purple-600" size={20} />
            <h3 className="font-semibold text-gray-900">Barbero</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900">{cita.empleado.nombre}</p>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={14} />
              {cita.empleado.telefono}
            </div>
          </div>
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Fecha</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(cita.fechaHora), "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Hora</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(cita.fechaHora), 'HH:mm')} 
                <span className="text-sm text-gray-600 ml-1">
                  ({cita.duracionMinutos} min)
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Servicio */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">Servicio</h3>
        <p className="text-lg text-gray-700">{cita.servicioNombre}</p>
      </div>

      {/* Notas */}
      {cita.notas && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Notas</h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{cita.notas}</p>
        </div>
      )}

      {/* Motivo de cancelación */}
      {cita.motivoCancelacion && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-red-900 mb-2">Motivo de Cancelación</h3>
          <p className="text-red-700 bg-red-50 p-3 rounded-lg">{cita.motivoCancelacion}</p>
        </div>
      )}

      {/* Acciones */}
      <div className="border-t pt-4 flex flex-wrap gap-3">
        {cita.estado !== 'COMPLETADA' && cita.estado !== 'CANCELADA' && (
          <>
            <Button variant="primary" onClick={onEditar}>
              Editar Cita
            </Button>
            <Button variant="secondary" onClick={onCambiarEstado}>
              Cambiar Estado
            </Button>
          </>
        )}
        
        {(cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA') && (
          <Button variant="danger" onClick={onCancelar}>
            Cancelar Cita
          </Button>
        )}

        {cita.estado !== 'COMPLETADA' && (
          <Button variant="ghost" onClick={onEliminar}>
            Eliminar
          </Button>
        )}

        <Button variant="ghost" onClick={onCerrar} className="ml-auto">
          Cerrar
        </Button>
      </div>

      {/* Metadata */}
      <div className="border-t pt-4 text-xs text-gray-500">
        <p>Creada: {format(new Date(cita.createdAt), "d/MM/yyyy HH:mm", { locale: es })}</p>
        <p>Última actualización: {format(new Date(cita.updatedAt), "d/MM/yyyy HH:mm", { locale: es })}</p>
      </div>
    </div>
  );
};