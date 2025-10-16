import { create } from 'zustand';
import { Cliente } from '../types/cliente.types';
import { clientesService } from '@services/clientes.service';

interface ClientesState {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  
  // Acciones
  fetchClientes: (search?: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  clearError: () => void;
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],
  loading: false,
  error: null,
  searchTerm: '',

  fetchClientes: async (search?: string) => {
    set({ loading: true, error: null });
    try {
      const clientes = await clientesService.getAll(search);
      set({ clientes, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar clientes',
        loading: false 
      });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    get().fetchClientes(term);
  },

  clearError: () => set({ error: null }),
}));