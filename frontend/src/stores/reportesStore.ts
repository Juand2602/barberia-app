// src/stores/reportesStore.ts

import { create } from 'zustand';
import { reportesService } from '../services/reportes.service';
import type {
  Dashboard,
  ReporteVentas,
  ReporteVentasPorEmpleado,
  ReporteVentasPorServicio,
  ReporteCitas,
  ReporteFinanciero,
  ReporteClientes
} from '../types/reporte.types';

interface ReportesState {
  // Data
  dashboard: Dashboard | null;
  reporteVentas: ReporteVentas | null;
  reporteVentasPorEmpleado: ReporteVentasPorEmpleado | null;
  reporteVentasPorServicio: ReporteVentasPorServicio | null;
  reporteCitas: ReporteCitas | null;
  reporteFinanciero: ReporteFinanciero | null;
  reporteClientes: ReporteClientes | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  fetchDashboard: (fechaInicio?: Date, fechaFin?: Date) => Promise<void>;
  fetchReporteVentas: (fechaInicio: Date, fechaFin: Date) => Promise<void>;
  fetchReporteVentasPorEmpleado: (fechaInicio: Date, fechaFin: Date) => Promise<void>;
  fetchReporteVentasPorServicio: (fechaInicio: Date, fechaFin: Date) => Promise<void>;
  fetchReporteCitas: (fechaInicio: Date, fechaFin: Date) => Promise<void>;
  fetchReporteFinanciero: (fechaInicio: Date, fechaFin: Date) => Promise<void>;
  fetchReporteClientes: (fechaInicio: Date, fechaFin: Date) => Promise<void>;
  clearError: () => void;
}

export const useReportesStore = create<ReportesState>((set) => ({
  // Initial state
  dashboard: null,
  reporteVentas: null,
  reporteVentasPorEmpleado: null,
  reporteVentasPorServicio: null,
  reporteCitas: null,
  reporteFinanciero: null,
  reporteClientes: null,
  loading: false,
  error: null,

  // Actions
  fetchDashboard: async (fechaInicio?: Date, fechaFin?: Date) => {
    set({ loading: true, error: null });
    try {
      const dashboard = await reportesService.getDashboard(fechaInicio, fechaFin);
      set({ dashboard, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar dashboard',
        loading: false 
      });
    }
  },

  fetchReporteVentas: async (fechaInicio: Date, fechaFin: Date) => {
    set({ loading: true, error: null });
    try {
      const reporteVentas = await reportesService.getReporteVentas(fechaInicio, fechaFin);
      set({ reporteVentas, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar reporte de ventas',
        loading: false 
      });
    }
  },

  fetchReporteVentasPorEmpleado: async (fechaInicio: Date, fechaFin: Date) => {
    set({ loading: true, error: null });
    try {
      const reporteVentasPorEmpleado = await reportesService.getReporteVentasPorEmpleado(fechaInicio, fechaFin);
      set({ reporteVentasPorEmpleado, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar reporte de ventas por empleado',
        loading: false 
      });
    }
  },

  fetchReporteVentasPorServicio: async (fechaInicio: Date, fechaFin: Date) => {
    set({ loading: true, error: null });
    try {
      const reporteVentasPorServicio = await reportesService.getReporteVentasPorServicio(fechaInicio, fechaFin);
      set({ reporteVentasPorServicio, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar reporte de ventas por servicio',
        loading: false 
      });
    }
  },

  fetchReporteCitas: async (fechaInicio: Date, fechaFin: Date) => {
    set({ loading: true, error: null });
    try {
      const reporteCitas = await reportesService.getReporteCitas(fechaInicio, fechaFin);
      set({ reporteCitas, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar reporte de citas',
        loading: false 
      });
    }
  },

  fetchReporteFinanciero: async (fechaInicio: Date, fechaFin: Date) => {
    set({ loading: true, error: null });
    try {
      const reporteFinanciero = await reportesService.getReporteFinanciero(fechaInicio, fechaFin);
      set({ reporteFinanciero, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar reporte financiero',
        loading: false 
      });
    }
  },

  fetchReporteClientes: async (fechaInicio: Date, fechaFin: Date) => {
    set({ loading: true, error: null });
    try {
      const reporteClientes = await reportesService.getReporteClientes(fechaInicio, fechaFin);
      set({ reporteClientes, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar reporte de clientes',
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null })
}));