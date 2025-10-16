import { PrismaClient } from '@prisma/client';
import { CreateServicioInput, UpdateServicioInput } from '../utils/validators';

const prisma = new PrismaClient();

function normalizeName(s: string): string {
  return s.trim().toLowerCase();
}

export class ServiciosService {
  // Obtener todos los servicios
  async getAll(activo?: boolean) {
    const where: any = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    const servicios = await prisma.servicio.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    return servicios;
  }

  // Obtener un servicio por ID
  async getById(id: string) {
    const servicio = await prisma.servicio.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }

    return servicio;
  }

  // Crear un nuevo servicio
  async create(data: CreateServicioInput) {
    // Aseguramos que nombre existe (tipo runtime guard)
    if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
      throw new Error('El nombre del servicio es obligatorio');
    }

    const nombreNorm = normalizeName(data.nombre);

    // Verificar si ya existe un servicio con ese nombre (normalizado)
    const existente = await prisma.servicio.findFirst({
      where: { nombre: nombreNorm },
    });

    if (existente) {
      throw new Error('Ya existe un servicio con ese nombre');
    }

    const servicio = await prisma.servicio.create({
      data: {
        nombre: nombreNorm,
        descripcion: data.descripcion ?? null,
        precio: data.precio,
        duracionMinutos: data.duracionMinutos,
      },
    });

    return servicio;
  }

  // Actualizar un servicio
  async update(id: string, data: UpdateServicioInput) {
    // Si se actualiza el nombre, verificar y normalizar
    if (data.nombre !== undefined) {
      if (typeof data.nombre !== 'string' || data.nombre.trim() === '') {
        throw new Error('El nombre, si se proporciona, no puede estar vacío');
      }

      const nombreNorm = normalizeName(data.nombre);

      const existente = await prisma.servicio.findFirst({
        where: {
          nombre: nombreNorm,
          NOT: { id },
        },
      });

      if (existente) {
        throw new Error('Ya existe otro servicio con ese nombre');
      }
    }

    const updateData: any = {};

    if (data.nombre !== undefined) {
      updateData.nombre = normalizeName(data.nombre as string);
    }
    if (data.descripcion !== undefined) {
      updateData.descripcion = data.descripcion ?? null;
    }
    if (data.precio !== undefined) {
      updateData.precio = data.precio;
    }
    if (data.duracionMinutos !== undefined) {
      updateData.duracionMinutos = data.duracionMinutos;
    }
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }

    const servicio = await prisma.servicio.update({
      where: { id },
      data: updateData,
    });

    return servicio;
  }

  // Eliminar un servicio (soft delete)
  async delete(id: string) {
    // Verificar si el servicio tiene transacciones asociadas
    const transacciones = await prisma.transaccionItem.count({
      where: { servicioId: id },
    });

    if (transacciones > 0) {
      // Solo desactivar si tiene transacciones
      return await prisma.servicio.update({
        where: { id },
        data: { activo: false },
      });
    }

    // Si no tiene transacciones, se puede eliminar físicamente
    return await prisma.servicio.delete({
      where: { id },
    });
  }

  // Obtener estadísticas de un servicio
  async getEstadisticas(id: string) {
    const [totalVendidosAgg, ingresoTotalAgg] = await Promise.all([
      prisma.transaccionItem.aggregate({
        where: { servicioId: id },
        _sum: { cantidad: true },
      }),
      prisma.transaccionItem.aggregate({
        where: { servicioId: id },
        _sum: { subtotal: true },
      }),
    ]);

    const totalVendidos = totalVendidosAgg._sum?.cantidad ?? 0;
    const ingresoTotal = ingresoTotalAgg._sum?.subtotal ?? 0;

    return {
      totalVendidos,
      ingresoTotal,
    };
  }

  // Obtener los servicios más vendidos
  async getMasVendidos(limit: number = 5) {
    const servicios = await prisma.servicio.findMany({
      where: { activo: true },
      include: {
        items: {
          select: {
            cantidad: true,
            subtotal: true,
          },
        },
      },
    });

    // Calcular totales y ordenar
    const serviciosConTotales = servicios.map(servicio => {
      const totalVendidos = servicio.items?.reduce(
        (sum, item) => sum + (item.cantidad ?? 0),
        0
      ) ?? 0;

      const ingresoTotal = servicio.items?.reduce(
        (sum, item) => sum + (item.subtotal ?? 0),
        0
      ) ?? 0;

      return {
        id: servicio.id,
        nombre: servicio.nombre,
        precio: servicio.precio,
        totalVendidos,
        ingresoTotal,
      };
    });

    return serviciosConTotales
      .sort((a, b) => b.totalVendidos - a.totalVendidos)
      .slice(0, limit);
  }
}
