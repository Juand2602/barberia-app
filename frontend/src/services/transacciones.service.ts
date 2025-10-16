import { api } from './api';
import {
  Transaccion,
  CreateTransaccionDTO,
  UpdateTransaccionDTO,
  TransaccionesEstadisticas,
  TransaccionesFiltros,
  ServicioMasVendido,
  IngresosPorEmpleado,
} from '../types/transaccion.types';

export const transaccionesService = {
  // Obtener todas las transacciones con filtros
  async getAll(filtros?: TransaccionesFiltros): Promise<Transaccion[]> {
    const params: any = {};

    if (filtros) {
      if (filtros.fechaInicio) {
        params.fechaInicio = filtros.fechaInicio.toISOString();
      }
      if (filtros.fechaFin) {
        params.fechaFin = filtros.fechaFin.toISOString();
      }
      if (filtros.tipo) {
        params.tipo = filtros.tipo;
      }
      if (filtros.metodoPago) {
        params.metodoPago = filtros.metodoPago;
      }
      if (filtros.empleadoId) {
        params.empleadoId = filtros.empleadoId;
      }
      if (filtros.clienteId) {
        params.clienteId = filtros.clienteId;
      }
    }

    const response = await api.get('/transacciones', { params });
    return response.data.data;
  },

  // Obtener transacciones por fecha
  async getByFecha(fecha: Date): Promise<Transaccion[]> {
    const response = await api.get(`/transacciones/fecha/${fecha.toISOString().split('T')[0]}`);
    return response.data.data;
  },

  // Obtener estadísticas
  async getEstadisticas(
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<TransaccionesEstadisticas> {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio.toISOString();
    if (fechaFin) params.fechaFin = fechaFin.toISOString();

    const response = await api.get('/transacciones/estadisticas', { params });
    return response.data.data;
  },

  // Obtener servicios más vendidos
  async getServiciosMasVendidos(
    limite: number = 10,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<ServicioMasVendido[]> {
    const params: any = { limite };
    if (fechaInicio) params.fechaInicio = fechaInicio.toISOString();
    if (fechaFin) params.fechaFin = fechaFin.toISOString();

    const response = await api.get('/transacciones/servicios-mas-vendidos', { params });
    return response.data.data;
  },

  // Obtener ingresos por empleado
  async getIngresosPorEmpleado(
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<IngresosPorEmpleado[]> {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio.toISOString();
    if (fechaFin) params.fechaFin = fechaFin.toISOString();

    const response = await api.get('/transacciones/ingresos-por-empleado', { params });
    return response.data.data;
  },

  // Obtener una transacción por ID
  async getById(id: string): Promise<Transaccion> {
    const response = await api.get(`/transacciones/${id}`);
    return response.data.data;
  },

  // Crear una nueva transacción
  async create(data: CreateTransaccionDTO): Promise<Transaccion> {
    const response = await api.post('/transacciones', data);
    return response.data.data;
  },

  // Registrar venta desde cita
  async registrarDesdeCita(citaId: string): Promise<Transaccion> {
    const response = await api.post(`/transacciones/desde-cita/${citaId}`);
    return response.data.data;
  },

  // Actualizar una transacción
  async update(id: string, data: UpdateTransaccionDTO): Promise<Transaccion> {
    const response = await api.put(`/transacciones/${id}`, data);
    return response.data.data;
  },

  // Eliminar una transacción
  async delete(id: string): Promise<void> {
    await api.delete(`/transacciones/${id}`);
  },
};