import { api } from './api';
import { 
  Empleado, 
  EmpleadoEstadisticas,
  CreateEmpleadoDTO, 
  UpdateEmpleadoDTO 
} from '../types/empleado.types';

export const empleadosService = {
  // Obtener todos los empleados
  async getAll(activo?: boolean): Promise<Empleado[]> {
    const params: any = {};
    if (activo !== undefined) params.activo = activo;

    const response = await api.get('/empleados', { params });
    return response.data.data;
  },

  // Obtener un empleado por ID
  async getById(id: string): Promise<Empleado> {
    const response = await api.get(`/empleados/${id}`);
    return response.data.data;
  },

  // Obtener estadísticas de un empleado
  async getEstadisticas(id: string): Promise<EmpleadoEstadisticas> {
    const response = await api.get(`/empleados/${id}/estadisticas`);
    return response.data.data;
  },

  // Verificar disponibilidad
  async verificarDisponibilidad(
    id: string, 
    fecha: Date, 
    duracionMinutos: number
  ): Promise<{ disponible: boolean; motivo?: string }> {
    const response = await api.post(`/empleados/${id}/verificar-disponibilidad`, {
      fecha: fecha.toISOString(),
      duracionMinutos,
    });
    return response.data.data;
  },

  // Crear un nuevo empleado
  async create(data: CreateEmpleadoDTO): Promise<Empleado> {
    const response = await api.post('/empleados', data);
    return response.data.data;
  },

  // Actualizar un empleado
  async update(id: string, data: UpdateEmpleadoDTO): Promise<Empleado> {
    const response = await api.put(`/empleados/${id}`, data);
    return response.data.data;
  },

  // Desactivar un empleado
  async delete(id: string): Promise<void> {
    await api.delete(`/empleados/${id}`);
  },
};