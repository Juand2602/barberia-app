import React, { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { EstadoCita } from '@/types/cita.types';

interface CambiarEstadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  estadoActual: EstadoCita;
  onConfirmar: (nuevoEstado: EstadoCita, motivoCancelacion?: string) => void;
  isLoading?: boolean;
}

export const CambiarEstadoModal: React.FC<CambiarEstadoModalProps> = ({
  isOpen,
  onClose,
  estadoActual,
  onConfirmar,
  isLoading = false,
}) => {
  const [nuevoEstado, setNuevoEstado] = useState<EstadoCita>(estadoActual);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  const estados: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA'];

  const handleConfirmar = () => {
    if (nuevoEstado === 'CANCELADA' && !motivoCancelacion.trim()) {
      alert('Debe proporcionar un motivo de cancelación');
      return;
    }
    onConfirmar(nuevoEstado, nuevoEstado === 'CANCELADA' ? motivoCancelacion : undefined);
  };

  const getEstadoColor = (estado: EstadoCita) => {
    const colors = {
      PENDIENTE: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      CONFIRMADA: 'bg-green-100 border-green-300 text-green-800',
      COMPLETADA: 'bg-gray-100 border-gray-300 text-gray-800',
      CANCELADA: 'bg-red-100 border-red-300 text-red-800',
    };
    return colors[estado];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Estado de Cita">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Estado actual: <span className="font-semibold">{estadoActual}</span>
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Seleccionar nuevo estado:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {estados.map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => setNuevoEstado(estado)}
                className={`
                  p-3 border-2 rounded-lg transition-all text-sm font-medium
                  ${nuevoEstado === estado 
                    ? getEstadoColor(estado) 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        {nuevoEstado === 'CANCELADA' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de cancelación *
            </label>
            <textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Explica por qué se cancela la cita..."
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmar}
            disabled={isLoading || nuevoEstado === estadoActual}
          >
            {isLoading ? 'Guardando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};