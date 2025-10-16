import { Request, Response } from 'express';
import { TransaccionesService } from '../services/transacciones.service';
import { createTransaccionSchema, updateTransaccionSchema } from '../utils/validators';

const transaccionesService = new TransaccionesService();

export class TransaccionesController {
  // GET /api/transacciones
  async getAll(req: Request, res: Response) {
    try {
      const {
        fechaInicio,
        fechaFin,
        tipo,
        metodoPago,
        empleadoId,
        clienteId,
      } = req.query;

      const filters: any = {};

      if (fechaInicio) {
        filters.fechaInicio = new Date(fechaInicio as string);
      }
      if (fechaFin) {
        filters.fechaFin = new Date(fechaFin as string);
      }
      if (tipo) {
        filters.tipo = tipo as string;
      }
      if (metodoPago) {
        filters.metodoPago = metodoPago as string;
      }
      if (empleadoId) {
        filters.empleadoId = empleadoId as string;
      }
      if (clienteId) {
        filters.clienteId = clienteId as string;
      }

      const transacciones = await transaccionesService.getAll(filters);

      res.json({
        success: true,
        data: transacciones,
        total: transacciones.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener transacciones',
        error: error.message,
      });
    }
  }

  // GET /api/transacciones/fecha/:fecha
  async getByFecha(req: Request, res: Response) {
    try {
      const { fecha } = req.params;
      const transacciones = await transaccionesService.getByFecha(new Date(fecha));

      res.json({
        success: true,
        data: transacciones,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener transacciones',
        error: error.message,
      });
    }
  }

  // GET /api/transacciones/estadisticas
  async getEstadisticas(req: Request, res: Response) {
    try {
      const { fechaInicio, fechaFin } = req.query;

      const estadisticas = await transaccionesService.getEstadisticas(
        fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin ? new Date(fechaFin as string) : undefined
      );

      res.json({
        success: true,
        data: estadisticas,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message,
      });
    }
  }

  // GET /api/transacciones/servicios-mas-vendidos
  async getServiciosMasVendidos(req: Request, res: Response) {
    try {
      const { limite, fechaInicio, fechaFin } = req.query;

      const servicios = await transaccionesService.getServiciosMasVendidos(
        limite ? parseInt(limite as string) : 10,
        fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin ? new Date(fechaFin as string) : undefined
      );

      res.json({
        success: true,
        data: servicios,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios más vendidos',
        error: error.message,
      });
    }
  }

  // GET /api/transacciones/ingresos-por-empleado
  async getIngresosPorEmpleado(req: Request, res: Response) {
    try {
      const { fechaInicio, fechaFin } = req.query;

      const ingresos = await transaccionesService.getIngresosPorEmpleado(
        fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin ? new Date(fechaFin as string) : undefined
      );

      res.json({
        success: true,
        data: ingresos,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener ingresos por empleado',
        error: error.message,
      });
    }
  }

  // GET /api/transacciones/:id
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaccion = await transaccionesService.getById(id);

      res.json({
        success: true,
        data: transaccion,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/transacciones
  async create(req: Request, res: Response) {
    try {
      const validatedData = createTransaccionSchema.parse(req.body);
      const transaccion = await transaccionesService.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Transacción creada exitosamente',
        data: transaccion,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        });
      }

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/transacciones/desde-cita/:citaId
  async registrarDesdeCita(req: Request, res: Response) {
    try {
      const { citaId } = req.params;
      const transaccion = await transaccionesService.registrarVentaDesdeCita(citaId);

      res.status(201).json({
        success: true,
        message: 'Venta registrada exitosamente desde cita',
        data: transaccion,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PUT /api/transacciones/:id
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateTransaccionSchema.parse(req.body);
      const transaccion = await transaccionesService.update(id, validatedData);

      res.json({
        success: true,
        message: 'Transacción actualizada exitosamente',
        data: transaccion,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        });
      }

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE /api/transacciones/:id
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await transaccionesService.delete(id);

      res.json({
        success: true,
        message: 'Transacción eliminada exitosamente',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}