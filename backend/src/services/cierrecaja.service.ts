import { PrismaClient } from '@prisma/client';
import { CreateCierreCajaInput, UpdateCierreCajaInput } from '../utils/validators';

const prisma = new PrismaClient();

interface DatosCierre {
  fecha: Date;
  efectivoInicial: number;
  ingresosEfectivo: number;
  egresosEfectivo: number;
  totalTransferencias: number;
  efectivoEsperado: number;
}

export class CierreCajaService {
  // Obtener todos los cierres
  async getAll(fechaInicio?: Date, fechaFin?: Date) {
    const where: any = {};

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = fechaInicio;
      if (fechaFin) where.fecha.lte = fechaFin;
    }

    const cierres = await prisma.cierreCaja.findMany({
      where,
      orderBy: { fecha: 'desc' },
    });

    return cierres;
  }

  // Obtener un cierre por ID
  async getById(id: string) {
    const cierre = await prisma.cierreCaja.findUnique({
      where: { id },
    });

    if (!cierre) {
      throw new Error('Cierre de caja no encontrado');
    }

    return cierre;
  }

  // Obtener cierre por fecha específica
  async getByFecha(fecha: Date) {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const cierre = await prisma.cierreCaja.findFirst({
      where: {
        fecha: {
          gte: inicioDia,
          lte: finDia,
        },
      },
    });

    return cierre;
  }

  // Obtener el último cierre
  async getUltimoCierre() {
    const cierre = await prisma.cierreCaja.findFirst({
      orderBy: { fecha: 'desc' },
    });

    return cierre;
  }

  // Calcular datos para el cierre del día
  async calcularDatosCierre(fecha: Date): Promise<DatosCierre> {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    // Obtener efectivo inicial (del último cierre)
    const ultimoCierre = await this.getUltimoCierre();
    const efectivoInicial = ultimoCierre ? ultimoCierre.efectivoFinal : 0;

    // Obtener transacciones del día
    const transacciones = await prisma.transaccion.findMany({
      where: {
        fecha: {
          gte: inicioDia,
          lte: finDia,
        },
      },
    });

    // Calcular totales
    let ingresosEfectivo = 0;
    let egresosEfectivo = 0;
    let totalTransferencias = 0;

    transacciones.forEach((trans) => {
      if (trans.metodoPago === 'EFECTIVO') {
        if (trans.tipo === 'INGRESO') {
          ingresosEfectivo += trans.total;
        } else {
          egresosEfectivo += trans.total;
        }
      } else if (trans.metodoPago === 'TRANSFERENCIA') {
        if (trans.tipo === 'INGRESO') {
          totalTransferencias += trans.total;
        }
        // Las transferencias de egreso no afectan el efectivo
      }
    });

    const efectivoEsperado = efectivoInicial + ingresosEfectivo - egresosEfectivo;

    return {
      fecha,
      efectivoInicial,
      ingresosEfectivo,
      egresosEfectivo,
      totalTransferencias,
      efectivoEsperado,
    };
  }

  // Crear un nuevo cierre de caja
  async create(data: CreateCierreCajaInput) {
    const fecha = data.fecha ? new Date(data.fecha) : new Date();

    // Verificar que no exista ya un cierre para esta fecha
    const cierreExistente = await this.getByFecha(fecha);
    if (cierreExistente) {
      throw new Error('Ya existe un cierre de caja para esta fecha');
    }

    // Calcular datos del cierre
    const datosCierre = await this.calcularDatosCierre(fecha);

    // Calcular diferencia
    const diferencia = data.efectivoFinal - datosCierre.efectivoEsperado;

    // Validar diferencia significativa (más de $20,000)
    if (Math.abs(diferencia) > 20000 && !data.notas) {
      throw new Error(
        'Se requiere una justificación para diferencias mayores a $20,000'
      );
    }

    // Crear el cierre
    const cierre = await prisma.cierreCaja.create({
      data: {
        fecha,
        efectivoInicial: datosCierre.efectivoInicial,
        efectivoFinal: data.efectivoFinal,
        efectivoEsperado: datosCierre.efectivoEsperado,
        ingresos: datosCierre.ingresosEfectivo,
        egresos: datosCierre.egresosEfectivo,
        diferencia,
        totalTransferencias: datosCierre.totalTransferencias,
        notas: data.notas || null,
      },
    });

    return cierre;
  }

  // Actualizar un cierre de caja
  async update(id: string, data: UpdateCierreCajaInput) {
    const cierreExistente = await this.getById(id);

    // Recalcular diferencia si se cambia el efectivo final
    let diferencia = cierreExistente.diferencia;
    if (data.efectivoFinal !== undefined) {
      diferencia = data.efectivoFinal - cierreExistente.efectivoEsperado;

      // Validar diferencia significativa
      if (Math.abs(diferencia) > 20000 && !data.notas && !cierreExistente.notas) {
        throw new Error(
          'Se requiere una justificación para diferencias mayores a $20,000'
        );
      }
    }

    const cierre = await prisma.cierreCaja.update({
      where: { id },
      data: {
        ...(data.efectivoInicial !== undefined && { efectivoInicial: data.efectivoInicial }),
        ...(data.efectivoFinal !== undefined && { 
          efectivoFinal: data.efectivoFinal,
          diferencia,
        }),
        ...(data.notas !== undefined && { notas: data.notas || null }),
      },
    });

    return cierre;
  }

  // Eliminar un cierre de caja
  async delete(id: string) {
    await this.getById(id); // Verificar que existe
    await prisma.cierreCaja.delete({
      where: { id },
    });
  }

  // Obtener estadísticas de cierres
  async getEstadisticas(fechaInicio?: Date, fechaFin?: Date) {
    const where: any = {};

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = fechaInicio;
      if (fechaFin) where.fecha.lte = fechaFin;
    }

    const [totalCierres, estadisticas] = await Promise.all([
      prisma.cierreCaja.count({ where }),
      prisma.cierreCaja.aggregate({
        where,
        _sum: {
          ingresos: true,
          egresos: true,
          diferencia: true,
          totalTransferencias: true,
        },
        _avg: {
          diferencia: true,
        },
      }),
    ]);

    // Obtener cierres con diferencias significativas
    const cierresConDiferencias = await prisma.cierreCaja.count({
      where: {
        ...where,
        OR: [
          { diferencia: { gt: 20000 } },
          { diferencia: { lt: -20000 } },
        ],
      },
    });

    return {
      totalCierres,
      totalIngresos: estadisticas._sum.ingresos || 0,
      totalEgresos: estadisticas._sum.egresos || 0,
      totalTransferencias: estadisticas._sum.totalTransferencias || 0,
      diferenciaTotal: estadisticas._sum.diferencia || 0,
      diferenciaPromedio: estadisticas._avg.diferencia || 0,
      cierresConDiferenciasSignificativas: cierresConDiferencias,
    };
  }

  // Verificar si se puede hacer cierre hoy
  async puedeCerrarHoy(): Promise<{
    puede: boolean;
    motivo?: string;
    datos?: DatosCierre;
  }> {
    const hoy = new Date();

    // Verificar si ya existe un cierre para hoy
    const cierreHoy = await this.getByFecha(hoy);
    if (cierreHoy) {
      return {
        puede: false,
        motivo: 'Ya existe un cierre de caja para el día de hoy',
      };
    }

    // Calcular datos del cierre
    const datos = await this.calcularDatosCierre(hoy);

    return {
      puede: true,
      datos,
    };
  }
}