import { api } from './api';
import {
  CierreCaja,
  CreateCierreCajaDTO,
  UpdateCierreCajaDTO,
  DatosCierre,
  PuedeCerrarResponse,
  CierreCajaEstadisticas,
} from '../types/cierrecaja.types';

export const cierreCajaService = {
  // Obtener todos los cierres
  async getAll(fechaInicio?: Date, fechaFin?: Date): Promise<CierreCaja[]> {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio.toISOString();
    if (fechaFin) params.fechaFin = fechaFin.toISOString();

    const response = await api.get('/cierre-caja', { params });
    return response.data.data;
  },

  // Obtener último cierre
  async getUltimo(): Promise<CierreCaja | null> {
    const response = await api.get('/cierre-caja/ultimo');
    return response.data.data;
  },

  // Verificar si se puede cerrar hoy
  async puedeCerrar(): Promise<PuedeCerrarResponse> {
    const response = await api.get('/cierre-caja/puede-cerrar');
    return response.data.data;
  },

  // Calcular datos del cierre
  async calcularDatos(fecha?: Date): Promise<DatosCierre> {
    const params: any = {};
    if (fecha) params.fecha = fecha.toISOString();

    const response = await api.get('/cierre-caja/calcular', { params });
    return response.data.data;
  },

  // Obtener estadísticas
  async getEstadisticas(
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<CierreCajaEstadisticas> {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio.toISOString();
    if (fechaFin) params.fechaFin = fechaFin.toISOString();

    const response = await api.get('/cierre-caja/estadisticas', { params });
    return response.data.data;
  },

  // Obtener cierre por fecha
  async getByFecha(fecha: Date): Promise<CierreCaja | null> {
    try {
      const response = await api.get(
        `/cierre-caja/fecha/${fecha.toISOString().split('T')[0]}`
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Obtener por ID
  async getById(id: string): Promise<CierreCaja> {
    const response = await api.get(`/cierre-caja/${id}`);
    return response.data.data;
  },

  // Crear cierre
  async create(data: CreateCierreCajaDTO): Promise<CierreCaja> {
    const response = await api.post('/cierre-caja', data);
    return response.data.data;
  },

  // Actualizar cierre
  async update(id: string, data: UpdateCierreCajaDTO): Promise<CierreCaja> {
    const response = await api.put(`/cierre-caja/${id}`, data);
    return response.data.data;
  },

  // Eliminar cierre
  async delete(id: string): Promise<void> {
    await api.delete(`/cierre-caja/${id}`);
  },
};