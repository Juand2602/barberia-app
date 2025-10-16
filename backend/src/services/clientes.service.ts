import { PrismaClient } from '@prisma/client';
import { CreateClienteInput, UpdateClienteInput } from '../utils/validators';

const prisma = new PrismaClient();

export class ClientesService {
  // Obtener todos los clientes
  async getAll(search?: string, activo?: boolean) {
    const where: any = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { telefono: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            citas: true,
            transacciones: true,
          },
        },
      },
    });

    return clientes;
  }

  // Obtener un cliente por ID
  async getById(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        citas: {
          orderBy: { fechaHora: 'desc' },
          take: 10,
          include: {
            empleado: true,
          },
        },
        transacciones: {
          orderBy: { fecha: 'desc' },
          take: 10,
          include: {
            items: {
              include: {
                servicio: true,
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    return cliente;
  }

  // Crear un nuevo cliente
  async create(data: CreateClienteInput) {
    // Verificar si el teléfono ya existe
    const existente = await prisma.cliente.findUnique({
      where: { telefono: data.telefono },
    });

    if (existente) {
      throw new Error('Ya existe un cliente con ese número de teléfono');
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email || null,
        notas: data.notas || null,
      },
    });

    return cliente;
  }

  // Actualizar un cliente
  async update(id: string, data: UpdateClienteInput) {
    // Si se está actualizando el teléfono, verificar que no exista
    if (data.telefono) {
      const existente = await prisma.cliente.findFirst({
        where: {
          telefono: data.telefono,
          NOT: { id },
        },
      });

      if (existente) {
        throw new Error('Ya existe otro cliente con ese número de teléfono');
      }
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.telefono && { telefono: data.telefono }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.notas !== undefined && { notas: data.notas || null }),
        ...(data.activo !== undefined && { activo: data.activo }),
      },
    });

    return cliente;
  }

  // Eliminar un cliente (soft delete)
  async delete(id: string) {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: { activo: false },
    });

    return cliente;
  }

  // Obtener estadísticas de un cliente
  async getEstadisticas(id: string) {
    const [totalCitas, totalGastado, ultimaVisita] = await Promise.all([
      prisma.cita.count({
        where: { clienteId: id, estado: 'COMPLETADA' },
      }),
      prisma.transaccion.aggregate({
        where: { clienteId: id, tipo: 'INGRESO' },
        _sum: { total: true },
      }),
      prisma.cita.findFirst({
        where: { clienteId: id, estado: 'COMPLETADA' },
        orderBy: { fechaHora: 'desc' },
      }),
    ]);

    return {
      totalCitas,
      totalGastado: totalGastado._sum.total || 0,
      ultimaVisita: ultimaVisita?.fechaHora || null,
    };
  }
}