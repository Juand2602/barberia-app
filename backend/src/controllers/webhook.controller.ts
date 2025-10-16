// backend/src/controllers/webhook.controller.ts

import { Request, Response } from 'express';
import botProcessor from '../services/whatsapp/bot.processor';
import { WhatsAppWebhookPayload } from '../types/whatsapp.types';

class WebhookController {
  /**
   * Verificación del webhook (GET)
   * WhatsApp envía esto para verificar que el webhook es válido
   */
  verificarWebhook(req: Request, res: Response) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'barberia_verify_token_2025';

      console.log('🔍 Verificación de webhook:', { mode, token });

      // Verificar que el token coincida
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verificado correctamente');
        res.status(200).send(challenge);
      } else {
        console.log('❌ Token de verificación inválido');
        res.sendStatus(403);
      }
    } catch (error) {
      console.error('❌ Error en verificación de webhook:', error);
      res.sendStatus(500);
    }
  }

  /**
   * Recibir mensajes (POST)
   * WhatsApp envía aquí todos los mensajes entrantes
   */
  async recibirMensaje(req: Request, res: Response) {
    try {
      const payload: WhatsAppWebhookPayload = req.body;

      // Responder inmediatamente a WhatsApp (requisito de la API)
      res.sendStatus(200);

      console.log('📨 Webhook recibido:', JSON.stringify(payload, null, 2));

      // Verificar que es un mensaje válido
      if (payload.object !== 'whatsapp_business_account') {
        console.log('⚠️ Payload no es de WhatsApp Business');
        return;
      }

      // Procesar cada entrada
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          // Solo procesar mensajes (no estados)
          if (change.field !== 'messages') {
            continue;
          }

          const { messages, contacts } = change.value;

          // Verificar que hay mensajes
          if (!messages || messages.length === 0) {
            continue;
          }

          // Procesar cada mensaje
          for (const message of messages) {
            const telefono = message.from;
            const nombreContacto = contacts?.find(c => c.wa_id === telefono)?.profile.name;

            // Procesar mensaje de forma asíncrona (no bloquear el webhook)
            this.procesarMensajeAsync(telefono, message, nombreContacto);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      // No enviar error a WhatsApp, ya respondimos con 200
    }
  }

  /**
   * Procesar mensaje de forma asíncrona
   */
  private async procesarMensajeAsync(
    telefono: string,
    mensaje: any,
    nombreContacto?: string
  ) {
    try {
      await botProcessor.procesarMensaje(telefono, mensaje, nombreContacto);
    } catch (error) {
      console.error(`❌ Error procesando mensaje de ${telefono}:`, error);
    }
  }

  /**
   * Endpoint de prueba para simular mensajes (solo desarrollo)
   */
  async testMensaje(req: Request, res: Response) {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'No disponible en producción' });
      }

      const { telefono, mensaje } = req.body;

      if (!telefono || !mensaje) {
        return res.status(400).json({ error: 'Faltan parámetros: telefono, mensaje' });
      }

      // Simular mensaje de WhatsApp
      const mensajeSimulado = {
        from: telefono,
        id: `test_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        text: {
          body: mensaje
        }
      };

      await botProcessor.procesarMensaje(telefono, mensajeSimulado, 'Usuario Test');

      res.json({
        success: true,
        message: 'Mensaje de prueba procesado'
      });
    } catch (error: any) {
      console.error('❌ Error en mensaje de prueba:', error);
      res.status(500).json({
        error: 'Error procesando mensaje de prueba',
        details: error.message
      });
    }
  }
}

export default new WebhookController();