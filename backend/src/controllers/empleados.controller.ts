import { Request, Response } from 'express';
import { EmpleadosService } from '../services/empleados.service';
import { createEmpleadoSchema, updateEmpleadoSchema } from '../utils/validators';

const empleadosService = new EmpleadosService();

export class EmpleadosController {
  // GET /api/empleados
  async getAll(req: Request, res: Response) {
    try {
      const { activo } = req.query;
      
      const empleados = await empleadosService.getAll(
        activo === 'true' ? true : activo === 'false' ? false : undefined
      );

      res.json({
        success: true,
        data: empleados,
        total: empleados.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener empleados',
        error: error.message,
      });
    }
  }

  // GET /api/empleados/:id
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empleado = await empleadosService.getById(id);

      res.json({
        success: true,
        data: empleado,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/empleados/:id/estadisticas
  async getEstadisticas(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const estadisticas = await empleadosService.getEstadisticas(id);

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

  // POST /api/empleados/:id/verificar-disponibilidad
  async verificarDisponibilidad(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { fecha, duracionMinutos } = req.body;

      if (!fecha || !duracionMinutos) {
        return res.status(400).json({
          success: false,
          message: 'Fecha y duración son requeridos',
        });
      }

      const resultado = await empleadosService.verificarDisponibilidad(
        id,
        new Date(fecha),
        duracionMinutos
      );

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar disponibilidad',
        error: error.message,
      });
    }
  }

  // POST /api/empleados
  async create(req: Request, res: Response) {
    try {
      const validatedData = createEmpleadoSchema.parse(req.body);
      const empleado = await empleadosService.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Empleado creado exitosamente',
        data: empleado,
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

  // PUT /api/empleados/:id
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateEmpleadoSchema.parse(req.body);
      const empleado = await empleadosService.update(id, validatedData);

      res.json({
        success: true,
        message: 'Empleado actualizado exitosamente',
        data: empleado,
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

  // DELETE /api/empleados/:id
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await empleadosService.delete(id);

      res.json({
        success: true,
        message: 'Empleado desactivado exitosamente',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}