import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { clientesService } from '@services/clientes.service';
import { empleadosService } from '@services/empleados.service';
import { serviciosService } from '@services/servicios.service';
import { CreateTransaccionDTO, TransaccionItemDTO } from '@/types/transaccion.types';
import { Cliente } from '@/types/cliente.types';
import { Empleado } from '@/types/empleado.types';
import { Servicio } from '@/types/servicio.types';

interface IngresoFormProps {
  onSubmit: (data: CreateTransaccionDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ItemFormulario extends TransaccionItemDTO {
  tempId: string;
  nombreServicio?: string;
}

type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA';

type FormValues = {
  clienteId?: string;
  empleadoId: string;
  metodoPago: MetodoPago;
  referencia?: string;
  notas?: string;
};

export const IngresoForm: React.FC<IngresoFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [items, setItems] = useState<ItemFormulario[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    defaultValues: {
      clienteId: undefined,
      empleadoId: '',
      metodoPago: 'EFECTIVO',
      referencia: '',
      notas: '',
    },
  });

  // Aseguramos el tipo correcto para metodoPago
  const metodoPago = (watch('metodoPago') ?? 'EFECTIVO') as MetodoPago;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientesData, empleadosData, serviciosData] = await Promise.all([
        clientesService.getAll(),
        empleadosService.getAll(true),
        serviciosService.getAll(true),
      ]);

      setClientes(clientesData);
      setEmpleados(empleadosData);
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const agregarItem = () => {
    setItems(prev => [
      ...prev,
      {
        tempId: Date.now().toString(),
        servicioId: '',
        cantidad: 1,
        precioUnitario: 0,
        subtotal: 0,
      },
    ]);
  };

  const eliminarItem = (tempId: string) => {
    setItems(prev => prev.filter(item => item.tempId !== tempId));
  };

  const actualizarItem = (tempId: string, campo: keyof ItemFormulario, valor: any) => {
    setItems(prev =>
      prev.map(item => {
        if (item.tempId !== tempId) return item;

        const itemActualizado: ItemFormulario = { ...item, [campo]: valor };

        // Si se cambió el servicio, actualizar precio y nombre
        if (campo === 'servicioId') {
          const servicio = servicios.find(s => s.id === valor);
          if (servicio) {
            itemActualizado.precioUnitario = servicio.precio;
            itemActualizado.nombreServicio = servicio.nombre;
            itemActualizado.subtotal = servicio.precio * (itemActualizado.cantidad || 1);
          } else {
            // servicio no encontrado: resetear precio/subtotal
            itemActualizado.precioUnitario = 0;
            itemActualizado.subtotal = 0;
            itemActualizado.nombreServicio = undefined;
          }
        }

        // Si se cambió la cantidad o precio, recalcular subtotal
        if (campo === 'cantidad') {
          const cantidad = Number(valor) || 0;
          itemActualizado.cantidad = cantidad;
          itemActualizado.subtotal = cantidad * (itemActualizado.precioUnitario || 0);
        }

        if (campo === 'precioUnitario') {
          const precio = Number(valor) || 0;
          itemActualizado.precioUnitario = precio;
          itemActualizado.subtotal = precio * (itemActualizado.cantidad || 0);
        }

        return itemActualizado;
      })
    );
  };

  const calcularTotal = () => items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const handleFormSubmit = (data: FormValues) => {
    if (items.length === 0) {
      alert('Debe agregar al menos un servicio');
      return;
    }

    if (items.some(item => !item.servicioId)) {
      alert('Todos los items deben tener un servicio seleccionado');
      return;
    }

    const transaccion: CreateTransaccionDTO = {
      tipo: 'INGRESO',
      clienteId: data.clienteId || undefined,
      empleadoId: data.empleadoId || undefined,
      total: calcularTotal(),
      metodoPago: data.metodoPago,
      referencia: data.metodoPago === 'TRANSFERENCIA' ? data.referencia : undefined,
      notas: data.notas || undefined,
      items: items.map(({ servicioId, cantidad, precioUnitario, subtotal }) => ({
        servicioId,
        cantidad,
        precioUnitario,
        subtotal,
      })),
    };

    onSubmit(transaccion);
  };

  if (loadingData) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">Cargando datos...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Cliente y Empleado */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente (opcional)
          </label>
          <select
            {...register('clienteId')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} - {cliente.telefono}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barbero *
          </label>
          <select
            {...register('empleadoId', { required: 'El barbero es requerido' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar barbero</option>
            {empleados.map((empleado) => (
              <option key={empleado.id} value={empleado.id}>
                {empleado.nombre}
              </option>
            ))}
          </select>
          {errors.empleadoId && (
            <p className="mt-1 text-sm text-red-600">{errors.empleadoId.message as string}</p>
          )}
        </div>
      </div>

      {/* Servicios */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Servicios</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={agregarItem}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Agregar Servicio
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No hay servicios agregados</p>
            <p className="text-sm text-gray-400 mt-1">
              Haz clic en "Agregar Servicio" para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.tempId}
                className="grid grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg items-end"
              >
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio *
                  </label>
                  <select
                    value={item.servicioId}
                    onChange={(e) => actualizarItem(item.tempId, 'servicioId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    {servicios.map((servicio) => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre} - ${servicio.precio.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cant.
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={item.cantidad}
                    onChange={(e) =>
                      actualizarItem(item.tempId, 'cantidad', parseInt(e.target.value || '1', 10))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.precioUnitario}
                    onChange={(e) =>
                      actualizarItem(item.tempId, 'precioUnitario', parseFloat(e.target.value || '0'))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtotal
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 font-semibold">
                    ${item.subtotal.toLocaleString()}
                  </div>
                </div>

                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarItem(item.tempId)}
                    className="w-full"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">TOTAL:</span>
          <span className="text-3xl font-bold text-blue-600">
            ${calcularTotal().toLocaleString()}
          </span>
        </div>
      </div>

      {/* Método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`
              flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors
              ${
                metodoPago === 'EFECTIVO'
                  ? 'bg-green-50 border-green-500 text-green-900'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input
              type="radio"
              value="EFECTIVO"
              {...register('metodoPago')}
              className="w-4 h-4"
            />
            <span className="font-medium">Efectivo</span>
          </label>

          <label
            className={`
              flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors
              ${
                metodoPago === 'TRANSFERENCIA'
                  ? 'bg-purple-50 border-purple-500 text-purple-900'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input
              type="radio"
              value="TRANSFERENCIA"
              {...register('metodoPago')}
              className="w-4 h-4"
            />
            <span className="font-medium">Transferencia</span>
          </label>
        </div>
      </div>

      {/* Referencia (solo si es transferencia) */}
      {metodoPago === 'TRANSFERENCIA' && (
        <Input
          label="Número de Referencia *"
          {...register('referencia', {
            required: metodoPago === 'TRANSFERENCIA' ? 'La referencia es requerida' : false,
          })}
          error={errors.referencia?.message as string}
          placeholder="123456789"
        />
      )}

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          {...register('notas')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Información adicional..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || items.length === 0}
        >
          {isLoading ? 'Registrando...' : 'Registrar Venta'}
        </Button>
      </div>
    </form>
  );
};
