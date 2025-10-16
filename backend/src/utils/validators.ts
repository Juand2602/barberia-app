import { z } from 'zod';

// ==================== CLIENTE ====================
export const createClienteSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  telefono: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos')
    .regex(/^[0-9+\s-]+$/, 'El teléfono solo puede contener números, +, espacios y guiones'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notas: z.string().optional(),
});

export const updateClienteSchema = z.object({
  nombre: z.string().min(3).optional(),
  telefono: z.string().min(10).regex(/^[0-9+\s-]+$/).optional(),
  email: z.string().email().optional().or(z.literal('')),
  notas: z.string().optional(),
  activo: z.boolean().optional(),
});

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;

// ==================== SERVICIO ====================
export const createServicioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  duracionMinutos: z.number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser mayor a 0')
    .multipleOf(5, 'La duración debe ser múltiplo de 5'),
});

export const updateServicioSchema = z.object({
  nombre: z.string().min(3).optional(),
  descripcion: z.string().optional(),
  precio: z.number().positive().optional(),
  duracionMinutos: z.number().int().positive().multipleOf(5).optional(),
  activo: z.boolean().optional(),
});

export type CreateServicioInput = z.infer<typeof createServicioSchema>;
export type UpdateServicioInput = z.infer<typeof updateServicioSchema>;

// ==================== EMPLEADO ====================
export const horarioSchema = z.object({
  inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  fin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
}).optional();

export const createEmpleadoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  telefono: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos')
    .regex(/^[0-9+\s-]+$/, 'El teléfono solo puede contener números, +, espacios y guiones'),
  especialidades: z.array(z.string()).min(1, 'Debe seleccionar al menos una especialidad'),
  horarioLunes: horarioSchema,
  horarioMartes: horarioSchema,
  horarioMiercoles: horarioSchema,
  horarioJueves: horarioSchema,
  horarioViernes: horarioSchema,
  horarioSabado: horarioSchema,
  horarioDomingo: horarioSchema,
});

export const updateEmpleadoSchema = z.object({
  nombre: z.string().min(3).optional(),
  telefono: z.string().min(10).regex(/^[0-9+\s-]+$/).optional(),
  especialidades: z.array(z.string()).min(1).optional(),
  horarioLunes: horarioSchema,
  horarioMartes: horarioSchema,
  horarioMiercoles: horarioSchema,
  horarioJueves: horarioSchema,
  horarioViernes: horarioSchema,
  horarioSabado: horarioSchema,
  horarioDomingo: horarioSchema,
  activo: z.boolean().optional(),
});

export type CreateEmpleadoInput = z.infer<typeof createEmpleadoSchema>;
export type UpdateEmpleadoInput = z.infer<typeof updateEmpleadoSchema>;
export type HorarioInput = z.infer<typeof horarioSchema>;

// ==================== CITAS ====================
export const createCitaSchema = z.object({
  clienteId: z.string().uuid('ID de cliente inválido'),
  empleadoId: z.string().uuid('ID de empleado inválido'),
  servicioNombre: z.string().min(1, 'El servicio es requerido'),
  fechaHora: z.string().datetime('Fecha y hora inválida'),
  duracionMinutos: z.number().int().positive('Duración debe ser positiva'),
  origen: z.enum(['WHATSAPP', 'MANUAL', 'TELEFONO']).default('MANUAL'),
  notas: z.string().optional(),
});

export const updateCitaSchema = z.object({
  clienteId: z.string().uuid().optional(),
  empleadoId: z.string().uuid(),
  servicioNombre: z.string().min(1).optional(),
  fechaHora: z.string().datetime().optional(),
  duracionMinutos: z.number().int().positive().optional(),
  estado: z.enum(['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']).optional(),
  notas: z.string().optional(),
  motivoCancelacion: z.string().optional(),
});

export const cambiarEstadoCitaSchema = z.object({
  estado: z.enum(['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']),
  motivoCancelacion: z.string().optional(),
});

export type CreateCitaInput = z.infer<typeof createCitaSchema>;
export type UpdateCitaInput = z.infer<typeof updateCitaSchema>;
export type CambiarEstadoCitaInput = z.infer<typeof cambiarEstadoCitaSchema>;

