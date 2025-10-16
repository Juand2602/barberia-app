// electron/server/routes/reportes.routes.ts

import { Router } from 'express';
import { ReportesController } from '../controllers/reportes.controller';

const router = Router();
const controller = new ReportesController();

// Dashboard general
router.get('/dashboard', (req, res) => controller.getDashboard(req, res));

// Reportes de ventas
router.get('/ventas', (req, res) => controller.getReporteVentas(req, res));
router.get('/ventas/por-empleado', (req, res) => controller.getReporteVentasPorEmpleado(req, res));
router.get('/ventas/por-servicio', (req, res) => controller.getReporteVentasPorServicio(req, res));

// Reportes de citas
router.get('/citas', (req, res) => controller.getReporteCitas(req, res));

// Reportes financieros
router.get('/financiero', (req, res) => controller.getReporteFinanciero(req, res));

// Reportes de clientes
router.get('/clientes', (req, res) => controller.getReporteClientes(req, res));

export default router;