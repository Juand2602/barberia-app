import { create } from 'zustand';
import { CierreCaja, CierreCajaEstadisticas } from '../types/cierrecaja.types';
import { cierreCajaService } from '@services/cierrecaja.service';

interface CierreCajaState {
  cierres: CierreCaja[];
  estadisticas: CierreCajaEstadisticas | null;
  loading: boolean;
  error: string | null;

  // Acciones
  fetchCierres: (fechaInicio?: Date, fechaFin?: Date) => Promise<void>;
  fetchEstadisticas: (fechaInicio?: Date, fechaFin?: Date) => Promise<void>;
  clearError: () => void;
}

export const useCierreCajaStore = create<CierreCajaState>((set) => ({
  cierres: [],
  estadisticas: null,
  loading: false,
  error: null,

  fetchCierres: async (fechaInicio?: Date, fechaFin?: Date) => {
    set({ loading: true, error: null });
    try {
      const cierres = await cierreCajaService.getAll(fechaInicio, fechaFin);
      set({ cierres, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar cierres',
        loading: false,
      });
    }
  },

  fetchEstadisticas: async (fechaInicio?: Date, fechaFin?: Date) => {
    try {
      const estadisticas = await cierreCajaService.getEstadisticas(fechaInicio, fechaFin);
      set({ estadisticas });
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
    }
  },

  clearError: () => set({ error: null }),
}));