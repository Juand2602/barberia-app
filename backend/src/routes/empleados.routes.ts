import { Router } from 'express';
import { EmpleadosController } from '../controllers/empleados.controller';

const router = Router();
const controller = new EmpleadosController();

// Rutas
router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/:id/estadisticas', (req, res) => controller.getEstadisticas(req, res));
router.post('/:id/verificar-disponibilidad', (req, res) => controller.verificarDisponibilidad(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;