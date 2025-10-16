import { create } from 'zustand';
import { Servicio } from '../types/servicio.types';
import { serviciosService } from '@services/servicios.service';

interface ServiciosState {
  servicios: Servicio[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  fetchServicios: (activo?: boolean) => Promise<void>;
  clearError: () => void;
}

export const useServiciosStore = create<ServiciosState>((set) => ({
  servicios: [],
  loading: false,
  error: null,

  fetchServicios: async (activo?: boolean) => {
    set({ loading: true, error: null });
    try {
      const servicios = await serviciosService.getAll(activo);
      set({ servicios, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar servicios',
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));