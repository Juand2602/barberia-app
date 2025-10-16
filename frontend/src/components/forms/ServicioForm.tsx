import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { CreateServicioDTO } from '@/types/servicio.types';

interface ServicioFormProps {
  initialData?: CreateServicioDTO;
  onSubmit: (data: CreateServicioDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ServicioForm: React.FC<ServicioFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateServicioDTO>({
    defaultValues: initialData,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre del servicio *"
        {...register('nombre', {
          required: 'El nombre es requerido',
          minLength: {
            value: 3,
            message: 'El nombre debe tener al menos 3 caracteres',
          },
        })}
        error={errors.nombre?.message}
        placeholder="Corte clásico"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción (opcional)
        </label>
        <textarea
          {...register('descripcion')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descripción del servicio..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio (COP) *"
          type="number"
          step="1000"
          {...register('precio', {
            required: 'El precio es requerido',
            valueAsNumber: true,
            min: {
              value: 1,
              message: 'El precio debe ser mayor a 0',
            },
          })}
          error={errors.precio?.message}
          placeholder="20000"
        />

        <Input
          label="Duración (minutos) *"
          type="number"
          step="5"
          {...register('duracionMinutos', {
            required: 'La duración es requerida',
            valueAsNumber: true,
            min: {
              value: 5,
              message: 'La duración debe ser al menos 5 minutos',
            },
            validate: (value) => 
              value % 5 === 0 || 'La duración debe ser múltiplo de 5',
          })}
          error={errors.duracionMinutos?.message}
          placeholder="30"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};