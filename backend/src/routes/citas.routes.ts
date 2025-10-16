import { Router } from 'express';
import { CitasController } from '../controllers/citas.controller';

const router = Router();
const controller = new CitasController();

// Rutas especiales (deben ir primero)
router.get('/proximas', (req, res) => controller.getProximas(req, res));
router.get('/estadisticas', (req, res) => controller.getEstadisticas(req, res));
router.get('/fecha/:fecha', (req, res) => controller.getByFecha(req, res));
router.get('/semana/:fechaInicio', (req, res) => controller.getBySemana(req, res));
router.get('/mes/:year/:month', (req, res) => controller.getByMes(req, res));

// Rutas CRUD
router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.patch('/:id/estado', (req, res) => controller.cambiarEstado(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;