import { PrismaClient } from '@prisma/client';
import { CreateEmpleadoInput, UpdateEmpleadoInput } from '../utils/validators';

const prisma = new PrismaClient();

export class EmpleadosService {
  // Obtener todos los empleados
  async getAll(activo?: boolean) {
    const where: any = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    const empleados = await prisma.empleado.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: {
            citas: true,
            transacciones: true,
          },
        },
      },
    });

    // Parsear especialidades y horarios (almacenados como JSON string)
    return empleados.map(emp => ({
      ...emp,
      especialidades: JSON.parse(emp.especialidades),
      horarioLunes: emp.horarioLunes ? JSON.parse(emp.horarioLunes) : null,
      horarioMartes: emp.horarioMartes ? JSON.parse(emp.horarioMartes) : null,
      horarioMiercoles: emp.horarioMiercoles ? JSON.parse(emp.horarioMiercoles) : null,
      horarioJueves: emp.horarioJueves ? JSON.parse(emp.horarioJueves) : null,
      horarioViernes: emp.horarioViernes ? JSON.parse(emp.horarioViernes) : null,
      horarioSabado: emp.horarioSabado ? JSON.parse(emp.horarioSabado) : null,
      horarioDomingo: emp.horarioDomingo ? JSON.parse(emp.horarioDomingo) : null,
    }));
  }

  // Obtener un empleado por ID
  async getById(id: string) {
    const empleado = await prisma.empleado.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            citas: true,
            transacciones: true,
          },
        },
        citas: {
          take: 10,
          orderBy: { fechaHora: 'desc' },
          include: {
            cliente: true,
          },
        },
      },
    });

    if (!empleado) {
      throw new Error('Empleado no encontrado');
    }

    // Parsear JSON
    return {
      ...empleado,
      especialidades: JSON.parse(empleado.especialidades),
      horarioLunes: empleado.horarioLunes ? JSON.parse(empleado.horarioLunes) : null,
      horarioMartes: empleado.horarioMartes ? JSON.parse(empleado.horarioMartes) : null,
      horarioMiercoles: empleado.horarioMiercoles ? JSON.parse(empleado.horarioMiercoles) : null,
      horarioJueves: empleado.horarioJueves ? JSON.parse(empleado.horarioJueves) : null,
      horarioViernes: empleado.horarioViernes ? JSON.parse(empleado.horarioViernes) : null,
      horarioSabado: empleado.horarioSabado ? JSON.parse(empleado.horarioSabado) : null,
      horarioDomingo: empleado.horarioDomingo ? JSON.parse(empleado.horarioDomingo) : null,
    };
  }

  // Crear un nuevo empleado
  async create(data: CreateEmpleadoInput) {
    const empleado = await prisma.empleado.create({
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
        especialidades: JSON.stringify(data.especialidades),
        horarioLunes: data.horarioLunes ? JSON.stringify(data.horarioLunes) : null,
        horarioMartes: data.horarioMartes ? JSON.stringify(data.horarioMartes) : null,
        horarioMiercoles: data.horarioMiercoles ? JSON.stringify(data.horarioMiercoles) : null,
        horarioJueves: data.horarioJueves ? JSON.stringify(data.horarioJueves) : null,
        horarioViernes: data.horarioViernes ? JSON.stringify(data.horarioViernes) : null,
        horarioSabado: data.horarioSabado ? JSON.stringify(data.horarioSabado) : null,
        horarioDomingo: data.horarioDomingo ? JSON.stringify(data.horarioDomingo) : null,
      },
    });

    return empleado;
  }

  // Actualizar un empleado
  async update(id: string, data: UpdateEmpleadoInput) {
    const empleado = await prisma.empleado.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.telefono && { telefono: data.telefono }),
        ...(data.especialidades && { especialidades: JSON.stringify(data.especialidades) }),
        ...(data.horarioLunes !== undefined && { 
          horarioLunes: data.horarioLunes ? JSON.stringify(data.horarioLunes) : null 
        }),
        ...(data.horarioMartes !== undefined && { 
          horarioMartes: data.horarioMartes ? JSON.stringify(data.horarioMartes) : null 
        }),
        ...(data.horarioMiercoles !== undefined && { 
          horarioMiercoles: data.horarioMiercoles ? JSON.stringify(data.horarioMiercoles) : null 
        }),
        ...(data.horarioJueves !== undefined && { 
          horarioJueves: data.horarioJueves ? JSON.stringify(data.horarioJueves) : null 
        }),
        ...(data.horarioViernes !== undefined && { 
          horarioViernes: data.horarioViernes ? JSON.stringify(data.horarioViernes) : null 
        }),
        ...(data.horarioSabado !== undefined && { 
          horarioSabado: data.horarioSabado ? JSON.stringify(data.horarioSabado) : null 
        }),
        ...(data.horarioDomingo !== undefined && { 
          horarioDomingo: data.horarioDomingo ? JSON.stringify(data.horarioDomingo) : null 
        }),
        ...(data.activo !== undefined && { activo: data.activo }),
      },
    });

    return empleado;
  }

  // Eliminar un empleado (soft delete)
  async delete(id: string) {
    const empleado = await prisma.empleado.update({
      where: { id },
      data: { activo: false },
    });

    return empleado;
  }

  // Obtener estadísticas de un empleado
  async getEstadisticas(id: string) {
    const [totalCitas, totalIngresos] = await Promise.all([
      prisma.cita.count({
        where: { empleadoId: id, estado: 'COMPLETADA' },
      }),
      prisma.transaccion.aggregate({
        where: { empleadoId: id, tipo: 'INGRESO' },
        _sum: { total: true },
      }),
    ]);

    return {
      totalCitas,
      totalIngresos: totalIngresos._sum.total || 0,
    };
  }

  // Verificar disponibilidad de un empleado en una fecha/hora específica
  async verificarDisponibilidad(empleadoId: string, fecha: Date, duracionMinutos: number) {
    const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();

    // Obtener horario del día
    const empleado = await this.getById(empleadoId);
    
    const diasSemana = [
      'horarioDomingo',
      'horarioLunes',
      'horarioMartes',
      'horarioMiercoles',
      'horarioJueves',
      'horarioViernes',
      'horarioSabado',
    ];

    const horarioDia = (empleado as any)[diasSemana[diaSemana]];

    if (!horarioDia) {
      return { disponible: false, motivo: 'El empleado no trabaja este día' };
    }

    // Verificar si está dentro del horario
    const [horaInicio, minInicio] = horarioDia.inicio.split(':').map(Number);
    const [horaFin, minFin] = horarioDia.fin.split(':').map(Number);

    const minutosActuales = hora * 60 + minutos;
    const minutosInicio = horaInicio * 60 + minInicio;
    const minutosFin = horaFin * 60 + minFin;
    const minutosFinServicio = minutosActuales + duracionMinutos;

    if (minutosActuales < minutosInicio || minutosFinServicio > minutosFin) {
      return { 
        disponible: false, 
        motivo: `Horario laboral: ${horarioDia.inicio} - ${horarioDia.fin}` 
      };
    }

    // Verificar citas existentes
    const finServicio = new Date(fecha.getTime() + duracionMinutos * 60000);

    const citasConflicto = await prisma.cita.count({
      where: {
        empleadoId,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        OR: [
          {
            AND: [
              { fechaHora: { lte: fecha } },
              { 
                fechaHora: { 
                  gte: new Date(fecha.getTime() - 2 * 60 * 60000) // 2 horas antes
                } 
              },
            ],
          },
          {
            AND: [
              { fechaHora: { gte: fecha } },
              { fechaHora: { lt: finServicio } },
            ],
          },
        ],
      },
    });

    if (citasConflicto > 0) {
      return { disponible: false, motivo: 'Ya tiene una cita agendada en ese horario' };
    }

    return { disponible: true };
  }
}