// ==================== TRANSACCIONES ====================
export const transaccionItemSchema = z.object({
  // permitir uuid (ID válido) o cadena vacía/omitida — el backend creará/reemplazará para EGRESO
  servicioId: z.string().uuid('ID de servicio inválido').optional().or(z.literal('')),
  cantidad: z.number().int('Cantidad debe ser un entero').min(1, 'Cantidad debe ser al menos 1').default(1),
  precioUnitario: z.number().nonnegative('Precio debe ser >= 0'),
  subtotal: z.number().nonnegative('Subtotal debe ser >= 0'),
});

export const createTransaccionSchema = z
  .object({
    tipo: z.enum(['INGRESO', 'EGRESO']),
    clienteId: z.string().uuid().optional().or(z.literal('')),
    empleadoId: z.string().uuid().optional().or(z.literal('')),
    fecha: z.string().optional(), // si quieres validar formato, usa .datetime()
    total: z.number().positive('El total debe ser mayor a 0'),
    metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA']),
    referencia: z.string().optional().or(z.literal('')), // para transferencias
    concepto: z.string().optional().or(z.literal('')), // para egresos
    categoria: z.string().optional().or(z.literal('')), // para egresos
    notas: z.string().optional().or(z.literal('')),
    // items opcional: para EGRESO lo puede enviar vacío; para INGRESO se exige items no vacíos en superRefine
    items: z.array(transaccionItemSchema).optional(),
  })
  .superRefine((val, ctx) => {
    // Transferencias requieren referencia
    if (val.metodoPago === 'TRANSFERENCIA') {
      if (!val.referencia || String(val.referencia).trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Las transferencias requieren número de referencia',
          path: ['referencia'],
        });
      }
    }

    // INGRESO requiere al menos un item
    if (val.tipo === 'INGRESO') {
      if (!Array.isArray(val.items) || val.items.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Los ingresos requieren al menos un item',
          path: ['items'],
        });
        return; // no seguir validando suma si faltan items
      }
    }

    // Si vienen items, validar que subtotal coincide con total
    if (Array.isArray(val.items) && val.items.length > 0) {
      const totalItems = val.items.reduce((s, it) => s + Number(it.subtotal || 0), 0);
      if (Math.abs(totalItems - Number(val.total)) > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El total no coincide con la suma de los items',
          path: ['total'],
        });
      }

      // Validar que cada item tenga precio/cantidad/subtotal coherentes
      val.items.forEach((it, idx) => {
        if (it.cantidad <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La cantidad debe ser al menos 1',
            path: ['items', idx, 'cantidad'],
          });
        }
        if (it.precioUnitario < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El precioUnitario no puede ser negativo',
            path: ['items', idx, 'precioUnitario'],
          });
        }
        if (it.subtotal < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El subtotal no puede ser negativo',
            path: ['items', idx, 'subtotal'],
          });
        }
      });
    }
  });

export const updateTransaccionSchema = z.object({
  tipo: z.enum(['INGRESO', 'EGRESO']).optional(),
  clienteId: z.string().uuid().optional().nullable(),
  empleadoId: z.string().uuid().optional().nullable(),
  fecha: z.string().optional(),
  total: z.number().positive().optional(),
  metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA']).optional(),
  referencia: z.string().optional().nullable(),
  concepto: z.string().optional().nullable(),
  categoria: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
});

export type TransaccionItemInput = z.infer<typeof transaccionItemSchema>;
export type CreateTransaccionInput = z.infer<typeof createTransaccionSchema>;
export type UpdateTransaccionInput = z.infer<typeof updateTransaccionSchema>;

// ==================== CIERRE DE CAJA ====================
export const createCierreCajaSchema = z.object({
  fecha: z.string().datetime().optional(), // Si no se envía, usa fecha actual
  efectivoInicial: z.number().min(0, 'El efectivo inicial no puede ser negativo'),
  efectivoFinal: z.number().min(0, 'El efectivo final no puede ser negativo'),
  notas: z.string().optional(),
});

export const updateCierreCajaSchema = z.object({
  efectivoInicial: z.number().min(0).optional(),
  efectivoFinal: z.number().min(0).optional(),
  notas: z.string().optional(),
});

export type CreateCierreCajaInput = z.infer<typeof createCierreCajaSchema>;
export type UpdateCierreCajaInput = z.infer<typeof updateCierreCajaSchema>;