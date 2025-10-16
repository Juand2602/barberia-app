// src/services/reportes.service.ts

import {api} from './api';
import type {
  Dashboard,
  ReporteVentas,
  ReporteVentasPorEmpleado,
  ReporteVentasPorServicio,
  ReporteCitas,
  ReporteFinanciero,
  ReporteClientes
} from '../types/reporte.types';

export const reportesService = {
  // Dashboard
  getDashboard: async (fechaInicio?: Date, fechaFin?: Date): Promise<Dashboard> => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio.toISOString());
    if (fechaFin) params.append('fechaFin', fechaFin.toISOString());
    
    const response = await api.get(`/reportes/dashboard?${params.toString()}`);
    return response.data;
  },

  // Reportes de ventas
  getReporteVentas: async (fechaInicio: Date, fechaFin: Date): Promise<ReporteVentas> => {
    const params = new URLSearchParams({
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    });
    
    const response = await api.get(`/reportes/ventas?${params.toString()}`);
    return response.data;
  },

  getReporteVentasPorEmpleado: async (fechaInicio: Date, fechaFin: Date): Promise<ReporteVentasPorEmpleado> => {
    const params = new URLSearchParams({
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    });
    
    const response = await api.get(`/reportes/ventas/por-empleado?${params.toString()}`);
    return response.data;
  },

  getReporteVentasPorServicio: async (fechaInicio: Date, fechaFin: Date): Promise<ReporteVentasPorServicio> => {
    const params = new URLSearchParams({
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    });
    
    const response = await api.get(`/reportes/ventas/por-servicio?${params.toString()}`);
    return response.data;
  },

  // Reporte de citas
  getReporteCitas: async (fechaInicio: Date, fechaFin: Date): Promise<ReporteCitas> => {
    const params = new URLSearchParams({
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    });
    
    const response = await api.get(`/reportes/citas?${params.toString()}`);
    return response.data;
  },

  // Reporte financiero
  getReporteFinanciero: async (fechaInicio: Date, fechaFin: Date): Promise<ReporteFinanciero> => {
    const params = new URLSearchParams({
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    });
    
    const response = await api.get(`/reportes/financiero?${params.toString()}`);
    return response.data;
  },

  // Reporte de clientes
  getReporteClientes: async (fechaInicio: Date, fechaFin: Date): Promise<ReporteClientes> => {
    const params = new URLSearchParams({
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    });
    
    const response = await api.get(`/reportes/clientes?${params.toString()}`);
    return response.data;
  }
};