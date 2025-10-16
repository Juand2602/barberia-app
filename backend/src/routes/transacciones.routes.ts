import { Router } from 'express';
import { TransaccionesController } from '../controllers/transacciones.controller';

const router = Router();
const controller = new TransaccionesController();

// Rutas especiales (deben ir primero)
router.get('/estadisticas', (req, res) => controller.getEstadisticas(req, res));
router.get('/servicios-mas-vendidos', (req, res) => controller.getServiciosMasVendidos(req, res));
router.get('/ingresos-por-empleado', (req, res) => controller.getIngresosPorEmpleado(req, res));
router.get('/fecha/:fecha', (req, res) => controller.getByFecha(req, res));
router.post('/desde-cita/:citaId', (req, res) => controller.registrarDesdeCita(req, res));

// Rutas CRUD
router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;