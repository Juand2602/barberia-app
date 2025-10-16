import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { CreateClienteDTO } from '@/types/cliente.types';

interface ClienteFormProps {
  initialData?: CreateClienteDTO;
  onSubmit: (data: CreateClienteDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
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
  } = useForm<CreateClienteDTO>({
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
        label="Nombre completo *"
        {...register('nombre', {
          required: 'El nombre es requerido',
          minLength: {
            value: 3,
            message: 'El nombre debe tener al menos 3 caracteres',
          },
        })}
        error={errors.nombre?.message}
        placeholder="Juan Pérez"
      />

      <Input
        label="Teléfono *"
        {...register('telefono', {
          required: 'El teléfono es requerido',
          pattern: {
            value: /^[0-9+\s-]+$/,
            message: 'Teléfono inválido',
          },
          minLength: {
            value: 10,
            message: 'El teléfono debe tener al menos 10 dígitos',
          },
        })}
        error={errors.telefono?.message}
        placeholder="3001234567"
      />

      <Input
        label="Email (opcional)"
        type="email"
        {...register('email', {
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email inválido',
          },
        })}
        error={errors.email?.message}
        placeholder="juan@example.com"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          {...register('notas')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Información adicional del cliente..."
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