// backend/src/routes/webhook.routes.ts

import { Router } from 'express';
import webhookController from '../controllers/webhook.controller';

const router = Router();

/**
 * GET /webhook
 * Verificación del webhook por parte de WhatsApp
 */
router.get('/', webhookController.verificarWebhook.bind(webhookController));

/**
 * POST /webhook
 * Recibir mensajes de WhatsApp
 */
router.post('/', webhookController.recibirMensaje.bind(webhookController));

/**
 * POST /webhook/test
 * Endpoint de prueba para simular mensajes (solo desarrollo)
 */
router.post('/test', webhookController.testMensaje.bind(webhookController));

export default router;