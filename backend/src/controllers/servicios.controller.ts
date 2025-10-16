import { Request, Response } from 'express';
import { ServiciosService } from '../services/servicios.service';
import { createServicioSchema, updateServicioSchema } from '../utils/validators';

const serviciosService = new ServiciosService();

export class ServiciosController {
  // GET /api/servicios
  async getAll(req: Request, res: Response) {
    try {
      const { activo } = req.query;
      
      const servicios = await serviciosService.getAll(
        activo === 'true' ? true : activo === 'false' ? false : undefined
      );

      res.json({
        success: true,
        data: servicios,
        total: servicios.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios',
        error: error.message,
      });
    }
  }

  // GET /api/servicios/:id
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const servicio = await serviciosService.getById(id);

      res.json({
        success: true,
        data: servicio,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/servicios/:id/estadisticas
  async getEstadisticas(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const estadisticas = await serviciosService.getEstadisticas(id);

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

  // GET /api/servicios/mas-vendidos
  async getMasVendidos(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const servicios = await serviciosService.getMasVendidos(limit);

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

  // POST /api/servicios
  async create(req: Request, res: Response) {
    try {
      const validatedData = createServicioSchema.parse(req.body);
      const servicio = await serviciosService.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Servicio creado exitosamente',
        data: servicio,
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

  // PUT /api/servicios/:id
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateServicioSchema.parse(req.body);
      const servicio = await serviciosService.update(id, validatedData);

      res.json({
        success: true,
        message: 'Servicio actualizado exitosamente',
        data: servicio,
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

  // DELETE /api/servicios/:id
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await serviciosService.delete(id);

      res.json({
        success: true,
        message: 'Servicio eliminado exitosamente',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}