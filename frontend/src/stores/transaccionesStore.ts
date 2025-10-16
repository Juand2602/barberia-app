import { create } from 'zustand';
import {
  Transaccion,
  TransaccionesFiltros,
  TransaccionesEstadisticas,
} from '../types/transaccion.types';
import { transaccionesService } from '@services/transacciones.service';

interface TransaccionesState {
  transacciones: Transaccion[];
  estadisticas: TransaccionesEstadisticas | null;
  loading: boolean;
  error: string | null;
  filtros: TransaccionesFiltros;

  // Acciones
  fetchTransacciones: (filtros?: TransaccionesFiltros) => Promise<void>;
  fetchEstadisticas: (fechaInicio?: Date, fechaFin?: Date) => Promise<void>;
  setFiltros: (filtros: TransaccionesFiltros) => void;
  clearError: () => void;
}

export const useTransaccionesStore = create<TransaccionesState>((set, get) => ({
  transacciones: [],
  estadisticas: null,
  loading: false,
  error: null,
  filtros: {},

  fetchTransacciones: async (filtros?: TransaccionesFiltros) => {
    set({ loading: true, error: null });
    try {
      const transacciones = await transaccionesService.getAll(filtros || get().filtros);
      set({ transacciones, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar transacciones',
        loading: false,
      });
    }
  },

  fetchEstadisticas: async (fechaInicio?: Date, fechaFin?: Date) => {
    try {
      const estadisticas = await transaccionesService.getEstadisticas(fechaInicio, fechaFin);
      set({ estadisticas });
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
    }
  },

  setFiltros: (filtros: TransaccionesFiltros) => {
    set({ filtros });
    get().fetchTransacciones(filtros);
  },

  clearError: () => set({ error: null }),
}));