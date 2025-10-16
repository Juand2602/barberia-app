import { api } from './api';
import { 
  Cita, 
  CreateCitaDTO, 
  UpdateCitaDTO, 
  CambiarEstadoCitaDTO,
  CitasEstadisticas,
  CitasFiltros
} from '../types/cita.types';

export const citasService = {
  // Obtener todas las citas con filtros
  async getAll(filtros?: CitasFiltros): Promise<Cita[]> {
    const params: any = {};
    
    if (filtros) {
      if (filtros.fechaInicio) {
        params.fechaInicio = filtros.fechaInicio.toISOString();
      }
      if (filtros.fechaFin) {
        params.fechaFin = filtros.fechaFin.toISOString();
      }
      if (filtros.empleadoId) {
        params.empleadoId = filtros.empleadoId;
      }
      if (filtros.clienteId) {
        params.clienteId = filtros.clienteId;
      }
      if (filtros.estado) {
        params.estado = filtros.estado;
      }
    }

    const response = await api.get('/citas', { params });
    return response.data.data;
  },

  // Obtener citas por fecha
  async getByFecha(fecha: Date, empleadoId?: string): Promise<Cita[]> {
    const params: any = {};
    if (empleadoId) params.empleadoId = empleadoId;

    const response = await api.get(`/citas/fecha/${fecha.toISOString().split('T')[0]}`, { params });
    return response.data.data;
  },

  // Obtener citas de una semana
  async getBySemana(fechaInicio: Date, empleadoId?: string): Promise<Cita[]> {
    const params: any = {};
    if (empleadoId) params.empleadoId = empleadoId;

    const response = await api.get(`/citas/semana/${fechaInicio.toISOString()}`, { params });
    return response.data.data;
  },

  // Obtener citas de un mes
  async getByMes(year: number, month: number, empleadoId?: string): Promise<Cita[]> {
    const params: any = {};
    if (empleadoId) params.empleadoId = empleadoId;

    const response = await api.get(`/citas/mes/${year}/${month}`, { params });
    return response.data.data;
  },

  // Obtener próximas citas
  async getProximas(limite: number = 10, empleadoId?: string): Promise<Cita[]> {
    const params: any = { limite };
    if (empleadoId) params.empleadoId = empleadoId;

    const response = await api.get('/citas/proximas', { params });
    return response.data.data;
  },

  // Obtener estadísticas
  async getEstadisticas(fechaInicio?: Date, fechaFin?: Date): Promise<CitasEstadisticas> {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio.toISOString();
    if (fechaFin) params.fechaFin = fechaFin.toISOString();

    const response = await api.get('/citas/estadisticas', { params });
    return response.data.data;
  },

  // Obtener una cita por ID
  async getById(id: string): Promise<Cita> {
    const response = await api.get(`/citas/${id}`);
    return response.data.data;
  },

  // Crear una nueva cita
  async create(data: CreateCitaDTO): Promise<Cita> {
    const response = await api.post('/citas', data);
    return response.data.data;
  },

  // Actualizar una cita
  async update(id: string, data: UpdateCitaDTO): Promise<Cita> {
    const response = await api.put(`/citas/${id}`, data);
    return response.data.data;
  },

  // Cambiar estado de una cita
  async cambiarEstado(id: string, data: CambiarEstadoCitaDTO): Promise<Cita> {
    const response = await api.patch(`/citas/${id}/estado`, data);
    return response.data.data;
  },

  // Eliminar una cita
  async delete(id: string): Promise<void> {
    await api.delete(`/citas/${id}`);
  },
};