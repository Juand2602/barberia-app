import { Router } from 'express';
import { CierreCajaController } from '../controllers/cierrecaja.controller';

const router = Router();
const controller = new CierreCajaController();

// Rutas especiales (deben ir primero)
router.get('/ultimo', (req, res) => controller.getUltimo(req, res));
router.get('/puede-cerrar', (req, res) => controller.puedeCerrar(req, res));
router.get('/calcular', (req, res) => controller.calcularDatos(req, res));
router.get('/estadisticas', (req, res) => controller.getEstadisticas(req, res));
router.get('/fecha/:fecha', (req, res) => controller.getByFecha(req, res));

// Rutas CRUD
router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;