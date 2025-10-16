import { api } from './api';
import { 
  Cliente, 
  ClienteDetalle, 
  ClienteEstadisticas, 
  CreateClienteDTO, 
  UpdateClienteDTO 
} from '../types/cliente.types';

export const clientesService = {
  // Obtener todos los clientes
  async getAll(search?: string, activo?: boolean): Promise<Cliente[]> {
    const params: any = {};
    if (search) params.search = search;
    if (activo !== undefined) params.activo = activo;

    const response = await api.get('/clientes', { params });
    return response.data.data;
  },

  // Obtener un cliente por ID
  async getById(id: string): Promise<ClienteDetalle> {
    const response = await api.get(`/clientes/${id}`);
    return response.data.data;
  },

  // Obtener estadísticas de un cliente
  async getEstadisticas(id: string): Promise<ClienteEstadisticas> {
    const response = await api.get(`/clientes/${id}/estadisticas`);
    return response.data.data;
  },

  // Crear un nuevo cliente
  async create(data: CreateClienteDTO): Promise<Cliente> {
    const response = await api.post('/clientes', data);
    return response.data.data;
  },

  // Actualizar un cliente
  async update(id: string, data: UpdateClienteDTO): Promise<Cliente> {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data.data;
  },

  // Desactivar un cliente
  async delete(id: string): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },
};