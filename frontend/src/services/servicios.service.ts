import { api } from './api';
import { 
  Servicio, 
  ServicioEstadisticas,
  ServicioMasVendido,
  CreateServicioDTO, 
  UpdateServicioDTO 
} from '../types/servicio.types';

export const serviciosService = {
  // Obtener todos los servicios
  async getAll(activo?: boolean): Promise<Servicio[]> {
    const params: any = {};
    if (activo !== undefined) params.activo = activo;

    const response = await api.get('/servicios', { params });
    return response.data.data;
  },

  // Obtener un servicio por ID
  async getById(id: string): Promise<Servicio> {
    const response = await api.get(`/servicios/${id}`);
    return response.data.data;
  },

  // Obtener estadísticas de un servicio
  async getEstadisticas(id: string): Promise<ServicioEstadisticas> {
    const response = await api.get(`/servicios/${id}/estadisticas`);
    return response.data.data;
  },

  // Obtener servicios más vendidos
  async getMasVendidos(limit: number = 5): Promise<ServicioMasVendido[]> {
    const response = await api.get('/servicios/mas-vendidos', { params: { limit } });
    return response.data.data;
  },

  // Crear un nuevo servicio
  async create(data: CreateServicioDTO): Promise<Servicio> {
    const response = await api.post('/servicios', data);
    return response.data.data;
  },

  // Actualizar un servicio
  async update(id: string, data: UpdateServicioDTO): Promise<Servicio> {
    const response = await api.put(`/servicios/${id}`, data);
    return response.data.data;
  },

  // Eliminar un servicio
  async delete(id: string): Promise<void> {
    await api.delete(`/servicios/${id}`);
  },
};