import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  User,
  CreditCard,
  FileText,
  Package,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Transaccion } from '@/types/transaccion.types';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';

interface TransaccionDetalleProps {
  transaccion: Transaccion;
  onEliminar: () => void;
  onCerrar: () => void;
}

export const TransaccionDetalle: React.FC<TransaccionDetalleProps> = ({
  transaccion,
  onEliminar,
  onCerrar,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Detalle de Transacción</h2>
          <div className="flex gap-2 mt-2">
            {transaccion.tipo === 'INGRESO' ? (
              <Badge variant="success" className="flex items-center gap-1">
                <TrendingUp size={14} />
                INGRESO
              </Badge>
            ) : (
              <Badge variant="danger" className="flex items-center gap-1">
                <TrendingDown size={14} />
                EGRESO
              </Badge>
            )}
            <Badge
              variant={transaccion.metodoPago === 'EFECTIVO' ? 'success' : 'info'}
            >
              {transaccion.metodoPago}
            </Badge>
          </div>
        </div>
      </div>

      {/* Monto Principal */}
      <div
        className={`p-6 rounded-lg ${
          transaccion.tipo === 'INGRESO' ? 'bg-green-50' : 'bg-red-50'
        }`}
      >
        <p className="text-sm text-gray-600 mb-1">Monto Total</p>
        <p
          className={`text-4xl font-bold ${
            transaccion.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {transaccion.tipo === 'INGRESO' ? '+' : '-'}
          {formatCurrency(transaccion.total)}
        </p>
      </div>

      {/* Fecha */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <Calendar className="text-blue-600" size={20} />
        <div>
          <p className="text-sm text-gray-600">Fecha y Hora</p>
          <p className="font-semibold text-gray-900">
            {format(new Date(transaccion.fecha), "EEEE, d 'de' MMMM yyyy - HH:mm", {
              locale: es,
            })}
          </p>
        </div>
      </div>

      {/* Información según tipo */}
      {transaccion.tipo === 'INGRESO' ? (
        <>
          {/* Cliente y Empleado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transaccion.cliente && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="text-blue-600" size={18} />
                  <h3 className="font-semibold text-gray-900">Cliente</h3>
                </div>
                <p className="font-medium text-gray-900">{transaccion.cliente.nombre}</p>
                <p className="text-sm text-gray-600">{transaccion.cliente.telefono}</p>
              </div>
            )}

            {transaccion.empleado && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="text-purple-600" size={18} />
                  <h3 className="font-semibold text-gray-900">Barbero</h3>
                </div>
                <p className="font-medium text-gray-900">{transaccion.empleado.nombre}</p>
              </div>
            )}
          </div>

          {/* Items/Servicios */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-gray-600" size={20} />
              <h3 className="font-semibold text-gray-900">Servicios</h3>
            </div>
            <div className="space-y-2">
              {transaccion.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.servicio.nombre}</p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.cantidad} × {formatCurrency(item.precioUnitario)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Concepto y Categoría */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-red-600" size={18} />
              <h3 className="font-semibold text-gray-900">Concepto</h3>
            </div>
            <p className="font-medium text-gray-900 mb-1">{transaccion.concepto}</p>
            <Badge variant="default">{transaccion.categoria}</Badge>
          </div>
        </>
      )}

      {/* Método de Pago */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <CreditCard
          className={transaccion.metodoPago === 'EFECTIVO' ? 'text-green-600' : 'text-purple-600'}
          size={20}
        />
        <div className="flex-1">
          <p className="text-sm text-gray-600">Método de Pago</p>
          <p className="font-semibold text-gray-900">{transaccion.metodoPago}</p>
          {transaccion.referencia && (
            <p className="text-sm text-gray-600">Ref: {transaccion.referencia}</p>
          )}
        </div>
      </div>

      {/* Notas */}
      {transaccion.notas && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Notas</h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{transaccion.notas}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="border-t pt-4 text-xs text-gray-500">
        <p>
          ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{transaccion.id}</code>
        </p>
        <p className="mt-1">
          Creada: {format(new Date(transaccion.createdAt), "d/MM/yyyy HH:mm", { locale: es })}
        </p>
      </div>

      {/* Acciones */}
      <div className="border-t pt-4 flex justify-between">
        <Button variant="danger" onClick={onEliminar}>
          Eliminar Transacción
        </Button>
        <Button variant="ghost" onClick={onCerrar}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};