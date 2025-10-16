import { Router } from 'express';
import { ServiciosController } from '../controllers/servicios.controller';

const router = Router();
const controller = new ServiciosController();

// Rutas especiales primero (antes de las rutas con :id)
router.get('/mas-vendidos', (req, res) => controller.getMasVendidos(req, res));

// Rutas CRUD
router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/:id/estadisticas', (req, res) => controller.getEstadisticas(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;