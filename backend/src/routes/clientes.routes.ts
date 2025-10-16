import { Router } from 'express';
import { ClientesController } from '../controllers/clientes.controller';

const router = Router();
const controller = new ClientesController();

// Rutas
router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/:id/estadisticas', (req, res) => controller.getEstadisticas(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;