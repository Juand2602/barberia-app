import { create } from 'zustand';
import { Empleado } from '../types/empleado.types';
import { empleadosService } from '@services/empleados.service';

interface EmpleadosState {
  empleados: Empleado[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  fetchEmpleados: (activo?: boolean) => Promise<void>;
  clearError: () => void;
}

export const useEmpleadosStore = create<EmpleadosState>((set) => ({
  empleados: [],
  loading: false,
  error: null,

  fetchEmpleados: async (activo?: boolean) => {
    set({ loading: true, error: null });
    try {
      const empleados = await empleadosService.getAll(activo);
      set({ empleados, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar empleados',
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));