// electron/server/controllers/reportes.controller.ts

import { Request, Response } from 'express';
import { ReportesService } from '../services/reportes.service';
import { z } from 'zod';

const reportesService = new ReportesService();

// Schema de validación para fechas
const FechasSchema = z.object({
  fechaInicio: z.string().datetime().optional(),
  fechaFin: z.string().datetime().optional()
});

export class ReportesController {
  // Dashboard general
  async getDashboard(req: Request, res: Response) {
    try {
      const params = FechasSchema.parse({
        fechaInicio: req.query.fechaInicio,
        fechaFin: req.query.fechaFin
      });

      const fechaInicio = params.fechaInicio ? new Date(params.fechaInicio) : undefined;
      const fechaFin = params.fechaFin ? new Date(params.fechaFin) : undefined;

      const dashboard = await reportesService.getDashboard(fechaInicio, fechaFin);
      res.json(dashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Parámetros inválidos', details: error.errors });
      } else {
        console.error('Error al obtener dashboard:', error);
        res.status(500).json({ error: 'Error al obtener dashboard' });
      }
    }
  }

  // Reporte de ventas general
  async getReporteVentas(req: Request, res: Response) {
    try {
      const params = FechasSchema.parse({
        fechaInicio: req.query.fechaInicio,
        fechaFin: req.query.fechaFin
      });

      if (!params.fechaInicio || !params.fechaFin) {
        return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
      }

      const fechaInicio = new Date(params.fechaInicio);
      const fechaFin = new Date(params.fechaFin);

      const reporte = await reportesService.getReporteVentas(fechaInicio, fechaFin);
      res.json(reporte);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Parámetros inválidos', details: error.errors });
      } else {
        console.error('Error al obtener reporte de ventas:', error);
        res.status(500).json({ error: 'Error al obtener reporte de ventas' });
      }
    }
  }

  // Reporte de ventas por empleado
  async getReporteVentasPorEmpleado(req: Request, res: Response) {
    try {
      const params = FechasSchema.parse({
        fechaInicio: req.query.fechaInicio,
        fechaFin: req.query.fechaFin
      });

      if (!params.fechaInicio || !params.fechaFin) {
        return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
      }

      const fechaInicio = new Date(params.fechaInicio);
      const fechaFin = new Date(params.fechaFin);

      const reporte = await reportesService.getReporteVentasPorEmpleado(fechaInicio, fechaFin);
      res.json(reporte);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Parámetros inválidos', details: error.errors });
      } else {
        console.error('Error al obtener reporte de ventas por empleado:', error);
        res.status(500).json({ error: 'Error al obtener reporte de ventas por empleado' });
      }
    }
  }

  // Reporte de ventas por servicio
  async getReporteVentasPorServicio(req: Request, res: Response) {
    try {
      const params = FechasSchema.parse({
        fechaInicio: req.query.fechaInicio,
        fechaFin: req.query.fechaFin
      });

      if (!params.fechaInicio || !params.fechaFin) {
        return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
      }

      const fechaInicio = new Date(params.fechaInicio);
      const fechaFin = new Date(params.fechaFin);

      const reporte = await reportesService.getReporteVentasPorServicio(fechaInicio, fechaFin);
      res.json(reporte);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Parámetros inválidos', details: error.errors });
      } else {
        console.error('Error al obtener reporte de ventas por servicio:', error);
        res.status(500).json({ error: 'Error al obtener reporte de ventas por servicio' });
      }
    }
  }

  // Reporte de citas
  async getReporteCitas(req: Request, res: Response) {
    try {
      const params = FechasSchema.parse({
        fechaInicio: req.query.fechaInicio,
        fechaFin: req.query.fechaFin
      });

      if (!params.fechaInicio || !params.fechaFin) {
        return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
      }

      const fechaInicio = new Date(params.fechaInicio);
      const fechaFin = new Date(params.fechaFin);

      const reporte = await reportesService.getReporteCitas(fechaInicio, fechaFin);
      res.json(reporte);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Parámetros inválidos', details: error.errors });
      } else {
        console.error('Error al obtener reporte de citas:', error);
        res.status(500).json({ error: 'Error al obtener reporte de citas' });
      }
    }
  }

  // Reporte financiero
  async getReporteFinanciero(req: Request, res: Response) {
    try {
      const params = FechasSchema.parse({
        fechaInicio: req.query.fechaInicio,
        fechaFin: req.query.fechaFin
      });

      if (!params.fechaInicio || !params.fechaFin) {
        return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
      }

      const fechaInicio = new Date(params.fechaInicio);
      const fechaFin = new Date(params.fechaFin);

      const reporte = await reportesService.getReporteFinanciero(fechaInicio, fechaFin);
      res.json(reporte);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Parámetros inválidos', details: error.errors });
      } else {
        console.error('Error al obtener reporte financiero:', error);
        res.status(500).json({ error: 'Error al obtener reporte financiero' });
      }
    }
  }

  // Reporte de clientes
  async getReporteClientes(req: Request, res: Response) {
    try {
      const params = FechasSchema.parse({
        fechaInicio: req.query.fechaInicio,
        fechaFin: req.query.fechaFin
      });

      if (!params.fechaInicio || !params.fechaFin) {
        return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
      }

      const fechaInicio = new Date(params.fechaInicio);
      const fechaFin = new Date(params.fechaFin);

      const reporte = await reportesService.getReporteClientes(fechaInicio, fechaFin);
      res.json(reporte);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Parámetros inválidos', details: error.errors });
      } else {
        console.error('Error al obtener reporte de clientes:', error);
        res.status(500).json({ error: 'Error al obtener reporte de clientes' });
      }
    }
  }
}