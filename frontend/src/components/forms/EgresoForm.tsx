import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';

import { CreateTransaccionDTO } from '@/types/transaccion.types';
import { CATEGORIAS_EGRESOS } from '@/types/transaccion.types';

interface EgresoFormProps {
  onSubmit: (data: CreateTransaccionDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA';

type FormValues = {
  concepto: string;
  categoria: string;
  total: number;
  metodoPago: MetodoPago;
  referencia?: string;
  notas?: string;
};

export const EgresoForm: React.FC<EgresoFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      concepto: '',
      categoria: '',
      total: 0,
      metodoPago: 'EFECTIVO',
      referencia: '',
      notas: '',
    },
  });

  // Aseguramos el tipo correcto para metodoPago
  const metodoPago = (watch('metodoPago') ?? 'EFECTIVO') as MetodoPago;

 // dentro de src/components/forms/EgresoForm.tsx
const handleFormSubmit = (data: any) => {
  const totalNumber = typeof data.total === 'string' ? parseFloat(data.total) : Number(data.total);

  const transaccion: CreateTransaccionDTO = {
    tipo: 'EGRESO',
    concepto: data.concepto,
    categoria: data.categoria,
    total: totalNumber,
    metodoPago: data.metodoPago as 'EFECTIVO' | 'TRANSFERENCIA',
    referencia: data.metodoPago === 'TRANSFERENCIA' ? data.referencia : undefined,
    notas: data.notas || undefined,
    // ENVIAMOS items vacío: el backend creará el servicio __GASTO__ y reemplazará items
    items: [], 
  };

  onSubmit(transaccion);
};


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Concepto */}
      <Input
        label="Concepto del Gasto *"
        {...register('concepto', {
          required: 'El concepto es requerido',
          minLength: {
            value: 3,
            message: 'El concepto debe tener al menos 3 caracteres',
          },
        })}
        error={errors.concepto?.message as string}
        placeholder="Pago de arriendo, compra de productos, etc."
      />

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoría *
        </label>
        <select
          {...register('categoria', { required: 'La categoría es requerida' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar categoría</option>
          {CATEGORIAS_EGRESOS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.categoria && (
          <p className="mt-1 text-sm text-red-600">{errors.categoria.message as string}</p>
        )}
      </div>

      {/* Monto */}
      <Input
        label="Monto *"
        type="number"
        step="0.01"
        min="0"
        {...register('total', {
          required: 'El monto es requerido',
          valueAsNumber: true,
          min: {
            value: 0.01,
            message: 'El monto debe ser mayor a 0',
          },
        })}
        error={errors.total?.message as string}
        placeholder="50000"
      />

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
          placeholder="Información adicional del gasto..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrar Egreso'}
        </Button>
      </div>
    </form>
  );
};
