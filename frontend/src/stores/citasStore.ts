import { create } from 'zustand';
import { Cita, CitasFiltros, CitasEstadisticas } from '../types/cita.types';
import { citasService } from '@services/citas.service';

interface CitasState {
  citas: Cita[];
  estadisticas: CitasEstadisticas | null;
  loading: boolean;
  error: string | null;
  filtros: CitasFiltros;
  
  // Acciones
  fetchCitas: (filtros?: CitasFiltros) => Promise<void>;
  fetchEstadisticas: (fechaInicio?: Date, fechaFin?: Date) => Promise<void>;
  setFiltros: (filtros: CitasFiltros) => void;
  clearError: () => void;
}

export const useCitasStore = create<CitasState>((set, get) => ({
  citas: [],
  estadisticas: null,
  loading: false,
  error: null,
  filtros: {},

  fetchCitas: async (filtros?: CitasFiltros) => {
    set({ loading: true, error: null });
    try {
      const citas = await citasService.getAll(filtros || get().filtros);
      set({ citas, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar citas',
        loading: false 
      });
    }
  },

  fetchEstadisticas: async (fechaInicio?: Date, fechaFin?: Date) => {
    try {
      const estadisticas = await citasService.getEstadisticas(fechaInicio, fechaFin);
      set({ estadisticas });
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
    }
  },

  setFiltros: (filtros: CitasFiltros) => {
    set({ filtros });
    get().fetchCitas(filtros);
  },

  clearError: () => set({ error: null }),
}));