import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { CreateCitaDTO } from '@/types/cita.types';
import { clientesService } from '@services/clientes.service';
import { empleadosService } from '@services/empleados.service';
import { serviciosService } from '@services/servicios.service';
import { Cliente } from '@/types/cliente.types';
import { Empleado } from '@/types/empleado.types';
import { Servicio } from '@/types/servicio.types';

interface CitaFormProps {
  initialData?: Partial<CreateCitaDTO> & { id?: string };
  onSubmit: (data: CreateCitaDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type FormValues = {
  clienteId: string;
  empleadoId: string;
  servicioNombre: string;
  fecha: string; // yyyy-MM-dd
  hora: string;  // HH:mm
  duracionMinutos: number;
  notas?: string;
};

export const CitaForm: React.FC<CitaFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Parse initial fechaHora ISO (si viene) a fecha y hora locales
  const parseInitialFechaHora = (iso?: string) => {
    if (!iso) return { fecha: '', hora: '' };
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return { fecha: '', hora: '' };
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return { fecha: `${yyyy}-${mm}-${dd}`, hora: `${hh}:${min}` };
    } catch {
      return { fecha: '', hora: '' };
    }
  };

  const initialFechaHora = parseInitialFechaHora(initialData?.fechaHora);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      clienteId: initialData?.clienteId || '',
      empleadoId: initialData?.empleadoId || '',
      servicioNombre: initialData?.servicioNombre || '',
      fecha: initialFechaHora.fecha,
      hora: initialFechaHora.hora,
      duracionMinutos: initialData?.duracionMinutos ?? 30,
      notas: initialData?.notas || '',
    },
  });

  const servicioSeleccionado = watch('servicioNombre');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialData) {
      const parsed = parseInitialFechaHora(initialData.fechaHora);
      reset({
        clienteId: initialData.clienteId || '',
        empleadoId: initialData.empleadoId || '',
        servicioNombre: initialData.servicioNombre || '',
        fecha: parsed.fecha,
        hora: parsed.hora,
        duracionMinutos: initialData.duracionMinutos ?? 30,
        notas: initialData.notas || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, reset]);

  // Actualizar duración automáticamente al seleccionar servicio
  useEffect(() => {
    if (servicioSeleccionado) {
      const servicio = servicios.find(s => s.nombre === servicioSeleccionado);
      if (servicio) {
        // sólo actualiza el campo duracionMinutos, no resetea fecha/hora
        setValue('duracionMinutos', servicio.duracionMinutos);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicioSeleccionado, servicios]);

  const loadData = async () => {
    try {
      const [clientesData, empleadosData, serviciosData] = await Promise.all([
        clientesService.getAll(),
        empleadosService.getAll(true), // Solo activos
        serviciosService.getAll(true), // Solo activos
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

  if (loadingData) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">Cargando datos...</p>
      </div>
    );
  }

  // Construye ISO desde fecha local y hora local: returns ISO string o null
  const buildFechaHoraISO = (fecha: string, hora: string) => {
    if (!fecha || !hora) return null;
    // fecha "yyyy-MM-dd", hora "HH:mm"
    const local = `${fecha}T${hora}:00`;
    const d = new Date(local);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const submitHandler = (form: FormValues) => {
    const fechaHoraISO = buildFechaHoraISO(form.fecha, form.hora);
    if (!fechaHoraISO) {
      alert('Formato de fecha/hora inválido. Selecciona fecha y hora.');
      return;
    }

    // Validación adicional: evitar enviar en el pasado
    if (new Date(fechaHoraISO) < new Date()) {
      alert('No se pueden agendar citas en el pasado');
      return;
    }

    const dto: CreateCitaDTO = {
      clienteId: form.clienteId,
      empleadoId: form.empleadoId,
      servicioNombre: form.servicioNombre,
      fechaHora: fechaHoraISO,
      duracionMinutos: form.duracionMinutos,
      notas: form.notas,
    };

    onSubmit(dto);
  };

  // min date (hoy) en formato yyyy-MM-dd
  const minDateToday = () => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cliente *
        </label>
        <select
          {...register('clienteId', { required: 'El cliente es requerido' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre} - {cliente.telefono}
            </option>
          ))}
        </select>
        {errors.clienteId && (
          <p className="mt-1 text-sm text-red-600">{errors.clienteId.message}</p>
        )}
      </div>

      {/* Servicio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Servicio *
        </label>
        <select
          {...register('servicioNombre', { required: 'El servicio es requerido' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar servicio</option>
          {servicios.map((servicio) => (
            <option key={servicio.id} value={servicio.nombre}>
              {servicio.nombre} - ${servicio.precio.toLocaleString()} ({servicio.duracionMinutos} min)
            </option>
          ))}
        </select>
        {errors.servicioNombre && (
          <p className="mt-1 text-sm text-red-600">{errors.servicioNombre.message}</p>
        )}
      </div>

      {/* Empleado (Barbero) */}
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
          <p className="mt-1 text-sm text-red-600">{errors.empleadoId.message}</p>
        )}
      </div>

      {/* Fecha y Hora: campos separados */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <Input
            type="date"
            {...register('fecha', { required: 'La fecha es requerida' })}
            min={minDateToday()}
          />
          {errors.fecha && (
            <p className="mt-1 text-sm text-red-600">{errors.fecha.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
          <Input
            type="time"
            {...register('hora', { required: 'La hora es requerida' })}
            placeholder="10:00"
          />
          {errors.hora && (
            <p className="mt-1 text-sm text-red-600">{errors.hora.message}</p>
          )}
        </div>
      </div>

      {/* Duración (readonly, se actualiza automáticamente) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
        <Input
          type="number"
          {...register('duracionMinutos', {
            required: 'La duración es requerida',
            valueAsNumber: true,
            min: { value: 5, message: 'Mínimo 5 minutos' },
          })}
          readOnly
        />
        {errors.duracionMinutos && (
          <p className="mt-1 text-sm text-red-600">{errors.duracionMinutos.message}</p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          {...register('notas')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Información adicional sobre la cita..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
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
          {isLoading ? 'Guardando...' : initialData?.id ? 'Actualizar' : 'Agendar'}
        </Button>
      </div>
    </form>
  );
};
