export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracionMinutos: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

export interface ServicioEstadisticas {
  totalVendidos: number;
  ingresoTotal: number;
}

export interface ServicioMasVendido {
  id: string;
  nombre: string;
  precio: number;
  totalVendidos: number;
  ingresoTotal: number;
}

export interface CreateServicioDTO {
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMinutos: number;
}

export interface UpdateServicioDTO {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracionMinutos?: number;
  activo?: boolean;
}