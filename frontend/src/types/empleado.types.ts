export interface Horario {
  inicio: string; // "09:00"
  fin: string;    // "18:00"
}

export interface Empleado {
  id: string;
  nombre: string;
  telefono: string;
  especialidades: string[];
  horarioLunes: Horario | null;
  horarioMartes: Horario | null;
  horarioMiercoles: Horario | null;
  horarioJueves: Horario | null;
  horarioViernes: Horario | null;
  horarioSabado: Horario | null;
  horarioDomingo: Horario | null;
  activo: boolean;
  fechaIngreso: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    citas: number;
    transacciones: number;
  };
}

export interface EmpleadoEstadisticas {
  totalCitas: number;
  totalIngresos: number;
}

export interface CreateEmpleadoDTO {
  nombre: string;
  telefono: string;
  especialidades: string[];
  horarioLunes?: Horario;
  horarioMartes?: Horario;
  horarioMiercoles?: Horario;
  horarioJueves?: Horario;
  horarioViernes?: Horario;
  horarioSabado?: Horario;
  horarioDomingo?: Horario;
}

export interface UpdateEmpleadoDTO {
  nombre?: string;
  telefono?: string;
  especialidades?: string[];
  horarioLunes?: Horario | null;
  horarioMartes?: Horario | null;
  horarioMiercoles?: Horario | null;
  horarioJueves?: Horario | null;
  horarioViernes?: Horario | null;
  horarioSabado?: Horario | null;
  horarioDomingo?: Horario | null;
  activo?: boolean;
}