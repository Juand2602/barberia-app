// src/types/reporte.types.ts

export interface PeriodoReporte {
  inicio: Date;
  fin: Date;
}

export interface Dashboard {
  periodo: PeriodoReporte;
  ventas: {
    total: number;
    cantidad: number;
  };
  citas: {
    total: number;
    porEstado: Record<string, number>;
  };
  clientes: {
    cantidad: number;
  };
  serviciosMasVendidos: Array<{
    nombre: string;
    cantidad: number;
    total: number;
  }>;
  empleadoTop: {
    nombre: string;
    total: number;
  } | null;
  comparativa: {
    actual: number;
    anterior: number;
    diferencia: number;
    porcentaje: number;
  };
}

export interface ReporteVentas {
  periodo: PeriodoReporte;
  resumen: {
    totalIngresos: number;
    cantidadVentas: number;
    promedioVenta: number;
    porMetodoPago: Record<string, { cantidad: number; total: number }>;
  };
  ventasPorDia: Array<{
    fecha: string;
    cantidad: number;
    total: number;
  }>;
  transacciones: Array<{
    id: string;
    fecha: Date;
    cliente: string;
    empleado: string;
    servicios: string;
    metodoPago: string;
    total: number;
  }>;
}

export interface ReporteVentasPorEmpleado {
  periodo: PeriodoReporte;
  empleados: Array<{
    empleadoId: string;
    nombre: string;
    cantidadVentas: number;
    totalVentas: number;
    servicios: Record<string, number>;
  }>;
}

export interface ReporteVentasPorServicio {
  periodo: PeriodoReporte;
  servicios: Array<{
    servicioId: string;
    nombre: string;
    cantidadVendida: number;
    totalGenerado: number;
  }>;
}

export interface ReporteCitas {
  periodo: PeriodoReporte;
  resumen: {
    totalCitas: number;
    porEstado: Record<string, number>;
    tasaCancelacion: number;
    tasaCompletadas: number;
  };
  citasPorDia: Array<{
    fecha: string;
    total: number;
    completadas: number;
    canceladas: number;
    pendientes: number;
  }>;
  ocupacionPorEmpleado: Array<{
    empleadoId: string;
    nombre: string;
    totalCitas: number;
    completadas: number;
    canceladas: number;
  }>;
}

export interface ReporteFinanciero {
  periodo: PeriodoReporte;
  resumen: {
    totalIngresos: number;
    totalEgresos: number;
    utilidad: number;
    margenUtilidad: number;
  };
  ingresosPorMetodo: Record<string, number>;
  egresosPorCategoria: Record<string, number>;
  flujoDiario: Array<{
    fecha: string;
    ingresos: number;
    egresos: number;
    neto: number;
  }>;
}

export interface ReporteClientes {
  periodo: PeriodoReporte;
  resumen: {
    clientesNuevos: number;
    clientesActivos: number;
    ticketPromedio: number;
  };
  topClientes: Array<{
    clienteId: string;
    nombre: string;
    totalGastado: number;
    cantidadCompras: number;
  }>;
  clientesFrecuentes: Array<{
    clienteId: string;
    nombre: string;
    visitas: number;
  }>;
  nuevosClientes: Array<{
    id: string;
    nombre: string;
    telefono: string;
    fechaRegistro: Date;
  }>;
}