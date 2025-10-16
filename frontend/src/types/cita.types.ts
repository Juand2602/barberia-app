import { Cliente } from './cliente.types';
import { Empleado } from './empleado.types';

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
export type OrigenCita = 'WHATSAPP' | 'MANUAL' | 'TELEFONO';

export interface Cita {
  id: string;
  clienteId: string;
  empleadoId: string;
  servicioNombre: string;
  fechaHora: string;
  duracionMinutos: number;
  estado: EstadoCita;
  origen: OrigenCita;
  notas: string | null;
  motivoCancelacion: string | null;
  cliente: Cliente;
  empleado: Empleado;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCitaDTO {
  clienteId: string;
  empleadoId: string;
  servicioNombre: string;
  fechaHora: string;
  duracionMinutos: number;
  origen?: OrigenCita;
  notas?: string;
}

export interface UpdateCitaDTO {
  clienteId?: string;
  empleadoId?: string;
  servicioNombre?: string;
  fechaHora?: string;
  duracionMinutos?: number;
  estado?: EstadoCita;
  notas?: string;
  motivoCancelacion?: string;
}

export interface CambiarEstadoCitaDTO {
  estado: EstadoCita;
  motivoCancelacion?: string;
}

export interface CitasEstadisticas {
  total: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
}

export interface CitasFiltros {
  fechaInicio?: Date;
  fechaFin?: Date;
  empleadoId?: string;
  clienteId?: string;
  estado?: EstadoCita;
}

// Para el calendario
export interface EventoCita {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Cita;
}